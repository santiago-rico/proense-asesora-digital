import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { rateLimit, rateLimitConfigs, withRateLimit, _store } from './rate-limiter';

// Mock Vercel Request and Response
const createMockRequest = (ip = '127.0.0.1', method = 'POST'): VercelRequest => ({
  method,
  headers: {
    'x-forwarded-for': ip,
  },
  connection: {},
  socket: {},
} as VercelRequest);

const createMockResponse = (): VercelResponse => {
  const headers: Record<string, string> = {};
  const response = {
    setHeader: vi.fn((name: string, value: string) => {
      headers[name] = value;
    }),
    status: vi.fn(() => response),
    json: vi.fn(() => response),
    end: vi.fn(() => response),
    headers,
  } as unknown as VercelResponse;
  
  return response;
};

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Clear the store before each test
    _store.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rateLimit function', () => {
    it('should allow requests under the limit', () => {
      const config = { maxRequests: 5, windowMs: 60000 };
      const rateLimiter = rateLimit(config);
      const req = createMockRequest('192.168.1.1');
      const res = createMockResponse();

      // First request should be allowed
      const result = rateLimiter(req, res);
      expect(result).toBe(true);

      // Check rate limit headers
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '5');
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '4');
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String));
    });

    it('should block requests over the limit', () => {
      const config = { maxRequests: 2, windowMs: 60000 };
      const rateLimiter = rateLimit(config);
      const req = createMockRequest('192.168.1.2');
      const res = createMockResponse();

      // Make requests up to the limit
      rateLimiter(req, res);
      rateLimiter(req, res);

      // Third request should be blocked
      const result = rateLimiter(req, res);
      expect(result).toBe(false);

      // Check that 429 status was set
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: expect.any(Number)
      });

      // Check retry-after header
      expect(res.setHeader).toHaveBeenCalledWith('Retry-After', expect.any(String));
    });

    it('should handle different IPs separately', () => {
      const config = { maxRequests: 1, windowMs: 60000 };
      const rateLimiter = rateLimit(config);
      const req1 = createMockRequest('192.168.1.1');
      const req2 = createMockRequest('192.168.1.2');
      const res1 = createMockResponse();
      const res2 = createMockResponse();

      // First IP reaches limit
      expect(rateLimiter(req1, res1)).toBe(true);
      expect(rateLimiter(req1, res1)).toBe(false);

      // Second IP should still be allowed
      expect(rateLimiter(req2, res2)).toBe(true);
    });

    it('should use custom error message', () => {
      const config = { 
        maxRequests: 1, 
        windowMs: 60000,
        message: 'Custom rate limit message'
      };
      const rateLimiter = rateLimit(config);
      const req = createMockRequest();
      const res = createMockResponse();

      // Reach limit
      rateLimiter(req, res);
      rateLimiter(req, res);

      expect(res.json).toHaveBeenCalledWith({
        error: 'Rate limit exceeded',
        message: 'Custom rate limit message',
        retryAfter: expect.any(Number)
      });
    });

    it('should skip rate limiting when skip function returns true', () => {
      const config = { 
        maxRequests: 1, 
        windowMs: 60000,
        skip: (req: VercelRequest) => req.headers['x-skip-rate-limit'] === 'true'
      };
      const rateLimiter = rateLimit(config);
      const req = createMockRequest();
      req.headers = { ...req.headers, 'x-skip-rate-limit': 'true' };
      const res = createMockResponse();

      // Multiple requests should be allowed due to skip function
      expect(rateLimiter(req, res)).toBe(true);
      expect(rateLimiter(req, res)).toBe(true);
      expect(rateLimiter(req, res)).toBe(true);
    });

    it('should extract IP from different headers', () => {
      const config = { maxRequests: 1, windowMs: 60000 };
      const rateLimiter = rateLimit(config);

      // Test x-real-ip header
      const req1 = createMockRequest();
      req1.headers = { 'x-real-ip': '10.0.0.1' };
      const res1 = createMockResponse();
      
      // Test x-connecting-ip header
      const req2 = createMockRequest();
      req2.headers = { 'x-connecting-ip': '10.0.0.2' };
      const res2 = createMockResponse();

      expect(rateLimiter(req1, res1)).toBe(true);
      expect(rateLimiter(req2, res2)).toBe(true);

      // Same IP should be blocked on second request
      expect(rateLimiter(req1, res1)).toBe(false);
      expect(rateLimiter(req2, res2)).toBe(false);
    });
  });

  describe('withRateLimit wrapper', () => {
    it('should call original handler when rate limit allows', async () => {
      const config = { maxRequests: 5, windowMs: 60000 };
      const originalHandler = vi.fn().mockResolvedValue(undefined);
      const wrappedHandler = withRateLimit(config, originalHandler);
      
      const req = createMockRequest();
      const res = createMockResponse();

      await wrappedHandler(req, res);

      expect(originalHandler).toHaveBeenCalledWith(req, res);
    });

    it('should not call original handler when rate limit blocks', async () => {
      const config = { maxRequests: 1, windowMs: 60000 };
      const originalHandler = vi.fn().mockResolvedValue(undefined);
      const wrappedHandler = withRateLimit(config, originalHandler);
      
      const req = createMockRequest();
      const res = createMockResponse();

      // First call should work
      await wrappedHandler(req, res);
      expect(originalHandler).toHaveBeenCalledTimes(1);

      // Second call should be blocked
      originalHandler.mockClear();
      await wrappedHandler(req, res);
      expect(originalHandler).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(429);
    });
  });

  describe('Rate limit configs', () => {
    it('should have appropriate limits for forms', () => {
      expect(rateLimitConfigs.forms.maxRequests).toBe(5);
      expect(rateLimitConfigs.forms.windowMs).toBe(60000);
      expect(rateLimitConfigs.forms.message).toContain('form submissions');
    });

    it('should have appropriate limits for CSRF', () => {
      expect(rateLimitConfigs.csrf.maxRequests).toBe(20);
      expect(rateLimitConfigs.csrf.windowMs).toBe(60000);
      expect(rateLimitConfigs.csrf.message).toContain('security tokens');
    });

    it('should have appropriate limits for API', () => {
      expect(rateLimitConfigs.api.maxRequests).toBe(10);
      expect(rateLimitConfigs.api.windowMs).toBe(60000);
      expect(rateLimitConfigs.api.message).toContain('API requests');
    });
  });

  describe('InMemoryStore', () => {
    it('should track store size', () => {
      const config = { maxRequests: 5, windowMs: 60000 };
      const rateLimiter = rateLimit(config);
      const req = createMockRequest();
      const res = createMockResponse();

      expect(_store.size()).toBe(0);
      rateLimiter(req, res);
      expect(_store.size()).toBe(1);
    });

    it('should clean up expired entries', async () => {
      const config = { maxRequests: 5, windowMs: 100 }; // Very short window
      const rateLimiter = rateLimit(config);
      const req = createMockRequest();
      const res = createMockResponse();

      rateLimiter(req, res);
      expect(_store.size()).toBe(1);

      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Make another request to trigger cleanup
      rateLimiter(req, res);
      
      // The expired entry should have been cleaned up and replaced with a new one
      expect(_store.size()).toBe(1);
    });
  });

  describe('IP extraction', () => {
    it('should handle x-forwarded-for with multiple IPs', () => {
      const config = { maxRequests: 1, windowMs: 60000 };
      const rateLimiter = rateLimit(config);
      const req = createMockRequest();
      req.headers = { 'x-forwarded-for': '203.0.113.1, 198.51.100.1, 192.0.2.1' };
      const res = createMockResponse();

      // Should use the first IP
      expect(rateLimiter(req, res)).toBe(true);
      expect(rateLimiter(req, res)).toBe(false); // Same first IP should be blocked
    });

    it('should fallback to unknown when no IP headers present', () => {
      const config = { maxRequests: 1, windowMs: 60000 };
      const rateLimiter = rateLimit(config);
      const req = { method: 'POST', headers: {}, connection: {}, socket: {} } as VercelRequest;
      const res = createMockResponse();

      expect(rateLimiter(req, res)).toBe(true);
      expect(rateLimiter(req, res)).toBe(false); // Should still track 'unknown' IP
    });
  });
});