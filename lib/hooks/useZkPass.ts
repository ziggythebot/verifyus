'use client';

/**
 * React Hook for zkPass TransGate Integration
 *
 * This hook provides client-side functionality for launching zkPass verification
 * and handling the proof generation process with enhanced error handling.
 */

import { useState, useCallback, useEffect } from 'react';
import TransgateConnect from '@zkpass/transgate-js-sdk';
import type { Result } from '@zkpass/transgate-js-sdk/lib/types';
import { getUserFriendlyErrorMessage } from '../utils/errorHandling';

export interface UseZkPassOptions {
  appId: string;
  schemaId: string;
  onSuccess?: (result: Result) => void;
  onError?: (error: Error) => void;
}

export interface UseZkPassReturn {
  isLoading: boolean;
  isTransgateAvailable: boolean;
  error: Error | null;
  result: Result | null;
  launch: (walletAddress?: string) => Promise<void>;
  reset: () => void;
  retryCount: number;
}

/**
 * Hook for zkPass TransGate integration
 *
 * @example
 * ```tsx
 * const { launch, isLoading, result, error, retryCount } = useZkPass({
 *   appId: 'your-app-id',
 *   schemaId: 'your-schema-id',
 *   onSuccess: (result) => console.log('Verification successful:', result),
 *   onError: (error) => console.error('Verification failed:', error),
 * });
 *
 * // Launch verification
 * await launch('0x1234...');
 * ```
 */
export function useZkPass({
  appId,
  schemaId,
  onSuccess,
  onError,
}: UseZkPassOptions): UseZkPassReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isTransgateAvailable, setIsTransgateAvailable] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [client] = useState(() => new TransgateConnect(appId));

  // Check if TransGate is available
  useEffect(() => {
    let mounted = true;

    client
      .isTransgateAvailable()
      .then((available) => {
        if (mounted) {
          setIsTransgateAvailable(available);
        }
      })
      .catch((err) => {
        console.error('Failed to check TransGate availability:', err);
        if (mounted) {
          setIsTransgateAvailable(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [client]);

  const launch = useCallback(
    async (walletAddress?: string) => {
      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        // Validate inputs
        if (!appId || !schemaId) {
          throw new Error('zkPass configuration is incomplete. Please check your setup.');
        }

        if (!isTransgateAvailable) {
          throw new Error(
            'TransGate extension is not available. Please install the zkPass TransGate extension and try again.'
          );
        }

        // Launch TransGate verification
        const verificationResult = await client.launch(schemaId, walletAddress);

        if (!verificationResult) {
          throw new Error('Verification failed: No result received from TransGate.');
        }

        const resultData = verificationResult as Result;
        setResult(resultData);
        setRetryCount(0);

        // Call success callback
        if (onSuccess) {
          onSuccess(resultData);
        }
      } catch (err) {
        // Enhanced error handling
        let error: Error;

        if (err instanceof Error) {
          error = err;
        } else if (typeof err === 'string') {
          error = new Error(err);
        } else {
          error = new Error('Unknown error occurred during verification');
        }

        // Add user-friendly message if not already present
        const userMessage = getUserFriendlyErrorMessage(error);
        if (userMessage !== error.message) {
          (error as any).userMessage = userMessage;
        }

        setError(error);
        setRetryCount((prev) => prev + 1);

        // Call error callback
        if (onError) {
          onError(error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [client, schemaId, appId, isTransgateAvailable, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
    setRetryCount(0);
  }, []);

  return {
    isLoading,
    isTransgateAvailable,
    error,
    result,
    launch,
    reset,
    retryCount,
  };
}
