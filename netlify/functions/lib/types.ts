export interface ChatRequest {
  message: string;
  turnstileToken?: string;
  sessionId?: string;
}

export interface ChatSuccessResponse {
  answer: string;
  remainingQuota?: number;
}

export interface ChatErrorResponse {
  error: string;
  message: string;
}

export interface StructuredLog {
  timestamp: string;
  requestId: string;
  endpoint: string;
  method: string;
  status: number;
  durationMs: number;
  clientIpHash?: string;
  sessionIdHash?: string;
  rateLimitResult?: 'ALLOWED' | 'BLOCKED_RATE_LIMIT' | 'BLOCKED_QUOTA';
  botVerificationResult?: 'PASSED' | 'FAILED' | 'BYPASSED';
  inputLength: number;
  outputLength?: number;
  category?: string;
  inputPreview?: string;
  model?: string;
  provider?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  errorType?: string;
}
