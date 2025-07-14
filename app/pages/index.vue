<template>
  <!-- Global Dropzone Overlay -->
  <div
    v-if="chatStore.isDragging"
    class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/75 backdrop-blur-sm"
  >
    <div class="text-center text-white rounded-lg bg-gray-900/50 p-12 border-2 border-dashed border-gray-400">
      <UIcon name="i-lucide-upload-cloud" class="w-16 h-16 mx-auto" />
      <p class="mt-4 text-2xl font-semibold">Drop files to upload</p>
    </div>
  </div>

  <NewConversationScreen v-if="chatStore.showNewConversationScreen" />
  <ChatInterface v-else />
</template>

<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { useFileUpload } from "~/composables/useFileUpload";
import NewConversationScreen from "~/components/chat/interface/NewConversationScreen.vue";
import ChatInterface from "~/components/chat/interface/ChatInterface.vue";
import { useChatStore } from "~/stores/chat";

definePageMeta({ showSidebar: true });

const chatStore = useChatStore();
const { processFiles } = useFileUpload();

// --- Global Drag and Drop Logic ---

// Counter to track drag events over the window
let dragCounter = 0;

useEventListener(window, "dragenter", (event) => {
  event.preventDefault();
  if (event.dataTransfer?.types.includes("Files")) {
    dragCounter++;
    chatStore.isDragging = true;
  }
});

useEventListener(window, "dragleave", (event) => {
  event.preventDefault();
  dragCounter--;
  if (dragCounter === 0) {
    chatStore.isDragging = false;
  }
});

useEventListener(window, "drop", (event: DragEvent) => {
  event.preventDefault();
  dragCounter = 0;
  chatStore.isDragging = false;
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    processFiles(event.dataTransfer.files);
  }
});

// Prevent browser from opening the file
useEventListener(window, "dragover", (event) => {
  event.preventDefault();
});
</script>
