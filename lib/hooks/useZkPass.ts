'use client';

/**
 * React Hook for zkPass TransGate Integration
 *
 * This hook provides client-side functionality for launching zkPass verification
 * and handling the proof generation process.
 */

import { useState, useCallback } from 'react';
import TransgateConnect from '@zkpass/transgate-js-sdk';
import type { Result } from '@zkpass/transgate-js-sdk/lib/types';

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
}

/**
 * Hook for zkPass TransGate integration
 *
 * @example
 * ```tsx
 * const { launch, isLoading, result, error } = useZkPass({
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
  const [client] = useState(() => new TransgateConnect(appId));

  // Check if TransGate is available
  useState(() => {
    client.isTransgateAvailable().then(setIsTransgateAvailable);
  });

  const launch = useCallback(
    async (walletAddress?: string) => {
      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        // Launch TransGate verification
        const verificationResult = await client.launch(schemaId, walletAddress);

        const resultData = verificationResult as Result;
        setResult(resultData);

        // Call success callback
        if (onSuccess) {
          onSuccess(resultData);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);

        // Call error callback
        if (onError) {
          onError(error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [client, schemaId, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    isLoading,
    isTransgateAvailable,
    error,
    result,
    launch,
    reset,
  };
}
