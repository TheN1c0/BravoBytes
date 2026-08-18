import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { generateRequestId, hashIdentifier, sanitizeInputPreview, logStructured } from './lib/logger';
import { validateRequest } from './lib/security';
import { checkRateLimitAndQuota } from './lib/rate-limiter';
import { verifyTurnstileToken } from './lib/turnstile';
import { queryOpenRouter } from './lib/openrouter';
import { ChatSuccessResponse, ChatErrorResponse, StructuredLog } from './lib/types';

function getCorsHeaders(requestOrigin?: string): Record<string, string> {
  const allowedOriginConfig = process.env['ALLOWED_ORIGIN'];
  let origin = '*';

  if (allowedOriginConfig) {
    const allowedList = allowedOriginConfig.split(',').map((o) => o.trim());
    if (requestOrigin && allowedList.includes(requestOrigin)) {
      origin = requestOrigin;
    } else {
      origin = allowedList[0] || '*';
    }
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const requestOrigin = event.headers['origin'] || event.headers['Origin'];
  const corsHeaders = getCorsHeaders(requestOrigin);

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  // Extract client identifiers safely
  const clientIp =
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['client-ip'] ||
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    'unknown-ip';

  const clientIpHash = hashIdentifier(clientIp);

  // Initialize base structured log
  const logData: StructuredLog = {
    timestamp: new Date().toISOString(),
    requestId,
    endpoint: '/.netlify/functions/chat',
    method: event.httpMethod,
    status: 200,
    durationMs: 0,
    clientIpHash,
    inputLength: 0,
  };

  // 1. Security & Input Validation
  const validation = validateRequest(event.httpMethod, event.headers, event.body);
  if (!validation.valid || !validation.data) {
    const status = validation.statusCode || 400;
    const durationMs = Date.now() - startTime;
    logData.status = status;
    logData.durationMs = durationMs;
    logData.errorType = validation.errorCode;
    logData.inputLength = event.body ? event.body.length : 0;
    logStructured(logData);

    const errorResponse: ChatErrorResponse = {
      error: validation.errorCode || 'VALIDATION_FAILED',
      message: validation.errorMessage || 'Invalid request.',
    };

    return {
      statusCode: status,
      headers: corsHeaders,
      body: JSON.stringify(errorResponse),
    };
  }

  const { message, turnstileToken, sessionId } = validation.data;
  logData.inputLength = message.length;
  logData.category = validation.category;
  logData.inputPreview = sanitizeInputPreview(message);
  logData.sessionIdHash = hashIdentifier(sessionId);

  // 2. Bot Protection (Cloudflare Turnstile)
  const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIp);
  logData.botVerificationResult = turnstileResult.status;

  if (!turnstileResult.success) {
    const durationMs = Date.now() - startTime;
    logData.status = 403;
    logData.durationMs = durationMs;
    logData.errorType = 'BOT_VERIFICATION_FAILED';
    logStructured(logData);

    const errorResponse: ChatErrorResponse = {
      error: 'BOT_VERIFICATION_FAILED',
      message: 'Verificación de seguridad no superada.',
    };

    return {
      statusCode: 403,
      headers: corsHeaders,
      body: JSON.stringify(errorResponse),
    };
  }

  // 3. Rate Limiting & Quota Tracker
  const rateLimitStatus = await checkRateLimitAndQuota(clientIp, sessionId);
  if (!rateLimitStatus.allowed) {
    const durationMs = Date.now() - startTime;
    logData.status = 429;
    logData.durationMs = durationMs;
    logData.rateLimitResult =
      rateLimitStatus.reason === 'QUOTA_EXCEEDED' ? 'BLOCKED_QUOTA' : 'BLOCKED_RATE_LIMIT';
    logData.errorType = rateLimitStatus.reason;
    logStructured(logData);

    const errorResponse: ChatErrorResponse = {
      error: rateLimitStatus.reason || 'RATE_LIMIT_EXCEEDED',
      message:
        rateLimitStatus.reason === 'QUOTA_EXCEEDED'
          ? 'Has alcanzado el límite de consultas para esta sesión.'
          : 'Demasiadas solicitudes. Por favor espera unos momentos antes de volver a consultar.',
    };

    return {
      statusCode: 429,
      headers: corsHeaders,
      body: JSON.stringify(errorResponse),
    };
  }

  logData.rateLimitResult = 'ALLOWED';

  // 4. OpenRouter Gateway Call
  try {
    const llmResult = await queryOpenRouter(message);
    const durationMs = Date.now() - startTime;

    logData.status = 200;
    logData.durationMs = durationMs;
    logData.model = llmResult.model;
    logData.outputLength = llmResult.answer.length;

    if (llmResult.usage) {
      logData.promptTokens = llmResult.usage.promptTokens;
      logData.completionTokens = llmResult.usage.completionTokens;
      logData.totalTokens = llmResult.usage.totalTokens;
    }

    logStructured(logData);

    const successResponse: ChatSuccessResponse = {
      answer: llmResult.answer,
      remainingQuota: rateLimitStatus.remainingQuota,
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(successResponse),
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    const isTimeout = error.message?.includes('timed out');
    const status = isTimeout ? 504 : 502;

    logData.status = status;
    logData.durationMs = durationMs;
    logData.errorType = isTimeout ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_ERROR';
    logStructured(logData);

    // Generic, safe user-facing error message (never leak upstream details or stack traces)
    const errorResponse: ChatErrorResponse = {
      error: isTimeout ? 'TIMEOUT' : 'SERVICE_UNAVAILABLE',
      message: 'El asistente de IA no está disponible temporalmente. Inténtalo más tarde.',
    };

    return {
      statusCode: status,
      headers: corsHeaders,
      body: JSON.stringify(errorResponse),
    };
  }
};
