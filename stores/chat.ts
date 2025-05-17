import { defineStore } from "pinia";
import type { ChatCompletionMessage, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { useOpenAIClient } from "~/composables/useOpenAIClient";
import { useLocalStorage } from "@vueuse/core";
import { useMessages } from "~/composables/useMessages"; // Import the useMessages composable
import type { User } from "~/models/user";
import { DEFAULT_ERROR_MESSAGE } from "~/composables/useMessages";
import { getOrCreateSessionId, parseMarkdown } from "~/utils/helpers";

export interface Message {
  id: string;
  content: string;
  htmlContent?: string;
  sender: "user" | "assistant" | "system";
  timestamp: Date;
  status?: "loading" | "sent";
  suggestions?: string[];
  isThrottleMessage?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  unread?: boolean;
  createdAt: Date;
}

export const useChatStore = defineStore("chat", () => {
  // State

  // Set up local storage for conversations. Set the default value to an empty array. This is set if there is nothing in local storage.
  let conversations = ref<Conversation[]>([]);
  const selectedConversationId = ref<string | null>(null);
  const sidebarOpen = ref(false);
  const aiResponsePending = ref(false);
  const user = ref<User>({
    id: "",
    name: "John Doe",
    email: "",
    subscription: { status: "active", tier: "free" },
    createdAt: new Date(),
  });

  // Getters
  const selectedConversation = computed<Conversation | undefined>(() => {
    return conversations.value.find((c) => c.id === selectedConversationId.value);
  });

  const currentMessages = computed<Message[]>(() => {
    return selectedConversation.value?.messages || [];
  });

  const throttleConversation = computed(() => {
    const userMessages = selectedConversation.value?.messages.filter((x) => x.sender === "user") ?? [];
    return userMessages.length >= 10 && user.value.subscription?.tier === "free";
  });

  // Actions
  async function createNewConversation() {
    aiResponsePending.value = true;
    const { getClientSideChatCompletion } = useOpenAIClient();

    var messageforApi: ChatCompletionMessageParam[] = [
      {
        content: "Hey",
        role: "user",
      },
    ];

    const conversationNumber = conversations.value.length + 1;

    // Create new conversation
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: `Conversation ${conversationNumber}`,
      messages: [],
      createdAt: new Date(),
    };
    conversations.value.push(newConversation);
    selectedConversationId.value = newConversation.id;

    // Add loading message and get its ID
    const loadingMessage = addMessage({
      content: "",
      sender: "system",
      status: "loading",
    });
    const loadingMessageId = loadingMessage.id;

    try {
      const responseMessage: ChatCompletionMessage | null = await getClientSideChatCompletion(messageforApi);

      // Remove loading message regardless of success or failure
      removeMessage(loadingMessageId);

      if (responseMessage?.content) {
        const htmlContent = await parseMarkdown(responseMessage.content);

        addMessage({
          content: responseMessage.content,
          htmlContent: htmlContent,
          sender: "assistant",
          suggestions: [
            "Help me build a cold outreach strategy",
            "Let's fix my lead scoring system",
            "Design a follow-up cadence for my leads",
          ],
          status: "sent",
        });
      } else {
        addMessage({
          content: DEFAULT_ERROR_MESSAGE,
          sender: "system",
          status: "sent",
        });
      }
    } catch (error) {
      console.error("Error creating new conversation:", error);
      removeMessage(loadingMessageId);
      addMessage({
        content: DEFAULT_ERROR_MESSAGE,
        sender: "system",
        status: "sent",
      });
    }

    aiResponsePending.value = false;
    return newConversation;
  }

  function selectConversation(conversationId: string) {
    selectedConversationId.value = conversationId;

    // Mark conversation as read when selected
    const conversation = conversations.value.find((c) => c.id === conversationId);
    if (conversation?.unread) {
      conversation.unread = false;
    }
  }

  function toggleSidebar(isOpen?: boolean) {
    if (typeof isOpen === "boolean") {
      sidebarOpen.value = isOpen;
    } else {
      sidebarOpen.value = !sidebarOpen.value;
    }
  }

  const { sendMessage, addMessage, removeMessage } = useMessages();

  // Initialize with first conversation selected
  onMounted(() => {
    conversations.value = useLocalStorage<Conversation[]>("chat-conversations", []).value;

    if (conversations.value.length > 0 && !selectedConversationId.value) {
      selectedConversationId.value = conversations.value[0].id;
    }
  });

  return {
    // State
    conversations,
    selectedConversationId,
    sidebarOpen,
    aiResponsePending,

    // Getters
    selectedConversation,
    currentMessages,
    throttleConversation,

    // Actions
    createNewConversation,
    selectConversation,
    toggleSidebar,
    sendMessage, // Re-exported from useMessages
  };
});
