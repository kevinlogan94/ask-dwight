import type { ChatCompletionMessage, ChatCompletionMessageParam } from "openai/resources/chat/completions";

export const useOpenAIClient = () => {
  const getClientSideChatCompletion = async (
    messages: ChatCompletionMessageParam[],
  ): Promise<ChatCompletionMessage | null> => {
    try {
      // Get Supabase client using the built-in composable
      const supabase = useSupabaseClient();

      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke("chat-conversations", {
        body: { messages },
      });

      if (error) {
        console.error("Error from Supabase Function:", error);
        throw error;
      }

      if (data?.message) {
        return data.message;
      } else {
        console.error("Invalid response structure from edge function:", data);
        throw new Error("Invalid response structure from edge function");
      }
    } catch (error) {
      console.error("Error fetching chat completion from edge function:", error);
      throw error;
    }
  };

  // Return the function to be used by the caller
  return {
    getClientSideChatCompletion,
  };
};
