import type { Message } from "~/models/chat";
import type { ChatCompletionMessage, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { useOpenAIClient } from "~/composables/useOpenAIClient";
import { organizeMessagesForApi, parseMarkdown } from "~/utils/helpers";

export const DEFAULT_ERROR_MESSAGE =
  "Your sales coach is temporarily off the grid—probably closing a deal or wrestling an API. Don't worry. We're rerouting. Try again in a few.";

export function useMessages() {
  // Get the chat store
  const chatStore = useChatStore();

  // Get utilities and services
  const { getClientSideChatCompletion } = useOpenAIClient();
  const { clearSuggestions } = useSuggestions(computed(() => chatStore.selectedConversation));

  /**
   * Add a new message to the current conversation
   */
  function addMessage(message: Omit<Message, "id" | "timestamp">): Message {
    // Create a new conversation if none is selected
    if (!chatStore.selectedConversationId) {
      chatStore.createNewConversation();
    }

    const conversation = chatStore.conversations.find((c) => c.id === chatStore.selectedConversationId);

    if (!conversation) {
      console.error("No conversation selected to add message");
      throw new Error("No conversation selected");
    }

    // Create a new message with a UUID
    const newMessage: Message = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...message,
    };

    // Add the message to the conversation
    conversation.messages.push(newMessage);

    return newMessage;
  }

  /**
   * Remove a message from the current conversation
   */
  function removeMessage(messageId: string): void {
    const conversation = chatStore.selectedConversation;
    if (!conversation) return;

    // Find index of the message to remove
    const messageIndex = conversation.messages.findIndex((m) => m.id === messageId);
    if (messageIndex !== -1) {
      // Remove the message from the array
      conversation.messages.splice(messageIndex, 1);
    }
  }

  /**
   * Send a message and get an AI response
   */
  async function sendMessage(content: string): Promise<boolean> {
    let conversation = chatStore.selectedConversation;

    // If no conversation exists or is selected, create a new one
    if (!conversation) {
      conversation = await chatStore.createNewConversation();
      if (!conversation) {
        console.error("Failed to create or find a conversation.");
        return false;
      }
    }

    clearSuggestions();

    chatStore.aiResponsePending = true;

    // Add user message
    addMessage({
      content,
      sender: "user",
      status: "sent",
    });

    // Add loading message and get its ID
    const loadingMessage = addMessage({
      content: "",
      sender: "system",
      status: "loading",
    });
    const loadingMessageId = loadingMessage.id;

    try {
      // Prepare messages for the API (only user and assistant roles)
      const messagesForApi: ChatCompletionMessageParam[] = organizeMessagesForApi(conversation.messages);

      // Call the client-side OpenAI utility function
      const responseMessage: ChatCompletionMessage | null = await getClientSideChatCompletion(messagesForApi);

      // Remove loading message regardless of success or failure
      removeMessage(loadingMessageId);

      if (responseMessage && responseMessage.content) {
        const htmlContent = await parseMarkdown(responseMessage.content);

        // Add the actual AI response with parsed HTML
        addMessage({
          content: responseMessage.content,
          htmlContent: htmlContent,
          sender: "assistant",
          status: "sent",
        });

        if (chatStore.throttleConversation) {
          // Trigger conversation throttling and get the response
          const { triggerThrottling } = useSystemInteractionControls(computed(() => chatStore.selectedConversation));
          const throttlingResponse = await triggerThrottling();

          if (throttlingResponse && throttlingResponse.content) {
            const throttleHtmlContent = await parseMarkdown(throttlingResponse.content);
            // Add the throttling response message as if it came from the assistant
            addMessage({
              content: throttlingResponse.content,
              htmlContent: throttleHtmlContent,
              sender: "assistant",
              status: "sent",
              isThrottleMessage: true,
            });
          }
        } else {
          // For non-throttled conversations, generate suggestions as normal
          const { generateSuggestions } = useSuggestions(computed(() => chatStore.selectedConversation));
          await generateSuggestions();
        }
      } else {
        // Add an error message if the API call failed or returned no content
        addMessage({
          content: DEFAULT_ERROR_MESSAGE,
          sender: "system",
          status: "sent",
        });
        console.error("Failed to get response from getClientSideChatCompletion");
      }
    } catch (error) {
      console.error("Error during sendMessage:", error);
      // Remove loading message in case of an exception
      removeMessage(loadingMessageId);
      // Add an error message
      addMessage({
        content: DEFAULT_ERROR_MESSAGE,
        sender: "system",
        status: "sent",
      });
    } finally {
      chatStore.aiResponsePending = false;
    }

    return true;
  }

  return {
    addMessage,
    removeMessage,
    sendMessage,
  };
}
