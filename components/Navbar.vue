<template>
  <nav class="fixed w-full bg-white dark:bg-gray-900 shadow">
    <div class="px-4">
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

          <div class="flex items-center">
          <Icon name="heroicons:chat-bubble-left-right" class="w-6 h-6 text-primary-500 mr-2" />
          <h1 class="text-lg font-bold">Ask Dwight</h1>
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
