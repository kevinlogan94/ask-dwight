import { defineStore } from 'pinia'
import type { ChatCompletionMessage, ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { useOpenAIClient } from '~/composables/useOpenAIClient';

export interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant' | 'system'
  timestamp: Date
  status?: 'loading' | 'sent'
  suggestions?: string[]
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  unread?: boolean
  createdAt: Date
}

export const useChatStore = defineStore('chat', () => {
  // State
  const conversations = ref<Conversation[]>([
    {
      id: crypto.randomUUID(),
      title: 'Getting Started',
      messages: [
        {
          id: '1',
          content: "Hey! I'm here — hit me with whatever you need.",
          sender: 'assistant',
          timestamp: new Date()
        },
        {
          id: '2',
          content: 'test',
          sender: 'user',
          timestamp: new Date()
        },
        {
          id: '3',
          content: "Hey hey! What's up?",
          sender: 'assistant',
          timestamp: new Date()
        },
        {
          id: '4',
          content: 'hello',
          sender: 'user',
          timestamp: new Date()
        },
        {
          id: '5',
          content: 'I can help you with a variety of tasks. What are you working on today?',
          sender: 'assistant',
          timestamp: new Date(),
          suggestions: ['Web development', 'Writing an email', 'Planning a trip']
        }
      ],
      createdAt: new Date()
    }
  ])
  
  const selectedConversationId = ref<string | null>(null)
  const sidebarOpen = ref(false)
  const aiResponsePending = ref(false)

  // Getters
  const selectedConversation = computed<Conversation | undefined>(() => {
    return conversations.value.find(c => c.id === selectedConversationId.value)
  })
  
  const currentMessages = computed<Message[]>(() => {
    return selectedConversation.value?.messages || []
  })
  
  // Actions
  function createNewConversation() {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Conversation',
      messages: [
        {
          id: crypto.randomUUID(),
          content: "Hello! How can I help you today?",
          sender: 'assistant',
          timestamp: new Date(),
          suggestions: ['Tell me about yourself', 'What can you do?', 'I need help with a task']
        }
      ],
      createdAt: new Date()
    }
    
    conversations.value.push(newConversation)
    selectedConversationId.value = newConversation.id
    return newConversation
  }
  
  function selectConversation(conversationId: string) {
    selectedConversationId.value = conversationId
    
    // Mark conversation as read when selected
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (conversation?.unread) {
      conversation.unread = false
    }
  }
  
  function toggleSidebar(isOpen?: boolean) {
    if (typeof isOpen === 'boolean') {
      sidebarOpen.value = isOpen
    } else {
      sidebarOpen.value = !sidebarOpen.value
    }
  }
  
  function addMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
    // Create a new conversation if none is selected
    if (!selectedConversationId.value) {
      createNewConversation()
    }
    
    const conversation = conversations.value.find(c => c.id === selectedConversationId.value)
    if (conversation) {
      const newMessage: Message = {
        ...message,
        id: crypto.randomUUID(),
        timestamp: new Date()
      }
      conversation.messages.push(newMessage)
      return newMessage
    }
    
    // This should not happen in normal operation, but we need to return something
    // to satisfy TypeScript
    throw new Error('Failed to add message: No conversation selected')
  }
  
  function removeMessage(messageId: string) {
    if (!selectedConversationId.value) return
    
    const conversation = conversations.value.find(c => c.id === selectedConversationId.value)
    if (!conversation) return
    
    const messageIndex = conversation.messages.findIndex(m => m.id === messageId)
    if (messageIndex !== -1) {
      conversation.messages.splice(messageIndex, 1)
    }
  }
  
  function clearSuggestions() {
    if (!selectedConversationId.value) return
    
    const conversation = conversations.value.find(c => c.id === selectedConversationId.value)
    if (!conversation) return
    
    const message = conversation.messages[conversation.messages.length - 1]
    if (message) {
      message.suggestions = []
    }
  }
  
  async function sendMessage(content: string) {
    if (!content.trim()) return
    
    // Create a new conversation if none is selected or get the current one
    let conversation = selectedConversation.value;
    if (!conversation) {
      conversation = createNewConversation();
      if (!conversation) { 
          console.error("Failed to create or find a conversation.")
          return false;
      }
      selectedConversationId.value = conversation.id; 
    }
    
    aiResponsePending.value = true
    
    // Add user message
    addMessage({
      content,
      sender: 'user',
      status: 'sent'
    })
    
    // Add loading message and get its ID
    const loadingMessage = addMessage({
      content: '',
      sender: 'system',
      status: 'loading'
    })
    const loadingMessageId = loadingMessage.id

    try {
      // Prepare messages for the API (only user and assistant roles)
      const messagesForApi: ChatCompletionMessageParam[] = conversation.messages
        // Filter out loading AND system messages before sending to API
        .filter(msg => msg.status !== 'loading' && msg.sender !== 'system') 
        .map(msg => ({
          // Role directly maps from sender ('user' or 'assistant')
          role: msg.sender as 'user' | 'assistant', 
          content: msg.content
        }));

      // Get the function from our new composable
      const { getClientSideChatCompletion } = useOpenAIClient(); 

      // Call the client-side OpenAI utility function
      const responseMessage: ChatCompletionMessage | null = await getClientSideChatCompletion(messagesForApi);

      // Remove loading message regardless of success or failure
      removeMessage(loadingMessageId)

      if (responseMessage && responseMessage.content) {
        // Add the actual AI response
        addMessage({
          content: responseMessage.content,
          sender: 'assistant',
          status: 'sent',
        });
      } else {
        // Add an error message if the API call failed or returned no content
        addMessage({
          content: "Sorry, I couldn't get a response. Please check the console for errors.",
          sender: 'system',
          status: 'sent',
        });
        console.error('Failed to get response from getClientSideChatCompletion');
      }
    } catch (error) {
      console.error('Error during sendMessage:', error);
      // Remove loading message in case of an exception
      removeMessage(loadingMessageId)
      // Add an error message
      addMessage({
        content: 'An unexpected error occurred. Please try again later.',
        sender: 'system',
        status: 'sent',
      });
    } finally {
      aiResponsePending.value = false 
    }
    
    return true
  }
  
  // Initialize with first conversation selected
  onMounted(() => {
    if (conversations.value.length > 0 && !selectedConversationId.value) {
      selectedConversationId.value = conversations.value[0].id
    }
  })
  
  return {
    // State
    conversations,
    selectedConversationId,
    sidebarOpen,
    aiResponsePending,
    
    // Getters
    selectedConversation,
    currentMessages,
    
    // Actions
    createNewConversation,
    selectConversation,
    toggleSidebar,
    addMessage,
    removeMessage,
    clearSuggestions,
    sendMessage
  }
})
