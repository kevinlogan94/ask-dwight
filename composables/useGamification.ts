import type { Conversation } from "~/models/chat";
import { getTotalTimeSaved } from "~/utils/gamification";

export const useGamification = () => {
  const chatStore = useChatStore();
  const supabaseUser = useSupabaseUser();

  /**
   * Computed property that returns the total time saved across all conversations
   * Will automatically re-evaluate when conversations change
   */
  const totalSavedTime = computed(() => {
    let conversations: Conversation[] = [];
    if (supabaseUser.value) {
      conversations = chatStore.conversations;
      if (!conversations || conversations.length === 0) return 0;
    } else if (chatStore.selectedConversation) {
      conversations.push(chatStore.selectedConversation);
    } else {
      return 0;
    }

    return getTotalTimeSaved(conversations);
  });

  return {
    totalSavedTime,
  };
};
