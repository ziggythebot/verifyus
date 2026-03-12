# VerifyUS V2 - Implementation Plan

**Goal:** Address Nick's feedback - add geolocation verification and bot detection.

---

## What We're Adding

### 1. Geolocation Verification
**Problem:** Applicants with US passports could be sitting in India/Philippines right now.

**Solution:** Prove physical US presence at application time.

### 2. Bot Detection
**Problem:** Competitor recruiters create fake profiles to steal job intel.

**Solution:** Detect fake profiles and bot behavior.

### 3. Enhanced KYC Integration
**Problem:** We're reinventing identity verification.

**Solution:** Integrate existing KYC providers (Sumsub, Onfido, Persona) for stronger identity checks.

---

## Option 1: Build In-House (Pure ZK Approach)

### Geolocation (Zero-Knowledge)

**Tech Stack:**
- Device geolocation API (GPS)
- IP address verification (with VPN detection)
- Network triangulation (WiFi/cell tower data)
- Trusted hardware attestation (Secure Enclave/SafetyNet)

**Implementation:**
```typescript
// Geolocation proof generation
async function generateLocationProof() {
  // 1. Get GPS coordinates
  const position = await navigator.geolocation.getCurrentPosition()

  // 2. Get IP address + VPN check
  const ipData = await fetch('https://ipapi.co/json')
  const isVPN = await detectVPN(ipData.ip)

  // 3. Cross-check timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // 4. Device attestation (if available)
  const attestation = await getDeviceAttestation()

  // 5. Generate ZK proof: "I'm in the US" (not exact location)
  const proof = await zkPass.generateLocationProof({
    country: 'US',
    coordinates: position.coords, // Used for proof, not revealed
    ipData,
    timezone,
    attestation
  })

  return proof
}
```

**Challenges:**
- VPN detection (high-quality VPNs hard to detect)
- Privacy concerns (GPS coordinates)
- Mobile vs. desktop (different APIs)
- Browser permission prompts (UX friction)

**Pros:**
- Full privacy (ZK proofs reveal nothing)
- No third-party dependency
- Aligned with our existing architecture

**Cons:**
- Complex to build
- Hard to get right (VPN evasion, spoofing)
- 6-8 weeks development time

---

### Bot Detection (Behavioral Analysis)

**Tech Stack:**
- Device fingerprinting
- Behavioral analysis (mouse movement, typing patterns)
- LinkedIn OAuth verification
- Pattern detection (same IP, rapid applications)

**Implementation:**
```typescript
// Bot detection signals
interface BotDetectionSignals {
  // Device
  deviceFingerprint: string
  ipAddress: string
  userAgent: string

  // Behavioral
  mouseMovements: Array<{x: number, y: number, timestamp: number}>
  typingCadence: Array<number> // Time between keystrokes
  timeOnPage: number

  // Social proof
  linkedInProfile?: LinkedInProfile
  emailDomain: string

  // Pattern detection
  duplicateFingerprints: number // How many other applications from this device
  rapidApplications: boolean // Multiple apps in short time
}

async function detectBot(signals: BotDetectionSignals): Promise<{isBot: boolean, confidence: number}> {
  let botScore = 0

  // Check 1: Suspicious IP patterns
  if (signals.duplicateFingerprints > 5) botScore += 30

  // Check 2: Inhuman behavior
  if (signals.timeOnPage < 10) botScore += 20 // Too fast
  if (signals.mouseMovements.length === 0) botScore += 25 // No mouse movement

  // Check 3: No social proof
  if (!signals.linkedInProfile) botScore += 15
  if (signals.emailDomain === 'gmail.com') botScore += 10

  // Check 4: Rapid applications
  if (signals.rapidApplications) botScore += 20

  return {
    isBot: botScore > 50,
    confidence: botScore / 100
  }
}
```

