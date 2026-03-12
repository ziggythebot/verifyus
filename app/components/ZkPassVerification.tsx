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
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Fetch zkPass configuration from API
  useEffect(() => {
    fetch('/api/v1/zkpass/session')
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setIsLoadingConfig(false);
      })
      .catch((error) => {
        console.error('Failed to load zkPass config:', error);
        setIsLoadingConfig(false);
      });
  }, []);

  const {
    isLoading,
    isTransgateAvailable,
    error,
    result,
    launch,
  } = useZkPass({
    appId: config?.appId || '',
    schemaId: config?.schemaId || '',
    onSuccess: async (result) => {
      console.log('zkPass verification successful:', result);

      // Submit proof to backend for verification
      try {
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

        const verificationData = await response.json();
        setVerificationResult(verificationData);

        if (verificationData.valid && onVerificationComplete) {
          onVerificationComplete(result);
        }
      } catch (error) {
        console.error('Backend verification failed:', error);
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

  if (isLoadingConfig) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-gray-600">Loading verification system...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Failed to load zkPass configuration.</p>
        <p className="text-red-600 text-sm mt-2">
          Please check your ZKPASS_APP_ID and ZKPASS_SCHEMA_ID environment variables.
        </p>
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
            disabled={isLoading || !isTransgateAvailable}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
              isLoading || !isTransgateAvailable
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Verifying...' : 'Verify US Residency'}
          </button>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Verification Failed</p>
              <p className="text-red-600 text-sm mt-1">{error.message}</p>
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
