import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { organizeMessagesForApi } from "~/utils/helpers";
import type { Conversation } from "~/models/chat";

export function useSuggestions(conversation: Ref<Conversation | undefined>) {
  async function generateSuggestions(): Promise<void> {
    if (
      !conversation.value ||
      conversation.value.messages[conversation.value.messages.length - 1].sender !== "assistant"
    ) {
      console.error("Failed to generate suggestions: No assistant message found");
      return;
    }

    // Set placeholder suggestions while loading
    const assistantMsg = conversation.value.messages[conversation.value.messages.length - 1];
    assistantMsg.suggestions = ["loading", "loading", "loading"];

    const messagesForApi: ChatCompletionMessageParam[] = organizeMessagesForApi(conversation.value.messages);

    messagesForApi.push({
      role: "user",
      content:
        "Trigger the suggestion trait to create 3 suggestions that I could say back to you.",
    });

    const { getClientSideChatCompletion } = useOpenAIClient();

    try {
      let response = await getClientSideChatCompletion(messagesForApi);

      //organize suggestions into latest message from AI
      if (response && response.content) {
        let suggestions = organizeSuggestions(response.content);

        if (suggestions.length !== 3) {
          response = await getClientSideChatCompletion(messagesForApi);
          if (response && response.content) {
            suggestions = organizeSuggestions(response.content);
            assistantMsg.suggestions = suggestions;
            return;
          }
          console.error("Failed to generate suggestions: No response from API");
        }

        assistantMsg.suggestions = suggestions;
        return;
      }
      console.error("Failed to generate suggestions: No response from API");
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
      assistantMsg.suggestions = [];
    }
  }

  function clearSuggestions(): void {
    if (!conversation.value) return;

    const message = conversation.value.messages[conversation.value.messages.length - 1];
    if (message) {
      message.suggestions = [];
    } else {
      console.error("Failed to clear suggestions: No message found");
    }
  }

  function organizeSuggestions(suggestions: string): string[] {
    return suggestions
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  return {
    clearSuggestions,
    generateSuggestions,
  };
}
