import { defineStore } from 'pinia'
import type { ChatCompletionMessage, ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { useOpenAIClient } from '~/composables/useOpenAIClient';
import { useLocalStorage } from '@vueuse/core';
import { useSuggestions } from '~/composables/useSuggestions';
import { useHelpers } from '~/composables/useHelpers';

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
  // Constants
  const DEFAULT_ERROR_MESSAGE = "Your sales coach is temporarily off the grid—probably closing a deal or wrestling an API. Don't worry. We're rerouting. Try again in a few.";

  // State

  // Set up local storage for conversations. Set the default value to an empty array. This is set if there is nothing in local storage.
  let conversations = ref<Conversation[]>([])
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
  async function createNewConversation() {
    aiResponsePending.value = true;
    const { getClientSideChatCompletion } = useOpenAIClient();

    var messageforApi: ChatCompletionMessageParam[] = [{
      content: "Hey",
      role: 'user'
    }] 

    // Create new conversation
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date()
    };
    conversations.value.push(newConversation)
    selectedConversationId.value = newConversation.id

    // Add loading message and get its ID
    const loadingMessage = addMessage({
      content: '',
      sender: 'system',
      status: 'loading'
    })
    const loadingMessageId = loadingMessage.id

    try {
      const responseMessage: ChatCompletionMessage | null = await getClientSideChatCompletion(messageforApi);

      // Remove loading message regardless of success or failure
      removeMessage(loadingMessageId)

      if (responseMessage?.content) {
        addMessage({
          content: responseMessage.content,
          sender: 'assistant',
          suggestions: [
            'I need to fix my follow-up. It’s sloppy and costing me deals.', 
            'Outreach is decent, but replies are weak. Need stronger hooks.', 
            'Lead scoring feels like guessing. I want it to mean something.'
          ],
          status: 'sent'
        });
      } else {
        addMessage({
          content: DEFAULT_ERROR_MESSAGE,
          sender: 'system',
          status: 'sent'
        });
      }
    } catch (error) {
      console.error('Error creating new conversation:', error);
      removeMessage(loadingMessageId)
      addMessage({
        content: DEFAULT_ERROR_MESSAGE,
        sender: 'system',
        status: 'sent'
      });
    }

    aiResponsePending.value = false;
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

  async function sendMessage(content: string) {
    if (!content.trim()) return
    clearSuggestions();
    
    // Create a new conversation if none is selected or get the current one
    let conversation = selectedConversation.value;
    if (!conversation) {
      conversation = await createNewConversation();
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
      const messagesForApi: ChatCompletionMessageParam[] = organizeMessagesForApi(conversation.messages);

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

        // Generate suggestions after adding the assistant message
        generateSuggestions();
      } else {
        // Add an error message if the API call failed or returned no content
        addMessage({
          content: DEFAULT_ERROR_MESSAGE,
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
        content: DEFAULT_ERROR_MESSAGE,
        sender: 'system',
        status: 'sent',
      });
    } finally {
      aiResponsePending.value = false
    }

    return true
  }

  const { organizeMessagesForApi } = useHelpers();
  const { generateSuggestions, clearSuggestions } = useSuggestions(selectedConversation);

  // Initialize with first conversation selected
  onMounted(() => {
    conversations.value = useLocalStorage<Conversation[]>('chat-conversations', []).value;

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
    sendMessage
  }
})
