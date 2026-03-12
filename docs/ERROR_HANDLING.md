# Error Handling & Loading States

Comprehensive error handling and loading state management for the verification system.

## Overview

The application implements robust error handling across:
- **Frontend components** - User-friendly error messages and retry logic
- **API routes** - Detailed error responses with proper HTTP status codes
- **Database operations** - Graceful degradation for non-critical failures
- **Network requests** - Timeout handling and automatic retries

## Components

### Error Handling Utilities (`lib/utils/errorHandling.ts`)

Core utilities for error handling:

```typescript
import {
  retryWithBackoff,
  fetchWithRetry,
  getUserFriendlyErrorMessage,
} from '@/lib/utils/errorHandling';
```

#### `retryWithBackoff(fn, options)`

Retry a function with exponential backoff:

```typescript
await retryWithBackoff(
  async () => {
    // Your async operation
    return await someOperation();
  },
  {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    shouldRetry: (error, attempt) => {
      // Custom retry logic
      return error.message !== 'Do not retry';
    },
    onRetry: (error, attempt) => {
      console.log(`Retry attempt ${attempt}:`, error);
    },
  }
);
```

#### `fetchWithRetry(url, options, retryOptions)`

Enhanced fetch with automatic retry and timeout:

```typescript
const response = await fetchWithRetry('/api/verify', {
  method: 'POST',
  body: JSON.stringify(data),
}, {
  maxAttempts: 3,
  initialDelay: 1000,
});
```

Features:
- Automatic retry on network errors
- Retry on server errors (5xx)
- Retry on rate limiting (429)
- No retry on client errors (4xx except 429)
- 30-second timeout by default

#### `getUserFriendlyErrorMessage(error)`

Convert technical errors to user-friendly messages:

```typescript
const error = new Error('Network request failed');
const message = getUserFriendlyErrorMessage(error);
// "Network connection issue. Please check your internet connection and try again."
```

Handles:
- Network errors
- HTTP status codes (401, 403, 404, 429, 500, 503, etc.)
- Validation errors
- Unknown errors

### Loading Components

#### `LoadingSpinner`

Reusable loading indicator:

```typescript
import LoadingSpinner from '@/app/components/LoadingSpinner';

<LoadingSpinner size="lg" color="blue" text="Loading..." />
<LoadingSpinner fullScreen text="Processing..." />
```

#### `InlineLoader`

For inline loading states:

```typescript
import { InlineLoader } from '@/app/components/LoadingSpinner';

<button disabled={isLoading}>
  {isLoading ? <InlineLoader text="Saving..." /> : 'Save'}
</button>
```

#### `Skeleton`

Content placeholder while loading:

```typescript
import { Skeleton } from '@/app/components/LoadingSpinner';

<Skeleton className="h-20 w-full" count={3} />
```

### Error Boundary

React error boundary for catching component errors:

```typescript
import ErrorBoundary from '@/app/components/ErrorBoundary';

<ErrorBoundary
  onError={(error, errorInfo) => {
    // Log to error tracking service
    console.error(error, errorInfo);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

## Usage Examples

### Frontend Component Error Handling

```typescript
'use client';

import { useState } from 'react';
import { fetchWithRetry, getUserFriendlyErrorMessage } from '@/lib/utils/errorHandling';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchWithRetry('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      // Handle success
    } catch (err) {
      const message = getUserFriendlyErrorMessage(err);
      setError(message);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading && <LoadingSpinner text="Submitting..." />}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleSubmit}>Try Again</button>
        </div>
      )}

      {retryCount > 0 && <p>Retry attempt {retryCount}</p>}

      <button onClick={handleSubmit} disabled={isLoading}>
        Submit
      </button>
    </div>
  );
}
```

### API Route Error Handling

```typescript
import { Response } from 'express';

router.post('/api/endpoint', async (req, res: Response) => {
  try {
    // Validate input
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        message: 'The data provided is invalid',
        details: validationResult.error.issues,
      });
    }

    // Process request
    const result = await processData(validationResult.data);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('API error:', error);

    // Return appropriate error response
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.message,
        details: error.details,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
    });
  }
});
```

### Database Error Handling

```typescript
try {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0];
} catch (dbError) {
  console.error('Database error:', dbError);
  throw new AppError('Database error', 500, {
    hint: 'Failed to fetch user data. Please try again.',
  });
}
```

## Error Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "error": "Error type",
  "message": "User-friendly error message",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "hint": "Additional context or suggestion"
}
```

## HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Valid auth but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Service temporarily down |

## Best Practices

### 1. Always Show Loading States

```typescript
// ✅ Good
<button disabled={isLoading}>
  {isLoading ? <InlineLoader /> : 'Submit'}
</button>

// ❌ Bad
<button onClick={handleSubmit}>Submit</button>
```

### 2. Provide Actionable Error Messages

```typescript
// ✅ Good
"Network connection issue. Please check your internet and try again."

// ❌ Bad
"Error: ECONNREFUSED"
```

### 3. Allow Users to Retry

```typescript
// ✅ Good
<div>
  <p>{error}</p>
  <button onClick={retry}>Try Again</button>
</div>

// ❌ Bad
<p>{error}</p>
```

### 4. Log Errors for Debugging

```typescript
// ✅ Good
catch (error) {
  console.error('Detailed error:', error);
  setError(getUserFriendlyErrorMessage(error));
}

// ❌ Bad
catch (error) {
  setError(error.message);
}
```

### 5. Handle Edge Cases

```typescript
// ✅ Good
try {
  const response = await fetch('/api/data');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  if (!data || !data.id) {
    throw new Error('Invalid response format');
  }
  return data;
} catch (error) {
  // Handle error
}

// ❌ Bad
const data = await fetch('/api/data').then(r => r.json());
```

## Testing

Run error handling tests:

```bash
npm test -- error-handling.test.ts
```

Test coverage includes:
- Retry logic with various scenarios
- Timeout handling
- Network error detection
- User-friendly message generation
- Fetch utilities with retry

## Monitoring

Consider integrating error tracking:

```typescript
import ErrorBoundary from '@/app/components/ErrorBoundary';

<ErrorBoundary
  onError={(error, errorInfo) => {
    // Send to Sentry, LogRocket, etc.
    errorTracker.captureException(error, { errorInfo });
  }}
>
  <App />
</ErrorBoundary>
```

## Future Improvements

- [ ] Add rate limiting feedback to users
- [ ] Implement circuit breaker pattern for external services
- [ ] Add error analytics dashboard
- [ ] Offline mode with queue for failed requests
- [ ] Better error recovery strategies
