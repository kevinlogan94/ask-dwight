<template>
  <div class="transition-all duration-300" :class="{ 'ml-0 lg:ml-64': chatStore.sidebarOpen }">
    <UContainer class="min-h-screen flex flex-col items-center justify-center max-w-3xl">
      <h1 class="text-3xl font-bold text-center" v-motion-fade>
        What are we selling today?
      </h1>
      <AskAnythingInput class="w-full mt-5" v-motion-slide-bottom />
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import AskAnythingInput from "~/components/chat/input/AskAnythingInput.vue";
import { useChatStore } from "~/stores/chat";

const chatStore = useChatStore();

</script>
