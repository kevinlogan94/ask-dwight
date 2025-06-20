import { useChatStore } from "~//stores/chat";
import { useConversationRepository } from "~/composables/repositories/useConversationRepository";
import type { Conversation } from "~/models/chat";

export function useConversationService() {
  const chatStore = useChatStore();
  const { createConversationInSupabase } = useConversationRepository();

  async function createNewConversation() {
    const conversationNumber = chatStore.conversations.length + 1;
    const title = `Conversation ${conversationNumber}`;

    try {
      const conversationId = await createConversationInSupabase(title);

      // Create new conversation with the ID from Supabase
      const newConversation: Conversation = {
        id: conversationId,
        title,
        messages: [],
        createdAt: new Date(),
      };

      // Add to local state
      chatStore.conversations.push(newConversation);
      chatStore.selectedConversationId = conversationId;

      return newConversation;
    } catch (error) {
      console.error("Failed to create conversation in Supabase:", error);
      throw error;
      //todo - show technical toast message on error.
    }
  }

  function selectConversation(conversationId: string | null) {
    chatStore.selectedConversationId = conversationId;
  }

  return {
    createNewConversation,
    selectConversation,
  };
}
