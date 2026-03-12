# Staged Filtering: Real Costs Per Applicant

**Problem:** Running full verification on every applicant is expensive. Most applicants are real humans, but we need to filter out bots cheaply before burning money on deep verification.

**Solution:** Multi-stage filtering funnel. Start cheap, only escalate if suspicious.

---

## Stage 1: Bot Pre-Filter (Low-Cost Triage)

**Who gets this:** Every single applicant (100% of traffic)

**Goal:** Filter out obvious bots before burning money on verification

**Components:**

| Component | What It Checks | Cost |
|-----------|----------------|------|
| **IPQualityScore** | IP address, VPN/proxy, datacenter IPs, high-risk countries | **$0.50** |
| **ClientJS** (free) | Browser fingerprint, headless browser detection, automation flags | **$0** |
| **Basic LLM scan** | LinkedIn summary + application text for bot-like patterns | **$0.005** |

**Total Stage 1 Cost:** **$0.505 per applicant**

**What happens next:**
- **Pass (looks human):** Proceed to Stage 2 (full verification)
- **Fail (bot score >70):** Send to "Verify to Continue" page OR auto-reject

**Expected filter rate:** 40-60% of bot applications caught here

---

## Stage 2: Work Authorization Verification (Mid-Cost)

**Who gets this:** Applicants who passed Stage 1 bot filter

**Goal:** Prove they're authorized to work in the US

**Components:**

| Component | What It Checks | Cost |
|-----------|----------------|------|
| **zkPass** | US Passport / State ID / SSN (zero-knowledge proof, no data shared) | **$0** (free) |
| **Stripe Identity** | Photo ID verification, liveness check (selfie) | **$1.50** |
| **Smarty** | Address verification (USPS database) | **$0.10** |
| **Gas fees** (Polygon L2) | Submit ZK proof on-chain | **$0.01** |

**Total Stage 2 Cost:** **$1.61 per applicant**

**Cumulative cost so far:** $0.505 (Stage 1) + $1.61 (Stage 2) = **$2.115**

**What happens next:**
- **Pass:** Applicant is verified ✅
- **Fail:** Document doesn't match, address invalid, or liveness check fails → rejected

---

## Stage 3: Deep Social Proof Analysis (High-Cost, Suspicious Only)

**Who gets this:** Applicants who passed Stage 1 but employer wants extra scrutiny (e.g., high-value roles, security clearance jobs)

**Goal:** Catch sophisticated bots that have real IDs but fake online presence

**Components:**

| Component | What It Checks | Cost |
|-----------|----------------|------|
| **FaceTec** | 3D liveness (prevents photo/video spoofing) | **$0.50** |
| **Twilio Verify** | Phone number validation (OTP) | **$0.05** |
| **Hunter.io** | Email deliverability, domain reputation | **$0.01** |
| **Claude LLM (full analysis)** | Deep LinkedIn/Twitter/GitHub analysis (300+ tokens output) | **$0.03** |
| **LinkedIn OAuth** | Pull full profile data (employment history, connections, endorsements) | **$0** (free) |

**Total Stage 3 Cost:** **$0.59 per applicant**

**Cumulative cost (full scan):** $0.505 + $1.61 + $0.59 = **$2.705 per applicant**

---

## Real-World Cost Scenarios

### Scenario 1: Job Board (Low-Value Roles, High Volume)

**Example:** Customer support role, 500 applicants

**Funnel:**
1. **500 applicants** → Stage 1 bot filter
   - Cost: 500 × $0.505 = **$252.50**
   - Result: 200 bots filtered out (40% bot rate)
2. **300 remaining** → Stage 2 work authorization
   - Cost: 300 × $1.61 = **$483**
   - Result: 10 fail verification (fake IDs)
3. **290 verified applicants** ✅
   - No Stage 3 needed (low-value role)

**Total cost:** $252.50 + $483 = **$735.50**
**Cost per verified applicant:** $735.50 / 290 = **$2.54**
**Bots blocked:** 210 (42% of original pool)

---

### Scenario 2: Tech Startup (Mid-Value Role, Moderate Volume)

**Example:** Senior engineer role, 200 applicants

**Funnel:**
1. **200 applicants** → Stage 1 bot filter
   - Cost: 200 × $0.505 = **$101**
   - Result: 50 bots filtered out (25% bot rate)
2. **150 remaining** → Stage 2 work authorization
   - Cost: 150 × $1.61 = **$241.50**
   - Result: 5 fail verification
3. **145 verified applicants** → Stage 3 deep analysis (employer wants extra scrutiny for senior role)
   - Cost: 145 × $0.59 = **$85.55**
   - Result: 8 flagged as suspicious (fake LinkedIn profiles)

**Total cost:** $101 + $241.50 + $85.55 = **$428.05**
**Cost per verified applicant:** $428.05 / 137 = **$3.12**
**Bots blocked:** 63 (31.5% of original pool)

---

### Scenario 3: Enterprise (High-Value Role, Low Volume)

**Example:** VP of Engineering, 50 applicants

