<template>
  <div class="relative w-full">
    <div class="flex justify-end mb-2 mr-1">
      <DojoMeter />
    </div>
    <form
    class="search-input bg-neutral-800/70 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2 border border-neutral-700 shadow-lg"
    @submit.prevent="handleSubmit"
  >
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Ask anything..."
      autofocus
      :disabled="chatStore.throttleConversation"
      class="flex-1 bg-transparent border-none outline-none placeholder:text-neutral-400 text-white text-base transition-opacity duration-200"
    />
    <UButton
      type="submit"
      color="success"
      variant="solid"
      :disabled="!searchQuery.trim() || chatStore.aiResponsePending || chatStore.throttleConversation"
      icon="heroicons:arrow-right"
      :loading="chatStore.aiResponsePending"
      class="h-8"
    />
  </form>
  <p class="text-xs text-neutral-400 mt-1 text-center">Dwight can make mistakes. Double-check his work.</p>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from "~/stores/chat";
import DojoMeter from "./chat/DojoMeter.vue";

const chatStore = useChatStore();

const props = defineProps({
  onSubmit: {
    type: Function,
    default: undefined,
  },
});

const searchQuery = ref("");

const handleSubmit = () => {
  if (searchQuery.value.trim() && props.onSubmit) {
    props.onSubmit(searchQuery.value);
    searchQuery.value = "";

    useTrackEvent("form_submit_question", {
      event_category: "engagement",
      event_label: "ask_dwight",
      value: searchQuery.value.length, // Track length instead of content for privacy
      non_interaction: false,
    });
  }
};
</script>

<style scoped>
.search-input {
  transition: all 0.3s ease;
}

.search-input:focus-within {
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.5);
}

input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-input:has(input:disabled) {
  background-color: rgba(38, 38, 38, 0.9) !important;
  border-color: rgba(64, 64, 64, 0.8) !important;
  opacity: 0.85;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