**Challenges:**
- False positives (real people flagged as bots)
- Privacy (tracking behavior feels invasive)
- Evasion (sophisticated bots mimic human behavior)

**Pros:**
- No user friction (runs in background)
- Catches obvious bot patterns
- Integrates with existing system

**Cons:**
- Not bulletproof (smart bots can evade)
- Privacy concerns (GDPR compliance)
- 4-6 weeks development time

---

## Option 2: Integrate Existing KYC Providers (Faster, Less Risk)

### Recommended Approach: **Modular KYC Integration**

Instead of building everything in-house, integrate best-in-class providers:

### 1. **Sumsub** (Primary Recommendation)
**What they do:**
- Identity verification (passport, driver's license, etc.)
- Liveness detection (real person, not photo)
- Document verification (detect fake IDs)
- **Geolocation:** Uses IP + device data to verify location

**Pros:**
- Industry leader (3000+ clients)
- Strong fraud detection
- Compliance built-in (GDPR, CCPA, KYC regulations)
- Geolocation included
- $1-3 per verification (cheaper than building)

**Cons:**
- Not zero-knowledge (documents uploaded to Sumsub)
- Privacy trade-off (less private than ZK proofs)
- Third-party dependency

**Integration time:** 1-2 weeks

**API Example:**
```typescript
// Sumsub verification
async function verifWithSumsub(applicantId: string) {
  const response = await sumsub.createApplicant({
    externalUserId: applicantId,
    levelName: 'basic-kyc-level'
  })

  // Redirect applicant to Sumsub verification flow
  const verificationUrl = response.inspectionId

  // Sumsub checks:
  // 1. Identity (passport, driver's license)
  // 2. Liveness (real person, not photo)
  // 3. Geolocation (IP + device data)
  // 4. Document authenticity (fake ID detection)

  return verificationUrl
}

// Webhook from Sumsub when verification completes
app.post('/webhooks/sumsub', (req, res) => {
  const { applicantId, reviewResult } = req.body

  if (reviewResult.reviewAnswer === 'GREEN') {
    // Verified: identity + location + liveness
    await markApplicantVerified(applicantId)
  }
})
```

---

### 2. **Onfido** (Alternative)
**What they do:**
- Similar to Sumsub (identity, liveness, documents)
- Strong in US/UK markets
- $3-5 per verification

**Pros:**
- Trusted by major companies (Revolut, Zipcar)
- Good developer experience
- Compliance built-in

**Cons:**
- More expensive than Sumsub
- Geolocation weaker than Sumsub

**Integration time:** 1-2 weeks

---

### 3. **Persona** (Alternative)
**What they do:**
- Modern identity verification (US-focused)
- Good UX (mobile-first)
- $2-4 per verification

**Pros:**
- Great UX (fastest completion time)
- US-specific features (SSN verification)
- Modern API

**Cons:**
- Smaller company (less mature fraud detection)
- No geolocation verification

**Integration time:** 1-2 weeks

---

### 4. **IPQualityScore** (Geolocation + VPN Detection)
**What they do:**
- IP reputation scoring
- VPN/proxy detection
- Geolocation verification
- Bot detection

**Pros:**
- Specializes in fraud detection
- Strong VPN detection
- Cheap ($0.10-0.50 per check)

**Cons:**
- Not identity verification (needs to be combined with Sumsub/Onfido)

**Integration time:** 1 week

**API Example:**
```typescript
// IPQualityScore for geolocation + bot detection
async function checkLocation(ipAddress: string, userAgent: string) {
  const response = await ipqs.check({
    ip: ipAddress,
    user_agent: userAgent,
    allow_public_access_points: false,
    strictness: 1 // 0-3, higher = stricter
  })

  return {
    isVPN: response.vpn,
    isProxy: response.proxy,
    isTor: response.tor,
    country: response.country_code,
    fraudScore: response.fraud_score, // 0-100
    isBot: response.bot_status
  }
}
```

---

## Recommended Solution: **Hybrid Approach**

### Architecture

```
Applicant
  ↓
1. Zero-Knowledge Proof (work authorization)
   - zkPass TransGate SDK
   - Passport/ID/SSN verification
   - Privacy-preserving
  ↓
2. Geolocation + VPN Check (IPQualityScore)
   - IP address verification
   - VPN/proxy detection
   - Bot detection signals
  ↓
3. Enhanced KYC (Sumsub) - OPTIONAL for high-risk cases
   - Full identity verification
   - Liveness detection
   - Document verification
  ↓
VerifyUS API validates all proofs
  ↓
ATS Integration (Greenhouse/Lever)
```

### Why Hybrid?

**Best of both worlds:**
- **ZK proofs** for privacy-sensitive data (work authorization)
- **Existing KYC** for identity + geolocation (proven, reliable)
- **Modular** (can mix and match providers)

**Cost-effective:**
- Basic verification: zkPass + IPQualityScore = ~$0.50
- Enhanced verification: Add Sumsub for high-risk = +$1-3
- Average cost: $1-2 per applicant (vs. $20-50 for traditional KYC)

**Fast to build:**
- zkPass: Already built ✅
- IPQualityScore: 1 week
- Sumsub: 1-2 weeks (optional tier)
- **Total: 2-3 weeks**

---

## Implementation Roadmap

### Week 1: IPQualityScore Integration
**Deliverables:**
- [ ] Sign up for IPQualityScore API
- [ ] Integrate IP reputation check
- [ ] Add VPN/proxy detection
- [ ] Implement bot detection signals
- [ ] Test with sample IPs

**Code:**
```typescript
// api/services/geolocation.ts
export async function verifyLocation(req: Request) {
  const ipAddress = req.ip
  const userAgent = req.headers['user-agent']

  const ipqs = await checkIPQualityScore(ipAddress, userAgent)

  if (ipqs.isVPN || ipqs.isProxy) {
    return { verified: false, reason: 'VPN/proxy detected' }
  }

  if (ipqs.country !== 'US') {
    return { verified: false, reason: 'Not in US' }
  }

  if (ipqs.fraudScore > 85) {
    return { verified: false, reason: 'High fraud score' }
  }

  return { verified: true, confidence: 100 - ipqs.fraudScore }
}
```

---

### Week 2: Sumsub Integration (Optional Tier)
**Deliverables:**
- [ ] Sign up for Sumsub account
- [ ] Create verification flow
- [ ] Implement webhook handler
- [ ] Add "Enhanced Verification" tier
- [ ] Test with sample documents

**Code:**
```typescript
// api/services/kyc.ts
export async function startEnhancedKYC(applicantId: string) {
  const applicant = await sumsub.createApplicant({
    externalUserId: applicantId,
    levelName: 'basic-kyc-level',
    country: 'USA'
  })

  // Generate verification URL
  const token = await sumsub.generateAccessToken(applicant.id)
  const verificationUrl = `https://sumsub.com/idensic/l/#/uni_${token}`

  return { verificationUrl, applicantId: applicant.id }
}

