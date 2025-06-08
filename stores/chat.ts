import { defineStore } from "pinia";
import type { User } from "~/models/user";
import type { Message, Conversation } from "~/models/chat";
import { throttleConversation } from "~/utils/helpers";
import { useMessageService } from "~/composables/services/useMessageService";
import { useConversationService } from "~/composables/services/useConversationService";
import { useConversationRepository } from "~/composables/repositories/useConversationRepository";

export const useChatStore = defineStore("chat", () => {
  // State

  // Set up local storage for conversations. Set the default value to an empty array.
  let conversations = ref<Conversation[]>([]);
  const selectedConversationId = ref<string | null>(null);
  const sidebarOpen = ref(false);
  const aiResponsePending = ref(false);
  const anyMessagesSentForCurrentSession = ref(false); // need to know if they just opened the app.

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

  const { sendMessage } = useMessageService();
  const { createNewConversation, selectConversation } = useConversationService();
  const { syncConversationsToSupabase, fetchConversationsFromSupabase, associateConversationsWithUser } =
    useConversationRepository();

  onMounted(async () => {
    await syncConversationsToSupabase();
    conversations.value = await fetchConversationsFromSupabase();

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
    anyMessagesSentForCurrentSession,

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
  };
});
