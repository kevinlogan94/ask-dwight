import type { ResponseApiCompletedEvent } from "~/models/chat";

/**
 * Composable for system-level interaction controls via Dwight.
 Sends a special message to the OpenAI client to indicate throttling.
 */
export function useSystemInteractionControls() {
  const { getResponseAPIStreamingResponse } = useOpenAIClient();
  const chatStore = useChatStore();

  /**
   * Triggers conversation throttling by sending a special message to the AI via streaming.
   * @param responseId The ID of the response to stream.
   * @param onDelta A callback function to be called when a delta is received.
   * @returns A promise that resolves to the completed response.
   */
  async function getThrottlingResponseStreaming(
    responseId: string,
    onDelta: (delta: string) => void,
  ): Promise<ResponseApiCompletedEvent | undefined> {
    if (!chatStore.selectedConversation) {
      console.error("No conversation found to throttle.");
      return undefined;
    }

    try {
      const response = await getResponseAPIStreamingResponse(
        "Trigger the throttle trigger so that you can tell me that I have to wait to ask another question.",
        responseId,
        onDelta,
      );

      return response;
    } catch (error) {
      console.error("Failed to trigger conversation throttling:", error);
      return undefined;
    }
  }

  return {
    getThrottlingResponseStreaming,
  };
}
