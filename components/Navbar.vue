<template>
  <nav class="fixed w-full bg-white z-30 dark:bg-gray-900 shadow">
    <div class="px-4">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <!-- Only show sidebar toggle on chat page -->
          <UButton 
            v-if="route.path.includes('/chat')"
            @click="toggleSidebar"
            :icon="chatStore.sidebarOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'"
            color="neutral"
            variant="ghost"
            class="mr-3"
            aria-label="Toggle sidebar"
          />

          

          <div class="flex items-center">
            <img src="/favicons/favicon.svg" alt="Ask Dwight Logo" class="w-6 h-6 mr-2" />
            <h1 class="text-lg font-bold">Ask Dwight</h1>
            <span v-if="route.path.includes('/chat') && chatStore.selectedConversation" class="ml-2 text-gray-600 dark:text-gray-400 font-medium">
              - {{ chatStore.selectedConversation.title }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat'

const route = useRoute()
const chatStore = useChatStore()

function toggleSidebar() {
  chatStore.toggleSidebar()
}
</script>
