import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { organizeMessagesForApi } from "~/utils/helpers";

/**
 * Composable for system-level interaction controls via Dwight.
 Sends a special message to the OpenAI client to indicate throttling.
 */
export function useSystemInteractionControls() {
  const { getResponseAPIStreamingResponse } = useOpenAIClient();
  const chatStore = useChatStore();

//todo finish this

  /**
 * Triggers conversation throttling by sending a special message to the AI via streaming.
 * @returns The AI response message or null if the request failed
 */
async function getThrottlingResponseStreaming(): Promise<any> {
  if (!chatStore.selectedConversation) {
      console.error("No conversation found to throttle.");
      return;
    }

    try {
      const response = await getResponseAPIStreamingResponse("trigger conversation throttling");
      return response;
    } catch (error) {
      console.error("Failed to trigger conversation throttling:", error);
      return;
    }
  }

  return {
    getThrottlingResponseStreaming,
  };
}
