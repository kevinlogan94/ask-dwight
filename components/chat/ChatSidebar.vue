<template>
  <div class="relative">

    <!-- Sidebar container -->
    <div
      class="conversation-sidebar fixed inset-y-0 left-0 w-64 bg-gray-900 text-white transition-transform duration-300 flex flex-col"
      :class="{ '-translate-x-full': !isOpen }"
    >
      <!-- Sidebar header with logo and close button -->
      <div class="flex items-center justify-between p-4 border-b border-gray-800">
        <div class="flex items-center">
          <Icon name="heroicons:chat-bubble-left-right" class="w-6 h-6 text-primary-500 mr-2" />
          <h1 class="text-lg font-bold">Dwight</h1>
        </div>
        <button @click="toggleSidebar" class="text-gray-400 hover:text-white">
          <Icon name="heroicons:chevron-left" class="w-5 h-5" />
        </button>
      </div>

      <!-- New conversation button -->
      <div class="p-4 border-b border-gray-800">
        <UButton
          color="primary"
          variant="soft"
          class="w-full"
          @click="handleNewConversation"
        >
          <template #prefix>
            <Icon name="heroicons:plus" class="w-4 h-4" />
          </template>
          New Conversation
        </UButton>
      </div>



      <!-- Conversation list -->
      <div class="flex-1 overflow-y-auto py-2 px-2">
        <div v-if="chatStore.conversations.length === 0" class="p-4 text-center text-gray-400">
          No conversations yet
        </div>
        
        <UButton
          v-for="conversation in chatStore.conversations"
          :key="conversation.id"
          size="sm"
          color="secondary"
          variant="ghost"
          class="w-full mb-2 text-left"
          :class="{ 'bg-primary-500/10': conversation.id === chatStore.selectedConversationId }"
          @click="selectConversation(conversation)"
        >
          <div class="flex items-center justify-between w-full">
            <div class="truncate">{{ conversation.title || 'Untitled Conversation' }}</div>
            <UBadge v-if="conversation.unread" color="primary" size="xs">New</UBadge>
          </div>
        </UButton>
      </div>
      
      <!-- Sidebar footer with ColorModeButton -->
      <div class="mt-auto p-4 border-t border-gray-800 flex items-center justify-between">
        <div class="text-sm text-gray-400">
          <span>© {{ new Date().getFullYear() }} Ask Dwight</span>
        </div>
        <ColorModeButton />
      </div>
    </div>

    <!-- Dark overlay that appears behind the sidebar on mobile -->
    <Transition name="fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" 
        @click="toggleSidebar"
      ></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useChatStore, type Conversation } from '~/stores/chat'
import ColorModeButton from '~/components/ColorModeButton.vue'

// Use the chat store
const chatStore = useChatStore()

// Local state for component functionality
const isOpen = computed({
  get: () => chatStore.sidebarOpen,
  set: (value) => chatStore.toggleSidebar(value)
})

const toggleSidebar = () => {
  isOpen.value = !isOpen.value
}

const handleNewConversation = () => {
  chatStore.createNewConversation()
  if (window.innerWidth < 1024) {
    // Auto-close sidebar on mobile after creating a new conversation
    isOpen.value = false
  }
}

const selectConversation = (conversation: Conversation) => {
  chatStore.selectConversation(conversation.id)
  if (window.innerWidth < 1024) {
    // Auto-close sidebar on mobile after selecting a conversation
    isOpen.value = false
  }
}


</script>

<style scoped>
.conversation-sidebar {
  z-index: 40; /* Below navbar but above content */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
