<template>
  <div class="transition-all duration-300" :class="{ 'ml-0 lg:ml-64': chatStore.sidebarOpen }">
    <UContainer class="min-h-screen flex flex-col items-center justify-center max-w-3xl">
      <h1 class="text-3xl font-bold text-center" v-motion-fade>
        What are we selling today?
      </h1>
      <AskAnythingInput class="w-full mt-5" v-motion-slide-bottom />
      <SuggestionChips class="w-[80%] mt-4" :suggestions="suggestions" v-motion-slide-bottom  />
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import AskAnythingInput from "~/components/chat/input/AskAnythingInput.vue";
import SuggestionChips from "~/components/chat/input/SuggestionChips.vue";
import { useChatStore } from "~/stores/chat";

const chatStore = useChatStore();

const suggestions = ref<string[]>([
  "Build a cold outreach strategy",
  "Fix my lead scoring system",
  "Design a lead follow-up cadence",
]);
</script>
