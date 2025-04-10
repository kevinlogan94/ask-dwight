import { defineStore } from 'pinia'

export interface Message {
  id: string
  content: string
  sender: 'user' | 'system'
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
          sender: 'system',
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
          sender: 'system',
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
          sender: 'system',
          timestamp: new Date(),
          suggestions: ['Web development', 'Writing an email', 'Planning a trip']
        }
      ],
      createdAt: new Date()
    }
  ])
  
  const selectedConversationId = ref<string | null>(null)
  const sidebarOpen = ref(false)
  
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
          sender: 'system',
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
  
  function clearSuggestions(messageId: string) {
    if (!selectedConversationId.value) return
    
    const conversation = conversations.value.find(c => c.id === selectedConversationId.value)
    if (!conversation) return
    
    const message = conversation.messages.find(m => m.id === messageId)
    if (message) {
      message.suggestions = []
    }
  }
  
  function sendMessage(content: string) {
    if (!content.trim()) return
    
    // Create a new conversation if none is selected
    if (!selectedConversationId.value) {
      createNewConversation()
    }
    
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
    
    // Simulate AI response (in a real app, this would be an API call)
    setTimeout(() => {
      // Remove loading message
      removeMessage(loadingMessageId)
      
      // Add the actual response
      addMessage({
        content: "I'm here to help! What can I assist you with today?",
        sender: 'system',
        status: 'sent',
        suggestions: ['Tell me about yourself', 'How can you help me?', 'Show me examples']
      })
    }, 1000)
    
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
