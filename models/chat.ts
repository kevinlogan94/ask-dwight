export interface Message {
  id: string;
  content: string;
  htmlContent?: string;
  sender: "user" | "assistant" | "system";
  timestamp: Date;
  status?: "loading" | "sent";
  suggestions?: string[];
  isThrottleMessage?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}
