import type { ChatCompletionMessage, ChatCompletionMessageParam } from "openai/resources/chat/completions";

export const useOpenAIClient = () => {
  const getClientSideChatCompletion = async (
    messages: ChatCompletionMessageParam[],
  ): Promise<ChatCompletionMessage | null> => {
    try {
      // Get Supabase client using the built-in composable
      const supabase = useSupabaseClient();
      const user = useSupabaseUser();
      const chat = useChatStore();

      const sessionId = getOrCreateSessionId();
      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke("chat-conversations", {
        body: { messages, session_id: sessionId, user_id: user.value?.id, conversation_id: chat.selectedConversationId },
      });

      if (error) {
        console.error("Error from Supabase Function:", error);
        return null;
      }

      if (data?.message) {
        console.log("Response from edge function:", data.message.content);
        return data.message;
      } else {
        console.error("Invalid response structure from edge function:", data);
        return null;
      }
    } catch (error) {
      console.error("Error fetching chat completion from edge function:", error);
      return null;
    }
  };

  // Return the function to be used by the caller
  return {
    getClientSideChatCompletion,
  };
};
