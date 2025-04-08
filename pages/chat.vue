<template>
  <div class="min-h-screen w-full flex flex-col items-center">
    <!-- Chat container - width set only once at this level -->
    <div class="flex-1 flex flex-col w-full max-w-3xl mx-auto pb-32"> <!-- Added padding at bottom for fixed elements -->
      <!-- Chat messages area with scroll -->
      <div class="flex-1 py-4 px-4 md:px-6 overflow-y-auto">
        <!-- Dynamic message rendering from messages array -->
        <div v-for="message in messages" :key="message.id" class="mb-4">
          <!-- System message with loading state -->
          <div v-if="message.sender === 'system'" class="flex items-start">
            <div class="max-w-[80%]">
              <div class="bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 text-white">
                <!-- Use the typing animation component when loading -->
                <TypingAnimation v-if="message.status === 'loading'" />
                <p v-else>{{ message.content }}</p>
              </div>
            </div>
          </div>

          <!-- User message -->
          <div v-else class="flex items-start justify-end">
            <div class="max-w-[80%]">
              <div class="bg-primary-600 backdrop-blur-sm rounded-lg p-3 text-white">
                <p>{{ message.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Fixed elements container at bottom -->
    <div class="fixed bottom-0 left-0 right-0 flex flex-col items-center bg-gradient-to-t from-gray-950 to-transparent pb-4 pt-8">
      <div class="w-full max-w-3xl mx-auto">
        <!-- Scroll down indicator - only shown when not at bottom -->
        <div v-if="!isAtBottom" class="flex justify-center mb-4">
          <UButton variant="ghost" class="rounded-full p-2 bg-gray-800/60" @click="scrollToBottom">
            <Icon name="heroicons:arrow-down" class="w-5 h-5" />
          </UButton>
        </div>

        <!-- Input container -->
        <div class="px-4 md:px-6 pb-4">
          <!-- Ask anything input -->
          <AskAnythingInput :onSubmit="sendMessage" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

interface Message {
  id: string
  content: string
  sender: 'user' | 'system'
  timestamp: Date
  status?: 'loading' | 'sent'
}

const messages = ref<Message[]>([
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
    timestamp: new Date()
  }
])

const isAtBottom = ref(true)

const sendMessage = (message: string) => {
  console.log('Sending message:', message);
  
  if (!message.trim()) return 
  
  // Add user message
  messages.value.push({
    id: crypto.randomUUID(),
    content: message,
    sender: 'user',
    timestamp: new Date(),
    status: 'sent'
  })

  // Add loading message
  const loadingMessageId = crypto.randomUUID()
  messages.value.push({
    id: loadingMessageId,
    content: '',
    sender: 'system',
    timestamp: new Date(),
    status: 'loading'
  })
  
  // Scroll to bottom to show loading indicator
  scrollToBottom()

  // Simulate AI response (in a real app, this would be an API call)
  setTimeout(() => {
    // Find and remove the loading message
    const loadingIndex = messages.value.findIndex(msg => msg.id === loadingMessageId)
    if (loadingIndex !== -1) {
      messages.value.splice(loadingIndex, 1)
    }
    
    // Add the actual response
    messages.value.push({
      id: crypto.randomUUID(),
      content: "I'm here to help! What can I assist you with today?",
      sender: 'system',
      timestamp: new Date(),
      status: 'sent'
    })
    
    // Scroll to bottom again after response is added
    scrollToBottom()
  }, 1000)
}

const scrollToBottom = async () => {
  console.log('Scrolling to bottom');
  
  // First wait for Vue to update the DOM
  await nextTick()
  
  // Update our position state
  isAtBottom.value = true
  
  // Scroll window to the bottom
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
  })
}

// Check if user is at bottom of document
const checkIfAtBottom = () => {
  // Get scroll position and document height
  const scrollPosition = window.scrollY + window.innerHeight
  const documentHeight = document.body.scrollHeight
  
  // Consider "at bottom" if within 100px of the bottom
  isAtBottom.value = documentHeight - scrollPosition < 100
}

// Scroll to bottom on initial load and setup scroll listener
onMounted(() => {
  scrollToBottom()
  
  // Add scroll event listener to check position
  window.addEventListener('scroll', checkIfAtBottom)
})

// Clean up event listener when component is unmounted
onUnmounted(() => {
  window.removeEventListener('scroll', checkIfAtBottom)
})

// Watch for changes in the messages array
watch(() => messages.value.length, () => {
  // If user was already at bottom, scroll to bottom when new messages are added
  // Otherwise, don't auto-scroll and show the button instead
  if (isAtBottom.value) {
    scrollToBottom()
  }
})
</script>

<style scoped>
/* Component-specific styles */
</style>
