import {
  failureModesRateLimiter,
  withRetry,
  isOnline,
  isRetryableError
} from '../../src/utils/apiUtils';

// Mock navigator for online/offline tests
const mockNavigatorOnline = jest.fn();
Object.defineProperty(navigator, 'onLine', {
  get: mockNavigatorOnline,
  configurable: true
});

describe('apiUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigatorOnline.mockReturnValue(true);
  });

  describe('RateLimiter', () => {
    beforeEach(() => {
      // Clear the rate limiter state
      (failureModesRateLimiter as any).requests.clear();
    });

    it('should allow requests within limit', () => {
      const identifier = 'test-user';

      // Should allow first 10 requests
      for (let i = 0; i < 10; i++) {
        expect(failureModesRateLimiter.isAllowed(identifier)).toBe(true);
      }
    });

    it('should block requests exceeding limit', () => {
      const identifier = 'test-user';

      // Use up the limit
      for (let i = 0; i < 10; i++) {
        failureModesRateLimiter.isAllowed(identifier);
      }

      // Next request should be blocked
      expect(failureModesRateLimiter.isAllowed(identifier)).toBe(false);
    });

    it('should reset after window expires', async () => {
      const identifier = 'test-user';
      const shortLimiter = new (failureModesRateLimiter.constructor as any)(1, 50); // 1 request per 50ms

      // Use the single request
      expect(shortLimiter.isAllowed(identifier)).toBe(true);
      expect(shortLimiter.isAllowed(identifier)).toBe(false);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 60));

      // Should be allowed again
      expect(shortLimiter.isAllowed(identifier)).toBe(true);
    });

    it('should track remaining requests correctly', () => {
      const identifier = 'test-user';

      expect(failureModesRateLimiter.getRemainingRequests(identifier)).toBe(10);

      // Use 3 requests
      failureModesRateLimiter.isAllowed(identifier);
      failureModesRateLimiter.isAllowed(identifier);
      failureModesRateLimiter.isAllowed(identifier);

      expect(failureModesRateLimiter.getRemainingRequests(identifier)).toBe(7);
    });

    it('should handle different identifiers separately', () => {
      const user1 = 'user-1';
      const user2 = 'user-2';

      // Use up limit for user1
      for (let i = 0; i < 10; i++) {
        failureModesRateLimiter.isAllowed(user1);
      }

      // user1 should be blocked, user2 should still be allowed
      expect(failureModesRateLimiter.isAllowed(user1)).toBe(false);
      expect(failureModesRateLimiter.isAllowed(user2)).toBe(true);
    });
  });

  describe('withRetry', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return result on first successful attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const result = await withRetry(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');

      const promise = withRetry(mockFn, {
        maxAttempts: 3,
        baseDelay: 100
      });

      // Fast forward past first retry delay
      jest.advanceTimersByTime(100);

      const result = await promise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should respect max attempts', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));

      const promise = withRetry(mockFn, {
        maxAttempts: 3,
        baseDelay: 100
      });

      // Fast forward past all retry delays
      jest.advanceTimersByTime(100 * 2); // 2 retries

      await expect(promise).rejects.toThrow('Always fails');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should call onRetry callback', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValue('success');

      const onRetry = jest.fn();

      const promise = withRetry(mockFn, {
        maxAttempts: 3,
        baseDelay: 100,
        onRetry
      });

      jest.advanceTimersByTime(100);

      await promise;

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });

    it('should use exponential backoff', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');

      const promise = withRetry(mockFn, {
        maxAttempts: 4,
        baseDelay: 100,
        backoffFactor: 2
      });

      // First retry after 100ms, second after 200ms
      jest.advanceTimersByTime(100);
      jest.advanceTimersByTime(200);

      const result = await promise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should add jitter to prevent thundering herd', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockResolvedValue('success');

      const promise = withRetry(mockFn, {
        maxAttempts: 2,
        baseDelay: 100
      });

      // Advance time enough to cover base delay + jitter
      jest.advanceTimersByTime(110); // 100ms + up to 10ms jitter

      const result = await promise;

      expect(result).toBe('success');
    });
  });

  describe('isOnline', () => {
    it('should return navigator.onLine status', () => {
      mockNavigatorOnline.mockReturnValue(true);
      expect(isOnline()).toBe(true);

      mockNavigatorOnline.mockReturnValue(false);
      expect(isOnline()).toBe(false);
    });
  });

  describe('isRetryableError', () => {
    it('should identify network errors as retryable', () => {
      const networkError = new TypeError('Failed to fetch');
      expect(isRetryableError(networkError)).toBe(true);
    });

    it('should identify Supabase timeout errors as retryable', () => {
      const timeoutError = { code: 'PGRST301' };
      expect(isRetryableError(timeoutError)).toBe(true);
    });

    it('should identify HTTP 5xx errors as retryable', () => {
      const serverError = { status: 500 };
      expect(isRetryableError(serverError)).toBe(true);

      const badGatewayError = { status: 502 };
      expect(isRetryableError(badGatewayError)).toBe(true);
    });

    it('should identify HTTP 429 as retryable', () => {
      const rateLimitError = { status: 429 };
      expect(isRetryableError(rateLimitError)).toBe(true);
    });

    it('should not retry HTTP 4xx errors (except 429)', () => {
      const notFoundError = { status: 404 };
      expect(isRetryableError(notFoundError)).toBe(false);

      const forbiddenError = { status: 403 };
      expect(isRetryableError(forbiddenError)).toBe(false);
    });

    it('should handle null/undefined errors', () => {
      expect(isRetryableError(null)).toBe(false);
      expect(isRetryableError(undefined)).toBe(false);
    });
  });
});