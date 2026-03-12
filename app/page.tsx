import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            VerifyUS
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Privacy-preserving US residency verification using zero-knowledge proofs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">🔐</div>
            <h2 className="text-xl font-semibold mb-2">Zero-Knowledge Proofs</h2>
            <p className="text-gray-600">
              Verify your US residency without revealing personal information using zkPass technology.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">🔄</div>
            <h2 className="text-xl font-semibold mb-2">Reusable Verification</h2>
            <p className="text-gray-600">
              Verify once, use everywhere. Save time on multiple applications with a single verification.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">⚡</div>
            <h2 className="text-xl font-semibold mb-2">Instant Results</h2>
            <p className="text-gray-600">
              Get verified in minutes, not days. Fast, secure, and privacy-first verification.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">🌐</div>
            <h2 className="text-xl font-semibold mb-2">Easy Integration</h2>
            <p className="text-gray-600">
              Simple embeddable widget for seamless integration into any platform.
            </p>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Link
            href="/verify"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Start Verification
          </Link>

          <div className="flex justify-center gap-4 text-sm">
            <Link href="/embed" className="text-blue-600 hover:underline">
              View Embed Demo
            </Link>
            <span className="text-gray-400">•</span>
            <a href="/examples/widget-demo.html" className="text-blue-600 hover:underline">
              Widget Example
            </a>
            <span className="text-gray-400">•</span>
            <a href="/docs/widget-embedding.md" className="text-blue-600 hover:underline">
              Documentation
            </a>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
              <div>
                <h3 className="font-semibold">Click "Start Verification"</h3>
                <p className="text-gray-600">Begin the verification process with zkPass TransGate</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
              <div>
                <h3 className="font-semibold">Complete zkPass Verification</h3>
                <p className="text-gray-600">Provide proof of US residency through secure zero-knowledge protocol</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
              <div>
                <h3 className="font-semibold">Get Verified</h3>
                <p className="text-gray-600">Receive instant verification that you can reuse across platforms</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
