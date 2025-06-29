import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed within the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Custom error message */
  message?: string;
  /** Skip rate limiting for certain conditions (optional) */
  skip?: (req: VercelRequest) => boolean;
}

/**
 * Rate limit entry for tracking requests
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory store for rate limiting data
 * Using Map for better performance and cleanup
 */
class InMemoryStore {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup process every 5 minutes to remove expired entries
    this.startCleanup();
  }

  /**
   * Get current count for a key
   */
  get(key: string): RateLimitEntry | undefined {
    const entry = this.store.get(key);
    if (entry && entry.resetTime <= Date.now()) {
      // Entry has expired, remove it
      this.store.delete(key);
      return undefined;
    }
    return entry;
  }

  /**
   * Increment count for a key
   */
  increment(key: string, windowMs: number): RateLimitEntry {
    const now = Date.now();
    const resetTime = now + windowMs;
    const existing = this.get(key);

    if (existing) {
      existing.count++;
      return existing;
    } else {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime
      };
      this.store.set(key, newEntry);
      return newEntry;
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime <= now) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Start periodic cleanup
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Clean up every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Get store size (for testing/monitoring)
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Clear all entries (for testing)
   */
  clear(): void {
    this.store.clear();
  }
}

// Global store instance (shared across all requests in the same process)
const store = new InMemoryStore();

/**
 * Get client IP address from request
 */
function getClientIP(req: VercelRequest): string {
  // Check various headers that might contain the real IP
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const connectingIP = req.headers['x-connecting-ip'];
  
  // x-forwarded-for can contain multiple IPs, take the first one
  if (forwarded) {
    const forwardedArray = Array.isArray(forwarded) ? forwarded : [forwarded];
    const firstForwarded = forwardedArray[0];
    return firstForwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] : realIP;
  }
  
  if (connectingIP) {
    return Array.isArray(connectingIP) ? connectingIP[0] : connectingIP;
  }
  
  // Fallback to connection remote address
  return req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
}

/**
 * Rate limiting middleware for Vercel functions
 */
export function rateLimit(config: RateLimitConfig) {
  return (req: VercelRequest, res: VercelResponse): boolean => {
    // Skip rate limiting if skip function returns true
    if (config.skip && config.skip(req)) {
      return true; // Allow request to continue
    }

    const clientIP = getClientIP(req);
    const key = `rate_limit:${clientIP}`;
    
    const entry = store.increment(key, config.windowMs);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());
    
    if (entry.count > config.maxRequests) {
      // Rate limit exceeded
      res.setHeader('Retry-After', Math.ceil((entry.resetTime - Date.now()) / 1000).toString());
      
      const message = config.message || 
        'Too many requests. Please try again later.';
      
      res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil((entry.resetTime - Date.now()) / 1000)
      });
      
      return false; // Block request
    }
    
    return true; // Allow request to continue
  };
}

/**
 * Common rate limit configurations
 */
export const rateLimitConfigs = {
  // For form submissions (stricter limits)
  forms: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many form submissions. Please wait a minute before trying again.'
  },
  
  // For CSRF token requests (more lenient)
  csrf: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many requests for security tokens. Please wait a moment.'
  },
  
  // For general API endpoints
  api: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many API requests. Please wait a minute before trying again.'
  }
} as const;

/**
 * Helper function to apply rate limiting to a handler
 */
export function withRateLimit<T extends VercelRequest, U extends VercelResponse>(
  config: RateLimitConfig,
  handler: (req: T, res: U) => Promise<void | U>
) {
  return async (req: T, res: U): Promise<void | U> => {
    const rateLimiter = rateLimit(config);
    
    if (!rateLimiter(req, res)) {
      // Rate limit exceeded, response already sent
      return;
    }
    
    // Continue with the original handler
    return handler(req, res);
  };
}

// Export store for testing purposes
export { store as _store };