import { getOrCreateSessionId, throttlePerMessages } from "~/utils/helpers";
import { organizePromptInfo } from "~/utils/gamification";
import type { Conversation, Message } from "~/models/chat";
import { parseMarkdown } from "~/utils/helpers";

export function useConversationRepository() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  const conversationsQuery = supabase.from("conversations");
  const userPromptsQuery = supabase.from("user_prompts");
  const dwightResponsesQuery = supabase.from("dwight_responses");
  const userPromptSuggestionsQuery = supabase.from("user_prompt_suggestions");

  userPromptsQuery.headers = {
    "supabase-session-id": getOrCreateSessionId(),
  };
  dwightResponsesQuery.headers = {
    "supabase-session-id": getOrCreateSessionId(),
  };
  userPromptSuggestionsQuery.headers = {
    "supabase-session-id": getOrCreateSessionId(),
  };
  conversationsQuery.headers = {
    "supabase-session-id": getOrCreateSessionId(),
  };

  // to be removed after August 2025
  async function syncConversationsToSupabase() {
    const ConversationsRaw = localStorage.getItem("chat-conversations");
    if (!ConversationsRaw) {
      return;
    }

    const currentUserId = user.value?.id;

    try {
      const Conversations: Conversation[] = JSON.parse(ConversationsRaw);
      if (!Conversations || Conversations.length === 0) {
        console.log("syncConversationsToSupabase: Local chat conversations empty or invalid format.");
        localStorage.removeItem("chat-conversations"); // Clean up if empty/invalid
        return;
      }

      const sessionId = getOrCreateSessionId();
      console.log(
        `syncConversationsToSupabase: Starting sync for session ID: ${sessionId}, User ID: ${currentUserId || "N/A"}`,
      );

      for (const conversation of Conversations) {
        const { error: convError } = await conversationsQuery.insert({
          id: conversation.id,
          created_at: conversation.createdAt,
          user_id: currentUserId, // This can be null if user is not logged in
          session_id: sessionId,
          title: conversation.title,
        } as any);

        if (convError) {
          console.error(
            "syncConversationsToSupabase: Error inserting conversation:",
            convError.message,
            "Conversation ID:",
            conversation.id,
          );
          continue;
        }

        let lastUserPromptIdInConversation: string | null = null;

        for (const message of conversation.messages) {
          if (message.sender === "user") {
            const { category, timeSaved } = organizePromptInfo(message.content);
            const { error: promptError } = await userPromptsQuery.insert({
              id: message.id,
              conversation_id: conversation.id,
              message: message.content,
              category: category.toString(),
              time_saved: timeSaved,
              created_at: message.timestamp,
            } as any);

            if (promptError) {
              console.error(
                "syncConversationsToSupabase: Error inserting user prompt:",
                promptError.message,
                "Prompt ID:",
                message.id,
              );
              continue;
            }
            lastUserPromptIdInConversation = message.id;
          } else if (message.sender === "assistant") {
            if (lastUserPromptIdInConversation) {
              const { error: responseError } = await dwightResponsesQuery.insert({
                id: message.id,
                conversation_id: conversation.id,
                message: message.content,
                created_at: message.timestamp,
                prompt_id: lastUserPromptIdInConversation,
              } as any);
              if (responseError) {
                console.error(
                  "syncConversationsToSupabase: Error inserting dwight response:",
                  responseError.message,
                  "Response ID:",
                  message.id,
                );
                continue;
              }

              if (message.suggestions && message.suggestions.length > 0) {
                const suggestionsToInsert = message.suggestions.map((suggestionText) => ({
                  dwight_response_id: message.id,
                  suggestion_text: suggestionText,
                }));
                const { error: suggestionsError } = await userPromptSuggestionsQuery.insert(suggestionsToInsert as any);
                if (suggestionsError) {
                  console.error(
                    "syncConversationsToSupabase: Error inserting suggestions for response ID:",
                    message.id,
                    suggestionsError.message,
                  );
                }
              }
            } else {
              console.warn(
                "syncConversationsToSupabase: Assistant message without a preceding user prompt. Skipping response ID:",
                message.id,
                "Conversation ID:",
                conversation.id,
              );
            }
          } else if (message.sender === "system") {
            // Ignored
          }
        }
      }

      localStorage.removeItem("chat-conversations");
    } catch (error: any) {
      console.error("syncConversationsToSupabase: Failed to parse or process local chat conversations:", error.message);
    }
  }

  /**
   * Associates any conversations tied to the current session ID with the user account
   * Call this function when a user logs in or signs up
   */
  async function associateConversationsWithUser(): Promise<void> {
    // Only proceed if we have a logged-in user
    if (!user.value?.id) {
      console.warn("associateConversationsWithUser: No user is logged in, skipping.");
      return;
    }

    const sessionId = getOrCreateSessionId();

    try {
      // Update all conversations in Supabase that match the current session ID
      const { error } = await conversationsQuery
        //@ts-ignore
        .update({ user_id: user.value?.id }) //typescript doesn't like this.
        .eq("session_id", sessionId)
        .is("user_id", null); // Only update records where user_id is null

      if (error) {
        console.error("associateConversationsWithUser: Error updating conversations:", error.message);
        throw error;
      }
    } catch (err: any) {
      console.error("associateConversationsWithUser: Exception during update:", err.message);
      throw err;
    }
  }

  /**
   * Creates a new conversation directly in Supabase
   * @param title The title of the conversation
   * @returns The ID of the newly created conversation
   */
  async function createConversationInSupabase(title: string): Promise<string> {
    try {
      const sessionId = getOrCreateSessionId();
      const currentUserId = user.value?.id;

      // Create the conversation in Supabase
      const { data: newConversation, error } = await conversationsQuery
        //@ts-ignore
        .insert({
          title,
          user_id: currentUserId || null,
          session_id: sessionId,
        })
        .select("id")
        .single();

      if (error) {
        console.error("createConversationInSupabase: Error creating conversation:", error.message);
        throw error;
      }

      if (!newConversation) {
        throw new Error("createConversationInSupabase: No conversation data returned");
      }

      return (newConversation as { id: string }).id;
    } catch (err: any) {
      console.error("createConversationInSupabase: Exception during creation:", err.message);
      throw err;
    }
  }

  // Placeholder for the new function
  async function fetchConversationsFromSupabase(): Promise<Conversation[]> {
    type RawCloudConversation = {
      id: string;
      title: string;
      created_at: string; // Timestamp for the conversation itself
      user_prompts: { id: string; message: string; created_at: string; time_saved: string }[];
      dwight_responses: {
        id: string;
        message: string;
        created_at: string;
        user_prompt_suggestions: { suggestion_text: string }[];
      }[];
    };

    const sessionId = getOrCreateSessionId();
    if (user.value?.id) {
      console.log("fetchConversationsFromSupabase: Using user ID:", user.value.id);
    } else {
      console.log("fetchConversationsFromSupabase: Using session ID:", sessionId);
    }

    try {
      // Set headers directly on the query builder
      const { data: fetchedCloudConversations, error } = await conversationsQuery
        .select(
          `
          id,
          title,
          created_at,
          user_prompts (
            id,
            message,
            created_at,
            time_saved
          ),
          dwight_responses (
            id,
            message,
            created_at,
            user_prompt_suggestions (
              suggestion_text
            )
          )
        `,
        )
        .order("created_at", { ascending: true });

      if (error) {
        console.error("fetchConversationsFromSupabase: Error fetching conversations:", error.message);
        throw error;
      }

      if (!fetchedCloudConversations) {
        return [];
      }

      // Cast the fetched data to our expected raw type for type safety during transformation
      const rawConversations = fetchedCloudConversations as RawCloudConversation[];

      const organizedConversations: Conversation[] = rawConversations.map((rawConv) => {
        const messages: Message[] = [];

        // Process user prompts
        (rawConv.user_prompts || []).forEach((prompt) => {
          messages.push({
            id: prompt.id,
            content: prompt.message,
            sender: "user",
            timestamp: new Date(prompt.created_at),
            status: "sent",
          });
        });

        // Process Dwight responses
        (rawConv.dwight_responses || [])
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .forEach((response, index) => {
            const isLastResponse = index === rawConv.dwight_responses?.length - 1;

          messages.push({
            id: response.id,
            content: response.message,
            sender: "assistant",
            timestamp: new Date(response.created_at),
            status: "sent",
            suggestions: isLastResponse ? response.user_prompt_suggestions?.map((s) => s.suggestion_text) || [] : [],
            isThrottleMessage: isLastResponse && throttlePerMessages(messages),
          });
        });

        // Sort all messages by timestamp chronologically
        messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const conversation: Conversation = {
          id: rawConv.id,
          title: rawConv.title,
          createdAt: new Date(rawConv.created_at),
          messages: messages,
        };

        if (conversation.messages.length > 0) {
          //define throttling
          conversation.messages[conversation.messages.length - 1].isThrottleMessage =
            throttleConversation(conversation);
        }

        return conversation;
      });

      // apply markdown parsing
      await Promise.all(
        organizedConversations.map(async (conversation) => {
          conversation.messages.forEach(async (message) => {
            if (message.sender === "assistant") {
              message.htmlContent = await parseMarkdown(message.content);
            }
          });
        }),
      );

      return organizedConversations;
    } catch (err: any) {
      console.error("fetchConversationsFromSupabase: Exception during fetch or data transformation:", err.message);
      throw err;
    }
  }

  return {
    syncConversationsToSupabase,
    fetchConversationsFromSupabase,
    associateConversationsWithUser,
    createConversationInSupabase,
  };
}
