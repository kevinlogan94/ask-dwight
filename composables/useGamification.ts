import { getTotalTimeSaved } from "~/utils/gamification";

export const useGamification = () => {
  const chatStore = useChatStore();

  /**
   * Computed property that returns the total time saved across all conversations
   * Will automatically re-evaluate when conversations change
   */
  const totalSavedTime = computed(() => {
    const conversations = chatStore.conversations;
    if (!conversations || conversations.length === 0) return 0;
    return getTotalTimeSaved(conversations);
  });

  return {
    totalSavedTime,
  };
};
