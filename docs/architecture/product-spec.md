# VerifyUS - Product Specification

## Product Vision

**Zero-knowledge proof-based US work authorization verification that blocks fraudulent job applicants before they reach the ATS.**

Privacy-preserving, bot-resistant, reusable verification for recruitment agencies and employers.

---

## User Flows

### Flow 1: Applicant Verification (First Time)

1. **Applicant clicks "Apply Now"** on job posting
2. **Pre-application gate:** "Verify US Work Authorization"
   - Explanation: "This employer requires proof of US work authorization. Verify once, apply everywhere."
3. **Choose verification method:**
   - [ ] US Passport
   - [ ] State ID / Driver's License
   - [ ] SSN + Address Verification
   - [ ] Bank Account (US-based)
4. **ZKPass SDK launches:**
   - User connects to authoritative source (government ID, bank, etc.)
   - Proof generated on-device
   - Zero-knowledge proof submitted
5. **Verification complete:**
   - "You're verified! Your proof is valid for 90 days."
   - Applicant proceeds to application form
6. **Proof stored in applicant dashboard** (reusable)

---

### Flow 2: Applicant Verification (Returning)

1. **Applicant clicks "Apply Now"**
2. **System detects existing proof:**
   - "You're already verified (expires in 45 days)"
3. **Applicant proceeds directly to application**
4. **No re-verification needed**

---

### Flow 3: Employer/Recruiter View

1. **Recruiter posts job** in ATS
2. **Enable VerifyUS toggle:** "Require US work authorization verification"
3. **Applications flow in:**
   - Verified applicants: ✅ Green badge "US Work Auth Verified"
   - Unverified applicants: ⚠️ "Not verified" (flagged or auto-rejected based on settings)
4. **Analytics dashboard:**
   - Total applications: 1000
   - Verified: 700 (70%)
   - Rejected (unverified): 300 (30%)
   - Fraud attempts blocked: 250
   - Time saved: 15 hours

---

### Flow 4: ATS Integration (API)

1. **ATS sends verification request** to VerifyUS API
   ```json
   POST /api/v1/verify
   {
     "applicant_id": "12345",
     "proof": "<zkproof_data>",
     "employer_id": "acme-corp"
   }
   ```

2. **VerifyUS validates proof** (cryptographic verification)

3. **API returns result:**
   ```json
   {
     "verified": true,
     "proof_type": "us_passport",
     "verified_at": "2026-03-11T22:00:00Z",
     "expires_at": "2026-06-09T22:00:00Z",
     "confidence_score": 0.98
   }
   ```

4. **ATS accepts/rejects application** based on result

---

## Core Features

### MVP (Version 1.0)

**Applicant-facing:**
- [ ] Verification widget (embeddable)
- [ ] Multi-method verification (passport, state ID, SSN+address)
- [ ] Proof generation via ZKPass SDK
- [ ] Applicant dashboard (view/reuse proofs)
- [ ] Mobile-friendly (responsive)

**Employer-facing:**
- [ ] ATS integration (Greenhouse, Lever)
- [ ] Admin dashboard (verification stats)
- [ ] Application filtering (verified vs. unverified)
- [ ] Fraud analytics

**API:**
- [ ] REST API for proof validation
- [ ] Webhooks (verification completed)
- [ ] Rate limiting / authentication

**Infrastructure:**
- [ ] ZKPass SDK integration
- [ ] Database (applicant proofs, employer settings)
- [ ] Proof storage (encrypted, time-limited)

---

### Post-MVP (Version 2.0)

- [ ] Deepfake detection (video interview layer)
- [ ] Continuous verification (re-verify every 90 days)
- [ ] White-label for ATS providers
- [ ] Multi-country support (UK, Canada, Australia)
- [ ] Blockchain proof registry (optional, for auditability)
- [ ] Advanced fraud signals (device fingerprinting, behavioral analysis)

---

## Technical Architecture

### Stack

**Frontend:**
- React (verification widget)
- Next.js (applicant dashboard)
- Tailwind CSS

**Backend:**
- Node.js / TypeScript
- Express (REST API)
- PostgreSQL (applicant data, proof metadata)
- Redis (rate limiting, caching)

**ZK Layer:**
- ZKPass SDK (client-side proof generation)
- zkTLS protocol (verify Web2 data sources)
- Custom smart contracts (optional, for on-chain proof validation)

**Integrations:**
- Greenhouse API
- Lever API
- Workday API (future)

**Infrastructure:**
- Vercel (frontend)
- Railway / Render (backend)
- AWS S3 (encrypted proof storage)
- CloudFlare (CDN, DDoS protection)

---

### Data Model

**Applicants:**
```sql
CREATE TABLE applicants (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_verified_at TIMESTAMP,
  proof_expires_at TIMESTAMP
);
```

**Proofs:**
```sql
CREATE TABLE proofs (
  id UUID PRIMARY KEY,
  applicant_id UUID REFERENCES applicants(id),
  proof_type VARCHAR(50), -- 'us_passport', 'state_id', 'ssn_address', 'bank'
  proof_data TEXT, -- Encrypted ZK proof
  verified_at TIMESTAMP,
  expires_at TIMESTAMP,
  confidence_score DECIMAL(3,2)
);
```