**Funnel:**
1. **50 applicants** → Stage 1 bot filter
   - Cost: 50 × $0.505 = **$25.25**
   - Result: 5 bots filtered out (10% bot rate, higher quality applicants)
2. **45 remaining** → Stage 2 work authorization
   - Cost: 45 × $1.61 = **$72.45**
   - Result: 2 fail verification
3. **43 verified applicants** → Stage 3 deep analysis (mandatory for executive roles)
   - Cost: 43 × $0.59 = **$25.37**
   - Result: 3 flagged as suspicious

**Total cost:** $25.25 + $72.45 + $25.37 = **$123.07**
**Cost per verified applicant:** $123.07 / 40 = **$3.08**
**Bots blocked:** 10 (20% of original pool)

---

## Smart Routing: When to Skip Stages

### Rule-Based Auto-Escalation

**Stage 1 → Auto-reject (no Stage 2):**
- IP address from known bot farm (datacenter IP)
- VPN/proxy detected + LinkedIn profile <6 months old
- Application text is 100% AI-generated (Claude flags it)
- Device fingerprint matches known bot pattern

**Stage 1 → Skip to Stage 3 (suspicious but not obvious bot):**
- LinkedIn profile exists but has generic AI headshot
- All posts are within last 30 days (new account)
- No GitHub/Twitter/social proof despite claiming 10 years experience
- Phone number is VoIP (not tied to carrier)

**Stage 2 → Skip Stage 3 (fast-track trusted applicants):**
- Work email domain matches Fortune 500 company
- LinkedIn profile >5 years old with 500+ connections
- GitHub account with 100+ contributions
- Previously verified by VerifyUS (cached result)

---

## Cost Optimization Strategies

### 1. Employer-Configurable Tiers

**Basic Plan ($0.50/applicant):**
- Stage 1 only (bot pre-filter)
- Good for: High-volume, low-value roles (customer support, retail, etc.)
- Blocks: 40-60% of bots

**Standard Plan ($2.10/applicant):**
- Stage 1 + Stage 2 (full work authorization)
- Good for: Most jobs (majority of use cases)
- Blocks: 95%+ of bots

**Premium Plan ($2.70/applicant):**
- Stage 1 + Stage 2 + Stage 3 (deep social proof)
- Good for: High-value roles, security clearance, remote-first companies
- Blocks: 99%+ of bots

---

### 2. Cached Verifications (Reuse Across Jobs)

**Problem:** Same applicant applies to 5 jobs at same company → paying $2.70 × 5 = $13.50

**Solution:** Cache verification for 90 days

**Flow:**
1. Applicant applies to Job A → Full verification ($2.70)
2. Applicant applies to Job B (same company) → Cache hit ($0, free)
3. Applicant applies to Job C (different company) → New verification ($2.70)

**Savings:** 80% cost reduction for repeat applicants within same company

---

### 3. Shared Verification Network (Cross-Employer)

**Problem:** Applicant verified by Company A, then applies to Company B → Company B pays again

**Solution:** VerifyUS network (like TSA PreCheck for job hunting)

**Flow:**
1. Applicant gets verified once via VerifyUS platform ($2.70, they pay OR first employer pays)
2. Verification valid for 90 days across ALL VerifyUS employers
3. Applicant applies to Company A → No verification cost (already verified)
4. Applicant applies to Company B → No verification cost (reuses proof)

**Business model:**
- **Job hunter pays:** $9.99/quarter for VerifyUS membership (unlimited applications)
- **OR employer pays:** $2.70 first time, then cached for 90 days

**Benefit to employers:** Only pay once per applicant (even if they apply to 10 jobs)

---

## Recommended Pricing for Enticeable Pilot

### Tier 1: Bot Filter Only
- **Cost to VerifyUS:** $0.505 per applicant
- **Price to employer:** $1.00 per applicant
- **Margin:** $0.495 (98% markup)
- **Use case:** High-volume roles (100+ applicants)

### Tier 2: Full Verification (Recommended)
- **Cost to VerifyUS:** $2.115 per applicant
- **Price to employer:** $3.00 per applicant
- **Margin:** $0.885 (42% markup)
- **Use case:** Standard roles (most jobs)

### Tier 3: Deep Analysis
- **Cost to VerifyUS:** $2.705 per applicant
- **Price to employer:** $4.00 per applicant
- **Margin:** $1.295 (48% markup)
- **Use case:** Senior/executive roles, remote-first companies

**Volume discounts:**
- 1-100 applicants: Full price
- 101-500 applicants: 10% off
- 501-1000 applicants: 20% off
- 1000+ applicants: 30% off (custom contract)

---

## Cost Breakdown: What Drives the Price?

### Stage 1 ($0.505):
- IPQualityScore: $0.50 (99% of cost)
- ClientJS: Free
- Basic LLM scan: $0.005 (negligible)

**Optimization:** Negotiate bulk pricing with IPQualityScore (currently $0.50/lookup, could get to $0.30 at scale)

### Stage 2 ($1.61):
- Stripe Identity: $1.50 (93% of cost)
- Smarty: $0.10
- Gas fees: $0.01 (negligible)

