
//todo introduce parts to organize parts of the assistant message
export interface Message {
  id: string;
  content: string;
  htmlContent?: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  status?: "loading" | "sent";
  suggestions?: string[];
  isThrottleMessage?: boolean;
  reaction?: 'thumbs_up' | 'thumbs_down' | null;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export interface MessageAction {
  label: string;
  icon: string;
  onClick: (e: MouseEvent, message: Message) => void;
}

