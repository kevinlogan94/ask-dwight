<template>
  <div class="flex flex-col">
    <!-- Chat container - centered with max width -->
    <div class="flex-1 flex flex-col w-full max-w-3xl mx-auto">
      <!-- Chat messages area-->
      <div class="flex-1 py-4 px-4 md:px-6">
        <div v-for="(message, index) in chatStore.currentMessages" :key="message.id" class="mb-4" v-motion-slide-bottom>
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
          <div
            v-else-if="message.role === 'assistant'"
            class="flex flex-col group transition-all duration-300"
            :ref="
              (el) => {
                if (index === chatStore.currentMessages.length - 1) {
                  lastAssistantMessageContentRef = el as HTMLElement;
                }
              }
            "
            :style="index === chatStore.currentMessages.length - 1 ? lastMessageStyle : {}"
          >
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
            <!-- Sources Button -->
            <div v-if="messageHasSources(message)" class="mt-4">
              <UButton
                icon="i-lucide-book-open"
                size="md"
                color="neutral"
                variant="link"
                :label="`Sources (${chatStore.activeSources.length})`"
                class="p-0"
                @click="chatStore.isSourcesPanelOpen = true"
              />
            </div>
            <!-- Assistant Message Actions -->
            <UButtonGroup
              :class="[
                'mt-4',
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
          <div
            v-else-if="message.role === 'user'"
            class="flex justify-end"
            :ref="
              (el) => {
                if (index === chatStore.currentMessages.length - 2) {
                  lastUserMessageContentRef = el as HTMLElement;
                }
              }
            "
          >
            <p class="bg-primary-600 rounded-lg p-3 text-white max-w-[80%] text-wrap">
              {{ message.content }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed elements container at bottom -->
    <div
      ref="fixedControlsRef"
      class="fixed bottom-0 left-0 right-0 flex flex-col items-center pb-4 transition-all duration-300"
      :class="{ 'lg:ml-64': chatStore.sidebarOpen }"
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
  <SourcesPanel />
</template>

<script setup lang="ts">
import type { ScrollToBottomButtonInstance } from "~/components/chat/ScrollToBottomButton.vue";
import SuggestionChips from "~/components/chat/input/SuggestionChips.vue";
import TypingAnimation from "~/components/chat/TypingAnimation.vue";
import ScrollToBottomButton from "~/components/chat/ScrollToBottomButton.vue";
import AskAnythingInput from "~/components/chat/input/AskAnythingInput.vue";
import SourcesPanel from "~/components/chat/SourcesPanel.vue";
import { useChatStore } from "~/stores/chat";
import type { Message, MessageAction } from "~/models/chat";
import { useWindowSize } from "@vueuse/core";
import { useChatActions } from "~/composables/useChatActions";

// Use the chat store
const chatStore = useChatStore();
const scrollButton = ref<ScrollToBottomButtonInstance | null>(null);

// Refs for DOM elements
const lastAssistantMessageContentRef = ref<HTMLElement | null>(null);
const lastUserMessageContentRef = ref<HTMLElement | null>(null);
const fixedControlsRef = ref<HTMLElement | null>(null);

// Reactive state for dynamic styling
const lastMessageStyle = ref({});
const { height: windowHeight } = useWindowSize();

const { handleCopyMessage, handleReaction } = useChatActions();

/**
 * Calculates and applies a minimum height to the last assistant message to fill the remaining screen space.
 * This creates an immersive, focused view for the most recent response.
 */
function updateLastMessageHeight() {
  // Reset style before recalculating
  lastMessageStyle.value = {};

  const lastMessage = chatStore.currentMessages[chatStore.currentMessages.length - 1];

  // Only apply this logic to the very last message, and only if it's from the assistant
  if (!lastMessage || lastMessage.role !== "assistant") {
    return;
  }

  // nextTick ensures that the DOM has been updated with the latest message before we measure it
  nextTick(() => {
    const lastMessageEl = lastAssistantMessageContentRef.value;
    const lastUserMessageEl = lastUserMessageContentRef.value;
    const fixedControlsEl = fixedControlsRef.value;

    if (!lastMessageEl || !lastUserMessageEl || !fixedControlsEl) return;

    // --- Dynamic Height Calculation ---
    // This logic calculates a min-height for the last assistant message to create space for the response to stream in,
    // ensuring the user's last message is visible at the top.

    // 1. Measure all UI elements that affect vertical space.
    const lastUserMessageHeight = lastUserMessageEl.offsetHeight;
    const fixedControlsHeight = fixedControlsEl.offsetHeight;
    const chatMessageAreaPadding = 16; // Vertical padding in the chat area.
    const buffer = 40; // An additional buffer for comfortable spacing.

    // Dynamically get the navbar height. Fallback to 63px if not found.
    const navbarEl = document.querySelector("header");
    const navbarHeight = navbarEl ? navbarEl.offsetHeight : 63;

    // 2. Calculate the total available space for the new message.
    // This is the full window height minus the user's message, the navbar, the input controls, and other spacing.
    const availableSpace = windowHeight.value - lastUserMessageHeight - navbarHeight - chatMessageAreaPadding - buffer;

    // 3. Apply the calculated height.
    // The condition checks if the calculated space is large enough to warrant an expansion.
    // If not, it applies a fixed margin to ensure consistent spacing.
    if (availableSpace > lastMessageEl.offsetHeight + fixedControlsHeight) {
      lastMessageStyle.value = { minHeight: `${availableSpace}px` };
    } else {
      lastMessageStyle.value = { "margin-bottom": "180px" };
    }
  });
}

function messageHasSources(message: Message): boolean {
  return !!chatStore.activeSources?.some((s) => s.messageId === message.id);
}

function getActionIcon(action: MessageAction, message: Message): string {
  if (action.label === "Thumbs Up" && message.reaction === "thumbs_up") {
    return "i-heroicons-hand-thumb-up-solid";
  }
  if (action.label === "Thumbs Down" && message.reaction === "thumbs_down") {
    return "i-heroicons-hand-thumb-down-solid";
  }

  return action.icon;
}

const assistantMessageActions: MessageAction[] = [
  {
    label: "Thumbs Up",
    icon: "i-heroicons-hand-thumb-up",
    onClick: (e: MouseEvent, message: Message) => handleReaction(message, "thumbs_up"),
  },
  {
    label: "Thumbs Down",
    icon: "i-heroicons-hand-thumb-down",
    onClick: (e: MouseEvent, message: Message) => handleReaction(message, "thumbs_down"),
  },
  {
    label: "Copy",
    icon: "i-lucide-copy",
    onClick: (e: MouseEvent, message: Message) => handleCopyMessage(message),
  },
];

/**
 * Handles chat view updates, including adjusting message height and scrolling.
 * This function is triggered on mount and when chat messages or window height change.
 */
function handleChatUpdate() {
  nextTick(() => {
    updateLastMessageHeight();
  })
  // Use nextTick to ensure the DOM is updated before calculations.
  nextTick(() => {
    // A short timeout allows for DOM updates and animations to settle before calculating heights and scrolling.
    setTimeout(() => {
      scrollButton.value?.scrollToBottom();
    }, 100);
  });
}

// Watch for changes in messages or window height to trigger UI updates.
watch([() => chatStore.currentMessages, windowHeight], handleChatUpdate, { deep: true });

// Perform initial setup and adjustments when the component is mounted.
onMounted(() => {
  handleChatUpdate();
});

function setupForNewConversation() {
  // Select null to display the new conversation screen
  chatStore.selectConversation(null);
}
</script>