**Optimization:**
- Alternative to Stripe Identity: Sumsub ($1.20) or Onfido ($1.80)
- Could build our own ID verification (not recommended, regulatory risk)

### Stage 3 ($0.59):
- FaceTec: $0.50 (85% of cost)
- Twilio: $0.05
- Hunter.io: $0.01
- Claude LLM: $0.03

**Optimization:**
- FaceTec has volume pricing ($0.30 at 10K/month)
- Claude cost is negligible (could use GPT-4o-mini for $0.01 instead)

---

## Real Costs vs. Made-Up Costs

**Made-Up Marketing Cost:** "Starts at $0.99 per applicant!"
**Reality:** $0.99 only covers IPQualityScore ($0.50) + gas ($0.01) + margin. No ID verification, no liveness check, no proof on-chain.

**Honest Cost (Our Model):**
- Bot filter only: **$0.50 cost**, $1.00 price (100% margin)
- Full verification: **$2.10 cost**, $3.00 price (43% margin)
- Deep analysis: **$2.70 cost**, $4.00 price (48% margin)

**Why we can't go lower:**
- Stripe Identity: $1.50 (non-negotiable for <100K volume)
- IPQualityScore: $0.50 (non-negotiable for <50K volume)
- FaceTec: $0.50 (non-negotiable for <10K volume)

**At scale (100K applicants/month):**
- IPQualityScore: $0.30 (40% discount)
- Stripe Identity: $1.20 (20% discount)
- FaceTec: $0.30 (40% discount)
- **New cost:** $1.85 per full verification (vs. $2.70 today)
- **Could price at:** $2.50 (35% margin)

---

## Competitor Comparison (Real Costs)

### Sumsub (KYC Platform)
- **Cost:** $1.20 - $6.00 per verification (depending on tier)
- **What you get:** ID verification, liveness check, AML screening
- **What you DON'T get:** Zero-knowledge proofs, selective sharing, bot detection

### Onfido (Identity Verification)
- **Cost:** $1.80 per document check, $0.50 per liveness check = $2.30 total
- **What you get:** ID verification, liveness check, AML screening
- **What you DON'T get:** Zero-knowledge proofs, selective sharing, geolocation verification

### Persona (Identity Platform)
- **Cost:** $2.00 - $5.00 per verification (tiered pricing)
- **What you get:** ID verification, liveness check, custom workflows
- **What you DON'T get:** Zero-knowledge proofs, bot detection

### VerifyUS (Our Model)
- **Cost:** $2.10 - $2.70 per verification
- **What you get:** ID verification, liveness check, geolocation, bot detection, zero-knowledge proofs, selective sharing
- **Unique value:** Privacy-preserving (employer never sees raw documents), on-chain proof (auditable), multi-use (verify once, apply many)

**We're competitively priced but offer MORE features.**

---

## Recommendations for Enticeable Pilot

### Phase 1: Prove Bot Detection (2 weeks)

**Offer:** Free bot pre-filter (Stage 1 only) for Enticeable's existing applicants

**Goal:** Measure false positive rate, bot detection accuracy

**We pay:** $0.505 × 500 applicants = **$252.50** (cost to validate product-market fit)

**Success metric:** Catch 30%+ bots with <5% false positives

---

### Phase 2: Paid Pilot (4 weeks)

**Offer:** $2.00 per verified applicant (Stage 1 + Stage 2)

**Goal:** Measure employer willingness to pay, time savings, applicant experience

**Expected volume:** 200 applicants

**Revenue:** 200 × $2.00 = **$400**
**Cost:** 200 × $2.115 = **$423**
**Loss:** -$23 (acceptable for pilot)

**Success metric:** Enticeable reports 50%+ time savings in applicant screening

---

### Phase 3: Scale to Market Rate (ongoing)

**Offer:** $3.00 per verified applicant (Stage 1 + Stage 2)

**Expected volume:** 1,000 applicants/month

**Revenue:** 1,000 × $3.00 = **$3,000/month**
**Cost:** 1,000 × $2.115 = **$2,115/month**
**Profit:** **$885/month** (42% margin)

**At 10K applicants/month:** $8,850/month profit ($106K/year)

---

## Open Questions

1. **Who pays: employer or job hunter?**
   - **Employer pays:** Easier sales motion (B2B), higher willingness to pay ($3-5 per applicant)
   - **Job hunter pays:** Consumer model ($9.99/quarter unlimited), slower growth but higher LTV

2. **Cached verifications: how long?**
   - 90 days (recommended): Work authorization can change, addresses change
   - 1 year: Lower cost for repeat applicants, but stale data risk

3. **Volume discounts: when to offer?**
   - Offer discounts at 500+ applicants/month (locks in large customers)
   - OR keep pricing flat (simpler, easier to sell)

4. **Stage 3: always on or opt-in?**
   - **Always on:** Higher cost ($2.70), better bot detection
   - **Opt-in:** Employer chooses per role (executive roles get Stage 3, entry-level doesn't)

5. **IPQualityScore alternatives?**
   - Could use Cloudflare Bot Management ($20/month flat fee for unlimited checks)
   - But loses granular risk scoring (IPQS gives 0-100 fraud score)
