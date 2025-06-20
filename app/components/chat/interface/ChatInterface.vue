<template>
  <div
    class="flex flex-col transition-all duration-300 pt-16 pb-32"
    :class="{ 'ml-0 lg:ml-64': chatStore.sidebarOpen }"
  >
    <!-- Chat container - centered with max width -->
    <div class="flex-1 flex flex-col w-full max-w-3xl mx-auto">
      <!-- Chat messages area-->
      <div class="flex-1 py-4 px-4 md:px-6">
        <div v-for="message in chatStore.currentMessages" :key="message.id" class="mb-4" v-motion-slide-bottom>

          <!-- System Message (Loading, Errors) -->
          <div v-if="message.role === 'system'" class="flex items-start">
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
          <div v-else-if="message.role === 'assistant'" class="flex flex-col group">
            <!-- Display AI response content -->
            <div
              :class="
                message.isThrottleMessage
                  ? 'text-white bg-gray-900 backdrop-blur-sm rounded-lg p-3'
                  : 'text-black dark:text-white'
              "
              class="prose max-w-none dark:prose-invert"
              v-html="message.htmlContent || message.content"
            ></div>
            <!-- Assistant Message Actions -->
            <UButtonGroup
              :class="[
                'mt-2',
                {
                  'opacity-0 group-hover:opacity-100 transition-opacity duration-300':
                    chatStore.currentMessages.indexOf(message) !== chatStore.currentMessages.length - 1,
                },
              ]"
              size="md"
            >
              <UTooltip
                v-for="action in assistantMessageActions"
                :key="action.label"
                :text="action.label"
                :content="{ side: 'top' }"
                :delayDuration="50"
              >
                <UButton
                  variant="ghost"
                  color="neutral"
                  class="rounded-full p-0 mr-3 hover:bg-transparent"
                  :icon="getActionIcon(action, message)"
                  @click="action.onClick($event, message)"
                />
              </UTooltip>
            </UButtonGroup>
            <!-- New conversation button -->
            <UButton
              :class="['mt-4 w-full', { 'mb-4': !message.suggestions?.length }]"
              size="lg"
              v-if="message.isThrottleMessage"
              label="Start a new conversation"
              @click="setupForNewConversation()"
              color="primary"
            />
            <!-- Show suggestion chips for assistant messages if available -->
            <SuggestionChips v-if="message.suggestions?.length" :suggestions="message.suggestions" class="mt-3 mb-4" />
          </div>

          <!-- User Message -->
          <div v-else-if="message.role === 'user'" class="flex justify-end">
            <p class="bg-primary-600 rounded-lg p-3 text-white max-w-[80%] text-wrap">
              {{ message.content }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed elements container at bottom -->
    <div
      class="fixed bottom-0 left-0 right-0 flex flex-col items-center pb-4"
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
import { useChatStore } from "~//stores/chat";
import type { Message, MessageAction } from "~/models/chat";
import { useChatActions } from "~/composables/useChatActions";

// Use the chat store
const chatStore = useChatStore();
const scrollButton = ref<ScrollToBottomButtonInstance | null>(null);

const { handleCopyMessage, handleReaction } = useChatActions();

function getActionIcon(action: MessageAction, message: Message): string {
  if (action.label === "Thumbs Up" && message.reaction === 'thumbs_up') {
    return "i-heroicons-hand-thumb-up-solid";
  }
  if (action.label === "Thumbs Down" && message.reaction === 'thumbs_down') {
    return "i-heroicons-hand-thumb-down-solid";
  }

  return action.icon;
}

const assistantMessageActions: MessageAction[] = [
  {
    label: "Thumbs Up",
    icon: "i-heroicons-hand-thumb-up",
    onClick: (e: MouseEvent, message: Message) => handleReaction(message, 'thumbs_up'),
  },
  {
    label: "Thumbs Down",
    icon: "i-heroicons-hand-thumb-down",
    onClick: (e: MouseEvent, message: Message) => handleReaction(message, 'thumbs_down'),
  },
  {
    label: "Copy",
    icon: "i-heroicons-clipboard-document",
    onClick: (e: MouseEvent, message: Message) => handleCopyMessage(message),
  },
];

onMounted(() => {
  nextTick(() => {
    scrollButton.value?.scrollToBottom();
  });
});

function setupForNewConversation() {
  // Select null to display the new conversation screen
  chatStore.selectConversation(null);
}

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
