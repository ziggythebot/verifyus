'use client';

/**
 * Embeddable Verification Widget Page
 *
 * This page is designed to be embedded in an iframe on external sites.
 * It renders only the verification widget without any surrounding UI.
 */

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ZkPassVerification from '../components/ZkPassVerification';
import type { Result } from '@zkpass/transgate-js-sdk/lib/types';

function EmbedContent() {
  const searchParams = useSearchParams();
  const walletAddress = searchParams.get('wallet');
  const origin = searchParams.get('origin');

  const handleVerificationComplete = (result: Result) => {
    // Post message to parent window (if embedded in iframe)
    if (window.parent && origin) {
      window.parent.postMessage(
        {
          type: 'VERIFICATION_COMPLETE',
          result,
        },
        origin
      );
    }
  };

  const handleVerificationError = (error: Error) => {
    // Post message to parent window (if embedded in iframe)
    if (window.parent && origin) {
      window.parent.postMessage(
        {
          type: 'VERIFICATION_ERROR',
          error: {
            message: error.message,
            name: error.name,
          },
        },
        origin
      );
    }
  };

  return (
    <div className="p-4">
      <ZkPassVerification
        walletAddress={walletAddress || undefined}
        onVerificationComplete={handleVerificationComplete}
        onVerificationError={handleVerificationError}
      />
    </div>
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <EmbedContent />
    </Suspense>
  );
}
