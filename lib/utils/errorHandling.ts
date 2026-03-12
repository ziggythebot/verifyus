/**
 * Error Handling Utilities
 *
 * Provides consistent error handling, retry logic, and user-friendly error messages
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry if we've exhausted attempts
      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Check if we should retry this error
      if (!shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      );

      // Call retry callback
      if (onRetry) {
        onRetry(lastError, attempt);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: Error): boolean {
  return (
    error.message.toLowerCase().includes('network') ||
    error.message.toLowerCase().includes('fetch') ||
    error.message.toLowerCase().includes('timeout') ||
    error.name === 'NetworkError' ||
    error.name === 'TypeError'
  );
}

/**
 * Check if an error is a validation error
 */
export function isValidationError(error: any): boolean {
  return error?.status === 400 || error?.name === 'ZodError';
}

/**
 * Get a user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: Error | any): string {
  // Check for specific error types
  if (isNetworkError(error)) {
    return 'Network connection issue. Please check your internet connection and try again.';
  }

  if (isValidationError(error)) {
    return 'Invalid data provided. Please check your information and try again.';
  }

  // Check for HTTP status codes
  if (error?.status) {
    switch (error.status) {
      case 400:
        return error.message || 'Invalid request. Please check your information.';
      case 401:
        return 'Authentication required. Please log in and try again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found. The requested item may have been removed.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Our team has been notified. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again in a few moments.';
      default:
        if (error.status >= 500) {
          return 'Server error. Please try again later.';
        }
    }
  }

  // Default message
  return error?.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Fetch with timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.response = response;

      // Try to parse error body
      try {
        const body = await response.json() as any;
        error.message = body.error || body.message || error.message;
        error.details = body.details;
      } catch {
        // Failed to parse error body, use status text
      }

      throw error;
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }

    throw error;
  }
}

/**
 * Enhanced fetch with retry and timeout
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return retryWithBackoff(
    () => fetchWithTimeout(url, options, 30000),
    {
      maxAttempts: 3,
      initialDelay: 1000,
      shouldRetry: (error: any, attempt) => {
        // Don't retry client errors (except network errors)
        if (error.status && error.status >= 400 && error.status < 500) {
          // Retry 429 (rate limit) and network errors
          return error.status === 429 || isNetworkError(error);
        }
        // Retry server errors and network errors
        return true;
      },
      ...retryOptions,
    }
  );
}
