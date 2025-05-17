import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export function useHelpers() {
  function organizeMessagesForApi(messages: Message[]) {
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
  async function validateImageUrl(url: string): Promise<boolean> {
    if (!url) return false;

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
  const parse = async (markdownString: string | null | undefined): Promise<string> => {
    if (!markdownString) {
      return "";
    }
    try {
      const rawHtml = await marked.parse(markdownString);
      // Sanitize the HTML to prevent XSS attacks
      const cleanHtml = DOMPurify.sanitize(rawHtml);
      return cleanHtml;
    } catch (error) {
      console.error("Error parsing Markdown:", error);
      // Return the original string as fallback in case of error
      return markdownString;
    }
  };

  return {
    organizeMessagesForApi,
    validateImageUrl,
    parse,
  };
}
