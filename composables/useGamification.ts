import { getTotalTimeSaved } from "~/utils/gamification";
import { useLocalStorage } from "@vueuse/core";

export const useGamification = () => {
  const chatStore = useChatStore();
  const toast = useToast();

  // Store the last milestone reached in localStorage to persist between sessions
  const lastMilestoneReached = useLocalStorage('last-milestone', {
    timeSaved: 0,
  });

  // Define our milestones in minutes
  const milestones = {
    timeSaved: [10, 30, 60, 120, 240, 480],
  };

  /**
   * Checks if user has reached a time-saved milestone and triggers appropriate animations/notifications
   */
  const checkMilestone = (): void => {
    const conversations = chatStore.conversations;
    if (!conversations || conversations.length === 0) return;

    // Calculate total time saved across all conversations
    let totalTimeSaved = getTotalTimeSaved(conversations);

    // Check if we've reached a new milestone
    const nextMilestone = milestones.timeSaved.find(
      (milestone) => milestone > lastMilestoneReached.value.timeSaved,
    );

    if (nextMilestone && totalTimeSaved >= nextMilestone) {
      // Update the last milestone reached
      lastMilestoneReached.value.timeSaved = nextMilestone;

      // Trigger animation and notification
      triggerMilestoneAnimation(nextMilestone);
    }
  };

  /**
   * Triggers animations and notifications for reaching milestones
   */
  const triggerMilestoneAnimation = (milestone: number): void => {
    // Show a toast notification
    toast.add({
      title: `🎉 Milestone Reached!`,
      description: `You've saved ${milestone} minutes with Ask Dwight.`,
      color: "success",
      duration: 5000,
    });

    // Here you could also trigger more complex animations using @vueuse/motion/nuxt
    // For example, you might want to update a global state that components can react to
    // or emit an event that animation components can listen for
  };

  return {
    checkMilestone,
  };
};
