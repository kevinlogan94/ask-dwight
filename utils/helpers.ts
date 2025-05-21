import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import type { Message } from "~/models/chat";

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
  return sessionId;
};

/**
 * Organizes messages for sending to API (filters and formats)
 */
export function organizeMessagesForApi(messages: Message[]) {
  return messages
    .filter((msg) => msg.status !== "loading" && msg.sender !== "system")
    .map((msg) => ({
      // Role directly maps from sender ('user' or 'assistant')
      role: msg.sender as "user" | "assistant",
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
