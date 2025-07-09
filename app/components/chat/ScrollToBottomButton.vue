<template>
  <UButton
    v-if="!isAtBottom"
    variant="ghost"
    class="fixed bottom-44 left-1/2 -translate-x-1/2 transform rounded-full p-2 bg-gray-800/60 z-50 transition-all duration-300"
    :class="{ 'lg:ml-32': chatStore.sidebarOpen }"
    @click="scrollToBottom"
  >
    <Icon name="heroicons:arrow-down" class="w-5 h-5" />
  </UButton>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat';

const chatStore = useChatStore();
const isAtBottom = ref(true);

// Scroll to bottom function
const scrollToBottom = async () => {
  // Wait for Vue to update the DOM
  await nextTick();

  // Update position state
  isAtBottom.value = true;

  // Scroll window to the bottom
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
};

// Check if user is at bottom of document
const checkIfAtBottom = () => {
  // Get scroll position and document height
  const scrollPosition = window.scrollY + window.innerHeight;
  const documentHeight = document.body.scrollHeight;

  // Consider "at bottom" if within 100px of the bottom
  isAtBottom.value = documentHeight - scrollPosition < 100;
};

// Setup event listeners on mounted
onMounted(() => {
  // Check position initially
  checkIfAtBottom();

  // Add scroll event listener to check position
  window.addEventListener("scroll", checkIfAtBottom);
});

// Clean up event listener when component is unmounted
onUnmounted(() => {
  window.removeEventListener("scroll", checkIfAtBottom);
});

// Define and export the interface for the component instance
export interface ScrollToBottomButtonInstance {
  scrollToBottom: () => void;
}

// Define the type for the component instance
// defineExpose<ScrollToBottomButtonInstance>()

defineExpose({
  scrollToBottom,
});
</script>
