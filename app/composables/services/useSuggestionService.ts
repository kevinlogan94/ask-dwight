import { organizeMessagesForApi } from "~/utils/helpers";
import { useChatStore } from "~/stores/chat";
import { useSuggestionRepository } from "~/composables/repositories/chat/useSuggestionRepository";
import { useOpenAIClient } from "~/composables/useOpenAIClient";
import type { Message } from "~/models/chat";
import type { ResponseInputItem } from "openai/resources/responses/responses.mjs";

export function useSuggestionService() {
  const chatStore = useChatStore();
  const { saveSuggestionsToSupabase } = useSuggestionRepository();

  async function generateSuggestions(): Promise<void> {
    if (
      !chatStore.selectedConversation ||
      chatStore.selectedConversation.messages?.length === 0 ||
      chatStore.selectedConversation.messages[chatStore.selectedConversation.messages.length - 1]?.role !== "assistant"
    ) {
      if ((chatStore.selectedConversation?.messages?.length ?? 0) > 2) {
        console.error("Failed to generate suggestions: No assistant message found");
      }
      return;
    }

    // Set placeholder suggestions while loading
    const assistantMsg = chatStore.selectedConversation.messages[chatStore.selectedConversation.messages.length - 1] as Message;
    assistantMsg.suggestions = ["loading", "loading", "loading"];

    const messagesForApi: ResponseInputItem[] = organizeMessagesForApi(
      chatStore.selectedConversation.messages,
    );

    messagesForApi.push({
      role: "user",
      content: "Trigger the suggestion trigger to create 3 suggestions that I could say back to you.",
    });

    const { getResponseAPIResponse } = useOpenAIClient();

    try {
      const apiResponse = await getResponseAPIResponse(messagesForApi);
      const content = apiResponse;

      if (content) {
        let suggestions = organizeSuggestions(content);

        // Retry logic if the response is not as expected
        if (suggestions.length !== 3) {
          const retryApiResponse = await getResponseAPIResponse(messagesForApi);
          const retryContent = retryApiResponse;
          if (retryContent) {
            suggestions = organizeSuggestions(retryContent);
          } else {
            console.error("Failed to generate suggestions on retry: No content in API response");
            assistantMsg.suggestions = [];
            return;
          }
        }

        assistantMsg.suggestions = suggestions;
        await saveSuggestionsToSupabase(assistantMsg.id, suggestions);
      } else {
        console.error("Failed to generate suggestions: No content in API response");
        assistantMsg.suggestions = [];
      }
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
      assistantMsg.suggestions = [];
    }
  }

  function clearSuggestions(): void {
    if (!chatStore.selectedConversation) return;

    const message = chatStore.selectedConversation.messages[chatStore.selectedConversation.messages.length - 1];
    if (message) {
      message.suggestions = [];
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
