import { createParser } from "eventsource-parser";
import type { ResponseApiCompletedEvent, ResponseRequest } from "~/models/chat";
import type { ResponseInputItem } from "openai/resources/responses/responses.mjs";

export const useOpenAIClient = () => {

  const chatStore = useChatStore();
  const supabase = useSupabaseClient();
  
  /**
 * Gets a response from the OpenAI API.
 * @param prompt The prompt to send to the API.
 * @returns A promise that resolves to the response text.
 */
  const getResponseAPIResponse = async (prompt: Array<ResponseInputItem>): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke<{output_text: string}>("response-conversations", {
        body: { prompt, stream: false },
      });

      if (error) {
        console.error("Error from Supabase Function:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Response body is null");
      }

      return data.output_text;
    } catch (error) {
      console.error("Error in getResponseAPIResponse:", error);
      throw error;
    }
  };

  /**
 * Gets a streaming response from the OpenAI API.
 * @param prompt The prompt to send to the API.
 * @param responseId The ID of the response to stream.
 * @param onDelta A callback function to be called when a delta is received.
 * @returns A promise that resolves to the completed response.
 */
  const getResponseAPIStreamingResponse = async (
    request: ResponseRequest,
    onDelta: (delta: string) => void,
  ): Promise<ResponseApiCompletedEvent> => {
    try {
      const { data, error } = await supabase.functions.invoke<Response>("response-conversations", {
        body: {
          prompt: request.prompt,
          responseId: request.responseId,
          tools: request.tools,
          stream: true,
        },
      });

      if (error || !data || !data.body) {
        console.error("Error from Supabase Function:", error);
        throw error || new Error("No response body");
      }

      let responseCompletedEvent;

      const onEvent = (event: { data: string }) => {
        try {
          const parsedData = JSON.parse(event.data);

          switch (parsedData.type) {
            case "response.created":
              chatStore.chatStatus = "streaming";
              break;
            case "response.output_text.delta":
              const delta = parsedData.delta;
              onDelta(delta);
              break;
            case "response.completed":
              responseCompletedEvent = parsedData;
              break;
            case "response.output_text.annotation.added":
              const { annotation } = parsedData;
              if (annotation.type === "file_citation") {
                const messageId = chatStore.selectedConversation!.messages[chatStore.selectedConversation!.messages.length - 1]!.id;

                chatStore.addSource({
                  title: annotation.filename,
                  type: 'file',
                  messageId,
                });
              }
              break;
          }
        } catch (e) {
          console.error("Failed to parse event data from stream:", event.data, e);
        }
      };

      const reader = data.body.getReader();
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
      console.error("Error fetching responses from edge function:", error);
      throw error;
    }
  };

  // Return the function to be used by the caller
  return {
    getResponseAPIResponse,
    getResponseAPIStreamingResponse,
  };
};
