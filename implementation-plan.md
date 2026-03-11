# VerifyUS - Full Implementation Plan

## Decision: Hybrid (Off-Chain + Optional On-Chain)

**TL;DR:** Build primarily **off-chain** for simplicity and cost, with **optional on-chain proof registry** for auditability.

### Why Hybrid?

✅ **Off-chain for UX** — Applicants verify in browser (1-2 sec), no wallet, no gas fees, no blockchain confusion
✅ **On-chain for trust** — Employers can verify proofs are real (cryptographically verifiable on blockchain if needed)
✅ **Cost-effective** — Free for applicants, cheap for employers ($0.01-0.05 per verification)
✅ **Simple for end users** — No crypto knowledge required, feels like normal web app

### Architecture

```
Applicant → zkPass Browser Extension → Proof Generated (client-side)
                                              ↓
                                    VerifyUS API (off-chain validation)
                                              ↓
                           ┌──────────────────┴──────────────────┐
                           ↓                                     ↓
                    ATS Integration                    (Optional) Blockchain Registry
                    (Greenhouse, Lever)                 (Immutable audit trail)
```

---

## Phase 1: MVP (Off-Chain Only) — 4 Weeks

**Goal:** Prove the concept works with manual integrations, no blockchain complexity.

### Week 1: zkPass Integration + Basic API

**Tech stack:**
- **Frontend:** Next.js + React (applicant verification widget)
- **Backend:** Node.js/TypeScript + Express (REST API)
- **Database:** PostgreSQL (proof metadata, applicant records)
- **ZK Layer:** zkPass TransGate SDK (browser extension)

**Deliverables:**

1. **zkPass Schema Setup**
   - Register project on zkPass DevHub
   - Create schema for US residency verification
   - Test with passport, state ID, SSN+address

2. **Applicant Verification Widget**
   ```typescript
   // Next.js component
   import { TransgateConnect } from '@zkpass/transgate-js-sdk'

   function VerificationWidget() {
     const connector = new TransgateConnect(APP_ID)

     const handleVerify = async () => {
       // Check if TransGate extension installed
       const isAvailable = await connector.isTransgateAvailable()

       // Launch verification flow
       const proof = await connector.launch(SCHEMA_ID)

       // Submit proof to VerifyUS API
       await submitProof(proof)
     }
   }
   ```

3. **REST API**
   ```typescript
   // Express endpoints
   POST /api/v1/verify - Submit ZK proof for validation
   GET  /api/v1/verify/:applicant_id - Check verification status
   POST /api/v1/webhooks/verified - Webhook for ATS integration
   ```

4. **Database Schema**
   ```sql
   -- Applicants
   CREATE TABLE applicants (
     id UUID PRIMARY KEY,
     email VARCHAR(255) UNIQUE,
     created_at TIMESTAMP,
     last_verified_at TIMESTAMP
   );

   -- Proofs (stored encrypted)
   CREATE TABLE proofs (
     id UUID PRIMARY KEY,
     applicant_id UUID REFERENCES applicants(id),
     proof_data TEXT, -- Encrypted ZK proof
     proof_type VARCHAR(50), -- 'us_passport', 'state_id', etc.
     verified_at TIMESTAMP,
     expires_at TIMESTAMP,
     confidence_score DECIMAL(3,2)
   );

   -- Verifications (audit log)
   CREATE TABLE verifications (
     id UUID PRIMARY KEY,
     applicant_id UUID,
     employer_id UUID,
     job_id VARCHAR(255),
     verified BOOLEAN,
     verified_at TIMESTAMP
   );
   ```

**Week 1 Deliverable:** Working verification widget that generates ZK proofs + API that validates them.

---

### Week 2: Employer Dashboard + Greenhouse Integration

**Deliverables:**

1. **Employer Admin Dashboard**
   - Login/auth (email + password, no crypto)
   - API key generation
   - Verification stats (total verified, fraud blocked)
   - Applicant list (verified vs. unverified)

