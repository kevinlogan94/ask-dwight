<template>
  <div>
    <div class="flex justify-end mb-2 mr-1" v-if="!chatStore.showNewConversationScreen">
      <DojoMeter />
    </div>

    <UChatPrompt
      variant="outline"
      :disabled="chatStore.throttleSelectedConversation"
      placeholder="Ask anything..."
      :loading="chatStore.aiResponsePending"
      v-model="searchQuery"
      @submit="handleSubmit"
      autofocus
      class="p-3 focus-within:ring-1 focus-within:ring-primary-500/30"
    >
      <UChatPromptSubmit
        v-if="!chatStore.aiResponsePending"
        color="success"
        variant="solid"
        :disabled="chatStore.throttleSelectedConversation"
        icon="heroicons:arrow-up"
      />
    </UChatPrompt>
    <p v-if="!chatStore.showNewConversationScreen" class="text-xs text-neutral-400 mt-1 text-center">
      Dwight can make mistakes. Double-check his work.
    </p>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from "~/stores/chat";
import DojoMeter from "~/components/chat/DojoMeter.vue";

const chatStore = useChatStore();
const searchQuery = ref("");

const handleSubmit = () => {
  if (searchQuery.value.trim() && !chatStore.aiResponsePending && !chatStore.throttleSelectedConversation) {
    chatStore.sendMessage(searchQuery.value);
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
