import { useHelpers } from "./useHelpers";

export function useSuggestions(conversation: Ref<Conversation | undefined>) {
  const { organizeMessagesForApi } = useHelpers();

  async function generateSuggestions(): Promise<void> {
    console.log("Generating suggestions...");
    if (
      !conversation.value ||
      conversation.value.messages[conversation.value.messages.length - 1]
        .sender !== "assistant"
    ) {
      console.error(
        "Failed to generate suggestions: No assistant message found"
      );
      return;
    }

    // Set placeholder suggestions while loading
    const assistantMsg = conversation.value.messages[conversation.value.messages.length - 1];
    assistantMsg.suggestions = ['loading', 'loading', 'loading'];

    var messagesForApi = organizeMessagesForApi(conversation.value.messages);

    messagesForApi.push({
      role: "user",
      content:
        "Generate 3 concise, relevant follow-up questions or prompts that the user might ask next.",
    });

    const { getClientSideChatCompletion } = useOpenAIClient();

    try {
        var response = await getClientSideChatCompletion(messagesForApi, true);
    
        //organize suggestions into latest message from AI
        if (response && response.content) {
          const suggestions = response.content
          .split("\n")
          .map((s) => s.trim())
    
          assistantMsg.suggestions = suggestions;
          return;
        }
        console.error("Failed to generate suggestions: No response from API");
    } catch (error) {
        console.error("Failed to generate suggestions:", error);
    }
  }

  function clearSuggestions(): void {
    if (!conversation.value) return;

    const message =
      conversation.value.messages[conversation.value.messages.length - 1];
    if (message) {
      message.suggestions = [];
    } else {
      console.error("");
    }
  }

  return {
    clearSuggestions,
    generateSuggestions,
  };
}
