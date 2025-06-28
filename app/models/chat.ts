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
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  responseId?: string;
  updatedAt: Date;
}

export interface MessageAction {
  label: string;
  icon: string;
  onClick: (e: MouseEvent, message: Message) => void;
}

export interface ConversationUpdateDto {
  title?: string;
  responseId?: string;
}

export interface ResponseApiCompletedEvent {
  id: string; // event id
  type: "response.completed";
  response: {
    id: string; // message id
    content: Array<{
      type: "output_text";
      text: string;
    }>;
    role: "assistant";
    status: "completed";
  };
}
