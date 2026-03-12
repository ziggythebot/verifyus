'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ApplicantVerificationFlow from '../components/ApplicantVerificationFlow';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingSpinner from '../components/LoadingSpinner';

function VerifyContent() {
  const searchParams = useSearchParams();
  const jobTitle = searchParams.get('job');
  const companyName = searchParams.get('company');
  const redirectUrl = searchParams.get('redirect');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            US Residency Verification
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete your verification in 4 simple steps
          </p>
        </div>

        <ApplicantVerificationFlow
          jobTitle={jobTitle || undefined}
          companyName={companyName || undefined}
          redirectUrl={redirectUrl || undefined}
          onComplete={(verificationId) => {
            console.log('Verification completed:', verificationId);
          }}
        />
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <LoadingSpinner size="lg" text="Loading verification flow..." />
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </ErrorBoundary>
  );
}
