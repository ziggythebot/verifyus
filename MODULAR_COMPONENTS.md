# VerifyUS - Modular Component Strategy

**Philosophy:** Don't reinvent the wheel. Use battle-tested components, package them elegantly.

---

## Component Stack (Mix & Match)

### 1. Photo ID Verification
**Options:**
- **Stripe Identity** - $1.50/verification
  - Document verification (driver's license, passport)
  - Selfie match (liveness)
  - Easy integration (Stripe account required)
  - Developer-friendly API

- **Veriff** - $1-2/verification
  - 98+ document types supported
  - Liveness detection
  - Real-time verification (30 seconds)
  - Good UX (mobile-optimized)

- **Persona** - $2-4/verification
  - US-focused (SSN verification)
  - Modern UX
  - Good for recruitment use case

**Recommendation:** **Stripe Identity**
- Easiest integration (if already using Stripe)
- Cheapest
- Good enough for most cases
- Can be gamed (fake IDs) but adds friction

---

### 2. Liveness Detection (Real Person, Not Photo)
**Options:**
- **iProov** - $0.50-1/verification
  - Best-in-class liveness
  - Flash-based verification
  - Hard to spoof

- **Onfido Motion** - Included in Onfido pricing
  - Face scan + motion verification
  - Mobile-first

- **FaceTec** - $0.25-0.50/verification
  - 3D face mapping
  - Deepfake resistant

**Recommendation:** **FaceTec**
- Cheapest
- Good enough
- Easy to integrate

---

### 3. IP Verification + Geolocation
**Options:**
- **IPQualityScore** - $0.10-0.50/check
  - VPN/proxy detection
  - Fraud scoring
  - Geolocation
  - Bot detection signals
  - Recommended ✅

- **MaxMind GeoIP2** - $0.01-0.05/check
  - Industry standard
  - Just geolocation (no fraud scoring)
  - Cheapest

- **IPAPI** - Free tier, then $0.01/check
  - Good for basic geolocation
  - No VPN detection

**Recommendation:** **IPQualityScore**
- Best fraud detection
- Includes VPN/proxy detection
- Worth the extra cost

---

### 4. Address Verification
**Options:**
- **Loqate** - $0.10-0.30/verification
  - Global address validation
  - Real-time API
  - Postal verification

- **Smarty** - $0.04-0.10/verification
  - US-focused
  - USPS CASS certified
  - Autocomplete + validation

- **Google Places API** - $0.017/verification
  - Address autocomplete
  - Validation via Google Maps
  - Cheapest

**Recommendation:** **Smarty**
- US-specific (our use case)
- USPS-certified (real addresses only)
- Cheap
- Can cross-reference with ID address

---

### 5. Email Verification
**Options:**
- **Hunter.io** - $0.01/verification
  - Catch-all detection
  - Disposable email detection
  - Email format validation

- **ZeroBounce** - $0.008/verification
  - Cheapest
  - Good for bulk

**Recommendation:** **Hunter.io**
- Developer-friendly
- Good free tier for testing

---

### 6. Phone Verification
**Options:**
- **Twilio Verify** - $0.05/verification
  - SMS + voice OTP
  - Industry standard

- **Plivo Verify** - $0.04/verification
  - Slightly cheaper alternative

**Recommendation:** **Twilio Verify**
- Most reliable
- Easy integration

---

### 7. LinkedIn Verification
**Options:**
- **LinkedIn OAuth** - Free (just OAuth flow)
  - Verify profile exists
  - Get profile age, connections, etc.
  - No API cost

**Implementation:**
```typescript
// OAuth flow
app.get('/auth/linkedin', passport.authenticate('linkedin'))

app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
  failureRedirect: '/verify'
}), (req, res) => {
  const profile = req.user

  // Check profile signals
  const signals = {
    profileAge: profile.createdAt,
    connections: profile.connectionsCount,
    hasPhoto: !!profile.profilePicture,
    hasExperience: profile.positions.length > 0
  }

  // Score authenticity
  const isLikelyReal =
    signals.profileAge > 180 && // 6+ months old
    signals.connections > 50 &&
    signals.hasPhoto &&
    signals.hasExperience

  await saveLinkedInVerification(applicantId, signals, isLikelyReal)
})
```

**Recommendation:** Use it (free, adds social proof)

---

### 8. Device Fingerprinting
**Options:**
- **FingerprintJS** - $200/mo for 100K fingerprints
  - Best-in-class device fingerprinting
  - 99.5% accuracy
  - Detects incognito, VMs, bots

- **ClientJS** - Free (open source)
  - Basic fingerprinting
  - Good enough for most cases

**Recommendation:** **ClientJS** for MVP, upgrade to FingerprintJS later

---

### 9. Fraud Scoring (Holistic)
**Options:**
- **Sift** - $500/mo + $0.01/event
  - Machine learning fraud detection
  - Patterns across all events
  - Overkill for our use case

- **Stripe Radar** - $0.05/transaction (if using Stripe)
  - Good fraud scoring
  - Only works if payment involved

**Recommendation:** Build custom scoring with IPQualityScore + other signals

---

## Recommended Stack (Modular Tiers)

### Tier 1: Basic Verification ($2-3 total)
```
1. zkPass (work authorization) - $0
2. IPQualityScore (IP + VPN check) - $0.50
3. Stripe Identity (photo ID) - $1.50
4. Smarty (address verification) - $0.10
5. ClientJS (device fingerprint) - $0
------------------------------------------
Total: ~$2.10 per verification
```

**What it proves:**
- Work authorization (passport/ID)
- Physical location (US-based IP)
- Real document (photo ID)
- Real address (USPS-verified)

---

### Tier 2: Enhanced Verification ($4-5 total)
```
1. Everything in Tier 1 - $2.10
2. FaceTec (liveness detection) - $0.50
3. LinkedIn OAuth (social proof) - $0
4. Twilio Verify (phone OTP) - $0.05
5. Hunter.io (email verification) - $0.01
------------------------------------------
Total: ~$2.66 per verification
```

**What it adds:**
- Real person (not photo/deepfake)
- Social proof (real LinkedIn profile)
- Phone ownership (US number)
- Real email (not disposable)

---

### Tier 3: Maximum Verification ($6-8 total)
```
1. Everything in Tier 2 - $2.66
2. Sumsub (full KYC) - $2-3
3. FingerprintJS (advanced fingerprint) - $0.20
4. Manual review (for edge cases) - Variable
------------------------------------------
Total: ~$5-6 per verification
```

**What it adds:**
- Regulatory compliance (KYC/AML)
- Advanced fraud detection
- Human review for suspicious cases

---

## Integration Complexity (Time Estimates)

| Component | Integration Time | Difficulty |
|-----------|-----------------|------------|
| zkPass | ✅ Already done | Medium |
| IPQualityScore | 2-3 days | Easy |
| Stripe Identity | 3-5 days | Easy |
| Smarty | 1-2 days | Easy |
| ClientJS | 1 day | Easy |
| FaceTec | 3-4 days | Medium |
| LinkedIn OAuth | 2-3 days | Easy |
| Twilio Verify | 1-2 days | Easy |
| Hunter.io | 1 day | Easy |
| Sumsub | 5-7 days | Medium |
| FingerprintJS | 2-3 days | Easy |

**Total for Tier 1 (Basic):** 1-2 weeks
**Total for Tier 2 (Enhanced):** 2-3 weeks
**Total for Tier 3 (Maximum):** 3-4 weeks

---

## Cost Comparison

### Current Manual Approach (WeWork)
- Recruiter time: 30 min × $50/hr = $25
- WeWork cost: $0-20 (location dependent)
- **Total: $25-45 per verification**
- **Scale:** Doesn't scale (manual)

### VerifyUS Tier 1 (Automated)
- Cost: $2.10 per verification
- Time: 3 minutes (applicant)
- **Savings: $23-43 per verification**
- **At 1000 verifications: $23K-43K saved**

---

## Architecture (Modular Flow)

```typescript
// api/services/verification.ts

interface VerificationTier {
  name: string
  steps: Array<() => Promise<VerificationStep>>
  cost: number
}

const TIER_1_BASIC: VerificationTier = {
  name: 'Basic',
  cost: 2.10,
  steps: [
    () => zkPassVerification(),      // Work authorization
    () => ipqsCheck(),                // IP + geolocation + VPN
    () => stripeIdentityCheck(),      // Photo ID
    () => smartyAddressCheck(),       // Address verification
    () => clientJSFingerprint()       // Device fingerprint
  ]
}

const TIER_2_ENHANCED: VerificationTier = {
  name: 'Enhanced',
  cost: 2.66,
  steps: [
    ...TIER_1_BASIC.steps,
    () => facetecLiveness(),          // Liveness detection
    () => linkedInOAuth(),            // Social proof
    () => twilioVerify(),             // Phone OTP
    () => hunterEmailCheck()          // Email verification
  ]
}

async function verifyApplicant(applicantId: string, tier: VerificationTier) {
  const results = []

  for (const step of tier.steps) {
    try {
      const result = await step()
      results.push(result)

      // Early exit if critical check fails
      if (!result.passed && result.critical) {
        return {
          verified: false,
          reason: result.reason,
          completedSteps: results
        }
      }
    } catch (error) {
      // Log error but continue (non-critical)
      console.error('Verification step failed:', error)
    }
  }

  // Calculate overall score
  const score = calculateVerificationScore(results)

  return {
    verified: score >= 70,
    score,
    tier: tier.name,
    cost: tier.cost,
    results
  }
}
```

---

## Decision Matrix: Which Components to Use?

| Use Case | Recommended Tier | Components |
|----------|-----------------|------------|
| **Recruitment platforms** (Nick's use case) | Tier 1 or 2 | zkPass + IPQS + Stripe Identity + LinkedIn |
| **Financial services** (compliance) | Tier 3 | Full KYC (Sumsub) |
| **Gig economy** (Uber, DoorDash) | Tier 2 | Liveness + phone verification |
| **Remote work platforms** | Tier 1 | Basic verification |

---

## Esoteric/Elegant Solutions

### 1. **Network Latency Triangulation**
**Concept:** Physical location affects network latency.
- Ping applicant's device from 3+ US servers
- Measure round-trip time (RTT)
- Calculate likely physical distance
- VPNs add latency (detectable)

**Implementation:**
```typescript
async function networkTriangulation(ipAddress: string) {
  const servers = [
    { location: 'US-West', endpoint: 'https://us-west.verifyus.com/ping' },
    { location: 'US-East', endpoint: 'https://us-east.verifyus.com/ping' },
    { location: 'US-Central', endpoint: 'https://us-central.verifyus.com/ping' }
  ]

  const latencies = await Promise.all(
    servers.map(async (server) => {
      const start = Date.now()
      await fetch(server.endpoint)
      return { location: server.location, latency: Date.now() - start }
    })
  )

  // If in US, latency should be <100ms
  // VPN from India would be 300-500ms
  const avgLatency = latencies.reduce((a, b) => a + b.latency, 0) / latencies.length

  return {
    likelyInUS: avgLatency < 150,
    avgLatency,
    latencies
  }
}
```

**Pros:** Hard to fake (physics-based)
**Cons:** WiFi quality affects results

---

### 2. **Browser Timezone + Language Cross-Check**
**Concept:** Browser exposes timezone and language preferences.
- Check if timezone matches claimed location
- Check if language settings are consistent

**Implementation:**
```typescript
function timezoneCheck() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const language = navigator.language

  const usTimezones = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles']
  const usLanguages = ['en-US', 'en']

  return {
    timezoneMatch: usTimezones.some(tz => timezone.startsWith(tz)),
    languageMatch: usLanguages.includes(language),
    timezone,
    language
  }
}
```

**Pros:** Free, hard to fake (most bots forget this)
**Cons:** Travelers, VPNs with timezone spoofing

---

### 3. **Keystroke Dynamics (Behavioral Biometrics)**
**Concept:** Typing patterns are unique per person.
- Measure time between keystrokes
- Detect copy-paste (bots use scripts)
- Flag inhuman speeds

**Implementation:**
```typescript
let keystrokeTimes = []

document.addEventListener('keydown', (e) => {
  keystrokeTimes.push({
    key: e.key,
    timestamp: Date.now()
  })
})

function analyzeKeystrokeDynamics() {
  const intervals = []
  for (let i = 1; i < keystrokeTimes.length; i++) {
    intervals.push(keystrokeTimes[i].timestamp - keystrokeTimes[i-1].timestamp)
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length

  // Humans: 100-300ms between keystrokes
  // Bots: < 50ms (too fast) or > 1000ms (scripted)
  const isHuman = avgInterval > 50 && avgInterval < 500

  return { isHuman, avgInterval }
}
```

---

## V0 Design Prompt

```
Create a modern, trustworthy verification flow for VerifyUS - a recruitment fraud prevention platform.

Design Requirements:

1. Landing Page
- Hero: "Stop losing $50K+ per fraudulent hire"
- Three problem cards: Foreign applicants faking location, Competitor bots, AI fraud
- "How it works" section with 3 steps
- Pricing table (3 tiers: Basic $2, Enhanced $3, Maximum $5)
- CTA: "Start Pilot" button

2. Applicant Verification Flow
- Step 1: Work Authorization (passport upload OR state ID OR SSN entry)
- Step 2: Take selfie (liveness detection)
- Step 3: Confirm address
- Progress bar showing 3/3 steps
- Success screen: "✅ Verified for 90 days"

3. Employer Dashboard
- Overview cards: Total verifications, Fraud blocked, Time saved, Cost savings
- Recent applicants table with verification status (✅ Verified, ⚠️ Pending, ❌ Rejected)
- Fraud signals chart (trend over time)
- API key generation section

Design Style:
- Color scheme: Trust-focused (blues/greens), red accents for fraud/warnings
- Modern SaaS aesthetic (think Stripe, Linear)
- Mobile-first responsive
- Glassmorphism cards
- Smooth animations
- Trust indicators (lock icons, checkmarks, shield badges)

Components Needed:
- VerificationCard (shows step status)
- StatsCard (dashboard metrics)
- ApplicantTable (recent verifications)
- PricingTier component
- TrustBadge (security indicators)

Include:
- Loading states (skeleton screens)
- Error states (friendly error messages)
- Success states (confetti animation?)
- Empty states (no data yet)

Reference:
- Stripe Identity flow (clean, trustworthy)
- Linear app (modern, fast)
- Retool dashboard (data-dense but clean)
```

---

## Next Steps

1. **Choose components** for Tier 1 (Basic)
   - zkPass ✅
   - IPQualityScore
   - Stripe Identity
   - Smarty
   - ClientJS

2. **Sign up for APIs** (1 day)
   - IPQualityScore account
   - Stripe account (if not already)
   - Smarty account

3. **Build integrations** (1-2 weeks)
   - Parallel development (all independent)

4. **Test with pilot** (Enticeable clients)

5. **Iterate based on feedback**
   - Add Tier 2 components if needed
   - Adjust scoring thresholds
