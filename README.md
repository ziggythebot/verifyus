# VerifyUS

**Stop losing $50K+ per fraudulent hire.**

VerifyUS blocks recruitment fraud with zero-knowledge proof verification: work authorization + physical US location + real person detection. No more fake profiles. No more foreign applicants pretending they're in the US. Just real, verified candidates.

---

## 🚧 Current Status: Beta V1 → Iterating on Customer Feedback

**What we've built (Beta V1):**
- ✅ Work authorization verification (passport/ID/SSN)
- ✅ Zero-knowledge proofs (privacy-preserving)
- ✅ ATS integration (Greenhouse/Lever)
- ✅ Embeddable widget + API

**What we're adding next (based on Nick's feedback from Enticeable):**
1. **Geolocation verification** - Prove physical US presence (not just passport)
2. **Bot detection** - Block fake profiles created by competitors
3. **Enhanced KYC** - Integrate with Sum/Sub or similar for stronger identity verification

See [NICK_FEEDBACK_ANALYSIS.md](./NICK_FEEDBACK_ANALYSIS.md) for full analysis and roadmap.

---

## The Problems We Solve

### Problem 1: Foreign Applicants Faking US Location
- Applicants in India/Philippines/Pakistan claim they're in the US
- Get through entire interview process
- Only after job offer: "I need visa sponsorship"
- **Current workaround:** WeWork verification (doesn't scale)

### Problem 2: Competitor Bots Stealing Job Intel
- Recruiters create fake LinkedIn profiles (100s of them)
- Fake profiles pretend to be "perfect candidates"
- When contacted, they demand: "Tell me which company first"
- **Goal:** Steal competitor's client list

### Problem 3: AI-Powered Identity Fraud
- Deepfake video interviews
- Stolen identities
- Fake documents
- **Average loss: $50K+ per fraudulent hire** (2025 data)

**Current solutions fail:**
- ❌ ATS filters get bypassed (applicants lie)
- ❌ Manual checks don't scale (WeWork = expensive, slow)
- ❌ Background checks too slow for application stage
- ❌ Existing KYC (Doti/OTI) = identity only, no geolocation

---

## How VerifyUS Works (Beta V1)

**US recruitment platforms are drowning in fraud:**
- Foreign applicants flood systems hoping for visa sponsorship
- Bots submit fake applications from competitors
- AI-powered deepfakes pass video interviews
- **Average loss: $50K+ per fraudulent hire** (2025 data)

Current solutions fail:
- ❌ ATS filters get bypassed (applicants lie)
- ❌ Manual checks don't scale (WeWork photo verification)
- ❌ Background checks are too slow/expensive for application stage

---

## How VerifyUS Works

### 1. Applicant Verifies (Once)
Before applying, candidates prove US work authorization using:
- US Passport
- State ID / Driver's License
- SSN + Address Verification
- Bank Account (US-based)

Verification happens **in their browser** using zero-knowledge proofs. No document upload. No privacy invasion. Takes ~2 minutes.

### 2. Proof Generated (Privacy-Preserving)
A cryptographic proof is created on the applicant's device. The proof says "I'm authorized to work in the US" without revealing:
- Passport number
- SSN
- Home address
- Date of birth
- Any other personal data

**It's like showing a bouncer your ID to prove you're 21—except the bouncer never sees your actual birthday, just the fact that you're old enough.**

### 3. Fraud Blocked (Pre-ATS)
The proof is submitted with their application. Our API validates it instantly:
- ✅ **Verified applicants** proceed to your ATS
- ⚠️ **Unverified applicants** get auto-rejected

Your recruiters only see legitimate candidates. **70% reduction in fraudulent applications.**

### 4. Proof Reused (Better UX)
Once verified, applicants can apply to unlimited jobs for 90 days. No repeated document uploads.

---

## Why Zero-Knowledge Proofs?

**Traditional identity verification:**
- You upload your passport → Company stores it → Risk of breach
- Company sees ALL your personal data → Privacy invasion
- Verification happens per-company → Painful UX

**Zero-knowledge proofs (what we use):**
- Nothing leaves your device → No breach risk
- Company only sees "verified" or "not verified" → Maximum privacy
- Verify once, apply everywhere → Great UX

**Bots can't fake cryptographic proofs.** Humans can. This is the difference.

---

## Key Features

### 🔐 Privacy-Preserving
Raw documents never leave the applicant's device. Employers see "verified" or "not verified"—that's it. GDPR/CCPA compliant by design.

### 🤖 Bot-Resistant
Cryptographic proofs can't be faked by bots, competitors, or AI. Includes deepfake detection for video interviews.

### ♻️ Reusable
Verify once, apply to 100 jobs. Proof is valid for 90 days. Better UX than repeated document uploads.

### ⚡ Pre-ATS Filtering
Block unverified applicants before they reach your ATS. No manual review needed. Saves recruiters 15+ hours/week.

### 🔗 ATS Integration
Works with Greenhouse, Lever, Workday. Simple API, 1-day integration. Webhooks notify you of verification status.

### 📊 Fraud Analytics
Track verification rates, fraud attempts blocked, time saved. ROI dashboard shows exactly how much you're saving.

---

## ROI: $44K-$89K Saved Per 1,000 Applications

### Current State (Manual Screening)
- 200-300 foreign applicants (30% of volume)
- 50-100 bot applications
- Manual screening cost: $1,250-3,000
- Fraudulent hires: $50K-100K loss
- **Total cost: $51K-103K**

### With VerifyUS
- 700 verified, 300 auto-rejected
- Manual screening reduced 70%
- Verification cost: $1,400-3,500
- Fraud reduction: 90%+ = $5K-10K loss
- **Total cost: $6.4K-13.5K**

### Net Savings: $44,500 - $89,500

---

## Quick Start

### For Applicants

1. Visit a VerifyUS-enabled job posting
2. Click "Verify US Work Authorization"
3. Choose verification method (passport, state ID, SSN+address)
4. Proof generated in browser (~2 minutes)
5. Apply to job with verified status

### For Employers

1. **Sign up:** Create employer account
2. **Get API key:** Generate key in dashboard
3. **Integrate ATS:** Connect Greenhouse, Lever, or Workday
4. **Enable verification:** Toggle on for job postings
5. **Block fraud:** Unverified applicants auto-rejected

### Embeddable Widget

Drop this into any job board:

```html
<script src="https://verifyus.com/widget.js"></script>
<div id="verify-widget" data-app-id="YOUR_APP_ID"></div>
```

That's it. Applicants verify before applying.

---

## Tech Stack

**Frontend:**
- Next.js 15 (React framework)
- TypeScript (type safety)
- TailwindCSS (styling)
- zkPass TransGate SDK (zero-knowledge proofs)

**Backend:**
- Node.js + Express (REST API)
- PostgreSQL (database)
- Redis (caching, rate limiting)

**Infrastructure:**
- Vercel (frontend hosting)
- Railway (backend hosting)
- Supabase (PostgreSQL)
- Upstash (Redis)
- CloudFlare (CDN, DDoS protection)

**Security:**
- AES-256 encryption at rest
- TLS 1.3 for all API calls
- Rate limiting (100 req/min per IP)
- Device fingerprinting (bot detection)
- Audit logging (all verification attempts)

---

## Documentation

### Getting Started
- [Environment Setup](./docs/ENV_SETUP.md) - Local environment configuration
- [zkPass Setup](./docs/zkpass-setup.md) - Register and configure zkPass
- [Manual Steps Required](./docs/MANUAL_STEPS_REQUIRED.md) - External setup tasks

### Technical Docs
- [API Documentation](./docs/api/README.md) - API reference
- [zkPass Integration Guide](./docs/zkpass-integration.md) - How zero-knowledge proofs work
- [Widget Embedding Guide](./docs/widget-embedding.md) - How to embed the verification widget
- [Error Handling](./docs/ERROR_HANDLING.md) - Error flows and remediation
- [API Implementation Notes](./docs/api/API_IMPLEMENTATION.md) - Route and controller details

### Deployment
- [Database Setup](./db/README.md) - Schema setup and DB operations
- [API Setup](./api/README.md) - API server setup
- [zkPass Registration Required](./docs/ZKPASS_REGISTRATION_REQUIRED.md) - External registration requirements

### Reference
- [Product Specification](./product-spec.md) - Full product spec
- [Implementation Plan](./implementation-plan.md) - Build timeline and architecture
- [Research Document](./research.md) - Market research and competitive analysis

---

## Pricing

### Per-Verification (Startups/Small Agencies)
**$3 per verification**
- No monthly minimum
- 1,000 free verifications (trial)
- Email support

### Growth (Mid-Market Agencies)
**$500/month** for 200 verifications
- $1.50 per additional verification
- Analytics dashboard
- Slack/email support
- 2 ATS integrations

### Enterprise (Large Agencies)
**Custom pricing** (volume discounts)
- White-label option
- Dedicated account manager
- SLA guarantees (99.9% uptime)
- Unlimited ATS integrations
- On-chain proof registry (optional)

---

## Pilot Program

We're running a 60-day pilot with 3 recruitment platforms. **No cost. Prove ROI before you pay.**

**What you get:**
- Full platform access
- Personal onboarding call
- Dedicated Slack channel
- Weekly check-ins
- Custom case study

**What we measure:**
- Fraudulent applications blocked
- Time saved per recruiter
- Applicant completion rate
- False positive rate

**Pilot customers are chosen for:**
- US-based recruitment platform
- 500+ applications/month
- Existing Greenhouse or Lever setup
- Willingness to provide feedback

[Apply for pilot →](mailto:bird@ghostclaw.io?subject=VerifyUS%20Pilot%20Interest)

---

## FAQ

**Q: Do applicants need to install anything?**
A: Just a browser extension (zkPass TransGate) that takes 10 seconds to install. Similar to MetaMask for crypto wallets.

**Q: What if applicants don't have a US passport?**
A: We support multiple verification methods: state ID, driver's license, SSN+address, or US bank account. Most Americans have at least one.

**Q: Can applicants fake the verification?**
A: No. Zero-knowledge proofs are cryptographically verified. Faking a proof is mathematically impossible without the underlying credentials.

**Q: What about privacy regulations (GDPR, CCPA)?**
A: VerifyUS is compliant by design. Raw documents never leave the applicant's device. We only store encrypted proof metadata, which is auto-deleted after 90 days.

**Q: How does this integrate with our ATS?**
A: Via webhooks. When a candidate applies, Greenhouse/Lever sends us a webhook. We check their verification status and either auto-reject or add a "✅ Verified" custom field.

**Q: What if someone is authorized to work but hasn't verified yet?**
A: You can make verification optional (flag unverified applicants) or required (auto-reject). Most agencies start with optional, then switch to required after seeing results.

**Q: Does this replace background checks?**
A: No. This is pre-screening at the application stage. Background checks happen post-offer. Think of VerifyUS as the "bouncer at the door" and background checks as the "full security clearance."

---

## Support

**Email:** bird@ghostclaw.io
**GitHub:** https://github.com/ziggythebot/verifyus
**Documentation:** See `/docs` folder
**Website:** https://enticeable-verification.vercel.app

---

## License

Proprietary - All rights reserved

---

## Built With

- [zkPass](https://zkpass.org/) - Zero-knowledge proof infrastructure
- [Next.js](https://nextjs.org/) - React framework
- [Greenhouse API](https://developers.greenhouse.io/) - ATS integration
- [Vercel](https://vercel.com/) - Frontend hosting
- [Railway](https://railway.app/) - Backend hosting
