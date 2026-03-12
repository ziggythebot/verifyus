'use client';

/**
 * zkPass Verification Component
 *
 * Client-side component for US residency verification using zkPass TransGate
 */

import { useState, useEffect } from 'react';
import { useZkPass } from '../../lib/hooks/useZkPass';
import type { Result } from '@zkpass/transgate-js-sdk/lib/types';

interface ZkPassVerificationProps {
  walletAddress?: string;
  onVerificationComplete?: (result: Result) => void;
  onVerificationError?: (error: Error) => void;
}

export default function ZkPassVerification({
  walletAddress,
  onVerificationComplete,
  onVerificationError,
}: ZkPassVerificationProps) {
  const [config, setConfig] = useState<{ appId: string; schemaId: string } | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  // Fetch zkPass configuration from API
  useEffect(() => {
    let mounted = true;

    const loadConfig = async () => {
      try {
        setIsLoadingConfig(true);
        setConfigError(null);

        const response = await fetch('/api/v1/zkpass/session');

        if (!response.ok) {
          throw new Error(`Failed to load configuration: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.appId || !data.schemaId) {
          throw new Error('Invalid configuration received from server');
        }

        if (mounted) {
          setConfig(data);
          setIsLoadingConfig(false);
        }
      } catch (error) {
        console.error('Failed to load zkPass config:', error);
        if (mounted) {
          setConfigError(
            error instanceof Error
              ? error.message
              : 'Failed to load verification configuration'
          );
          setIsLoadingConfig(false);
        }
      }
    };

    loadConfig();

    return () => {
      mounted = false;
    };
  }, [retryAttempt]);

  const {
    isLoading,
    isTransgateAvailable,
    error,
    result,
    launch,
    retryCount,
  } = useZkPass({
    appId: config?.appId || '',
    schemaId: config?.schemaId || '',
    onSuccess: async (result) => {
      console.log('zkPass verification successful:', result);

      // Submit proof to backend for verification
      try {
        setIsSubmitting(true);
        setSubmitError(null);

        const response = await fetch('/api/v1/zkpass/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            proof: result,
            schemaId: config?.schemaId,
            chainType: 'evm',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || errorData.message || `Server error: ${response.statusText}`
          );
        }

        const verificationData = await response.json();
        setVerificationResult(verificationData);
        setIsSubmitting(false);

        if (verificationData.valid && onVerificationComplete) {
          onVerificationComplete(result);
        } else if (!verificationData.valid) {
          const error = new Error('Proof verification failed on server');
          setSubmitError(error.message);
          if (onVerificationError) {
            onVerificationError(error);
          }
        }
      } catch (error) {
        console.error('Backend verification failed:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to verify proof with server';
        setSubmitError(errorMessage);
        setIsSubmitting(false);

        if (onVerificationError && error instanceof Error) {
          onVerificationError(error);
        }
      }
    },
    onError: (error) => {
      console.error('zkPass verification failed:', error);
      if (onVerificationError) {
        onVerificationError(error);
      }
    },
  });

  const handleVerify = async () => {
    if (!config) {
      console.error('zkPass config not loaded');
      return;
    }

    await launch(walletAddress);
  };

  const handleRetryConfig = () => {
    setRetryAttempt((prev) => prev + 1);
  };

  if (isLoadingConfig) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <div className="text-gray-600">Loading verification system...</div>
      </div>
    );
  }

  if (!config || configError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg space-y-3">
        <p className="text-red-800 font-medium">Failed to load zkPass configuration</p>
        <p className="text-red-600 text-sm">
          {configError || 'Please check your ZKPASS_APP_ID and ZKPASS_SCHEMA_ID environment variables.'}
        </p>
        <button
          onClick={handleRetryConfig}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">US Residency Verification</h2>

        <div className="space-y-4">
          {/* TransGate Status */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isTransgateAvailable ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            <span className="text-sm text-gray-600">
              TransGate {isTransgateAvailable ? 'Available' : 'Not Available'}
            </span>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading || isSubmitting || !isTransgateAvailable}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
              isLoading || isSubmitting || !isTransgateAvailable
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {(isLoading || isSubmitting) && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            )}
            <span>
              {isLoading
                ? 'Generating Proof...'
                : isSubmitting
                ? 'Verifying with Server...'
                : 'Verify US Residency'}
            </span>
          </button>

          {retryCount > 0 && !isLoading && error && (
            <p className="text-xs text-gray-500 text-center">
              Retry attempt {retryCount}
            </p>
          )}

          {/* Error Display */}
          {(error || submitError) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
              <div>
                <p className="text-red-800 font-medium">Verification Failed</p>
                <p className="text-red-600 text-sm mt-1">
                  {(error as any)?.userMessage || error?.message || submitError}
                </p>
              </div>

              {/* Error-specific help */}
              {error && !isTransgateAvailable && (
                <div className="text-xs text-red-700 bg-red-100 p-2 rounded">
                  Make sure the zkPass TransGate extension is installed and enabled in your browser.
                </div>
              )}

              {/* Retry button */}
              <button
                onClick={handleVerify}
                disabled={isLoading || isSubmitting}
                className="w-full px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:bg-gray-400"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Success Display */}
          {verificationResult?.valid && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✓ Verification Successful</p>
              <p className="text-green-700 text-sm mt-1">
                Your US residency has been verified.
              </p>

              {verificationResult.publicFields && (
                <div className="mt-3 p-3 bg-white rounded border border-green-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">Public Fields:</p>
                  <pre className="text-xs text-gray-800 overflow-auto">
                    {JSON.stringify(verificationResult.publicFields, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• zkPass uses zero-knowledge proofs to verify your US residency</p>
            <p>• Your personal information remains private</p>
            <p>• Only verification status is shared with the application</p>
          </div>
        </div>
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && result && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-medium text-gray-600 mb-2">Debug Info:</p>
          <pre className="text-xs text-gray-800 overflow-auto max-h-64">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
