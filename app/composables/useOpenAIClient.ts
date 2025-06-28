import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { createParser } from "eventsource-parser";
import type { ResponseApiCompletedEvent } from "~/models/chat";

export const useOpenAIClient = () => {

  const chatStore = useChatStore();
  const supabase = useSupabaseClient();
  
  //to be used for the suggestions
  const getResponseAPIResponse = async (prompt: Array<ChatCompletionMessageParam>): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke("response-conversations", {
        body: { prompt },
      });

      if (error) {
        console.error("Error from Supabase Function:", error);
        throw error;
      }

      return data.output_text;
    } catch (error) {
      console.error("Error in getResponseAPIResponse:", error);
      throw error;
    }
  };

  const getResponseAPIStreamingResponse = async (
    prompt: string | Array<ChatCompletionMessageParam>,
    responseId: string | undefined,
    onDelta: (delta: string) => void,
  ): Promise<ResponseApiCompletedEvent> => {
    try {
      const { data, error } = await supabase.functions.invoke<ReadableStream>("response-conversations-stream", {
        body: { prompt, responseId },
      });

      if (error || !data) {
        console.error("Error from Supabase Function:", error);
        throw error || new Error("No response body");
      }

      let responseCompletedEvent;

      const onEvent = (event: any) => {
        if (event.type === "response.created") {
          chatStore.chatStatus = "streaming";
        }

        if (event.type === "response.output_text.delta") {
          try {
            const parsedData = JSON.parse(event.data);
            const delta = parsedData.delta;
            onDelta(delta);
          } catch (e) {
            console.error("Failed to parse JSON:", e);
          }
        }

        if (event.type === "response.completed") {
          responseCompletedEvent = event;
        }
      };

      const reader = data.getReader();
      const decoder = new TextDecoder();
      const parser = createParser({ onEvent });

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          return responseCompletedEvent as unknown as ResponseApiCompletedEvent;
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
    getResponseAPIResponse,
    getResponseAPIStreamingResponse,
  };
};