2. **Greenhouse Webhook Integration**
   ```typescript
   // Listen for new applications
   app.post('/webhooks/greenhouse/candidate_created', async (req, res) => {
     const { candidate_id, email } = req.body

     // Check if applicant has valid proof
     const proof = await getProofByEmail(email)

     if (!proof || proof.expired) {
       // Reject or flag application in Greenhouse
       await greenhouse.rejectCandidate(candidate_id, {
         reason: 'US work authorization not verified'
       })
     }
   })
   ```

3. **Greenhouse API Integration**
   - Use Greenhouse Harvest API v3 (v1/v2 deprecated Aug 2026)
   - Add custom field: "US Work Auth Verified" (✅ or ⚠️)
   - Webhook for `candidate.created` event

**Week 2 Deliverable:** Employers can view verified applicants, Greenhouse integration auto-flags unverified candidates.

---

### Week 3: Applicant Dashboard + Proof Reuse

**Deliverables:**

1. **Applicant Dashboard**
   - View current verification status
   - See proof expiration date (90 days)
   - Re-verify when expired
   - Download verification certificate (PDF)

2. **Proof Reuse Flow**
   ```typescript
   // When applicant applies to new job
   app.post('/api/v1/verify/reuse', async (req, res) => {
     const { applicant_id, job_id } = req.body

     // Check existing proof
     const proof = await getLatestProof(applicant_id)

     if (proof && !isExpired(proof)) {
       // Reuse existing proof, no re-verification
       await logVerification(applicant_id, job_id, proof.id)
       return res.json({ verified: true, reused: true })
     }

     // Expired, needs re-verification
     return res.json({ verified: false, needs_reverify: true })
   })
   ```

3. **Embeddable Widget**
   - Simple `<script>` tag for job boards
   - Drop into any website
   - Auto-detects if applicant already verified

**Week 3 Deliverable:** Applicants can verify once, apply to multiple jobs without re-verifying.

---

### Week 4: Security, Testing, Pilot Prep

**Deliverables:**

1. **Security Hardening**
   - Proof encryption at rest (AES-256)
   - Rate limiting (prevent DDoS)
   - API authentication (employer API keys)
   - Audit logging (all verification attempts)

2. **Fraud Detection**
   - Device fingerprinting (detect bots)
   - Behavioral analysis (time spent on verification)
   - Duplicate proof detection (same proof used by multiple applicants)

3. **Testing**
   - Unit tests (proof validation logic)
   - Integration tests (Greenhouse API)
   - E2E tests (full applicant flow)
   - Load testing (1000 concurrent verifications)

4. **Pilot Materials**
   - Demo video (2 min walkthrough)
   - Case study template (for post-pilot)
   - Pricing calculator (ROI estimator)
   - Onboarding guide (for pilot customers)

**Week 4 Deliverable:** Production-ready MVP for pilot launch.

---

## Phase 2: Pilot (8 Weeks)

**Goal:** Validate with 3 recruitment agencies, measure ROI, iterate.

### Pilot Customers (via Enticeable)

1. **Agency A** — Mid-size (500-1000 apps/month)
2. **Agency B** — Small (100-300 apps/month)
3. **Agency C** — Large (2000+ apps/month)

### Metrics to Track

**Adoption:**
- % of applicants who complete verification
- Drop-off rate (where do they abandon?)
- Time to verify (avg seconds)

**Efficacy:**
- Fraud blocked (unverified applicants)
- False positive rate (legit applicants flagged)
- Time saved (hours/week per recruiter)

**Revenue:**
- Verifications per customer
- Cost per verification
- Customer willingness to pay

### Iteration Plan

**Week 5-6: Deploy to Pilot A + B**
- Manual onboarding
- Daily check-ins
- Bug fixes as they arise

**Week 7-8: Deploy to Pilot C**
- Test at scale (2000 apps/month)
- Performance optimization

**Week 9-10: Data Collection + Interviews**
- Survey applicants (UX feedback)
- Interview recruiters (time saved, fraud reduction)
- Calculate ROI

