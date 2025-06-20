<template>
  <div>
    <!-- Suggestions static header with icon -->
    <div v-if="!chatStore.showNewConversationScreen" class="text-sm dark:text-gray-300 mb-2 flex items-center gap-1">
      <span>Continue with:</span>
    </div>

    <!-- Suggestion buttons -->
    <div class="flex gap-2 flex-col md:flex-row justify-between">
      <template v-for="(suggestion, index) in suggestions" :key="index">
        <USkeleton v-if="suggestion === 'loading'" class="h-8 w-full rounded dark:bg-gray-900" />
        <UButton v-else size="md" color="neutral" variant="outline" class="ring-0" @click="handleClick(suggestion)">
          {{ suggestion }}
        </UButton>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from "~//stores/chat";

const chatStore = useChatStore();
const props = defineProps<{
  suggestions: string[];
}>();

function handleClick(suggestion: string) {
  chatStore.sendMessage(suggestion);

  useTrackEvent("suggestionChips_click_select", {
    event_category: "engagement",
    event_label: "ask_dwight",
    value: suggestion,
    non_interaction: false,
  });
}
</script>

<style scoped></style>
