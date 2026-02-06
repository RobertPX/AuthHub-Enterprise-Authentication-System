import { Ratelimit } from '@upstash/ratelimit';
import redis from './redis';
import { TooManyRequestsError } from './errors';

type RateLimitConfig = {
  requests: number;
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`;
};

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  auth: { requests: 5, window: '1 m' },
  api: { requests: 100, window: '1 m' },
  strict: { requests: 3, window: '1 m' },
};

function createRateLimiter(config: RateLimitConfig): Ratelimit | null {
  if (!redis) {
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    analytics: true,
  });
}

const rateLimiters: Record<string, Ratelimit | null> = {
  auth: createRateLimiter(rateLimitConfigs.auth),
  api: createRateLimiter(rateLimitConfigs.api),
  strict: createRateLimiter(rateLimitConfigs.strict),
};

export type RateLimitType = keyof typeof rateLimiters;

export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'api'
): Promise<void> {
  const limiter = rateLimiters[type];

  if (!limiter) {
    // Rate limiting disabled when Redis is not configured
    return;
  }

  const { success, reset } = await limiter.limit(identifier);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    throw new TooManyRequestsError(
      `Rate limit exceeded. Try again in ${retryAfter} seconds.`
    );
  }
}

export async function getRateLimitInfo(
  identifier: string,
  type: RateLimitType = 'api'
): Promise<{ remaining: number; reset: number } | null> {
  const limiter = rateLimiters[type];

  if (!limiter) {
    return null;
  }

  const { remaining, reset } = await limiter.limit(identifier);
  return { remaining, reset };
}
