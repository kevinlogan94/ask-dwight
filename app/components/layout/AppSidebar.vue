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

      <!-- Main navigation -->
      <div class="p-2 space-y-1">
        <!-- <UButton
          to="/my-playbook"
          icon="i-lucide-notebook-tabs"
          variant="ghost"
          color="neutral"
          class="w-full justify-start text-base font-normal"
        >
          My Playbook
        </UButton> -->
<!-- 
        <UAccordion v-if="accounts.length > 0" :items="accordionItems" :ui="{ label:'text-base font-normal', item: 'p-0 w-full', trigger: 'px-3 py-2 hover:bg-transparent dark:hover:bg-transparent' }">
          
          <template #accounts-body>
            <div class="space-y-1">
              <UButton
                v-for="account in accounts.slice(0, 2)"
                :key="account.to"
                :to="account.to"
                variant="ghost"
                color="neutral"
                class="w-full justify-start text-base font-normal pl-8"
              >
                {{ account.label }}
              </UButton>
              <UButton
                v-if="accounts.length > 0"
                to="/accounts"
                variant="ghost"
                color="neutral"
                class="w-full justify-start text-base font-normal pl-8"
              >
                See all
              </UButton>
            </div>
          </template>
        </UAccordion>
        <UButton
          v-else
          to="/accounts"
          icon="i-lucide-users"
          variant="ghost"
          color="neutral"
          class="w-full justify-start text-base font-normal"
        >
          Accounts
        </UButton> -->

        <UButton
          icon="i-lucide-plus-circle"
          variant="ghost"
          color="neutral"
          class="w-full justify-start text-base font-normal"
          @click="handleNewConversation"
        >
          New Conversation
        </UButton>
      </div>

      <!-- Conversation list -->
      <div class="flex-1 overflow-y-auto py-2 px-2 border-t border-gray-200 dark:border-gray-800 mt-2">
        <div class="px-2 pb-2 pt-2">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">Recent</p>
        </div>
        <div v-if="chatStore.conversations.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
          No conversations yet
        </div>

        <UButton
          v-for="conversation in sortedConversations"
          :key="conversation.id"
          icon="i-lucide-message-square"
          variant="ghost"
          color="neutral"
          class="w-full mb-1 justify-start font-normal"
          :class="{ 'bg-gray-200 dark:bg-gray-800': conversation.id === chatStore.selectedConversationId }"
          @click="selectConversation(conversation)"
        >
          <span class="truncate">{{ conversation.title || "Untitled Conversation" }}</span>
        </UButton>
      </div>

      <!-- Sidebar footer with ColorModeButton -->
      <div class="mt-auto p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          <span>© {{ new Date().getFullYear() }} Ask Dwight</span>
        </div>
        <div class="flex items-center space-x-2">
          <FeedbackButton />
          <UColorModeButton />
        </div>
      </div>
    </div>

    <!-- Dark overlay that appears behind the sidebar on mobile -->
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" @click="toggleSidebar"></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from "~/stores/chat";
import type { Conversation } from "~/models/chat";
import FeedbackButton from "~/components/chat/FeedbackButton.vue";

const router = useRouter();

const accordionItems = [
  {
    label: 'Accounts',
    icon: 'i-lucide-users',
    slot: 'accounts-body',
  },
];

// Placeholder for accounts data
const accounts = ref([
  { label: "Acme Corp", to: "/accounts/acme" },
  { label: "MegaCorp", to: "/accounts/mega" },
]);

// Use the chat store
const chatStore = useChatStore();

const sortedConversations = computed(() => {
  return [...chatStore.conversations].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
});

// Local state for component functionality
const isOpen = computed({
  get: () => chatStore.sidebarOpen,
  set: (value) => chatStore.toggleSidebar(value),
});

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
};

const handleNewConversation = () => {
  // Select null to display the new conversation screen
  chatStore.selectConversation(null);
  if (router.currentRoute.value.path !== '/') {
    router.push('/');
  }
  

  if (window.innerWidth < 1024) {
    // Auto-close sidebar on mobile after creating a new conversation
    isOpen.value = false;
  }

  useTrackEvent("sidebar_click_newConversation", {
    event_category: "engagement",
    event_label: "ask_dwight",
    non_interaction: false,
  });
};

const selectConversation = (conversation: Conversation) => {
  chatStore.selectConversation(conversation.id);
  if (router.currentRoute.value.path !== '/') {
    router.push('/');
  }
  if (window.innerWidth < 1024) {
    // Auto-close sidebar on mobile after selecting a conversation
    isOpen.value = false;
  }

  useTrackEvent("sidebar_click_selectConversation", {
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
