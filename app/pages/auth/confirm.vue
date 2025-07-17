<script setup lang="ts">
definePageMeta({ showSidebar: false });
import { useChatStore } from "~/stores/chat";

const user = useSupabaseUser();
const chatStore = useChatStore();

watch(
  user,
  () => {
    if (user.value) {
      chatStore.associateConversationsWithUser();
      useTrackEvent("confirm_page_success", {
        event_category: "conversion",
        event_label: "authentication",
        value: user.value?.user_metadata?.email,
        non_interaction: true,
      });

      // Redirect to protected page
      return navigateTo("/");
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4 min-h-screen">
    <UPageCard class="w-full max-w-md">
      <div class="flex flex-col items-center justify-center p-6 space-y-6 text-center">
        <UIcon name="i-lucide-circle-check" class="text-primary w-16 h-16" />

        <div class="space-y-2">
          <h1 class="text-2xl font-bold">Authentication in Progress</h1>
          <p class="text-gray-500 dark:text-gray-400">Please wait while we confirm your authentication...</p>
        </div>

        <UProgress class="w-full" animation="carousel" />

        <p class="text-sm text-gray-500 dark:text-gray-400">
          You'll be redirected automatically once the process is complete.
        </p>
      </div>
    </UPageCard>
  </div>
</template>
