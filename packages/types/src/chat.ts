export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  tokensUsed: number | null;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string | null;
  context: Record<string, unknown> | null;
  tokensUsed: number;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
  lastMessage?: ChatMessage;
}

export interface SendMessageRequest {
  sessionId: string;
  content: string;
}

export interface StreamChatResponse {
  sessionId: string;
  messageId: string;
  role: 'ASSISTANT';
}
