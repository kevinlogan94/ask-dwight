import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import type { Conversation, Message } from "~/models/chat";

// Session utilities
const SESSION_ID_KEY = "supabase-session-id";

/**
 * Get or create a session ID for tracking user sessions
 * @returns The session ID from localStorage or a newly created one
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
 * Organizes messages for sending to API (filters and formats)
 * @param messages The array of messages to organize
 * @returns The organized messages for API
 */
export function organizeMessagesForApi(messages: Message[]) {
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
 * @param url The image URL to validate
 * @returns Promise<boolean> true if valid, false if not
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
 * @returns Sanitized HTML string.
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
 * Examples:
 * - formatTimeSaved(20) -> "20 min"
 * - formatTimeSaved(62) -> "1 hr 2 min"
 * - formatTimeSaved(60) -> "1 hr"
 * - formatTimeSaved(62, true) -> "1 hour 2 minutes"
 * @param minutes The number of minutes to format.
 * @param longForm Whether to use long-form time units (e.g., "hours" instead of "hr").
 * @returns Formatted time string.
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
 * Checks if a conversation has exceeded the throttle limit based on the number of user messages.
 * @param messages The array of messages to check.
 * @returns True if the conversation has exceeded the throttle limit, false otherwise.
 */
export const throttlePerMessages = (messages: Message[]) => {
  const userMessages = messages.filter((x) => x.role === "user") ?? [];
  return userMessages.length >= 10;
};

/**
 * Deletes all Supabase cookies from the browser.
 * This is used to handle critical authentication errors that require a full logout.
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
