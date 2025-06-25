import type { ChatCompletionMessage, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { Responses } from "openai/resources/responses";
import { createParser, type EventSourceMessage } from "eventsource-parser";

export const useOpenAIClient = () => {
  const getClientSideChatCompletion = async (
    messages: ChatCompletionMessageParam[],
  ): Promise<ChatCompletionMessage | null> => {
    try {
      // Get Supabase client using the built-in composable
      const supabase = useSupabaseClient();

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

    const getResponseAPIResponse = async (prompt: string): Promise<Responses | null> => {
    try {
      const supabase = useSupabaseClient();
      const { data, error } = await supabase.functions.invoke("response-conversations", {
        body: { prompt },
      });

      if (error) {
        console.error("Error from Supabase Function:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in getResponseAPIResponse:", error);
      throw error;
    }
  };

  const getResponseAPIStreamingResponse = async (prompt: string) => {
    try {
      // Get Supabase client using the built-in composable
      const supabase = useSupabaseClient();

      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke("response-conversations-stream", {
        body: { prompt },
      });

      if (error || !data.body) {
        console.error("Error from Supabase Function:", error);
        throw error || new Error("No response body");
      }

      const onEvent = (event: EventSourceMessage) => {
        if (event.data) {
          try {
            const parsedData = JSON.parse(event.data);
            // Now you can process the event from OpenAI
            console.log(parsedData);
          } catch (e) {
            console.error("Failed to parse JSON:", e);
          }
        }
      };

      const reader = data.body.getReader();
      const decoder = new TextDecoder();
      const parser = createParser({ onEvent });

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          //save the full response to the dwight_response table
          break;
        }
        const chunk = decoder.decode(value);
        parser.feed(chunk);
      }
    } catch (error) {
      console.error("Error fetching chat completion from edge function:", error);
      throw error;
    }
  };

  // Return the function to be used by the caller
  return {
    getClientSideChatCompletion,
    getResponseAPIResponse,
    getResponseAPIStreamingResponse,
  };
};
