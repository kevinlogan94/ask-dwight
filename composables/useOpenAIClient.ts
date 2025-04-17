import { OpenAI } from "openai";
import type { ChatCompletionMessage, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { DWIGHT_INSTRUCTIONS } from "~/composables/config/dwight-instructions";
import { SUGGESTION_SYSTEM_PROMPT } from "./config/suggestion-prompt-instructions";

// Keep the client instance in the module scope to act like a singleton
let openai: OpenAI | null = null;
let isInitialized = false;

export const useOpenAIClient = () => {
  // Initialize only once
  if (!isInitialized) {
    // Call useRuntimeConfig safely inside the composable
    const config = useRuntimeConfig();
    const apiKey = config.public.chatgptApiKey;

    if (typeof apiKey === "string" && apiKey) {
      try {
        console.log("Initializing OpenAI client (client-side)...");
        openai = new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true, // Required for client-side usage
        });
        isInitialized = true; // Mark as initialized
      } catch (error) {
        console.error("Failed to initialize OpenAI client:", error);
        openai = null; // Ensure it's null if init fails
        isInitialized = true; // Still mark to prevent re-attempts on every call
      }
    } else {
      console.error("OpenAI API key is missing or invalid in runtime config.");
      isInitialized = true; // Mark to prevent re-attempts
    }
  }

  const getClientSideChatCompletion = async (
    messages: ChatCompletionMessageParam[],
    useSuggestionsIntructions: boolean = false,
  ): Promise<ChatCompletionMessage | null> => {
    if (!openai) {
      console.error("OpenAI client is not initialized. Check API key and initialization logs.");
      return null;
    }

    const chatMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: useSuggestionsIntructions ? SUGGESTION_SYSTEM_PROMPT : DWIGHT_INSTRUCTIONS },
      ...messages,
    ];

    try {
      console.log("Sending completion request to OpenAI..."); // Log before sending
      const res = await openai.chat.completions.create({
        model: "gpt-4",
        messages: chatMessages,
        temperature: 0.7,
      });
      console.log("Received response from OpenAI."); // Log after receiving

      if (res.choices?.length > 0 && res.choices[0].message) {
        console.log("Response from OpenAI:", res.choices[0].message.content);
        return res.choices[0].message;
      } else {
        console.error("Invalid response structure from OpenAI:", res);
        return null;
      }
    } catch (error) {
      console.error("Error fetching chat completion from OpenAI:", error);
      return null;
    }
  };

  // Return the function to be used by the caller
  return {
    getClientSideChatCompletion,
  };
};
