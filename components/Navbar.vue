<template>
  <nav class="fixed w-full z-50 bg-white dark:bg-gray-900 shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <!-- Only show sidebar toggle on chat page -->
          <button 
            v-if="route.path.includes('/chat')"
            @click="toggleSidebar"
            class="mr-3 p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Toggle sidebar"
          >
            <Icon :name="chatStore.sidebarOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'" class="w-5 h-5" />
          </button>

          <NuxtLink to="/" class="flex items-center">
            <img src="/favicon.ico" alt="Ask Dwight Logo" class="h-8 w-auto" />
            <span class="ml-3 font-bold text-xl text-gray-900 dark:text-white">Ask Dwight</span>
          </NuxtLink>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Color mode button moved to sidebar -->
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat'
// ColorModeButton moved to sidebar

const route = useRoute()
const chatStore = useChatStore()

function toggleSidebar() {
  chatStore.toggleSidebar()
}
</script>
