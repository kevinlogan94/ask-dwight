<template>
  <div class="relative">
    <!-- Sidebar container -->
    <div
      class="conversation-sidebar fixed inset-y-0 left-0 w-64 transition-transform duration-300 flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
      :class="{ '-translate-x-full': !isOpen }"
    >
      <!-- Sidebar header with logo and close button -->
      <div class="flex items-center justify-between p-4 border-b border-gray-400 dark:border-gray-800">
        <UButton
          @click="toggleSidebar"
          icon="heroicons:x-mark"
          color="neutral"
          variant="ghost"
          aria-label="Toggle sidebar"
        />
        <div class="flex items-center">
          <img src="/favicons/favicon.svg" alt="Ask Dwight Logo" class="w-6 h-6 mr-2" />
          <h1 class="text-lg font-bold">Ask Dwight</h1>
        </div>
      </div>

      <!-- New conversation button -->
      <div class="p-4 border-b border-gray-400 dark:border-gray-800">
        <UButton color="primary" variant="soft" class="w-full" :icon="'heroicons:plus'" @click="handleNewConversation">
          New Conversation
        </UButton>
      </div>

      <!-- Conversation list -->
      <div class="flex-1 overflow-y-auto py-2 px-2">
        <div v-if="chatStore.conversations.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
          No conversations yet
        </div>

        <UButton
          v-for="conversation in chatStore.conversations"
          :key="conversation.id"
          size="md"
          color="secondary"
          variant="ghost"
          class="w-full mb-2 text-left text-gray-700 dark:text-gray-300"
          :class="{ 'bg-primary-500/10': conversation.id === chatStore.selectedConversationId }"
          @click="selectConversation(conversation)"
        >
          <div class="flex items-center justify-between w-full">
            <div class="truncate">{{ conversation.title || "Untitled Conversation" }}</div>
            <UBadge v-if="conversation.unread" color="primary" size="xs">New</UBadge>
          </div>
        </UButton>
      </div>

      <!-- Sidebar footer with ColorModeButton -->
      <div class="mt-auto p-4 border-t border-gray-400 dark:border-gray-800 flex items-center justify-between">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          <span>© {{ new Date().getFullYear() }} Ask Dwight</span>
        </div>
        <UColorModeButton />
      </div>
    </div>

    <!-- Dark overlay that appears behind the sidebar on mobile -->
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" @click="toggleSidebar"></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useChatStore, type Conversation } from "~/stores/chat";
import ColorModeButton from "~/components/ColorModeButton.vue";

// Use the chat store
const chatStore = useChatStore();
const { gtag } = useGtag();

// Local state for component functionality
const isOpen = computed({
  get: () => chatStore.sidebarOpen,
  set: (value) => chatStore.toggleSidebar(value),
});

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
};

const handleNewConversation = () => {
  chatStore.createNewConversation();

  gtag("event", "sidebar_click_newConversation", {
    event_category: "engagement",
    event_label: "ask_dwight",
    non_interaction: false,
  });

  if (window.innerWidth < 1024) {
    // Auto-close sidebar on mobile after creating a new conversation
    isOpen.value = false;
  }
};

const selectConversation = (conversation: Conversation) => {
  chatStore.selectConversation(conversation.id);
  if (window.innerWidth < 1024) {
    // Auto-close sidebar on mobile after selecting a conversation
    isOpen.value = false;
  }

  gtag("event", "sidebar_click_selectConversation", {
    event_category: "engagement",
    event_label: "ask_dwight",
    value: conversation.id,
    non_interaction: false,
  });
};
</script>

<style scoped>
.conversation-sidebar {
  z-index: 40; /* Below navbar but above content */
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
