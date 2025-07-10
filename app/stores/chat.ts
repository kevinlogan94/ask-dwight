import { defineStore } from "pinia";
import type { Message, Conversation, Source } from "~/models/chat";
import { throttleConversation } from "~/utils/helpers";
import { useMessageService } from "~/composables/services/useMessageService";
import { useConversationService } from "~/composables/services/useConversationService";
import { useConversationRepository } from "~/composables/repositories/chat/useConversationRepository";
import type { FileObject } from "openai/resources/files.mjs";

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
  const uploadedFiles = ref<FileObject[]>([]);

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

  function openSourcesPanel(sources: Source[]) {
    activeSources.value = sources;
    isSourcesPanelOpen.value = true;
  }

  function closeSourcesPanel() {
    isSourcesPanelOpen.value = false;
    // We can clear the sources when the panel closes
    activeSources.value = [];
  }

  function addUploadedFile(file: FileObject) {
    uploadedFiles.value.push(file);
  }

  function removeUploadedFile(fileId: string) {
    uploadedFiles.value = uploadedFiles.value.filter((f: FileObject) => f.id !== fileId);
  }

  function clearUploadedFiles() {
    uploadedFiles.value = [];
  }

  // Dependencies
  const { sendMessage } = useMessageService();
  const { createNewConversation, selectConversation } = useConversationService();
  const { syncConversationsToSupabase, fetchConversationsFromSupabase, associateConversationsWithUser } =
    useConversationRepository();

  onMounted(async () => {
    await syncConversationsToSupabase();
    conversations.value = await fetchConversationsFromSupabase();

    if (conversations.value.length > 0 && !selectedConversationId.value) {
      selectedConversationId.value = conversations.value[0]!.id;
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
    uploadedFiles,

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
    openSourcesPanel,
    closeSourcesPanel,
    addUploadedFile,
    removeUploadedFile,
    clearUploadedFiles,
  };
});
