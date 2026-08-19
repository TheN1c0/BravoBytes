export interface RateLimitStatus {
  allowed: boolean;
  reason?: 'RATE_LIMIT_EXCEEDED' | 'QUOTA_EXCEEDED';
  remainingQuota: number;
  resetTimeMs?: number;
}

export interface RateLimiterStore {
  incrementAndCheck(key: string, windowMs: number, maxLimit: number): Promise<{ count: number; allowed: boolean; ttlMs: number }>;
}

/**
 * In-memory sliding window store with automatic TTL garbage collection.
 * Ready to be swapped with Upstash / Redis in future versions.
 */
class MemoryRateLimiterStore implements RateLimiterStore {
  private hits = new Map<string, { count: number; expiresAt: number }>();

  async incrementAndCheck(
    key: string,
    windowMs: number,
    maxLimit: number
  ): Promise<{ count: number; allowed: boolean; ttlMs: number }> {
    const now = Date.now();
    const entry = this.hits.get(key);

    // Clean expired entries periodically
    if (this.hits.size > 500) {
      for (const [k, v] of this.hits.entries()) {
        if (v.expiresAt <= now) {
          this.hits.delete(k);
        }
      }
    }

    if (!entry || entry.expiresAt <= now) {
      const expiresAt = now + windowMs;
      this.hits.set(key, { count: 1, expiresAt });
      return { count: 1, allowed: true, ttlMs: windowMs };
    }

    entry.count += 1;
    const allowed = entry.count <= maxLimit;
    const ttlMs = Math.max(0, entry.expiresAt - now);
    return { count: entry.count, allowed, ttlMs };
  }
}

const defaultStore: RateLimiterStore = new MemoryRateLimiterStore();

// Limits
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per 10 minutes per IP
const WINDOW_DURATION_MS = 10 * 60 * 1000;
const MAX_SESSION_QUOTA = 6; // 6 questions per session limit

/**
 * Checks rate limits and visitor quota server-side.
 */
export async function checkRateLimitAndQuota(
  ipIdentifier: string,
  sessionIdentifier?: string,
  store: RateLimiterStore = defaultStore
): Promise<RateLimitStatus> {
  // 1. Check IP sliding window
  const ipResult = await store.incrementAndCheck(
    `ip:${ipIdentifier}`,
    WINDOW_DURATION_MS,
    MAX_REQUESTS_PER_WINDOW
  );

  if (!ipResult.allowed) {
    return {
      allowed: false,
      reason: 'RATE_LIMIT_EXCEEDED',
      remainingQuota: 0,
      resetTimeMs: ipResult.ttlMs,
    };
  }

  // 2. Check Session Quota (if provided)
  if (sessionIdentifier) {
    const sessionResult = await store.incrementAndCheck(
      `session:${sessionIdentifier}`,
      WINDOW_DURATION_MS * 2, // 20 minutes window
      MAX_SESSION_QUOTA
    );

    const remaining = Math.max(0, MAX_SESSION_QUOTA - sessionResult.count);

    if (!sessionResult.allowed) {
      return {
        allowed: false,
        reason: 'QUOTA_EXCEEDED',
        remainingQuota: 0,
        resetTimeMs: sessionResult.ttlMs,
      };
    }

    return {
      allowed: true,
      remainingQuota: remaining,
    };
  }

  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - ipResult.count);
  return {
    allowed: true,
    remainingQuota: remaining,
  };
}
