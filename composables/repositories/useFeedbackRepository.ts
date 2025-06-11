import { useSupabaseClient } from '#imports';
import type { Database } from '../../models/supabase';
import { getOrCreateSessionId } from '~/utils/helpers';

type FeedbackReactionType = Database['public']['Enums']['feedback_reaction_type'];

export function useFeedbackRepository() {
  const supabase = useSupabaseClient<Database>();
  const userFeedbackQuery = supabase.from("ai_response_feedback");

  userFeedbackQuery.headers = {
    "supabase-session-id": getOrCreateSessionId(),
  };

  /**
   * Fetches feedback for a specific Dwight response.
   * @param dwightResponseId - The ID of the response being evaluated.
   * @returns The feedback data for the specified response.
   */
  async function fetchFeedback(dwightResponseId: string) {
    const { data, error } = await userFeedbackQuery
      .select('id, reaction, copied')
      .eq('dwight_response_id', dwightResponseId)
      .maybeSingle();

    if (error) {
      throw error;
    }
    return data;
  }

  /**
   * Updates feedback for a specific Dwight response.
   * @param feedbackId - The ID of the feedback being updated.
   * @param reaction - The new reaction state (e.g., 'thumbs_up', 'thumbs_down', or null).
   * @param isCopied - The new copied state.
   */
  async function updateFeedback(
    feedbackId: string,
    reaction: FeedbackReactionType | null,
    isCopied: boolean
  ) {
    const { error } = await userFeedbackQuery
      .update({
        reaction,
        copied: isCopied,
      })
      .eq('id', feedbackId);

    if (error) {
      throw error;
    }
    return;
  }

  /**
   * Inserts new feedback for a specific Dwight response.
   * @param dwightResponseId - The ID of the response being evaluated.
   * @param reaction - The new reaction state (e.g., 'thumbs_up', 'thumbs_down', or null).
   * @param isCopied - The new copied state.
   */
  async function insertFeedback(
    dwightResponseId: string,
    reaction: FeedbackReactionType | null,
    isCopied: boolean
  ) {
    const { error } = await userFeedbackQuery
      .insert({
        dwight_response_id: dwightResponseId,
        reaction,
        copied: isCopied,
      });

    if (error) {
      throw error;
    }
    return;
  }

  return {
    fetchFeedback,
    updateFeedback,
    insertFeedback,
  };
}
