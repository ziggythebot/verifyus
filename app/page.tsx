import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-slate-800 text-emerald-400 font-mono text-sm rounded">
            [SYSTEM] :: FRAUD_PREVENTION_PLATFORM
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Stop wasting hours on fake applicants
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            VerifyUS filters bot applications and verifies US work authorization before applications reach your ATS.
            Save your team 10+ hours per role. Prevent fraudulent hires.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hello@verifyus.dev?subject=Pilot%20Interest"
              className="inline-block bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-slate-800 transition-colors shadow-lg"
            >
              Request Pilot
            </a>
            <Link
              href="/verify"
              className="inline-block bg-white text-slate-900 border-2 border-slate-300 px-8 py-4 rounded-lg font-semibold text-lg hover:border-slate-400 transition-colors"
            >
              View Demo Flow
            </Link>
          </div>
        </div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="font-mono text-sm text-slate-500 mb-2">[THREAT_01]</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Bot Farms</h3>
            <p className="text-slate-600 text-sm">
              Mass-generated applications designed to overwhelm your team. One bot net can submit 400+ fake resumes in a weekend.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="font-mono text-sm text-slate-500 mb-2">[THREAT_02]</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">VPN Abuse</h3>
            <p className="text-slate-600 text-sm">
              Foreign applicants masking location to appear US-based. Your team screens candidates who can't legally work here.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="font-mono text-sm text-slate-500 mb-2">[THREAT_03]</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Identity Fraud</h3>
            <p className="text-slate-600 text-sm">
              Stolen or fake credentials that pass initial checks. The $50K+ fraudulent hire that makes it through screening.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-16">
          <div className="font-mono text-sm text-emerald-600 mb-2">[MODULE_02] :: INTEGRATION</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Custom Integration for Your Stack</h2>
          <p className="text-slate-600 mb-8">
            We build a verification flow tailored to your ATS and hiring process. No off-the-shelf widget. No forced workflows. Just fraud prevention that fits how you actually hire.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-mono font-bold">01</div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">We integrate with your ATS</h3>
                <p className="text-slate-600 text-sm">Greenhouse, Lever, Workday, or custom system. Webhook or API. We handle the integration.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-mono font-bold">02</div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Applicants verify before submission</h3>
                <p className="text-slate-600 text-sm">AI screening, IP checks, work authorization, or full KYC — you choose the verification tier per role.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-mono font-bold">03</div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Your team sees clean pipelines</h3>
                <p className="text-slate-600 text-sm">Bots blocked. Fraud flagged. Only verified candidates reach your recruiters.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modular Approach */}
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-8 mb-16">
          <div className="font-mono text-sm text-emerald-600 mb-2">[MODULE_03] :: MODULAR_VERIFICATION</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Choose your verification depth</h2>
          <p className="text-slate-600 mb-6">
            Different roles need different verification levels. We build a system that lets you decide what checks to run per position.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-2">LLM-Led Screening</h3>
              <p className="text-slate-600 text-sm mb-4">
                AI analyzes LinkedIn, resume, application form, and basic fraud signals. Fast and cheap. Good for volume roles.
              </p>
              <div className="font-mono text-xs text-slate-500">COST: Variable per role</div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-2">Full KYC Verification</h3>
              <p className="text-slate-600 text-sm mb-4">
                Government ID, liveness detection, address verification, VPN checks. For high-stakes roles or flagged candidates.
              </p>
              <div className="font-mono text-xs text-slate-500">COST: Variable per role</div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-16">
          <div className="font-mono text-sm text-emerald-600 mb-4">[FIELD_REPORT] :: PILOT_RESULTS</div>
          <blockquote className="text-lg text-slate-700 mb-4 italic">
            "We got hit with 400+ bot applications over a weekend. Our recruiter would've drowned.
            VerifyUS blocked every single one. We deployed it globally that afternoon."
          </blockquote>
          <div className="font-mono text-sm text-slate-500">
            — VP Engineering, Enticeable<br/>
            METRIC: 63% BOT_DETECTION_RATE ACROSS 2,000+ APPS
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-slate-900 rounded-lg p-12">
          <div className="font-mono text-sm text-emerald-400 mb-4">[FINAL_DIRECTIVE] :: REQUEST_PILOT</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Run a pilot on your next role
          </h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            We'll integrate with your ATS, configure verification for one position, and show you the bots we block in real-time.
            No contracts. No upfront costs.
          </p>
          <a
            href="mailto:hello@verifyus.dev?subject=Pilot%20Request"
            className="inline-block bg-emerald-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-600 transition-colors shadow-lg"
          >
            Request Pilot Access
          </a>
        </div>
      </div>
    </div>
  );
}
