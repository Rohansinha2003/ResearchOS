// src/components/types.ts
export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number | string | Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}
