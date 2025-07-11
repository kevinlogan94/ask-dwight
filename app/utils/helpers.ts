import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import type { Conversation, Message } from "~/models/chat";
import type { FileObject } from "openai/resources/files.mjs";
import type {
  ResponseInputItem,
  ResponseInput,
} from "openai/resources/responses/responses.mjs";

// Session utilities
const SESSION_ID_KEY = "supabase-session-id";

/**
 * Get or create a session ID for tracking user sessions.
 * This ID is stored in localStorage to persist across sessions.
 * @returns The session ID.
 */
export const getOrCreateSessionId = (): string => {
  if (process.server) return ""; // Don't use localStorage on server

  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId.trim();
};

/**
 * Organizes the input for the OpenAI API when file uploads are involved.
 * If files are present, it constructs a multi-part message containing both the text and file references.
 * @param content The initial content, which can be a string or a `ResponseInput` object.
 * @param uploadedFiles An array of `FileObject` from OpenAI representing the uploaded files.
 * @returns The modified content, ready for the API, which will be a `ResponseInput` if files were added.
 */
export function organizeResponsesInputForFileUpload(
  content: string | ResponseInput,
  uploadedFiles: FileObject[],
): string | ResponseInput {
  let contentToSend: string | ResponseInput = content;

  // If there are uploaded files, modify the last message to include them.
  if (uploadedFiles.length > 0) {
    const textContent = typeof content === "string" ? content : ""; // Fallback for safety

    const multiPartContent = [
      ...uploadedFiles.map((file) => ({
        type: "input_file" as const,
        file_id: file.id,
      })),
      { type: "input_text" as const, text: textContent },
    ];

    if (Array.isArray(contentToSend)) {
      // If this is a setup for the responses
      const lastMessage = contentToSend[contentToSend.length - 1];
      // Type guard to ensure we're modifying a user message
      if (lastMessage && 'role' in lastMessage && lastMessage.role === "user") {
        lastMessage.content = multiPartContent;
      }
    } else if (typeof contentToSend === 'string') {
      // If we are just trying to pass an input, create a new message
      contentToSend = [
        {
          role: "user",
          content: multiPartContent,
        },
      ];
    }
  }

  return contentToSend;
}

/**
 * Organizes an array of chat messages for the API.
 * It filters out system messages and messages that are still loading.
 * @param messages The array of `Message` objects from the conversation.
 * @returns A filtered and mapped array of messages formatted for the API.
 */
export function organizeMessagesForApi(messages: Message[]): ResponseInputItem[] {
  return messages
    .filter((msg) => msg.status !== "loading" && msg.role !== "system")
    .map((msg) => ({
      // Role directly maps from role ('user' or 'assistant')
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
}

/**
 * Validates if an image URL is accessible (loads successfully).
 * @param url The image URL to validate.
 * @returns A promise that resolves to true if the image is valid, false otherwise.
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  if (!url) return false;

  // Skip validation on server
  if (process.server) return true;

  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Parses a Markdown string into HTML and sanitizes it.
 * @param markdownString The Markdown string to parse.
 * @returns A sanitized HTML string.
 */
export const parseMarkdown = async (markdownString: string | null | undefined): Promise<string> => {
  if (!markdownString) {
    return "";
  }
  try {
    const rawHtml = await marked.parse(markdownString);
    // Sanitize the HTML to prevent XSS attacks
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    return cleanHtml;
  } catch (error) {
    console.error("Error parsing markdown:", error);
    return markdownString || "";
  }
};

/**
 * Formats a number of minutes into a human-readable time string.
 * @example
 * formatTimeSaved(20) // "20 min"
 * formatTimeSaved(62) // "1 hr 2 min"
 * @param minutes The number of minutes to format.
 * @param longForm Whether to use long-form time units (e.g., "hours" instead of "hr").
 * @returns The formatted time string.
 */
export const formatTimeSaved = (minutes: number, longForm: boolean = false): string => {
  const hourUnit = longForm ? (Math.floor(minutes / 60) === 1 ? "hour" : "hours") : "hr";
  const minuteUnit = longForm ? (minutes % 60 === 1 ? "minute" : "minutes") : "min";

  if (minutes < 60) {
    return `${minutes} ${minuteUnit}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ${hourUnit}`;
  }

  return `${hours} ${hourUnit} ${remainingMinutes} ${minuteUnit}`;
};

/**
 * Checks if a conversation has exceeded the throttle limit based on the number of user messages.
 * @param conversation The conversation to check.
 * @returns True if the conversation has exceeded the throttle limit, false otherwise.
 */
// todo add subscription check
export const throttleConversation = (conversation: Conversation) => {
  return throttlePerMessages(conversation.messages);
};

/**
 * Checks if a conversation has exceeded the throttle limit based on the number of user and assistant messages.
 * @param messages The array of messages to check.
 * @returns True if the conversation has exceeded the throttle limit, false otherwise.
 */
export const throttlePerMessages = (messages: Message[]) => {
  const userMessages = messages.filter((x) => x.role === "user") ?? [];
  const assistantMessages = messages.filter((x) => x.role === "assistant") ?? [];
  return userMessages.length >= 10 && assistantMessages.length >= 10;
};

/**
 * Deletes all Supabase-related cookies from the browser.
 * This is a utility function to force a full logout and clear session state in case of critical auth errors.
 */
export const deleteSupabaseCookies = () => {
  document.cookie.split(";").forEach((cookie) => {
    if (cookie.trim().startsWith("sb-")) {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/");
    }
  });
};
