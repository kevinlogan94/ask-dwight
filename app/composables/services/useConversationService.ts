import { useChatStore } from "~//stores/chat";
import { useConversationRepository } from "~/composables/repositories/chat/useConversationRepository";
import type { Conversation } from "~/models/chat";
import type { TablesUpdate } from "~/models/supabase";

export function useConversationService() {
  const chatStore = useChatStore();
  const { createConversationInSupabase, updateConversationInSupabase } = useConversationRepository();

  /*
   * Creates a new conversation in the chat store and in Supabase.
   */
  async function createNewConversation(vectorStoreId: string | null = null) {
    const conversationNumber = chatStore.conversations.length + 1;
    const title = `Conversation ${conversationNumber}`;

    try {
      const conversationId = await createConversationInSupabase(title, vectorStoreId);

      // Create new conversation with the ID from Supabase
      const newConversation: Conversation = {
        id: conversationId,
        title,
        messages: [],
        vector_store_id: vectorStoreId,
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

  //todo use this when we start setting the title of conversations
  async function updateConversation(conversationId: string, dto: TablesUpdate<"conversations">) {
    const conversation = chatStore.conversations.find((c) => c.id === conversationId);
    if (!conversation) {
      console.error(`updateConversation: Conversation with ID ${conversationId} not found`);
      return;
    }

    // Update local state
    if (dto.title) {
      conversation.title = dto.title;
    }
    if (dto.vector_store_id) {
      conversation.vector_store_id = dto.vector_store_id;
    }

    await updateConversationInSupabase(conversationId, dto);
  }

  return {
    createNewConversation,
    selectConversation,
    updateConversation,
  };
}
