<template>
  <div>
    <UBanner
      v-if="isBannerVisible"
      icon="i-lucide-rocket"
      title="Unlock Your Full Potential: Ask-Dwight Pro!"
      :actions="[{ label: 'Pre-Order Now', to: proLink, target: '_blank', trailingIcon: 'i-lucide-arrow-right' }]"
      class="fixed w-full z-50"
      :ui="{ container: 'h-8' }"
    />
    <UHeader
      class="fixed w-full z-50 bg-white dark:bg-gray-900 shadow-sm"
      :class="{ 'mt-8': isBannerVisible }"
      :toggle="false"
      v-if="route.path !== '/auth/confirm'"
    >
      <template #title>
      <div class="flex items-center">
        <UButton
          v-if="showSidebar"
          @click="toggleSidebar"
          :icon="chatStore.sidebarOpen ? 'i-lucide-x' : 'i-lucide-menu'"
          color="neutral"
          variant="ghost"
          class="mr-3"
          aria-label="Toggle sidebar"
        />

        <div class="flex items-center cursor-pointer" @click="goToHome">
          <img src="/favicons/favicon.svg" alt="Ask Dwight Logo" class="w-6 h-6 mr-2" />
          <h1 class="text-lg font-bold">Ask Dwight</h1>
          <span
            v-if="route.path === '/' && chatStore.selectedConversation"
            class="ml-2 text-gray-600 dark:text-gray-400 font-medium truncate"
          >
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
  </UHeader>
</div>
</template>

<script setup lang="ts">
import { useBanner } from '~/composables/useBanner';
import { useChatStore } from "~//stores/chat";
import { useRoute } from "vue-router";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { validateImageUrl } from "~/utils/helpers";
import { deleteSupabaseCookies } from "~/utils/helpers";

const route = useRoute();
const chatStore = useChatStore();
const { isBannerVisible } = useBanner();
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const toast = useToast();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("sm"); // smaller than 640px

const showSidebar = computed(() => route.meta.showSidebar === true);

const avatarUrl = ref("");
const proLink = ref("https://ask-dwight.com/pro");

onMounted(async () => {
  avatarUrl.value = (await validateImageUrl(user.value?.user_metadata?.avatar_url))
    ? user.value?.user_metadata?.avatar_url
    : "";
});

/**
 * Checks if an authentication error is critical and requires clearing Supabase cookies.
 * @param error The authentication error to check.
 * @returns True if the error is critical and requires cookie clearing, false otherwise.
 */
const isKnownAuthErrorRequiringCookieClear = (error: any): boolean => {
  if (!error) return false;
  if (error.name === "AuthSessionMissingError") {
    return true;
  }
  if (error.name === "AuthApiError") {
    const criticalErrorCodes = ["refresh_token_not_found", "invalid_grant"];
    return criticalErrorCodes.includes(error.code);
  }
  return false;
};

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
      onSelect: () => window.open(proLink.value, "_blank"),
    },
    {
      label: "Logout",
      icon: "heroicons:arrow-right-on-rectangle",
      onSelect: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Error logging out:", error);
          if (isKnownAuthErrorRequiringCookieClear(error)) {
            console.warn("Known authentication error encountered during logout. Manually clearing Supabase cookies.");
            deleteSupabaseCookies();
          } else {
            console.error("Logout failed with an unhandled error. Requesting user to try again.");
            toast.add({
              title: "Logout Failed",
              icon: "heroicons:exclamation-circle",
              description: "An unexpected error occurred. Please try logging out again.",
              color: "error",
            });
            return;
          }
        }
        useTrackEvent("navbar_click_logout", {
          event_category: "conversion",
          event_label: "authentication",
          non_interaction: false,
        });
        chatStore.conversations = [];
        chatStore.selectConversation(null);
      },
    },
  ],
]);

const truncatedTitle = computed(() => {
  const title = chatStore.selectedConversation?.title;
  if (!title) return ""; // Handle case where there is no title
  if (isMobile.value && title.length > 7) {
    return title.substring(0, 7) + "...";
  }
  return title; // Return full title on larger screens or if title is short
});

function toggleSidebar() {
  chatStore.toggleSidebar();

  useTrackEvent("navbar_click_toggleSidebar", {
    event_category: "engagement",
    event_label: "ui_interaction",
    non_interaction: false,
  });
}

function goToLogin() {
  navigateTo("/auth/login");
}

function goToHome() {
  navigateTo("/");
}
</script>
