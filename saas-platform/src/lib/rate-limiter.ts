/**
 * Distributed rate limiter using Upstash Redis.
 * Falls back to in-memory if Redis is not configured or package not installed.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let redisClient: any = null;
let redisChecked = false;

async function getRedis() {
  if (redisChecked) return redisClient;
  redisChecked = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      // Dynamic import — fails gracefully if @upstash/redis is not installed
      const { Redis } = await import("@upstash/redis");
      redisClient = new Redis({ url, token });
    } catch {
      // @upstash/redis not installed — fall back to memory
    }
  }

  return redisClient;
}

function getRateLimitConfig(endpoint: string): { maxAttempts: number; windowMs: number } {
  const configs: Record<string, { maxAttempts: number; windowMs: number }> = {
    login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
    signup: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
    "forgot-password": { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
    "reset-password": { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
    "change-password": { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
    captcha: { maxAttempts: 10, windowMs: 60 * 1000 },
  };
  return configs[endpoint] || { maxAttempts: 10, windowMs: 60 * 1000 };
}

function checkRateLimitMemory(
  key: string,
  config: { maxAttempts: number; windowMs: number }
): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxAttempts - 1, retryAfter: 0 };
  }

  if (entry.count >= config.maxAttempts) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxAttempts - entry.count, retryAfter: 0 };
}

async function checkRateLimitRedis(
  key: string,
  config: { maxAttempts: number; windowMs: number }
): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
  const client = await getRedis();
  if (!client) {
    return checkRateLimitMemory(key, config);
  }

  const windowSeconds = Math.ceil(config.windowMs / 1000);

  try {
    const multi = client.multi();
    multi.incr(key);
    multi.pttl(key);
    const result = await multi.exec() as [number, number];
    const count = result[0];
    const ttl = result[1];

    if (count === 1) {
      await client.pexpire(key, config.windowMs);
    }

    if (count > config.maxAttempts) {
      const retryAfter = ttl > 0 ? Math.ceil(ttl / 1000) : windowSeconds;
      return { allowed: false, remaining: 0, retryAfter };
    }

    return { allowed: true, remaining: config.maxAttempts - count, retryAfter: 0 };
  } catch {
    return checkRateLimitMemory(key, config);
  }
}

export async function checkRateLimit(
  endpoint: string,
  identifier: string
): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
  const config = getRateLimitConfig(endpoint);
  const key = `ratelimit:${endpoint}:${identifier}`;
  return checkRateLimitRedis(key, config);
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}
