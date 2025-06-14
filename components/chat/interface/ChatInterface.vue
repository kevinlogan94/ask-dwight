<template>
  <div
    class="flex flex-col transition-all duration-300 pt-16 pb-32"
    :class="{ 'ml-0 lg:ml-64': chatStore.sidebarOpen }"
  >
    <!-- Chat container - centered with max width -->
    <div class="flex-1 flex flex-col w-full max-w-3xl mx-auto">
      <!-- Chat messages area-->
      <div class="flex-1 py-4 px-4 md:px-6">
        <!-- Dynamic message rendering from messages array -->
        <div v-for="message in chatStore.currentMessages" :key="message.id" class="mb-4" v-motion-slide-bottom>
          <!-- System Message (Loading, Errors) -->
          <div v-if="message.sender === 'system'" class="flex items-start">
            <div class="max-w-[80%]">
              <div class="bg-gray-800 backdrop-blur-sm rounded-lg p-3 text-white">
                <!-- Use the typing animation component only when loading -->
                <TypingAnimation v-if="message.status === 'loading'" />
                <!-- Display content if not loading (e.g., for error messages) -->
                <p v-else>{{ message.content }}</p>
              </div>
            </div>
          </div>

          <!-- Assistant Message (AI Response) -->
          <div v-else-if="message.sender === 'assistant'" class="flex items-start">
            <div class="max-w-[90%]">
              <div
                :class="
                  message.isThrottleMessage
                    ? 'bg-gray-900 backdrop-blur-sm rounded-lg p-3 text-white'
                    : 'bg-gray-800 backdrop-blur-sm rounded-lg p-3 text-white'
                "
              >
                <!-- Display AI response content -->
                <div class="prose prose-invert max-w-none" v-html="message.htmlContent || message.content"></div>
              </div>
              <UButton
                class="mt-4 w-full"
                size="lg"
                v-if="message.isThrottleMessage"
                label="Start a new conversation"
                @click="chatStore.createNewConversation()"
                color="primary"
              />
              <!-- Show suggestion chips for assistant messages if available -->
              <SuggestionChips v-if="message.suggestions?.length" :suggestions="message.suggestions" class="mt-3 mb-4" />
            </div>
          </div>

          <!-- User Message -->
          <div v-else-if="message.sender === 'user'" class="flex items-start justify-end">
            <div class="max-w-[80%]">
              <div class="bg-primary-600 backdrop-blur-sm rounded-lg p-3 text-white">
                <p>{{ message.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed elements container at bottom -->
    <div
      class="fixed bottom-0 left-0 right-0 flex flex-col items-center bg-gradient-to-t from-gray-950 to-transparent pb-4 transition-all duration-300"
      :class="{ 'ml-0 lg:ml-64': chatStore.sidebarOpen }"
    >
      <div class="w-full max-w-3xl mx-auto">
        <!-- Scroll down button component -->
        <ScrollToBottomButton ref="scrollButton" />

        <!-- Input container -->
        <div class="px-4 md:px-6 pb-4">
          <!-- Ask anything input -->
          <AskAnythingInput />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScrollToBottomButtonInstance } from "~/components/chat/ScrollToBottomButton.vue";
import SuggestionChips from "~/components/chat/input/SuggestionChips.vue";
import TypingAnimation from "~/components/chat/TypingAnimation.vue";
import ScrollToBottomButton from "~/components/chat/ScrollToBottomButton.vue";
import AskAnythingInput from "~/components/chat/input/AskAnythingInput.vue";
import { useChatStore } from "~/stores/chat";

// Use the chat store
const chatStore = useChatStore();
const scrollButton = ref<ScrollToBottomButtonInstance | null>(null);

onMounted(() => {
  nextTick(() => {
    scrollButton.value?.scrollToBottom();
  });
});

// Watch for changes in the messages array and scroll down when new messages are added
watch(
  () => chatStore.currentMessages.length,
  (newLength, oldLength) => {
    // Only scroll if a new message was added
    if (newLength > oldLength) {
      // Use nextTick to ensure DOM is updated before scrolling
      nextTick(() => {
        scrollButton.value?.scrollToBottom();
      });
    }
  },
);
</script>
