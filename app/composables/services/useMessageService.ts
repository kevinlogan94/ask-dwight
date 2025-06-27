import type { ConversationUpdateDto, Message } from "~/models/chat";
import { useOpenAIClient } from "~/composables/useOpenAIClient";
import { parseMarkdown } from "~/utils/helpers";
import { useMessageRepository } from "~/composables/repositories/useMessageRepository";
import { useConversationService } from "~/composables/services/useConversationService";
import { useSuggestionService } from "~/composables/services/useSuggestionService";
import { useSystemInteractionControls } from "~/composables/useSystemInteractionControls";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export const DEFAULT_ERROR_MESSAGE =
  "Your sales coach is temporarily off the grid—probably closing a deal or wrestling an API. Don't worry. We're rerouting. Try again in a few.";

export function useMessageService() {
  // Get the chat store
  const chatStore = useChatStore();

  // Get utilities and services
  const { getResponseAPIStreamingResponse } = useOpenAIClient();
  const { clearSuggestions, generateSuggestions } = useSuggestionService();
  const { saveAssistantResponseToSupabase, saveUserPromptToSupabase } = useMessageRepository();
  const { getThrottlingResponseStreaming } = useSystemInteractionControls();
  const { createNewConversation, updateConversation } = useConversationService();


  // Watch for chat status changes to manage loading indicators
  watch(
    () => chatStore.chatStatus,
    (newStatus, oldStatus) => {
      if (newStatus === "submitted") {
        AddSystemMessage("loading");
      } else if (oldStatus === "submitted" && newStatus !== "submitted") {
        removeLoadingMessage();
      }
    },
  );

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
      const savedId = await saveUserPromptToSupabase(chatStore.selectedConversationId, content);

      messageId = savedId;
    } catch (error) {
      console.error("Error saving user message to Supabase:", error);
      throw error;
    }

    // Create a new message with the ID from Supabase
    const newMessage: Message = {
      id: messageId,
      content,
      role: "user",
      timestamp: new Date(),
    };

    // Add the message to the conversation
    chatStore.selectedConversation.messages.push(newMessage);

    return newMessage;
  }

  /**
   * Add an assistant message to the current conversation
   */
  async function addAssistantMessage(
    content: string,
    htmlContent: string,
    throttleMessage: boolean = false,
  ): Promise<Message> {
    if (!chatStore.selectedConversation || !chatStore.selectedConversationId) {
      console.error("No conversation selected to add message");
      throw new Error("No conversation selected");
    }

    let messageId: string;

    try {
      // For assistant messages, we need the previous user message ID
      const userMessages = chatStore.selectedConversation.messages.filter((m: any) => m.role === "user");
      const lastUserMessageId = userMessages.length > 0 ? userMessages[userMessages.length - 1]!.id : null;

      if (!lastUserMessageId) {
        console.error("Attempted to add assistant message without preceding user message");
        throw new Error("No preceding user message found");
      }

      // We know lastUserMessageId is not null at this point
      const savedId = await saveAssistantResponseToSupabase(
        chatStore.selectedConversationId,
        content,
        lastUserMessageId,
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
      role: "assistant",
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
      role: "system",
      status: messageType === "loading" ? "loading" : "sent",
      timestamp: new Date(),
    };
    chatStore.selectedConversation.messages.push(newMessage);
    return newMessage;
  }

  /**
   * Handles the logic for a streaming chat response.
   */
  async function _handleStreamingChat(content: string | ChatCompletionMessageParam[]): Promise<boolean> {
    const response = await getResponseAPIStreamingResponse(content);

    console.log("response", response);

    if (response) {
      if (chatStore.throttleSelectedConversation) {
        const throttlingResponse = await getThrottlingResponseStreaming();
  
        if (throttlingResponse) {
          const throttleHtmlContent = await parseMarkdown(throttlingResponse);
          await addAssistantMessage(throttlingResponse, throttleHtmlContent, true);
        }
      } else {
        await generateSuggestions();
      }

      //handle setting the response id if needed
      if(!chatStore.selectedConversation?.responseId) {
        const conversationUpdate: ConversationUpdateDto = { responseId: response.id };
        await updateConversation(chatStore.selectedConversationId as string, conversationUpdate);
      }

      return true;
    }
    return false;
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

  function manageStreamingAssistantMessage() {
    //todo
  }

  // Sends a message and gets an AI response.
  // @param content the text of the message to send
  // @returns a Promise that resolves when the AI response is received
  //          The Promise resolves to void, but the response is saved to the conversation
  //          and the conversation is updated in the store.
  async function sendMessage(content: string): Promise<void> {
    chatStore.anyMessagesSentForCurrentSession = true;
    let conversation = chatStore.selectedConversation;

    // If no conversation exists or is selected, create a new one
    if (!conversation) {
      conversation = await createNewConversation();
      if (!conversation) {
        console.error("Failed to create or find a conversation.");
        AddSystemMessage("error"); 
        chatStore.chatStatus = "error";
        return;
      }
    }

    clearSuggestions();
    await addUserMessage(content);
    chatStore.chatStatus = "submitted";

    //we need to account for old conversations that were being used by the old api that we don't have a stored conversation thread.
    let contentToSend: string | ChatCompletionMessageParam[] = content;
    if (!conversation.responseId && conversation.messages.length > 0) {
      contentToSend = organizeMessagesForApi(conversation.messages);
    }

    try {
      const success = await _handleStreamingChat(contentToSend);

      if (success) {
        chatStore.chatStatus = "ready";
      } else {
        AddSystemMessage("error");
        chatStore.chatStatus = "error";
        console.error("Failed to get a valid response from the API.");
      }
    } catch (error) {
      console.error("Error during sendMessage:", error);
      AddSystemMessage("error");
      chatStore.chatStatus = "error";
    }
  }

  return {
    sendMessage,
    manageStreamingAssistantMessage
  };
}
