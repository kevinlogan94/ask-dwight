<template>
  <nav class="fixed w-full z-50 bg-white dark:bg-gray-900 shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <!-- Only show sidebar toggle on chat page -->
          <UButton 
            v-if="route.path.includes('/chat')"
            @click="toggleSidebar"
            :icon="chatStore.sidebarOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'"
            color="gray"
            variant="ghost"
            class="mr-3"
            aria-label="Toggle sidebar"
          />

          <NuxtLink to="/" class="flex items-center">
            <img src="/favicon.ico" alt="Ask Dwight Logo" class="h-8 w-auto" />
            <span class="ml-3 font-bold text-xl text-gray-900 dark:text-white">Ask Dwight</span>
          </NuxtLink>
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
