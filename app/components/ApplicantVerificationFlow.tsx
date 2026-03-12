'use client';

/**
 * Complete Applicant Verification Flow
 *
 * Multi-step UI that guides applicants through the verification process:
 * 1. Welcome/Information
 * 2. Consent & Privacy
 * 3. zkPass Verification
 * 4. Success/Next Steps
 */

import { useState } from 'react';
import ZkPassVerification from './ZkPassVerification';
import type { Result } from '@zkpass/transgate-js-sdk/lib/types';

type FlowStep = 'welcome' | 'consent' | 'verify' | 'success' | 'error';

interface ApplicantVerificationFlowProps {
  /** Optional job title being applied for */
  jobTitle?: string;
  /** Optional company name */
  companyName?: string;
  /** Callback when verification completes successfully */
  onComplete?: (verificationId: string) => void;
  /** Optional redirect URL after completion */
  redirectUrl?: string;
}

export default function ApplicantVerificationFlow({
  jobTitle,
  companyName,
  onComplete,
  redirectUrl,
}: ApplicantVerificationFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('welcome');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerificationComplete = async (result: Result) => {
    try {
      // Submit to backend to get verification ID
      const response = await fetch('/api/v1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proof: result,
          metadata: {
            jobTitle,
            companyName,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save verification');
      }

      const data = await response.json();
      setVerificationId(data.verificationId);
      setCurrentStep('success');

      if (onComplete) {
        onComplete(data.verificationId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setCurrentStep('error');
    }
  };

  const handleVerificationError = (err: Error) => {
    setError(err.message);
    setCurrentStep('error');
  };

  const handleRetry = () => {
    setError(null);
    setCurrentStep('verify');
  };

  const handleRedirect = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <StepIndicator step={1} label="Welcome" active={currentStep === 'welcome'} completed={['consent', 'verify', 'success'].includes(currentStep)} />
          <div className="flex-1 h-1 mx-2 bg-gray-200">
            <div
              className={`h-full bg-blue-600 transition-all duration-300 ${
                ['consent', 'verify', 'success'].includes(currentStep) ? 'w-full' : 'w-0'
              }`}
            />
          </div>
          <StepIndicator step={2} label="Consent" active={currentStep === 'consent'} completed={['verify', 'success'].includes(currentStep)} />
          <div className="flex-1 h-1 mx-2 bg-gray-200">
            <div
              className={`h-full bg-blue-600 transition-all duration-300 ${
                ['verify', 'success'].includes(currentStep) ? 'w-full' : 'w-0'
              }`}
            />
          </div>
          <StepIndicator step={3} label="Verify" active={currentStep === 'verify'} completed={currentStep === 'success'} />
          <div className="flex-1 h-1 mx-2 bg-gray-200">
            <div
              className={`h-full bg-blue-600 transition-all duration-300 ${
                currentStep === 'success' ? 'w-full' : 'w-0'
              }`}
            />
          </div>
          <StepIndicator step={4} label="Complete" active={currentStep === 'success'} completed={currentStep === 'success'} />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {currentStep === 'welcome' && (
          <WelcomeStep
            jobTitle={jobTitle}
            companyName={companyName}
            onNext={() => setCurrentStep('consent')}
          />
        )}

        {currentStep === 'consent' && (
          <ConsentStep
            onNext={() => setCurrentStep('verify')}
            onBack={() => setCurrentStep('welcome')}
          />
        )}

        {currentStep === 'verify' && (
          <VerifyStep
            onVerificationComplete={handleVerificationComplete}
            onVerificationError={handleVerificationError}
            onBack={() => setCurrentStep('consent')}
          />
        )}

        {currentStep === 'success' && (
          <SuccessStep
            verificationId={verificationId!}
            jobTitle={jobTitle}
            onRedirect={redirectUrl ? handleRedirect : undefined}
          />
        )}

        {currentStep === 'error' && (
          <ErrorStep
            error={error!}
            onRetry={handleRetry}
            onBack={() => setCurrentStep('welcome')}
          />
        )}
      </div>
    </div>
  );
}

function StepIndicator({
  step,
  label,
  active,
  completed,
}: {
  step: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
          completed
            ? 'bg-green-600 text-white'
            : active
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        {completed ? '✓' : step}
      </div>
      <span className={`text-xs mt-1 ${active ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}

function WelcomeStep({
  jobTitle,
  companyName,
  onNext,
}: {
  jobTitle?: string;
  companyName?: string;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to US Residency Verification
        </h2>
        {jobTitle && companyName && (
          <p className="text-gray-600">
            Required for: <span className="font-medium">{jobTitle}</span> at{' '}
            <span className="font-medium">{companyName}</span>
          </p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">What to expect:</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">🔐</span>
            <span>Secure verification using zero-knowledge proofs</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">⚡</span>
            <span>Process takes 2-3 minutes</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🔄</span>
            <span>One-time verification, reusable for future applications</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🛡️</span>
            <span>Your personal data stays private and encrypted</span>
          </li>
        </ul>
      </div>

      <div className="space-y-3 text-sm text-gray-600">
        <p className="font-medium">You'll need:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Valid US government-issued ID or documentation</li>
          <li>Access to verify your identity via zkPass</li>
          <li>About 3 minutes of uninterrupted time</li>
        </ul>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Continue to Privacy & Consent
      </button>
    </div>
  );
}

function ConsentStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const canProceed = agreedToTerms && agreedToPrivacy;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy & Consent</h2>
        <p className="text-gray-600">Please review and agree to continue</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">How we protect your privacy:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Zero-knowledge proofs verify your status without revealing personal details</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>We only store encrypted verification proofs, not your documents</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Employers only see verification status (verified/not verified)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>You control when and where your verification is used</span>
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-300">
          <h3 className="font-semibold text-gray-900 mb-2">What we collect:</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Verification status (verified/not verified)</li>
            <li>• Encrypted proof data (zkPass proof)</li>
            <li>• Timestamp of verification</li>
            <li>• Application metadata (job/company if provided)</li>
          </ul>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            I agree to the{' '}
            <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
              Terms of Service
            </a>{' '}
            and understand how my verification will be used
          </span>
        </label>

        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToPrivacy}
            onChange={(e) => setAgreedToPrivacy(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            I have read and agree to the{' '}
            <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
              Privacy Policy
            </a>
          </span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
            canProceed
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          I Agree - Continue to Verification
        </button>
      </div>
    </div>
  );
}

function VerifyStep({
  onVerificationComplete,
  onVerificationError,
  onBack,
}: {
  onVerificationComplete: (result: Result) => void;
  onVerificationError: (error: Error) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your US Residency</h2>
        <p className="text-gray-600">
          Click the button below to start the verification process
        </p>
      </div>

      <ZkPassVerification
        onVerificationComplete={onVerificationComplete}
        onVerificationError={onVerificationError}
      />

      <button
        onClick={onBack}
        className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
      >
        Back
      </button>
    </div>
  );
}

function SuccessStep({
  verificationId,
  jobTitle,
  onRedirect,
}: {
  verificationId: string;
  jobTitle?: string;
  onRedirect?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(verificationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Complete!</h2>
        <p className="text-gray-600">
          Your US residency has been successfully verified
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-sm text-green-800 font-medium">Verification ID</p>
            <p className="text-xs text-green-600 font-mono mt-1">{verificationId}</p>
          </div>
          <button
            onClick={handleCopyId}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="text-left text-sm text-green-800 space-y-1">
          <p>✓ Valid for 90 days</p>
          <p>✓ Reusable across multiple applications</p>
          <p>✓ Encrypted and secure</p>
        </div>
      </div>

      {jobTitle && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Next step:</strong> Return to your application for{' '}
            <span className="font-semibold">{jobTitle}</span>
          </p>
        </div>
      )}

      <div className="space-y-3">
        {onRedirect && (
          <button
            onClick={onRedirect}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Return to Application
          </button>
        )}

        <a
          href="/dashboard"
          className="block w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          View My Dashboard
        </a>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Need help? Contact{' '}
          <a href="mailto:support@verifyus.example.com" className="text-blue-600 hover:underline">
            support@verifyus.example.com
          </a>
        </p>
      </div>
    </div>
  );
}

function ErrorStep({
  error,
  onRetry,
  onBack,
}: {
  error: string;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
        <p className="text-gray-600">We encountered an issue during verification</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800 font-medium mb-2">Error details:</p>
        <p className="text-sm text-red-600">{error}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
        <p className="text-sm font-medium text-blue-900 mb-2">Common solutions:</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Make sure you have a stable internet connection</li>
          <li>• Check that you're using a supported browser (Chrome, Firefox, Safari)</li>
          <li>• Ensure you have the necessary documentation ready</li>
          <li>• Try disabling browser extensions that might interfere</li>
        </ul>
      </div>

      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>

        <button
          onClick={onBack}
          className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Start Over
        </button>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Still having trouble?{' '}
          <a href="mailto:support@verifyus.example.com" className="text-blue-600 hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