**Week 11-12: Iteration**
- Fix top 3 pain points
- Build missing features (based on feedback)
- Prepare case study

**Week 12 Deliverable:** Case study with headline: "$89K saved in 60 days" + product ready for scale.

---

## Phase 3: Scale (Weeks 13-24)

### Lever Integration (Week 13-14)

- Same pattern as Greenhouse
- Webhook for `candidate.created`
- Custom field: "US Work Auth Verified"

### Self-Serve Signup (Week 15-16)

- Applicant self-serve verification (no employer required)
- Freemium tier (first 1,000 verifications free)
- Payment integration (Stripe)

### White-Label for ATS Providers (Week 17-20)

- Rebrandable widget
- API documentation for ATS providers
- Revenue share model (20% of verification fees)

### International Expansion (Week 21-24)

- UK residency verification
- Canada work permit verification
- Australia visa verification

---

## Phase 4: Blockchain Registry (Optional, Weeks 25-28)

**Why add blockchain?**

✅ **Immutable audit trail** — Employers can verify proofs haven't been tampered with
✅ **Decentralized trust** — No single point of failure
✅ **Compliance** — Some enterprises require blockchain-backed verification

**How it works:**

1. **Off-chain proof generation** (zkPass in browser)
2. **API validates proof** (off-chain, fast)
3. **(Optional) Proof hash stored on-chain** (Polygon, zkSync, or Base for low fees)
4. **Employers can verify on-chain** (if needed for audit)

### Tech Stack for Blockchain Layer

- **Chain:** Polygon zkEVM or zkSync (low fees, ZK-native)
- **Smart Contract:** Proof registry (stores proof hashes)
- **Cost:** ~$0.01-0.05 per on-chain verification

### Smart Contract (Simplified)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProofRegistry {
    mapping(bytes32 => bool) public proofs;

    event ProofRegistered(
        bytes32 indexed proofHash,
        address indexed applicant,
        uint256 timestamp
    );

    function registerProof(bytes32 _proofHash) external {
        require(!proofs[_proofHash], "Proof already registered");
        proofs[_proofHash] = true;
        emit ProofRegistered(_proofHash, msg.sender, block.timestamp);
    }

    function verifyProof(bytes32 _proofHash) external view returns (bool) {
        return proofs[_proofHash];
    }
}
```

### User Flow with Blockchain

1. **Applicant verifies** (off-chain, zkPass)
2. **Proof validated** by VerifyUS API
3. **Proof hash submitted on-chain** (optional, employer pays $0.01)
4. **Employer verifies** (check blockchain for proof hash)

**Key:** Applicants never touch blockchain. Employers optionally use it for extra trust.

---

## Technical Architecture (Full Stack)

### Frontend

**Tech:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- zkPass TransGate SDK

**Components:**
- Verification widget (embeddable)
- Applicant dashboard
- Employer dashboard
- Analytics UI

---

### Backend

**Tech:**
- Node.js 20 + TypeScript
- Express (REST API)
- PostgreSQL 16 (primary database)
- Redis (caching, rate limiting)
- Bull (job queue for webhooks)

**APIs:**
- `POST /api/v1/verify` - Submit proof
- `GET /api/v1/verify/:id` - Check status
- `POST /api/v1/webhooks/greenhouse` - Greenhouse webhook
- `POST /api/v1/webhooks/lever` - Lever webhook
- `GET /api/v1/analytics` - Employer analytics

---

### Infrastructure

**Hosting:**
- **Frontend:** Vercel (Next.js optimized)
- **Backend:** Railway or Render (Node.js)
- **Database:** Supabase or Neon (Postgres)
- **Cache:** Upstash (Redis)
- **CDN:** CloudFlare

**Cost (MVP):**
- Vercel: $20/mo (Pro plan)
- Railway: $25/mo (backend)
- Supabase: $25/mo (Pro plan)
- Upstash: $10/mo (Redis)
- **Total: ~$80/mo**

---

### Security

**Encryption:**
- Proofs encrypted at rest (AES-256)
- TLS 1.3 for all API calls
- API keys rotated every 90 days

**Rate Limiting:**
- 100 requests/minute per IP
- 1,000 verifications/day per employer

**Compliance:**
- GDPR compliant (right to erasure)
- CCPA compliant (opt-out mechanism)
- SOC 2 Type II (future, for enterprise)

---

## Integration Patterns

### Pattern 1: Pre-Application Gate

**Flow:**
1. User clicks "Apply Now"
2. **Before application form:** "Verify US Work Authorization"
3. zkPass verification widget launches
4. Proof generated + submitted to VerifyUS API
5. If verified → proceed to application
6. If not → show "Verification required to apply"

**Implementation:**
```html
<!-- Job board -->
<script src="https://verify-us.com/widget.js"></script>
<div id="verify-widget" data-app-id="YOUR_APP_ID"></div>

