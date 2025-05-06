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

  return {
    organizeMessagesForApi,
    validateImageUrl,
  };
}
