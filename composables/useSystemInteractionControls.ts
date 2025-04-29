import { useHelpers } from "./useHelpers";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

/**
 * Composable for system-level interaction controls via Dwight.
 Sends a special message to the OpenAI client to indicate throttling.
 */
export function useSystemInteractionControls(conversation: Ref<Conversation | undefined>) {
  const { getClientSideChatCompletion } = useOpenAIClient();
  const { organizeMessagesForApi } = useHelpers();

  /**
   * Triggers conversation throttling by sending a special message to the AI.
   * @returns The AI response message or null if the request failed
   */
  async function triggerThrottling(): Promise<any> {
    if (!conversation.value) {
      console.error("No conversation found to throttle.");
      return null;
    }

    const messagesForApi: ChatCompletionMessageParam[] = organizeMessagesForApi(conversation.value.messages);
    messagesForApi.push({
      role: "user",
      content: "trigger conversation throttling",
    });
    try {
      const response = await getClientSideChatCompletion(messagesForApi);
      return response;
    } catch (error) {
      console.error("Failed to trigger conversation throttling:", error);
      return null;
    }
  }

  return {
    triggerThrottling,
  };
}