<form id="application-form" disabled>
  <!-- Application fields -->
</form>

<script>
  VerifyUS.onVerified(() => {
    document.getElementById('application-form').disabled = false
  })
</script>
```

---

### Pattern 2: ATS Webhook (Post-Application)

**Flow:**
1. Applicant submits application to ATS (Greenhouse)
2. Greenhouse webhook fires: `candidate.created`
3. VerifyUS checks if applicant has valid proof
4. If no → Greenhouse API rejects candidate
5. If yes → Greenhouse API adds custom field "✅ US Work Auth Verified"

**Implementation:**
```typescript
// Webhook handler
app.post('/webhooks/greenhouse', async (req, res) => {
  const { candidate_id, email } = req.body.payload

  const proof = await getProofByEmail(email)

  if (!proof || isExpired(proof)) {
    // Reject in Greenhouse
    await greenhouse.rejectCandidate(candidate_id, {
      reason: 'US work authorization not verified',
      rejection_reason_id: CUSTOM_REJECTION_ID
    })
  } else {
    // Add custom field
    await greenhouse.updateCandidate(candidate_id, {
      custom_fields: {
        'us_work_auth_verified': true,
        'verified_at': proof.verified_at
      }
    })
  }

  res.sendStatus(200)
})
```

---

### Pattern 3: Embeddable Widget

**Flow:**
1. Job board embeds VerifyUS widget
2. Widget checks if applicant already verified (via localStorage or session)
3. If yes → show "✅ Verified" badge
4. If no → show "Verify Now" button
5. Proof reused across all job applications on the site

**Implementation:**
```html
<!-- Any job board -->
<script src="https://verify-us.com/widget.js"></script>
<div
  class="verify-widget"
  data-app-id="YOUR_APP_ID"
  data-auto-detect="true"