**Employers:**
```sql
CREATE TABLE employers (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  ats_provider VARCHAR(50), -- 'greenhouse', 'lever', 'workday'
  api_key VARCHAR(255),
  settings JSONB -- { require_verification: true, auto_reject_unverified: false }
);
```

**Verifications:**
```sql
CREATE TABLE verifications (
  id UUID PRIMARY KEY,
  applicant_id UUID REFERENCES applicants(id),
  employer_id UUID REFERENCES employers(id),
  job_id VARCHAR(255),
  verified BOOLEAN,
  verified_at TIMESTAMP,
  proof_id UUID REFERENCES proofs(id)
);
```

---

## Security & Privacy

### Privacy Guarantees

✅ **Zero-knowledge proofs** - Raw documents never leave applicant's device
✅ **Selective disclosure** - Only prove "US work auth", not full ID details
✅ **No document storage** - Only cryptographic proofs stored (encrypted)
✅ **Time-limited proofs** - Auto-expire after 90 days
✅ **User consent** - Applicant controls when/where proof is shared

### Security Measures

✅ **Cryptographic proof validation** - Can't be faked or replayed
✅ **Rate limiting** - Prevent bot abuse of verification endpoint
✅ **API authentication** - Employer API keys for ATS integration
✅ **Encrypted storage** - Proofs encrypted at rest (AES-256)
✅ **Audit logs** - Track all verification attempts
✅ **DDoS protection** - CloudFlare + rate limiting

### Compliance

✅ **GDPR** - Right to erasure, data portability, consent-based
✅ **CCPA** - Privacy policy, opt-out mechanism
✅ **SOC 2** (future) - Security audit for enterprise customers

---

## Pricing

### Tier 1: Per-Verification (Small Agencies)

- **$3 per verification**
- No monthly minimum
- 1,000 free verifications (trial)

### Tier 2: Monthly Subscription (Mid-Market)

- **$500/month** for 200 verifications
- **$0.50 per additional verification**
- Analytics dashboard included

### Tier 3: Enterprise (Large Agencies / ATS Providers)

- **Custom pricing** (volume discounts)
- White-label option
- Dedicated support
- SLA guarantees

### Tier 4: White-Label (ATS Providers)

- **Revenue share** (20% of verification fees)
- OR **Annual license** ($50,000/year)
- Full API access
- Co-branded or white-label

---

## Success Metrics

### North Star Metric

**Fraudulent applications blocked** (per 1000 applications)

### Key Metrics

**Adoption:**
- Applicants verified (weekly)
- Employers/agencies onboarded (monthly)
- ATS integrations live

**Efficacy:**
- Fraud detection rate (% of unverified applicants)
- False positive rate (<1%)
- Time saved per recruiter (hours/week)

**Revenue:**
- MRR (monthly recurring revenue)
- LTV/CAC ratio
- Churn rate (<5% monthly)

**Product:**
- Verification success rate (>95%)
- Average verification time (<2 minutes)
- Proof reuse rate (% of applicants using existing proof)

---

## GTM Strategy

### Phase 1: Pilot (Weeks 1-8)

**Goal:** Prove it works with Enticeable's clients

1. **Recruit 3 pilot customers** (US recruitment agencies)
2. **Manual integration** (no ATS required)
3. **Measure:** Fraud blocked, time saved, applicant experience
4. **Case study:** "$89K saved in 60 days" headline

### Phase 2: ATS Integrations (Weeks 9-16)

**Goal:** Scale via partnerships

1. **Greenhouse integration** (native app)
2. **Lever integration**
3. **Land 10 paying customers** via ATS marketplaces
4. **PR push:** "New fraud prevention tool integrates with Greenhouse"

### Phase 3: Expansion (Weeks 17-24)

**Goal:** Product-led growth + enterprise sales

1. **Self-serve signup** (applicants verify before applying)
2. **Freemium tier** (first 1,000 verifications free)
3. **Enterprise sales team** (target Fortune 500 HR teams)
4. **International expansion** (UK, Canada)

---

## Risks & Open Questions

### Technical

❓ **Can ZKPass actually verify US residency?**
→ Need to test SDK, may require custom zkTLS integration

❓ **What if applicants don't have passports?**
→ Support multiple verification methods (state ID, SSN+address, bank)

❓ **How to handle expired documents?**
→ Proof expires after 90 days, require re-verification

### Product

❓ **Will applicants abandon if verification takes >2 minutes?**
→ A/B test: Optional vs. required verification

❓ **What if ATS providers build this in-house?**
→ White-label partnership prevents this

❓ **How to differentiate from Checkr?**
→ Emphasize: Pre-application (faster), zero-knowledge (privacy), reusable proofs (UX)

### Business

❓ **Can Enticeable sell this to clients?**
→ Validate in pilot phase, may need dedicated sales team

❓ **What's the right pricing?**
→ Test $2-5 range, optimize based on CAC/LTV

❓ **Is the market big enough?**
→ US staffing industry = $150B, 20% is tech staffing = $30B TAM

---

## Next Actions

1. **Technical validation** - Test ZKPass SDK with US passport/ID verification
2. **Customer discovery** - Interview 5 recruitment agencies about fraud pain
3. **Build POC** - Simple verification widget + API (1-2 weeks)
4. **Pitch to Enticeable** - "We want to pilot this with your clients"
