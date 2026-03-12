'use client';

import ZkPassVerification from '../components/ZkPassVerification';

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            US Residency Verification
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Verify your US residency using zero-knowledge proofs
          </p>
        </div>

        <ZkPassVerification
          onVerificationComplete={(result) => {
            console.log('Verification completed:', result);
          }}
          onVerificationError={(error) => {
            console.error('Verification error:', error);
          }}
        />
      </div>
    </div>
  );
}
