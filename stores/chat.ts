import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import type { User } from "~/models/user";
import type { Message, Conversation } from "~/models/chat";

export const useChatStore = defineStore("chat", () => {
  // State

  // Set up local storage for conversations. Set the default value to an empty array. This is set if there is nothing in local storage.
  let conversations = ref<Conversation[]>([]);
  const selectedConversationId = ref<string | null>(null);
  const sidebarOpen = ref(false);
  const aiResponsePending = ref(false);

  // todo: integrate supabase user
  // this is currently just a placeholder
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

  const showNewConversationScreen = computed(() => {
    return !conversations.value.length || !selectedConversation.value?.messages.length;
  });

  // Actions
  async function createNewConversation() {
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

    return newConversation;
  }

  function selectConversation(conversationId: string | null) {
    selectedConversationId.value = conversationId;
  }

  function toggleSidebar(isOpen?: boolean) {
    if (typeof isOpen === "boolean") {
      sidebarOpen.value = isOpen;
    } else {
      sidebarOpen.value = !sidebarOpen.value;
    }
  }

  const { sendMessage } = useMessages();

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
    showNewConversationScreen,

    // Actions
    createNewConversation,
    selectConversation,
    toggleSidebar,
    sendMessage, // Re-exported from useMessages
  };
});
