export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface ChatApiRequest {
  message: string;
  turnstileToken?: string;
  sessionId?: string;
}

export interface ChatApiResponse {
  answer?: string;
  remainingQuota?: number;
  error?: string;
  message?: string;
}
