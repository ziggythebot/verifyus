/**
 * Error Handling Tests
 *
 * Tests for error handling utilities and retry logic
 */

import {
  retryWithBackoff,
  sleep,
  isNetworkError,
  isValidationError,
  getUserFriendlyErrorMessage,
  fetchWithTimeout,
  fetchWithRetry,
} from '../lib/utils/errorHandling';

describe('Error Handling Utilities', () => {
  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValueOnce('success');

      const result = await retryWithBackoff(fn, { maxAttempts: 3, initialDelay: 10 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max attempts', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('always fail'));

      await expect(
        retryWithBackoff(fn, { maxAttempts: 3, initialDelay: 10 })
      ).rejects.toThrow('always fail');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should not retry if shouldRetry returns false', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));

      await expect(
        retryWithBackoff(fn, {
          maxAttempts: 3,
          shouldRetry: () => false,
          initialDelay: 10,
        })
      ).rejects.toThrow('fail');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry callback', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce('success');
      const onRetry = jest.fn();

      await retryWithBackoff(fn, { onRetry, initialDelay: 10 });
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1);
    });
  });

  describe('isNetworkError', () => {
    it('should detect network errors', () => {
      expect(isNetworkError(new Error('Network request failed'))).toBe(true);
      expect(isNetworkError(new Error('fetch failed'))).toBe(true);
      expect(isNetworkError(new Error('timeout exceeded'))).toBe(true);

      const networkError = new Error('test');
      networkError.name = 'NetworkError';
      expect(isNetworkError(networkError)).toBe(true);
    });

    it('should not detect non-network errors', () => {
      expect(isNetworkError(new Error('validation failed'))).toBe(false);
      expect(isNetworkError(new Error('unauthorized'))).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('should detect validation errors', () => {
      expect(isValidationError({ status: 400 })).toBe(true);
      expect(isValidationError({ name: 'ZodError' })).toBe(true);
    });

    it('should not detect non-validation errors', () => {
      expect(isValidationError({ status: 500 })).toBe(false);
      expect(isValidationError(new Error('test'))).toBe(false);
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('should return friendly message for network errors', () => {
      const error = new Error('Network request failed');
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toContain('Network connection');
    });

    it('should return friendly message for HTTP status codes', () => {
      expect(getUserFriendlyErrorMessage({ status: 401 })).toContain('Authentication');
      expect(getUserFriendlyErrorMessage({ status: 403 })).toContain('permission');
      expect(getUserFriendlyErrorMessage({ status: 404 })).toContain('not found');
      expect(getUserFriendlyErrorMessage({ status: 429 })).toContain('Too many');
      expect(getUserFriendlyErrorMessage({ status: 500 })).toContain('Server error');
      expect(getUserFriendlyErrorMessage({ status: 503 })).toContain('unavailable');
    });

    it('should return default message for unknown errors', () => {
      const message = getUserFriendlyErrorMessage(new Error('Unknown'));
      expect(message).toContain('unexpected error');
    });
  });

  describe('sleep', () => {
    it('should wait for specified duration', async () => {
      const start = Date.now();
      await sleep(100);
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(95); // Allow small variance
    });
  });
});

describe('Fetch Utilities', () => {
  // Mock global fetch
  global.fetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchWithTimeout', () => {
    it('should fetch successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ data: 'test' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const response = await fetchWithTimeout('/api/test');
      expect(response.ok).toBe(true);
    });

    it('should throw error for non-ok response', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Not found' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(fetchWithTimeout('/api/test')).rejects.toThrow('HTTP 404');
    });

    it('should timeout after specified duration', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      await expect(fetchWithTimeout('/api/test', {}, 100)).rejects.toThrow('timeout');
    });
  });

  describe('fetchWithRetry', () => {
    it('should retry on server errors', async () => {
      const mockResponse = { ok: true, json: async () => ({ data: 'test' }) };
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Server error'))
        .mockResolvedValueOnce(mockResponse);

      const response = await fetchWithRetry('/api/test', {}, { initialDelay: 10 });
      expect(response.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on client errors (except 429)', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Bad request' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(fetchWithRetry('/api/test', {}, { initialDelay: 10 })).rejects.toThrow();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
