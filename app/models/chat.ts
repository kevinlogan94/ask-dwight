import type { ResponseInput, Tool } from "openai/resources/responses/responses.mjs";

//todo introduce parts to organize parts of the assistant message
export interface Message {
  id: string;
  content: string;
  htmlContent?: string;
  role: "user" | "assistant" | "system";
  /** @deprecated use role instead */
  sender?: "user" | "assistant" | "system";
  timestamp: Date;
  status?: "loading" | "sent" | "streaming" | "error";
  suggestions?: string[];
  isThrottleMessage?: boolean;
  reaction?: 'thumbs_up' | 'thumbs_down' | null;
  sources?: Source[];
  responseId?: string; // The unique ID from the OpenAI response
}

export interface Source {
  title: string;
  type: 'web' | 'file';
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  vector_store_id: string | null;
  createdAt: Date;
}

export interface MessageAction {
  label: string;
  icon: string;
  onClick: (e: MouseEvent, message: Message) => void;
}

export interface AssistantMessageCreateDto {
  conversationId: string;
  content: string;
  promptId: string;
  responseId?: string;
}

export interface ResponseRequest {
  prompt: string | ResponseInput;
  responseId?: string;
  tools?: Array<Tool>;
}

export interface ResponseApiCompletedEvent {
  id: string; // event id
  type: "response.completed";
  response: {
    id: string; // message id
    output: Array<{
      content: Array<{
        type: "output_text";
        text: string;
      }>;
    }>;
    role: "assistant";
    status: "completed";
  };
}
