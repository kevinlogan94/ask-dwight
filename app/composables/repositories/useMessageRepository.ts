import { useSupabaseClient } from "#imports";
import { organizePromptInfo } from "~/utils/gamification";
import { getOrCreateSessionId } from "~/utils/helpers";

export function useMessageRepository() {
  const supabase = useSupabaseClient();
  const userPromptsQuery = supabase.from("user_prompts");
  const dwightResponsesQuery = supabase.from("dwight_responses");

  userPromptsQuery.headers = {
    "supabase-session-id": getOrCreateSessionId(),
  };
  dwightResponsesQuery.headers = {
    "supabase-session-id": getOrCreateSessionId(),
  };

  /**
   * Save a user prompt to Supabase
   * @param conversationId The conversation ID
   * @param content The message content
   * @returns The ID of the created user prompt
   */
  async function saveUserPromptToSupabase(conversationId: string, content: string): Promise<string> {
    try {
      const { category, timeSaved } = organizePromptInfo(content);
      const { data, error } = await userPromptsQuery
        .insert({
          conversation_id: conversationId,
          message: content,
          category: category.toString(),
          time_saved: timeSaved,
        } as any)
        .select("id")
        .single();

      if (error) {
        console.error("Error saving user prompt to Supabase:", error);
        throw error;
      }

      return (data as any)?.id;
    } catch (error) {
      console.error("Error in saveUserPromptToSupabase:", error);
      throw error;
    }
  }

  /**
   * Save an assistant response to Supabase
   * @param conversationId The conversation ID
   * @param content The message content
   * @param promptId The ID of the corresponding user prompt
   * @returns The ID of the created response
   */
  async function saveAssistantResponseToSupabase(
    id: string,
    conversationId: string,
    content: string,
    promptId: string,
  ): Promise<string> {
    try {
      // Insert the response
      const { data, error } = await dwightResponsesQuery
        .insert({
          id,
          conversation_id: conversationId,
          message: content,
          prompt_id: promptId,
        } as any)
        .select("id")
        .single();

      if (error) {
        console.error("Error saving assistant response to Supabase:", error);
        throw error;
      }

      const responseId = (data as any)?.id;
      if (!responseId) {
        throw new Error("Failed to save assistant response to Supabase");
      }

      return responseId;
    } catch (error) {
      console.error("Error in saveAssistantResponseToSupabase:", error);
      throw error;
    }
  }

  return {
    saveUserPromptToSupabase,
    saveAssistantResponseToSupabase,
  };
}
