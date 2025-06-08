import type { Message } from "~/models/chat";
import type { ChatCompletionMessage, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { useOpenAIClient } from "~/composables/useOpenAIClient";
import { organizeMessagesForApi, parseMarkdown } from "~/utils/helpers";
import { useMessageRepository } from "~/composables/repositories/useMessageRepository";
import { useConversationService } from "~/composables/services/useConversationService";
import { useSuggestionService } from "~/composables/services/useSuggestionService";

export const DEFAULT_ERROR_MESSAGE =
  "Your sales coach is temporarily off the grid—probably closing a deal or wrestling an API. Don't worry. We're rerouting. Try again in a few.";

export function useMessageService() {
  // Get the chat store
  const chatStore = useChatStore();

  // Get utilities and services
  const { getClientSideChatCompletion } = useOpenAIClient();
  const { clearSuggestions, generateSuggestions } = useSuggestionService();
  const { saveAssistantResponseToSupabase, saveUserPromptToSupabase } = useMessageRepository();
  const { getThrottlingResponse } = useSystemInteractionControls();
  const { createNewConversation } = useConversationService();

  /**
   * Add a user message to the current conversation
   */
  async function addUserMessage(content: string): Promise<Message> {
    // Create a new conversation if none is selected
    if (!chatStore.selectedConversationId) {
      await createNewConversation();
    }

    if (!chatStore.selectedConversation || !chatStore.selectedConversationId) {
      console.error("No conversation selected to add message");
      throw new Error("No conversation selected");
    }

    let messageId: string;

    try {
      // Save user message to Supabase
      const savedId = await saveUserPromptToSupabase(
        chatStore.selectedConversationId,
        content
      );
      
      messageId = savedId;
    } catch (error) {
      console.error("Error saving user message to Supabase:", error);
      throw error;
    }

    // Create a new message with the ID from Supabase
    const newMessage: Message = {
      id: messageId,
      content,
      sender: "user",
      timestamp: new Date(),
    };

    // Add the message to the conversation
    chatStore.selectedConversation.messages.push(newMessage);

    return newMessage;
  }

  /**
   * Add an assistant message to the current conversation
   */
  async function addAssistantMessage(content: string, htmlContent: string, throttleMessage: boolean = false): Promise<Message> {
    if (!chatStore.selectedConversation || !chatStore.selectedConversationId) {
      console.error("No conversation selected to add message");
      throw new Error("No conversation selected");
    }

    let messageId: string;

    try {
      // For assistant messages, we need the previous user message ID
      const userMessages = chatStore.selectedConversation.messages.filter((m: any) => m.sender === "user");
      const lastUserMessageId = userMessages.length > 0 ? userMessages[userMessages.length - 1].id : null;

      if (!lastUserMessageId) {
        console.error("Attempted to add assistant message without preceding user message");
        throw new Error("No preceding user message found");
      }

      // We know lastUserMessageId is not null at this point
      const savedId = await saveAssistantResponseToSupabase(
        chatStore.selectedConversationId,
        content,
        lastUserMessageId
      );

      messageId = savedId;
    } catch (error) {
      console.error("Error saving assistant message to Supabase:", error);
      throw error;
    }

    // Create a new message with the ID from Supabase
    const newMessage: Message = {
      id: messageId,
      content,
      sender: "assistant",
      timestamp: new Date(),
      htmlContent,
      isThrottleMessage: throttleMessage,
    };

    // Add the message to the conversation
    chatStore.selectedConversation.messages.push(newMessage);

    return newMessage;
  }

  function AddSystemMessage(messageType: "loading" | "error"): Message {
    if (!chatStore.selectedConversation) {
      console.error("No conversation selected to add message");
      throw new Error("No conversation selected");
    }
    const generatedId = crypto.randomUUID();
    const newMessage: Message = {
      id: generatedId,
      content: messageType === "loading" ? "" : DEFAULT_ERROR_MESSAGE,
      sender: "system",
      status: messageType === "loading" ? "loading" : "sent",
      timestamp: new Date()
    };
    chatStore.selectedConversation.messages.push(newMessage);
    return newMessage;
  }

  /**
   * Remove a message from the current conversation
   */
  function removeLoadingMessage(): void {
    const conversation = chatStore.selectedConversation;
    if (!conversation) return;

    // Find index of the message to remove
    const messageIndex = conversation.messages.findIndex((m: Message) => m.status === "loading");
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
    chatStore.anyMessagesSentForCurrentSession = true;

    // If no conversation exists or is selected, create a new one
    if (!conversation) {
      conversation = await createNewConversation();
      if (!conversation) {
        console.error("Failed to create or find a conversation.");
        return false;
      }
    }

    clearSuggestions();
    chatStore.aiResponsePending = true;

    // Add user message
    await addUserMessage(content);

    // Add loading message
    AddSystemMessage("loading");

    try {
      // Prepare messages for the API (only user and assistant roles)
      const messagesForApi: ChatCompletionMessageParam[] = organizeMessagesForApi(conversation.messages);

      // Call the client-side OpenAI utility function
      const responseMessage: ChatCompletionMessage | null = await getClientSideChatCompletion(messagesForApi);

      // Remove loading message regardless of success or failure
      removeLoadingMessage();

      if (responseMessage && responseMessage.content) {
        const htmlContent = await parseMarkdown(responseMessage.content);

        // Add the actual AI response with parsed HTML
        await addAssistantMessage(responseMessage.content, htmlContent);

        if (chatStore.throttleSelectedConversation) {
          // Trigger conversation throttling and get the response
          const throttlingResponse = await getThrottlingResponse();
          if (throttlingResponse && throttlingResponse.content) {
            const throttleHtmlContent = await parseMarkdown(throttlingResponse.content);
            // Add the throttling response message as if it came from the assistant
            await addAssistantMessage(
              throttlingResponse.content,
              throttleHtmlContent,
              true
            );
          }
        } else {
          // For non-throttled conversations, generate suggestions as normal
          await generateSuggestions();
        }
      } else {
        // Add an error message if the API call failed or returned no content
        AddSystemMessage("error");
        console.error("Failed to get response from getClientSideChatCompletion");
      }
    } catch (error) {
      console.error("Error during sendMessage:", error);
      // Remove loading message in case of an exception
      removeLoadingMessage();
      // Add an error message
      AddSystemMessage("error");
    } finally {
      chatStore.aiResponsePending = false;
    }

    return true;
  }

  return {
    sendMessage,
  };
}
