import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { organizeMessagesForApi } from "~/utils/helpers";
import type { Conversation } from "~/models/chat";

/**
 * Composable for system-level interaction controls via Dwight.
 Sends a special message to the OpenAI client to indicate throttling.
 */
export function useSystemInteractionControls() {
  const { getClientSideChatCompletion } = useOpenAIClient();
  const chatStore = useChatStore();

  /**
   * Triggers conversation throttling by sending a special message to the AI.
   * @returns The AI response message or null if the request failed
   */
  async function getThrottlingResponse(): Promise<any> {
    if (!chatStore.selectedConversation) {
      console.error("No conversation found to throttle.");
      return null;
    }

    const messagesForApi: ChatCompletionMessageParam[] = organizeMessagesForApi(chatStore.selectedConversation.messages);
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
    getThrottlingResponse,
  };
}
