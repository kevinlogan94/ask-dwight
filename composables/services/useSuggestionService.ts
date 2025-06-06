import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { organizeMessagesForApi } from "~/utils/helpers";
import { useChatStore } from "~/stores/chat";
import { useSuggestionRepository } from "~/composables/repositories/useSuggestionRepository";

export function useSuggestionService() {
 const chatStore = useChatStore();
 const { saveSuggestionsToSupabase } = useSuggestionRepository();

  async function generateSuggestions(): Promise<void> {
    if (
      !chatStore.selectedConversation ||
      chatStore.selectedConversation.messages[chatStore.selectedConversation.messages.length - 1].sender !== "assistant"
    ) {
      if ((chatStore.selectedConversation?.messages?.length ?? 0) > 2) {
        console.error("Failed to generate suggestions: No assistant message found");
      }
      return;
    }

    // Set placeholder suggestions while loading
    const assistantMsg = chatStore.selectedConversation.messages[chatStore.selectedConversation.messages.length - 1];
    assistantMsg.suggestions = ["loading", "loading", "loading"];

    const messagesForApi: ChatCompletionMessageParam[] = organizeMessagesForApi(chatStore.selectedConversation.messages);

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
            await saveSuggestionsToSupabase(assistantMsg.id, suggestions);
            return;
          }
          console.error("Failed to generate suggestions: No response from API");
        }

        assistantMsg.suggestions = suggestions;
        await saveSuggestionsToSupabase(assistantMsg.id, suggestions);
        return;
      }
      console.error("Failed to generate suggestions: No response from API");
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
