<template>
  <div class="min-h-screen w-full flex pt-16">
    <!-- Sidebar component -->
    <ChatSidebar />
    
    <!-- Main chat area with transition for sidebar -->
    <div 
      class="flex-1 flex flex-col transition-all duration-300"
      :class="{ 'ml-0 lg:ml-64': chatStore.sidebarOpen }"
    >
      <!-- Chat container - centered with max width -->
      <div class="flex-1 flex flex-col w-full max-w-3xl mx-auto pb-32">
        <!-- Chat messages area-->
        <div class="flex-1 py-4 px-4 md:px-6">
          <!-- Dynamic message rendering from messages array -->
          <div v-for="message in chatStore.currentMessages" :key="message.id" class="mb-4" v-motion-slide-bottom>
            
            <!-- System Message (Loading, Errors) -->
            <div v-if="message.sender === 'system'" class="flex items-start">
              <div class="max-w-[80%]">
                <div class="bg-gray-800 backdrop-blur-sm rounded-lg p-3 text-white">
                  <!-- Use the typing animation component only when loading -->
                  <TypingAnimation v-if="message.status === 'loading'" />
                  <!-- Display content if not loading (e.g., for error messages) -->
                  <p v-else>{{ message.content }}</p>
                </div>
              </div>
            </div>

            <!-- Assistant Message (AI Response) -->
            <div v-else-if="message.sender === 'assistant'" class="flex items-start">
              <div class="max-w-[80%]">
                <div class="bg-gray-800 backdrop-blur-sm rounded-lg p-3 text-white">
                  <!-- Display AI response content -->
                  <p>{{ message.content }}</p>
                </div>
                <!-- Show suggestion chips for assistant messages if available -->
                <SuggestionChips 
                  v-if="message.suggestions?.length" 
                  :suggestions="message.suggestions || []" 
                  @select="(suggestion: string) => handleSuggestionSelect(suggestion)" 
                  class="mt-3" 
                />
              </div>
            </div>

            <!-- User Message -->
            <div v-else-if="message.sender === 'user'" class="flex items-start justify-end">
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
      <div class="fixed bottom-0 left-0 right-0 flex flex-col items-center bg-gradient-to-t from-gray-950 to-transparent pb-4 pt-8 transition-all duration-300"
           :class="{ 'ml-0 lg:ml-64': chatStore.sidebarOpen }">
        <div class="w-full max-w-3xl mx-auto">
          <!-- Scroll down button component -->
          <ScrollToBottomButton ref="scrollButton" /> 

          <!-- Input container -->
          <div class="px-4 md:px-6 pb-4">
            <!-- Ask anything input -->
            <AskAnythingInput :onSubmit="sendMessage" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScrollToBottomButtonInstance } from '~/components/chat/ScrollToBottomButton.vue'
import SuggestionChips from '~/components/chat/SuggestionChips.vue'
import TypingAnimation from '~/components/chat/TypingAnimation.vue'
import ScrollToBottomButton from '~/components/chat/ScrollToBottomButton.vue'
import ChatSidebar from '~/components/chat/ChatSidebar.vue'
import { useChatStore, type Message } from '~/stores/chat'

// Use the chat store
const chatStore = useChatStore()
const scrollButton = ref<ScrollToBottomButtonInstance | null>(null)

// Handle sending a new message using the store
const sendMessage = (message: string) => {
  chatStore.clearSuggestions()
  chatStore.sendMessage(message)
  
  // Scroll to bottom to show the new message
  scrollButton.value?.scrollToBottom()
  
  // Scroll again after the response comes in (handled by the store)
  setTimeout(() => {
    scrollButton.value?.scrollToBottom()
  }, 1100) // Wait slightly longer than the store's timeout
}

// Handle suggestion chip selection
const handleSuggestionSelect = (suggestion: string) => {
  chatStore.clearSuggestions()
  sendMessage(suggestion)
}

// Scroll to bottom on initial load
onMounted(() => {
  scrollButton.value?.scrollToBottom()
})

</script>

<style scoped>
/* Component-specific styles */
</style>
