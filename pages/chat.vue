<template>
  <div class="min-h-screen w-full flex flex-col items-center">
    <!-- Chat container - width set only once at this level -->
    <div class="flex-1 flex flex-col w-full max-w-3xl mx-auto pb-32"> <!-- Added padding at bottom for fixed elements -->
      <!-- Chat messages area with scroll -->
      <div class="flex-1 py-4 px-4 md:px-6 overflow-y-auto" ref="chatContainer">
        <!-- Dynamic message rendering from messages array -->
        <div v-for="message in messages" :key="message.id" class="mb-4">
          <!-- System message -->
          <div v-if="message.sender === 'system'" class="flex items-start">
            <div class="max-w-[80%]">
              <div class="bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 text-white">
                <p>{{ message.content }}</p>
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
        <!-- Scroll down indicator -->
        <div class="flex justify-center mb-4">
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
  },
  // {
  //   id: '6',
  //   content: 'I need help setting up a Nuxt project with Tailwind CSS',
  //   sender: 'user',
  //   timestamp: new Date()
  // },
  // {
  //   id: '7',
  //   content: "That's a great choice! Nuxt 3 with Tailwind CSS is a powerful combination for building modern web applications. Let me guide you through the setup process.",
  //   sender: 'system',
  //   timestamp: new Date()
  // },
  // {
  //   id: '8',
  //   content: 'Can you show me how to add animations?',
  //   sender: 'user',
  //   timestamp: new Date()
  // },
  // {
  //   id: '9',
  //   content: "Absolutely! For animations in Nuxt 3, I recommend using @vueuse/motion which integrates nicely with the Vue ecosystem. It provides a simple way to add entrance animations, hover effects, and more complex animation sequences.",
  //   sender: 'system',
  //   timestamp: new Date()
  // },
  // {
  //   id: '10',
  //   content: 'Thanks, what about form submissions?',
  //   sender: 'user',
  //   timestamp: new Date()
  // },
  // {
  //   id: '11',
  //   content: "For form submissions, you can use Netlify Forms which integrates well with Nuxt. It provides a serverless solution for handling form submissions without needing a backend. You just need to add the 'netlify' attribute to your form tag and configure the form name.",
  //   sender: 'system',
  //   timestamp: new Date()
  // },
  // {
  //   id: '12',
  //   content: 'Thanks, what about form submissions?',
  //   sender: 'user',
  //   timestamp: new Date()
  // },
  // {
  //   id: '13',
  //   content: "For form submissions, you can use Netlify Forms which integrates well with Nuxt. It provides a serverless solution for handling form submissions without needing a backend. You just need to add the 'netlify' attribute to your form tag and configure the form name.",
  //   sender: 'system',
  //   timestamp: new Date()
  // },
  // {
  //   id: '14',
  //   content: 'Thanks, what about form submissions?',
  //   sender: 'user',
  //   timestamp: new Date()
  // },
  // {
  //   id: '15',
  //   content: "For form submissions, you can use Netlify Forms which integrates well with Nuxt. It provides a serverless solution for handling form submissions without needing a backend. You just need to add the 'netlify' attribute to your form tag and configure the form name.",
  //   sender: 'system',
  //   timestamp: new Date()
  // }
])

const chatContainer = ref<HTMLElement | null>(null)

const sendMessage = (message: string) => {
  console.log('Sending message:', message);
  
  if (!message.trim()) return 
  
  // Add user message
  messages.value.push({
    id: crypto.randomUUID(),
    content: message,
    sender: 'user',
    timestamp: new Date()
  })

  // Simulate AI response (in a real app, this would be an API call)
  setTimeout(() => {
    messages.value.push({
      id: crypto.randomUUID(),
      content: "I'm here to help! What can I assist you with today?",
      sender: 'system',
      timestamp: new Date()
    })
    
    // Scroll to bottom
    scrollToBottom()
  }, 1000)
}

const scrollToBottom = async () => {
  console.log('Scrolling to bottom');
  console.log(chatContainer.value);
  
  
  // First wait for Vue to update the DOM
  await nextTick()
  
  // Then apply the scroll
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    
    // As a fallback, also scroll the window to the bottom
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    })
  }
}

// Scroll to bottom on initial load and when messages change
onMounted(() => {
  scrollToBottom()
})

// Watch for changes in the messages array and scroll to bottom when new messages are added
watch(() => messages.value.length, () => {
  scrollToBottom()
})
</script>

<style scoped>
/* Add any specific styles for the chat page here */
</style>
