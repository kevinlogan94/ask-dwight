<template>
  <UDashboardNavbar
    class="fixed w-full z-50 bg-white dark:bg-gray-900 shadow-sm"
    :toggle="false"
    v-if="route.path !== '/auth/confirm'"
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
          <span v-if="route.path === '/'" class="ml-2 text-gray-600 dark:text-gray-400 font-medium truncate">
            - {{ truncatedTitle }}
          </span>
        </div>
      </div>
    </template>

    <template #right>
      <div v-if="user">
        <UDropdownMenu :items="profileMenuItems" :content="{ align: 'end' }">
          <UButton color="neutral" variant="ghost" trailing-icon="heroicons:chevron-down">
            <div class="flex items-center gap-2">
              <UAvatar :src="avatarUrl" :alt="user.user_metadata.name" size="sm" />
              <span class="hidden sm:inline">{{ user.user_metadata.name }}</span>
            </div>
          </UButton>
        </UDropdownMenu>
      </div>
      <UButton v-else-if="route.path !== '/auth/login'" variant="soft" color="primary" @click="goToLogin">
        Login
      </UButton>
    </template>
  </UDashboardNavbar>
</template>

<script setup lang="ts">
import { useChatStore } from "~/stores/chat";
import { useRoute } from "vue-router";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { useHelpers } from "~/composables/useHelpers";

const route = useRoute();
const chatStore = useChatStore();
const user = useSupabaseUser();
const supabase = useSupabaseClient();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("sm"); // smaller than 640px

const avatarUrl = ref("");

onMounted(async () => {
  avatarUrl.value = (await useHelpers().validateImageUrl(user.value?.user_metadata?.avatar_url))
    ? user.value?.user_metadata?.avatar_url
    : "";
});

const profileMenuItems = computed(() => [
  [
    {
      label: user.value?.user_metadata.email,
      type: "label",
      disabled: true,
    },
  ],
  [
    {
      label: "Pricing",
      icon: "heroicons:tag",
      onSelect: () => navigateTo("/pricing"),
    },
    {
      label: "Logout",
      icon: "heroicons:arrow-right-on-rectangle",
      onSelect: () => supabase.auth.signOut(),
    },
  ],
]);

const truncatedTitle = computed(() => {
  const title = chatStore.selectedConversation?.title;
  if (!title) return ""; // Handle case where there is no title
  if (isMobile.value && title.length > 10) {
    return title.substring(0, 10) + "...";
  }
  return title; // Return full title on larger screens or if title is short
});

function toggleSidebar() {
  chatStore.toggleSidebar();
}

function goToLogin() {
  navigateTo("/auth/login");
}

function goToHome() {
  navigateTo("/");
}
</script>
