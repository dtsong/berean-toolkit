/**
 * In-memory rate limiter using sliding window algorithm
 * Suitable for single-instance deployments
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

const CLEANUP_INTERVAL = 60_000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const store of stores.values()) {
      for (const [key, entry] of store.entries()) {
        if (now > entry.resetTime) {
          store.delete(key);
        }
      }
    }
  }, CLEANUP_INTERVAL);

  if (typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

function getStore(name: string): Map<string, RateLimitEntry> {
  let store = stores.get(name);
  if (!store) {
    store = new Map();
    stores.set(name, store);
    startCleanup();
  }
  return store;
}

export function createRateLimiter(name: string, config: RateLimitConfig) {
  const store = getStore(name);

  return {
    check(identifier: string): RateLimitResult {
      const now = Date.now();
      const entry = store.get(identifier);

      if (!entry || now > entry.resetTime) {
        store.set(identifier, {
          count: 1,
          resetTime: now + config.windowMs,
        });
        return {
          success: true,
          remaining: config.limit - 1,
          resetIn: config.windowMs,
        };
      }

      if (entry.count >= config.limit) {
        return {
          success: false,
          remaining: 0,
          resetIn: entry.resetTime - now,
        };
      }

      entry.count++;
      return {
        success: true,
        remaining: config.limit - entry.count,
        resetIn: entry.resetTime - now,
      };
    },

    reset(identifier: string): void {
      store.delete(identifier);
    },
  };
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

export const rateLimiters = {
  sermon: createRateLimiter('sermon', {
    limit: 10,
    windowMs: 60_000,
  }),

  verse: createRateLimiter('verse', {
    limit: 60,
    windowMs: 60_000,
  }),

  strongs: createRateLimiter('strongs', {
    limit: 100,
    windowMs: 60_000,
  }),

  interlinear: createRateLimiter('interlinear', {
    limit: 60,
    windowMs: 60_000,
  }),

  bible: createRateLimiter('bible', {
    limit: 60,
    windowMs: 60_000,
  }),

  game: createRateLimiter('game', {
    limit: 30,
    windowMs: 60_000,
  }),
};
