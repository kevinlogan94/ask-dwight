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

  return {
    organizeMessagesForApi,
  };
}
