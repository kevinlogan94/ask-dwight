<template>
  <UDashboardNavbar 
    class="fixed w-full z-30"
    :toggle="false"
  >
    <template #left>
      <div class="flex items-center">
          <UButton
            v-if="route.path === '/'"
            @click="toggleSidebar"
            :icon="chatStore.sidebarOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'"
            color="neutral"
            variant="ghost"
            class="mr-3"
            aria-label="Toggle sidebar"
          />

          <div class="flex items-center cursor-pointer" @click="goToHome">
            <img src="/favicons/favicon.svg" alt="Ask Dwight Logo" class="w-6 h-6 mr-2" />
            <h1 class="text-lg font-bold">Ask Dwight</h1>
            <span
            v-if="route.path === '/'"
            class="ml-2 text-gray-600 dark:text-gray-400 font-medium truncate"
          >
           - {{ truncatedTitle }}
          </span>
          </div>
      </div>
    </template>
    
    <template #right>
      <div v-if="isAuthenticated">
        <UDropdownMenu :items="profileMenuItems">
          <UButton color="neutral" variant="ghost" trailing-icon="heroicons:chevron-down">
            <div class="flex items-center gap-2">
              <UAvatar
                :src="user?.avatar"
                :alt="user?.name"
                size="sm"
              />
              <span class="hidden sm:inline">{{ user?.name }}</span>
            </div>
          </UButton>
        </UDropdownMenu>
      </div>
      <UButton
        v-else-if="route.path !== '/auth/login'"
        variant="soft"
        color="primary"
        @click="goToLogin"
      >
        Login
      </UButton>
    </template>
  </UDashboardNavbar>
</template>

<script setup lang="ts">
import { useChatStore } from "~/stores/chat";
import { useAuth } from "~/composables/useAuth";
import { useRoute } from 'vue-router';
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';

const route = useRoute();
const chatStore = useChatStore();
const { user, isAuthenticated, login, logout } = useAuth();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller('sm'); // smaller than 640px

const profileMenuItems = computed(() => [
  [
    {
      label: user.value?.name,
      avatar: {
        src: user.value?.avatar,
        alt: user.value?.name
      },
      type: 'label',
      disabled: true
    },
    {
      label: user.value?.email,
      type: 'label',
      disabled: true
    }
  ],
  [
    {
      label: 'Settings',
      icon: 'heroicons:cog-6-tooth'
    },
    {
      label: 'Logout',
      icon: 'heroicons:arrow-right-on-rectangle',
      onSelect: () => logout()
    }
  ]
]);

const truncatedTitle = computed(() => {
  const title = chatStore.selectedConversation?.title;
  if (!title) return ''; // Handle case where there is no title
  if (isMobile.value && title.length > 10) {
    return title.substring(0, 10) + '...';
  } 
  return title; // Return full title on larger screens or if title is short
});

function toggleSidebar() {
  chatStore.toggleSidebar();
}

function goToLogin() {
  navigateTo('/auth/login');
}

function goToHome() {
  navigateTo('/');
}
</script>
