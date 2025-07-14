import { defineStore } from "pinia";
import type { Message, Conversation, Source } from "~/models/chat";
import { throttleConversation } from "~/utils/helpers";
import { useMessageService } from "~/composables/services/useMessageService";
import { useConversationService } from "~/composables/services/useConversationService";
import { useConversationRepository } from "~/composables/repositories/chat/useConversationRepository";
import { useLocalStorage } from "@vueuse/core";

export const useChatStore = defineStore("chat", () => {
  // State

  // Set up local storage for conversations. Set the default value to an empty array.
  let conversations = ref<Conversation[]>([]);
  const selectedConversationId = ref<string | null>(null);
  const sidebarOpen = ref(false);
  const chatStatus = ref("ready" as "ready" | "error" | "submitted" | "streaming");
  const anyMessagesSentForCurrentSession = ref(false); // need to know if they just opened the app.
  const isSourcesPanelOpen = ref(false);
  const activeSources = ref<Source[]>([]);
  const isDragging = ref(false);

  // Getters
  const selectedConversation = computed<Conversation | undefined>(() => {
    return conversations.value.find((c) => c.id === selectedConversationId.value);
  });

  const currentMessages = computed<Message[]>(() => {
    return selectedConversation.value?.messages || [];
  });

  const throttleSelectedConversation = computed(() => {
    if (!selectedConversation.value) return false;
    return throttleConversation(selectedConversation.value);
  });

  const showNewConversationScreen = computed(() => {
    return !conversations.value.length || !selectedConversation.value?.messages.length;
  });

  // Actions
  function toggleSidebar(isOpen?: boolean) {
    if (typeof isOpen === "boolean") {
      sidebarOpen.value = isOpen;
    } else {
      sidebarOpen.value = !sidebarOpen.value;
    }
  }

  function addSource(source: Source) {
    // Check if the source already exists to avoid duplicates
    const exists = activeSources.value.some(
      (s) => s.title === source.title && s.type === source.type,
    );
    if (!exists) {
      activeSources.value.push(source);
    }
  }

  function clearSources() {
    activeSources.value = [];
  }

  // Dependencies
  const { sendMessage } = useMessageService();
  const { createNewConversation, selectConversation } = useConversationService();
  const { syncConversationsToSupabase, fetchConversationsFromSupabase, associateConversationsWithUser } =
    useConversationRepository();

  onMounted(async () => {
    await syncConversationsToSupabase();
    conversations.value = await fetchConversationsFromSupabase();

    activeSources.value = useLocalStorage("ask-dwight-active-sources", []).value;

    if (conversations.value.length > 0 && !selectedConversationId.value) {
      selectedConversationId.value = conversations.value.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]!.id;
    }
  });

  return {
    // State
    conversations,
    selectedConversationId,
    sidebarOpen,
    anyMessagesSentForCurrentSession,
    chatStatus,
    isSourcesPanelOpen,
    activeSources,
    isDragging,

    // Getters
    selectedConversation,
    currentMessages,
    throttleSelectedConversation,
    showNewConversationScreen,

    // Actions
    toggleSidebar,
    createNewConversation,
    selectConversation,
    sendMessage,
    associateConversationsWithUser,
    addSource,
    clearSources,
  };
});
