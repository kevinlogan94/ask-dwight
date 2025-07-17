// c:\Users\KevinLogan\githubRepositories\ask-dwight\composables\services\useFeedbackService.ts

import { useFeedbackRepository } from "~/composables/repositories/chat/useFeedbackRepository";
import type { Message } from "~/models/chat";
import type { Database } from "~/models/supabase";

type FeedbackReactionType = Database["public"]["Enums"]["feedback_reaction_type"];

export function useFeedbackService() {
  const { fetchFeedback, updateFeedback, insertFeedback } = useFeedbackRepository();

  /**
   * Records user feedback for a Dwight response.
   * It handles the logic for both creating new feedback and updating existing feedback.
   * @param dwight_response_id - The ID of the response being evaluated.
   * @param reactionToSet - The new reaction state (e.g., 'thumbs_up', 'thumbs_down', or null).
   * @param isCopiedToSet - The new copied state.
   */
  async function recordFeedback(
    dwight_response_id: string,
    reactionToSet: FeedbackReactionType | null | undefined,
    isCopiedToSet: boolean | undefined,
  ) {
    try {
      // Step 1: Query for existing feedback
      const existingData = await fetchFeedback(dwight_response_id);

      let existingFeedbackId: string | null = null;
      let currentReactionInDb: FeedbackReactionType | null = null;
      let currentCopiedInDb: boolean = false;

      if (existingData) {
        existingFeedbackId = existingData.id;
        currentReactionInDb = existingData.reaction as FeedbackReactionType | null;
        currentCopiedInDb = existingData.copied || false;
      }

      // Determine the final state to be saved
      const finalReaction = reactionToSet === undefined ? currentReactionInDb : reactionToSet;
      const finalCopied = isCopiedToSet === undefined ? currentCopiedInDb : isCopiedToSet;

      // Step 2: Update or Insert
      if (existingFeedbackId) {
        await updateFeedback(existingFeedbackId, finalReaction, finalCopied);
      } else {
        await insertFeedback(dwight_response_id, finalReaction, finalCopied);
      }
    } catch (error) {
      console.error("Error in recordFeedback:", error);
      throw error;
    }
  }

  /**
   * Toggles the reaction for a specific Dwight response.
   * If the user has already given the same reaction, it removes the reaction (sets it to null).
   * If the user has given a different reaction, it updates the reaction to the new one.
   * @param dwight_response_id - The ID of the response being evaluated.
   * @param reaction - The new reaction state (e.g., 'thumbs_up', 'thumbs_down').
   */
  async function toggleReaction(dwightResponse: Message, reaction: "thumbs_up" | "thumbs_down") {
    try {
      const existingData = await fetchFeedback(dwightResponse.id);

      const newReactionState = existingData && existingData.reaction === reaction ? null : reaction;

      dwightResponse.reaction = newReactionState;

      await recordFeedback(dwightResponse.id, newReactionState, undefined);
    } catch (error) {
      console.error("Error in toggleReaction:", error);
      throw error;
    }
  }

  return {
    recordFeedback,
    toggleReaction,
  };
}
