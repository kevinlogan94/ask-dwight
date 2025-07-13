import type { Message, AssistantMessageCreateDto } from "~/models/chat";
import { useOpenAIClient } from "~/composables/useOpenAIClient";
import { parseMarkdown } from "~/utils/helpers";
import { useMessageRepository } from "~/composables/repositories/chat/useMessageRepository";
import { useConversationService } from "~/composables/services/useConversationService";
import { useSuggestionService } from "~/composables/services/useSuggestionService";
import { useSystemInteractionControls } from "~/composables/useSystemInteractionControls";
import type { ResponseInput, Tool } from "openai/resources/responses/responses.mjs";

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
  const { createNewConversation } = useConversationService();

  // Watch for chat status changes to manage loading indicators
  watch(
    () => chatStore.chatStatus,
    (newStatus, oldStatus) => {
      if (newStatus === "submitted") {
        AddSystemMessage("loading");
        // @ts-ignore
      } else if (oldStatus === "submitted" && newStatus !== "submitted") {
        removeLoadingMessage();
      }
    },
  );

  /**
   * Add a user message to the current conversation
   */
  async function addUserMessage(content: string): Promise<Message> {
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
  async function _handleStreamingChat(content: string | ResponseInput, responseId?: string): Promise<boolean> {
    const conversation = chatStore.selectedConversation;
    if (!conversation) return false;

  // Create a placeholder message to avoid a race condition
  const streamingMessage: Message = {
    id: crypto.randomUUID(),
    content: "",
    htmlContent: "",
    role: "assistant",
    timestamp: new Date(),
    status: "streaming",
    isThrottleMessage: chatStore.throttleSelectedConversation,
  };
  conversation.messages.push(streamingMessage);

    let tools: Array<Tool> | undefined;

    if (conversation.vector_store_id) {
      tools = [{
        type: "file_search",
        vector_store_ids: [conversation.vector_store_id]
      }];
    }

    const response = await getResponseAPIStreamingResponse(
      {
        prompt: content,
        responseId,
        tools,
      },
      manageStreamingAssistantMessage,
    );

    if (response) {
      const finalContent = response.response.output[response.response.output.length - 1]?.content[0]?.text ?? "";
      const newResponseId = response.response.id;
      await _finalizeStreamedMessage(finalContent, newResponseId);

      if (chatStore.throttleSelectedConversation) {
        const throttlingResponseEvent = await getThrottlingResponseStreaming(
          newResponseId,
          manageStreamingAssistantMessage,
        );

        if (throttlingResponseEvent) {
          const finalThrottleContent = throttlingResponseEvent.response.output[0]?.content[0]?.text ?? "";
          await _finalizeStreamedMessage(finalThrottleContent, newResponseId);
        }
      } else {
        await generateSuggestions();
      }

      return true;
    }
    return false;
  }

  /**
   * Finalizes a streamed message by saving it to the database and updating its local state.
   */
  async function _finalizeStreamedMessage(finalContent: string, responseId: string): Promise<void> {
    const conversation = chatStore.selectedConversation;
    if (!conversation) return;

    const streamingMessage = conversation.messages.find((m) => m.status === "streaming");
    if (!streamingMessage) {
      console.error("Could not find a streaming message to finalize.");
      return;
    }

    // Assign the OpenAI response ID to the message
    streamingMessage.responseId = responseId;

    try {
      const userMessages = conversation.messages.filter((m: any) => m.role === "user");
      const lastUserMessageId = userMessages.length > 0 ? userMessages[userMessages.length - 1]!.id : null;

      if (!lastUserMessageId) {
        throw new Error("No preceding user message found for finalizing assistant response.");
      }

      const dto: AssistantMessageCreateDto = {
        conversationId: conversation.id,
        content: finalContent,
        promptId: lastUserMessageId,
        responseId,
      };

      await saveAssistantResponseToSupabase(streamingMessage.id, dto);

      streamingMessage.status = "sent";
    } catch (error) {
      console.error("Error finalizing streamed message:", error);
      streamingMessage.status = "error";
    }
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
   * Manages the UI updates for a streaming assistant message.
   * This function is intended to be used as a callback for each text delta.
   */
  async function manageStreamingAssistantMessage(delta: string): Promise<void> {
    const conversation = chatStore.selectedConversation;
    if (!conversation) return;

    let streamingMessage = conversation.messages.find((m) => m.status === "streaming");

    if (streamingMessage) {
      streamingMessage.content += delta;
      streamingMessage.htmlContent = await parseMarkdown(streamingMessage.content);
    }
  }

  /**
   * Sends a message and gets an AI response.
   * @param content the text of the message to send
   * @returns a Promise that resolves when the AI response is received
   *          The Promise resolves to void, but the response is saved to the conversation
   *          and the conversation is updated in the store.
   */
    async function sendMessage(content: string, vectorStoreId: string | null = null): Promise<void> {
    chatStore.anyMessagesSentForCurrentSession = true;
    let conversation = chatStore.selectedConversation;

    // If no conversation exists or is selected, create a new one
    if (!conversation) {
      conversation = await createNewConversation(vectorStoreId);
      if (!conversation) {
        console.error("Failed to create or find a conversation.");
        AddSystemMessage("error");
        chatStore.chatStatus = "error";
        return;
      }
    }

    chatStore.clearSources();
    clearSuggestions();
    await addUserMessage(content);
    chatStore.chatStatus = "submitted";

    const assistantMessages = conversation.messages.filter((m) => m.role === "assistant" && m.responseId);
    const lastResponseId =
      assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1]!.responseId : undefined;

    let contentToSend: string | ResponseInput = content;

    // Organize the full conversation if we have yet to setup the responses api for this conversation
    if (!lastResponseId && conversation.messages.length > 1) {
      contentToSend = organizeMessagesForApi(conversation.messages);
    }

    try {
      const success = await _handleStreamingChat(contentToSend, lastResponseId);

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
  };
}
