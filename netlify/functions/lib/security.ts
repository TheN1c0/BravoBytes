import { ChatRequest } from './types';

export const MAX_INPUT_LENGTH = 300;
export const MAX_BODY_SIZE_BYTES = 5 * 1024; // 5 KB

export interface ValidationResult {
  valid: boolean;
  statusCode?: number;
  errorCode?: string;
  errorMessage?: string;
  data?: ChatRequest;
  category?: string;
}

/**
 * Categorizes the user's inquiry based on keywords for observability and prompt context.
 */
export function categorizeQuestion(text: string): string {
  const lower = text.toLowerCase();
  
  if (
    lower.includes('ignore previous') ||
    lower.includes('system prompt') ||
    lower.includes('dan mode') ||
    lower.includes('jailbreak') ||
    lower.includes('act as') ||
    lower.includes('olvida tus instrucciones')
  ) {
    return 'injection_attempt';
  }

  if (
    lower.includes('tecnolog') ||
    lower.includes('stack') ||
    lower.includes('lenguaje') ||
    lower.includes('angular') ||
    lower.includes('net') ||
    lower.includes('python') ||
    lower.includes('react') ||
    lower.includes('docker') ||
    lower.includes('linux') ||
    lower.includes('sql')
  ) {
    return 'technologies';
  }

  if (
    lower.includes('proyect') ||
    lower.includes('agenda social') ||
    lower.includes('rrhh') ||
    lower.includes('recursos humanos') ||
    lower.includes('smart english') ||
    lower.includes('app')
  ) {
    return 'projects';
  }

  if (
    lower.includes('contact') ||
    lower.includes('correo') ||
    lower.includes('email') ||
    lower.includes('linkedin') ||
    lower.includes('telefono') ||
    lower.includes('whatsapp') ||
    lower.includes('contrat')
  ) {
    return 'contact';
  }

  if (
    lower.includes('experiencia') ||
    lower.includes('estudio') ||
    lower.includes('perfil') ||
    lower.includes('quien es') ||
    lower.includes('nicolas') ||
    lower.includes('bravobytes') ||
    lower.includes('analista programador')
  ) {
    return 'profile_experience';
  }

  return 'general_portfolio';
}

/**
 * Validates HTTP method, headers, payload size, JSON format, and message constraints.
 */
export function validateRequest(
  httpMethod: string,
  headers: Record<string, string | undefined>,
  rawBody: string | null
): ValidationResult {
  // 1. Method must be POST
  if (httpMethod.toUpperCase() !== 'POST') {
    return {
      valid: false,
      statusCode: 405,
      errorCode: 'METHOD_NOT_ALLOWED',
      errorMessage: 'Only POST method is allowed.',
    };
  }

  // 2. Content-Type must be application/json
  const contentType = headers['content-type'] || headers['Content-Type'] || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return {
      valid: false,
      statusCode: 400,
      errorCode: 'INVALID_CONTENT_TYPE',
      errorMessage: 'Content-Type must be application/json.',
    };
  }

  // 3. Body must exist and not exceed maximum byte limit
  if (!rawBody || rawBody.trim() === '') {
    return {
      valid: false,
      statusCode: 400,
      errorCode: 'EMPTY_BODY',
      errorMessage: 'Request body cannot be empty.',
    };
  }

  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_SIZE_BYTES) {
    return {
      valid: false,
      statusCode: 413,
      errorCode: 'PAYLOAD_TOO_LARGE',
      errorMessage: 'Payload exceeds maximum allowed size (5KB).',
    };
  }

  // 4. Safe JSON parsing
  let parsed: any;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return {
      valid: false,
      statusCode: 400,
      errorCode: 'INVALID_JSON',
      errorMessage: 'Malformed JSON payload.',
    };
  }

  // 5. Message validation
  if (typeof parsed.message !== 'string') {
    return {
      valid: false,
      statusCode: 400,
      errorCode: 'INVALID_MESSAGE_TYPE',
      errorMessage: 'The message field must be a string.',
    };
  }

  const cleanMessage = parsed.message
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '') // remove control characters
    .trim();

  if (cleanMessage.length === 0) {
    return {
      valid: false,
      statusCode: 400,
      errorCode: 'EMPTY_MESSAGE',
      errorMessage: 'Message cannot be empty.',
    };
  }

  if (cleanMessage.length > MAX_INPUT_LENGTH) {
    return {
      valid: false,
      statusCode: 400,
      errorCode: 'MESSAGE_TOO_LONG',
      errorMessage: `Message cannot exceed ${MAX_INPUT_LENGTH} characters.`,
    };
  }

  const category = categorizeQuestion(cleanMessage);

  return {
    valid: true,
    data: {
      message: cleanMessage,
      turnstileToken: typeof parsed.turnstileToken === 'string' ? parsed.turnstileToken : undefined,
      sessionId: typeof parsed.sessionId === 'string' ? parsed.sessionId : undefined,
    },
    category,
  };
}