// Webhook handler
app.post('/webhooks/sumsub', async (req, res) => {
  const { applicantId, reviewResult, rejectLabels } = req.body

  if (reviewResult.reviewAnswer === 'GREEN') {
    await updateApplicant(applicantId, {
      kycVerified: true,
      kycProvider: 'sumsub',
      kycCompletedAt: new Date()
    })
  } else {
    await flagApplicant(applicantId, {
      reason: rejectLabels.join(', '),
      kycFailed: true
    })
  }

  res.sendStatus(200)
})
```

---

### Week 3: Bot Detection Enhancement
**Deliverables:**
- [ ] Device fingerprinting
- [ ] Behavioral tracking (mouse, typing)
- [ ] LinkedIn OAuth integration
- [ ] Pattern detection (duplicate devices)
- [ ] Dashboard for flagged applicants

**Code:**
```typescript
// Frontend: Capture behavioral signals
const signals = {
  deviceFingerprint: await generateFingerprint(),
  mouseMovements: captureMouseMovements(),
  typingCadence: captureTypingPattern(),
  timeOnPage: Date.now() - pageLoadTime
}

// Backend: Analyze signals
const botDetection = await analyzeBotSignals(signals)

if (botDetection.isBot && botDetection.confidence > 0.7) {
  await flagApplicant(applicantId, {
    reason: 'Bot detection: high confidence',
    botScore: botDetection.confidence
  })
}
```

---

### Week 4: Testing + Pilot
**Deliverables:**
- [ ] End-to-end testing (all tiers)
- [ ] Performance testing (latency, throughput)
- [ ] Pilot with Enticeable clients
- [ ] Measure: false positive rate, fraud blocked
- [ ] Iterate based on feedback

---

## Pricing (Updated for V2)

### Tier 1: Basic Verification
**$2 per verification**
- Work authorization (zkPass)
- Geolocation + VPN check (IPQualityScore)
- Basic bot detection

### Tier 2: Enhanced Verification
**$4 per verification**
- Everything in Basic
- Full KYC (Sumsub: identity + liveness + documents)
- Advanced bot detection (behavioral analysis)
- LinkedIn verification

### Tier 3: Enterprise
**Custom pricing**
- Everything in Enhanced
- Dedicated fraud analyst
- Custom risk scoring
- White-label option

---

## Cost Analysis

### Build vs. Buy

**Option 1: Build In-House (Pure ZK)**
- Development time: 8-12 weeks
- Developer cost: $60K (3 months)
- Ongoing maintenance: $20K/year
- Risk: High (complex, easy to get wrong)
- **Total first year: $80K**

**Option 2: Integrate KYC Providers (Hybrid)**
- Development time: 2-3 weeks
- Developer cost: $15K (1 month)
- Provider costs: $1-2 per verification × 10K verifications = $10-20K/year
- Risk: Low (proven solutions)
- **Total first year: $25-35K**

**Recommendation:** Option 2 (Hybrid)
- 3x faster
- 2-3x cheaper
- Lower risk
- Better fraud detection (battle-tested)

---

## Nick's Questions (To Clarify)

1. **Geolocation precision:**
   - Do you need city-level? State-level? Just "in the US"?
   - Our recommendation: Country-level ("in the US") for MVP

2. **Bot detection:**
   - What patterns have you seen with fake profiles?
   - Profile age? Connection count? Behavior?

3. **Pricing:**
   - What do you currently pay for WeWork verification?
   - What would you pay per automated verification?

4. **Volume:**
   - How many applicants/month per client?
   - How many clients in pilot?

5. **Privacy:**
   - Are applicants okay with Sumsub (document upload)?
   - Or prefer pure ZK (no document upload, but weaker geolocation)?

---

## Next Steps

1. **[Today]** Share analysis with Nick, get feedback
2. **[This week]** Decide: Pure ZK vs. Hybrid vs. Full KYC
3. **[Week 1]** Sign up for IPQualityScore + Sumsub
4. **[Week 2-3]** Build integrations
5. **[Week 4]** Pilot with Enticeable clients
6. **[Month 2]** Iterate based on pilot results

---

## Decision Matrix

| Factor | Pure ZK (In-House) | Hybrid (Recommended) | Full KYC (Sumsub Only) |
|--------|-------------------|---------------------|----------------------|
| **Privacy** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Fraud Detection** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Time to Build** | 8-12 weeks | 2-3 weeks | 1-2 weeks |
| **Cost (Year 1)** | $80K | $25-35K | $30-50K |
| **Risk** | High | Low | Low |
| **Geolocation Accuracy** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Bot Detection** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

**Winner:** Hybrid (Best balance of privacy, accuracy, speed, and cost)
