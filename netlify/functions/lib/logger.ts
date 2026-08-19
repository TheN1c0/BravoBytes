import crypto from 'node:crypto';
import { StructuredLog } from './types';

/**
 * Generates a unique request identifier (UUID v4)
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Hashes an identifier (IP address or session ID) to anonymize it for privacy.
 */
export function hashIdentifier(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(value).digest('hex').substring(0, 12);
}

/**
 * Sanitizes and truncates user input to max 100 characters for observability preview.
 * Redacts common patterns like emails, telephone numbers, and auth tokens.
 */
export function sanitizeInputPreview(input: string, maxLen = 100): string {
  if (!input) return '';
  // Redact potential emails
  let sanitized = input.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
  // Redact potential phone numbers
  sanitized = sanitized.replace(/\+?[0-9]{8,15}/g, '[REDACTED_PHONE]');
  // Redact potential bearer tokens / API keys
  sanitized = sanitized.replace(/(bearer\s+[a-zA-Z0-9_\-\.]+)|(sk-[a-zA-Z0-9]+)/gi, '[REDACTED_SECRET]');
  // Clean whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  if (sanitized.length <= maxLen) {
    return sanitized;
  }
  return sanitized.substring(0, maxLen) + '...';
}

/**
 * Emits a structured JSON log entry to stdout without leaking secrets.
 */
export function logStructured(log: StructuredLog): void {
  // Enforce allowlist: ensure no raw secrets or unapproved fields are printed
  const safeLog: StructuredLog = {
    timestamp: log.timestamp || new Date().toISOString(),
    requestId: log.requestId,
    endpoint: log.endpoint,
    method: log.method,
    status: log.status,
    durationMs: log.durationMs,
    clientIpHash: log.clientIpHash,
    sessionIdHash: log.sessionIdHash,
    rateLimitResult: log.rateLimitResult,
    botVerificationResult: log.botVerificationResult,
    inputLength: log.inputLength,
    outputLength: log.outputLength,
    category: log.category,
    inputPreview: log.inputPreview,
    model: log.model,
    provider: log.provider || 'OpenRouter',
    promptTokens: log.promptTokens,
    completionTokens: log.completionTokens,
    totalTokens: log.totalTokens,
    errorType: log.errorType,
  };

  // Structured single-line JSON output for serverless logs
  console.log(JSON.stringify(safeLog));
}
