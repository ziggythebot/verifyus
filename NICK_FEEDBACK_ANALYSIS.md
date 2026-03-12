# Nick's Feedback - Problem Analysis

**Source:** Nick (CEO, Enticeable)
**Date:** 2026-03-12

---

## The Real Problems (From Nick)

### Problem 1: Competitor Bots (Intelligence Gathering)

**What's happening:**
- Recruiters create fake LinkedIn profiles (dozens or hundreds)
- Fake profiles pretend to be "perfect candidates"
- When real recruiters approach them, they demand: "Tell me which company you're recruiting for, or I won't talk"
- **Goal:** Steal competitor's job listings (find out where the work is)

**Why it works:**
- Real candidates don't tell recruiters where they're interviewing anymore
- Fake profiles fill this intelligence gap
- Recruiters can't tell fake from real until after they've revealed the client

**Current "solution":**
- None effective

---

### Problem 2: Foreign Applicants Faking US Location

**What's happening:**
- Applicants in India, Philippines, Pakistan claim to be in the US
- Get through entire interview process
- Only AFTER job offer do they reveal: "I need visa sponsorship"
- Companies in these countries offer this as a service (scam-as-a-service)

**Current "solution":**
- **WeWork verification:** Require applicants to physically go to WeWork, do 5-min interview from there to prove US location
- **Problem with WeWork approach:**
  - Doesn't scale
  - Still vulnerable to proxies/workarounds
  - Manual verification is expensive

