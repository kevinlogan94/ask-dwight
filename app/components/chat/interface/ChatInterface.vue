<template>
  <div class="flex flex-col">
    <!-- Chat container - centered with max width -->
    <div class="flex-1 flex flex-col w-full max-w-3xl mx-auto">
      <!-- Chat messages area-->
      <div class="flex-1 py-4 px-4 md:px-6">
        <div v-for="(group, groupIndex) in messageGroups" :key="group.id" class="mb-4" v-motion-slide-bottom>
          <!-- Handle single messages (system, or a lone user/assistant message) -->
          <div v-if="group.type === 'single'" class="pb-50">
            <div v-if="group.message?.role === 'system'" class="flex items-start">
              <div class="max-w-[80%]">
                <div class="bg-gray-800 backdrop-blur-sm rounded-lg p-3 text-white">
                  <p>{{ group.message?.content }}</p>
                </div>
              </div>
            </div>
            <!-- This will render a user message if it's the very last message -->
            <div v-else-if="group.message?.role === 'assistant'">
              <div
                class="prose max-w-none dark:prose-invert"
                :class="
                  group.message.isThrottleMessage
                    ? 'text-white bg-gray-900 backdrop-blur-sm rounded-lg p-3'
                    : 'text-black dark:text-white'
                "
                v-html="group.message?.htmlContent || group.message?.content"
              ></div>

              <!-- New conversation button -->
              <UButton
                :class="'mt-4 w-full'"
                size="lg"
                label="Start a new conversation"
                @click="setupForNewConversation()"
                color="primary"
              />
            </div>
            <div v-else-if="group.message?.role === 'user'" class="flex justify-end">
              <p class="bg-primary-600 rounded-lg p-3 text-white max-w-[80%] text-wrap">
                {{ group.message?.content }}
              </p>
            </div>
          </div>

          <!-- Handle user-assistant pairs -->
          <div
            v-else-if="group.type === 'pair'"
            :ref="
              (el) => {
                if (groupIndex === messageGroups.length - 1) {
                  lastAssistantMessageContentRef = el as HTMLElement;
                }
              }
            "
            :style="groupIndex === messageGroups.length - 1 ? lastMessageStyle : {}"
          >
            <!-- User Message -->
            <div
              class="flex justify-end mb-4"
              :ref="
                (el) => {
                  if (groupIndex === messageGroups.length - 1) {
                    lastUserMessageContentRef = el as HTMLElement;
                  }
                }
              "
            >
              <p class="bg-primary-600 rounded-lg p-3 text-white max-w-[80%] text-wrap">
                {{ group?.user?.content }}
              </p>
            </div>

            <!-- Assistant Message (AI Response) -->
            <div class="flex flex-col group transition-all duration-300">
              <TypingAnimation v-if="chatStore.chatStatus === 'submitted' && groupIndex === messageGroups.length - 1" />
              <!-- Display AI response content -->
              <div
                class="prose max-w-none dark:prose-invert"
                v-html="group?.assistant?.htmlContent || group?.assistant?.content"
              ></div>
              <!-- Sources Button -->
              <div v-if="messageHasSources(group?.assistant as Message)" class="mt-4">
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
                      groupIndex !== messageGroups.length - 1,
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
                    :icon="getActionIcon(action, group?.assistant as Message)"
                    @click="action.onClick($event, group?.assistant as Message)"
                  />
                </UTooltip>
              </UButtonGroup>
              <!-- Show suggestion chips for assistant messages if available -->
              <SuggestionChips
                v-if="group?.assistant?.suggestions?.length"
                :suggestions="group.assistant.suggestions"
                class="mt-3 mb-4"
              />
            </div>
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
import AskAnythingInput from "~/components/chat/input/AskAnythingInput.vue";
import ScrollToBottomButton from "~/components/chat/ScrollToBottomButton.vue";
import TypingAnimation from "~/components/chat/TypingAnimation.vue";
import SourcesPanel from "~/components/chat/SourcesPanel.vue";
import { useChatStore } from "~/stores/chat";
import { useChatActions } from "~/composables/useChatActions";
import type { Message, MessageAction } from "~/models/chat";
import { useWindowSize } from "@vueuse/core";
import { useBanner } from '~/composables/useBanner';

const chatStore = useChatStore();
const scrollButton = ref<ScrollToBottomButtonInstance | null>(null);

// Refs for dynamic height calculation
const lastAssistantMessageContentRef = ref<HTMLElement | null>(null);
const lastUserMessageContentRef = ref<HTMLElement | null>(null);
const fixedControlsRef = ref<HTMLElement | null>(null);

// Reactive state for dynamic styling
const lastMessageStyle = ref({});
const { height: windowHeight } = useWindowSize();
const { isBannerVisible } = useBanner();

const { handleCopyMessage, handleReaction } = useChatActions();

/**
 * Groups messages into pairs of user/assistant messages, or single system messages.
 */
const messageGroups = computed(() => {
  const groups = [];
  const messages = chatStore.currentMessages;
  let i = 0;
  while (i < messages.length) {
    const currentMessage = messages[i];
    // A user message followed by an assistant message is a pair
    if (currentMessage?.role === "user" && i + 1 < messages.length && messages[i + 1]?.role === "assistant") {
      groups.push({
        type: "pair",
        user: currentMessage,
        assistant: messages[i + 1],
        id: currentMessage.id, // Use user message id as the key for the group
      });
      i += 2; // Skip next message as it's part of the pair
    } else {
      // Otherwise, it's a single message (system, or a lone user/assistant)
      groups.push({
        type: "single",
        message: currentMessage,
        id: currentMessage?.id,
      });
      i += 1;
    }
  }
  return groups;
});

/**
 * Calculates and applies a minimum height to the last assistant message to fill the remaining screen space.
 * This creates an immersive, focused view for the most recent response.
 */
function updateLastMessageHeight() {
  const lastGroup = messageGroups.value[messageGroups.value.length - 1];

  // Only apply this logic if the last group is a user/assistant pair
  if (!lastGroup || lastGroup.type !== "pair") {
    lastMessageStyle.value = {}; // Reset style if not applicable
    return;
  }

  nextTick(() => {
    const lastMessageEl = lastAssistantMessageContentRef.value;
    const lastUserMessageEl = lastUserMessageContentRef.value;
    const fixedControlsEl = fixedControlsRef.value;

    if (!lastMessageEl || !lastUserMessageEl || !fixedControlsEl) return;

    const lastUserMessageHeight = lastUserMessageEl.offsetHeight;
    const chatMessageAreaPadding = 16;
    const navbarEl = document.querySelector<HTMLElement>("header");
    const navbarHeight = navbarEl ? navbarEl.offsetHeight : 63;
    const bannerHeight = isBannerVisible.value ? 48 : 0; // Banner height is h-12 (48px)
    const availableSpace = windowHeight.value - lastUserMessageHeight - navbarHeight - chatMessageAreaPadding - bannerHeight;
    if (availableSpace > (lastMessageEl.offsetHeight)) {
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
 */
function handleChatUpdate() {
  updateLastMessageHeight();
  nextTick(() => {
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
