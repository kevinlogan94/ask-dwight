<template>
  <NewConversationScreen v-if="chatStore.showNewConversationScreen" />
  <ChatInterface v-else />
</template>

<script setup lang="ts">
definePageMeta({ showSidebar: true });
import NewConversationScreen from "~/components/chat/interface/NewConversationScreen.vue";
import ChatInterface from "~/components/chat/interface/ChatInterface.vue";
import { useChatStore } from "~/stores/chat";

const chatStore = useChatStore();

onMounted(() => {
  console.log("Mounted");
});
</script>
