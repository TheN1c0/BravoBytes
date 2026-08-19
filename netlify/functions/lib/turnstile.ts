export interface TurnstileVerificationResult {
  success: boolean;
  status: 'PASSED' | 'FAILED' | 'BYPASSED';
  errorCodes?: string[];
}

/**
 * Validates Cloudflare Turnstile token server-side.
 * Allows safe bypass if TURNSTILE_SECRET_KEY is not configured or TURNSTILE_ENABLED is explicitly 'false'.
 */
export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp?: string
): Promise<TurnstileVerificationResult> {
  const secretKey = process.env['TURNSTILE_SECRET_KEY'];
  const isEnabled = process.env['TURNSTILE_ENABLED'] !== 'false';

  // If secret key is not configured or protection is disabled in dev, bypass safely
  if (!secretKey || !isEnabled) {
    return {
      success: true,
      status: 'BYPASSED',
    };
  }

  // If enabled and secret key exists, token is strictly required
  if (!token || token.trim() === '') {
    return {
      success: false,
      status: 'FAILED',
      errorCodes: ['missing-input-response'],
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!res.ok) {
      return {
        success: false,
        status: 'FAILED',
        errorCodes: [`http-status-${res.status}`],
      };
    }

    const data: any = await res.json();
    return {
      success: Boolean(data.success),
      status: data.success ? 'PASSED' : 'FAILED',
      errorCodes: data['error-codes'] || [],
    };
  } catch (err) {
    return {
      success: false,
      status: 'FAILED',
      errorCodes: ['turnstile-fetch-error'],
    };
  }
}