**What Nick says they need:**
- **Proof of geolocation** (you're in America, not Pakistan)
- **Proof of identity** (you are who you say you are)
- Digital profile verification (mentions Doti/OTI)

---

## Our Current Solution (VerifyUS)

### What We Built:
- Zero-knowledge proof of US work authorization
- Verifies passport, state ID, SSN+address, or bank account
- Privacy-preserving (no document upload)
- Bot-resistant (cryptographic proofs)

### What We Solve:
✅ **Problem 2 (Foreign Applicants)** - Partially
- Proves work authorization (passport/ID)
- But doesn't prove **current physical location**
- Applicant could have US passport but be in India right now

### What We DON'T Solve:
❌ **Problem 1 (Competitor Bots)** - Not addressed at all
- Our solution assumes real applicants
- Doesn't detect fake profiles created by competitors
- No intelligence-gathering protection

---

## Gap Analysis

### Gap 1: Geolocation Verification Missing

**What Nick needs:**
> "They need to physically know proof of where you are."

**What we have:**
- Proof of US work authorization (passport/ID)
- But NOT proof of current physical location

**The problem:**
- Someone with a US passport could be sitting in India
- Work authorization ≠ physical presence
- WeWork workaround proves physical presence, but doesn't scale

**Solution needed:**
- Real-time geolocation verification
- Privacy-preserving (ZK-based)
- Can't be faked/proxied

---

### Gap 2: Bot Detection Missing

**What Nick needs:**
- Detect fake profiles created by competitor recruiters
- Prevent intelligence gathering through fake candidates

**What we have:**
- Nothing that addresses this

**The problem:**
- Competitor creates 100 fake LinkedIn profiles
- Each fake profile has believable work history
- When contacted, they demand job details before engaging
- Recruiters can't tell fake from real

**Solution needed:**
- Profile authenticity verification
- Detect patterns (same IP creating multiple profiles)
- LinkedIn/social proof verification
- Behavioral analysis (real vs. bot interaction patterns)

---

## Revised Product Requirements

### Must-Have Features (Based on Nick's Feedback)

1. **Geolocation Verification**
   - Prove applicant is physically in the US right now
   - Not just "has US passport"
   - Privacy-preserving (don't reveal exact location)
   - Can't be spoofed with VPN/proxy

2. **Identity Verification**
   - Prove applicant is a real person (not bot)
   - Verify LinkedIn/social profiles are authentic
   - Detect duplicate/fake profiles

3. **Work Authorization Verification**
   - Prove applicant is authorized to work in the US
   - What we already built

### Technical Approaches

#### Geolocation (Privacy-Preserving)

**Option 1: Zero-Knowledge Geolocation Proof**
- Use GPS + network data + timezone
- Generate ZK proof: "I'm in the US" (without revealing exact location)
- Verify against IP address (with VPN detection)
- Cross-reference with device timezone, WiFi network data

**Option 2: Trusted Hardware Attestation**
- Use device's secure enclave (Apple Secure Enclave, Android SafetyNet)
- Generate attestation: "This device is in the US"
- Can't be faked without physical device in the US

**Option 3: Network-Based Verification**
- Verify IP address is US-based (with VPN detection)
- Check latency to US servers (physical location proxy)
- Cross-reference with browser timezone, language settings

**Challenges:**
- VPN detection (sophisticated VPNs hard to detect)
- Privacy (don't want to reveal exact location)
- Mobile vs. desktop (different verification methods)

---

#### Bot Detection

**Option 1: LinkedIn Verification**
- OAuth login with LinkedIn
- Verify profile age (new profiles = suspicious)
- Check activity history (real profiles have engagement)
- Network analysis (100 profiles from same IP = bot farm)

**Option 2: Behavioral Analysis**
- Track interaction patterns (real humans vs. bots)
- Mouse movement, typing cadence, navigation patterns
- Time spent on pages (bots are too fast/too slow)

**Option 3: Social Proof Verification**
- Verify email domain (real company emails vs. Gmail)
- GitHub, Twitter, other social profiles
- "Proof of personhood" (WorldCoin-style, but less invasive)

**Option 4: Pattern Detection**
- Flag multiple applications from same IP/device
- Detect copy-pasted responses (fake profiles use scripts)
- Flag profiles that always demand job details before engaging

---

## Updated Product: VerifyUS 2.0

### Core Features

1. **Triple Verification**
   - ✅ Work Authorization (passport/ID/SSN)
   - ✅ Physical Location (geolocation proof)
   - ✅ Real Person (bot detection)

2. **For Applicants**
   - Verify once, apply everywhere
   - Privacy-preserving (no exact location revealed)
   - Takes ~3 minutes (not 5-min WeWork interview)

3. **For Recruiters**
   - Block foreign applicants (prove US location)
   - Block competitor bots (prove real person)
   - Pre-ATS filtering (only real, US-based candidates)

---

### How It Works (Updated Flow)

**Step 1: Work Authorization**
- Applicant verifies US passport/ID/SSN
- Zero-knowledge proof generated

**Step 2: Geolocation**
- Applicant's device generates location attestation
- Cross-checks: GPS + IP + timezone + network data
- VPN detection (block VPNs or flag for manual review)
- ZK proof: "I'm in the US" (not exact location)

**Step 3: Real Person Verification**
- LinkedIn OAuth login (verify profile is real)
- Behavioral analysis (interaction patterns)
- Device fingerprinting (detect bot farms)
- Optional: Email verification (company email vs. Gmail)

**Step 4: Proof Submitted**
- All three proofs bundled
- API validates all three
- Recruiter sees: "✅ Verified (US-based, real person, work authorized)"

---

## Competitive Advantage

**Current competitors (Doti/OTI):**
- Identity verification only
- No geolocation
- No bot detection
- Expensive ($20-50 per verification)

**VerifyUS 2.0:**
- Identity + geolocation + bot detection
- Privacy-preserving (ZK proofs)
- Cheaper ($3-5 per verification)
- Better UX (browser-based, no WeWork visit)

---

## Implementation Priority

### Phase 1 (MVP, what we built):
- ✅ Work authorization verification
- ✅ Zero-knowledge proofs
- ✅ ATS integration (Greenhouse/Lever)

### Phase 2 (Address Nick's feedback):
- [ ] Geolocation verification (prove physical US presence)
- [ ] Bot detection (fake profile detection)
- [ ] VPN detection (block spoofing)
- [ ] LinkedIn verification (real profile check)

### Phase 3 (Advanced):
- [ ] Behavioral analysis (human vs. bot patterns)
- [ ] Pattern detection (bot farm identification)
- [ ] Intelligence-gathering protection (flag suspicious behavior)

---

## Questions for Nick

1. **Geolocation precision:**
   - Do you need city-level? State-level? Just "in the US"?
   - How do you handle border cases (US citizen traveling abroad)?

2. **Bot detection:**
   - How do you currently detect fake profiles?
   - What patterns have you seen (profile age, connection count, etc.)?
   - Would LinkedIn verification be acceptable (or too invasive)?

3. **Pricing:**
   - Current cost per WeWork verification?
   - What would you pay per automated verification?
   - Volume? (how many applicants/month?)

4. **Integration:**
   - Do you use Greenhouse/Lever?
   - Or custom ATS?
   - How do fake profiles currently enter your system?

5. **Privacy concerns:**
   - Are applicants okay with geolocation verification?
   - Is LinkedIn OAuth acceptable?
   - Any legal concerns (GDPR, CCPA)?

---

## Next Steps

1. **Schedule call with Nick** - Clarify requirements
2. **Research geolocation tech** - Privacy-preserving location proofs
3. **Research bot detection** - LinkedIn API, behavioral analysis
4. **Update product spec** - Add geolocation + bot detection
5. **Prototype geolocation verification** - Proof of concept
6. **Test with Enticeable** - Pilot with Nick's clients

---

## Revised Pitch (For Nick)

**VerifyUS solves both problems:**

1. **Foreign applicants faking US location**
   - Prove physical US presence (not just passport)
   - Can't be faked with VPN
   - Replaces WeWork verification
   - Scales to 1000s of applicants

2. **Competitor bots stealing job intel**
   - Detect fake profiles (real person verification)
   - LinkedIn verification (profile authenticity)
   - Pattern detection (bot farm identification)
   - Flag suspicious behavior (always demands job details)

**Better than current solutions:**
- Faster than WeWork (3 min vs. scheduling + travel)
- Cheaper than Doti/OTI ($3 vs. $20-50)
- More comprehensive (3 verifications vs. 1)
- Privacy-preserving (ZK proofs, no exact location)

**Pilot with Enticeable:**
- Test with your clients (recruitment platforms)
- Measure: fake profiles blocked, time saved, false positive rate
- 60-day free trial, prove ROI before you pay
