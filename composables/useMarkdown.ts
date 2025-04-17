import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

/**
 * Composable for parsing Markdown content safely.
 */
export function useMarkdown() {
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
    parse,
  };
}