></div>
```

---

## Pricing (Finalized)

### Tier 1: Per-Verification (Startups/Small Agencies)

- **$3 per verification**
- No monthly minimum
- 1,000 free verifications (trial)
- Email support

### Tier 2: Growth (Mid-Market Agencies)

- **$500/month** for 200 verifications
- **$1.50 per additional verification**
- Analytics dashboard
- Slack/email support
- 2 ATS integrations

### Tier 3: Enterprise (Large Agencies)

- **Custom pricing** (volume discounts at scale)
- White-label option
- Dedicated account manager
- SLA guarantees (99.9% uptime)
- Unlimited ATS integrations
- On-chain proof registry (optional)

### Tier 4: White-Label (ATS Providers)

- **Revenue share:** 30% of verification fees
- OR **Annual license:** $50,000/year
- Full API access
- Co-branded or fully white-label
- Priority support

---

## Go-to-Market Timeline

### Month 1-2: Pilot

- 3 recruitment agencies (via Enticeable)
- Manual onboarding
- Measure ROI

### Month 3-4: ATS Integrations

- Greenhouse + Lever native integrations
- Launch on Greenhouse Marketplace
- Land 10 paying customers

### Month 5-6: Product-Led Growth

- Self-serve signup
- Freemium tier (1,000 free verifications)
- Content marketing (SEO, case studies)

### Month 7-9: Enterprise Sales

- Hire 2 sales reps
- Target Fortune 500 HR teams
- White-label partnerships with ATS providers

### Month 10-12: International Expansion

- UK, Canada, Australia verification
- Localized marketing
- Compliance (GDPR, data residency)

---

## Key Decisions

### ✅ Off-Chain First, On-Chain Optional

**Why:** Simplicity for users, low cost, faster to market. Blockchain adds trust but not required for MVP.

### ✅ zkPass SDK (Not Custom ZK)

**Why:** Proven tech, saves 6+ months of dev time, enterprise-ready.

### ✅ Hybrid Business Model

**Why:** Per-verification for small customers, subscriptions for growth, white-label for scale.

### ✅ Focus on US First

**Why:** Biggest pain (H-1B costs $100K now), largest market, easier compliance.

---

## Risk Mitigation

### Risk 1: zkPass doesn't support US residency yet

**Mitigation:**
- Test with passport verification (works today)
- If limited, build custom zkTLS integration (adds 4-6 weeks)
- Fallback: Use traditional ID verification (Stripe Identity, Persona) with ZK wrapper

### Risk 2: Applicants won't install browser extension

**Mitigation:**
- Build web-based flow (no extension required) using zkPass mobile SDK
- Partner with ATS providers to pre-populate "verified" applicants
- A/B test: Required vs. optional verification

### Risk 3: ATS providers build this in-house

**Mitigation:**
- Move fast (ship MVP in 4 weeks)
- Lock in white-label partnerships (30% revenue share is attractive)
- Patent the workflow (provisional patent: $2K)

---

## Budget (First 6 Months)

**Development:**
- Developer (full-time): $120K/year ÷ 2 = $60K
- Infrastructure: $80/mo × 6 = $480
- zkPass DevHub: Free (pilot tier)
- **Total: $60,480**

**Marketing:**
- Case study video: $3K
- Content marketing (SEO): $2K/mo × 6 = $12K
- Paid ads (Google, LinkedIn): $5K/mo × 3 = $15K
- **Total: $30K**

**Sales:**
- 2 sales reps (Month 7+): $0 for first 6 months
- Travel (customer meetings): $5K

**Total First 6 Months: $95,480**

---

## Success Metrics (6-Month Goals)

**Adoption:**
- 50 paying customers (recruitment agencies)
- 100,000 verifications processed
- 2 ATS integrations live (Greenhouse + Lever)

**Revenue:**
- $30K MRR (monthly recurring revenue)
- LTV/CAC ratio > 3:1
- Churn rate < 5%/month

**Product:**
- 95%+ verification success rate
- <2 min average verification time
- 70%+ proof reuse rate

---

## Next Steps (This Week)

1. **Register zkPass DevHub account** (30 min)
2. **Create test schema** for US passport verification (1 hour)
3. **Build POC widget** (Next.js + zkPass SDK) (4 hours)
4. **Validate with 5 test users** (friends/family with US passports)
5. **Pitch to Enticeable** — "Can we pilot this with 1-2 of your clients?"

---

**Decision:** Start with **off-chain MVP**, add blockchain later if customers demand it. Ship fast, validate, iterate.

Sources:
- [zkPass JS SDK Docs](https://docs.zkpass.org/developer-guides/js-sdk)
- [Greenhouse API Overview](https://support.greenhouse.io/hc/en-us/articles/10568627186203-Greenhouse-API-overview)
- [Greenhouse Webhooks](https://developers.greenhouse.io/webhooks.html)
- [zkPass Roadmap 2026](https://docs.zkpass.org/supports/roadmap)
- [Unified ATS API Guide](https://unified.to/blog/how_to_build_a_job_board_integrating_greenhouse_lever_and_73_ats_platforms_with_an_ats_api)
