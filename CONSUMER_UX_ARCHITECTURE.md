# VerifyUS - Consumer UX Architecture (Account Abstraction)

**Goal:** Make verification feel like creating a LinkedIn profile, not interfacing with blockchain.

---

## The Problem

**Current zkPass flow (scary for job hunters):**
- Install browser extension
- Connect wallet (???)
- Sign transaction (gas fees???)
- Blockchain jargon everywhere
- Feels like crypto, not job applications

**What job hunters expect:**
- Fill out a form
- Upload documents
- Click "Verify"
- Done

**Our solution:** Hide ALL blockchain complexity behind a normal web app.

---

## User Flow: Job Hunter Perspective

### Step 1: Create VerifyUS Profile (One-Time Setup)

**Landing Page:** https://verifyus.com

```
┌─────────────────────────────────────────────────────────┐
│  VerifyUS - Get Verified Once, Apply Everywhere         │
│                                                          │
│  Stop re-uploading documents. Verify your work          │
│  authorization once and apply to any US job.            │
│                                                          │
│  [Create Free Profile]                                   │
│                                                          │
│  ✓ 2-minute setup                                       │
│  ✓ Verify once, use forever                            │
│  ✓ Your documents never leave your device              │
│  ✓ Share only what you want with each employer         │
└─────────────────────────────────────────────────────────┘
```

**No mention of:**
- Blockchain
- Zero-knowledge proofs
- Wallets
- Gas fees
- Crypto anything

---

### Step 2: Login with Privy (One-Click Account Creation)

**Privy Login Modal:**

```
┌─────────────────────────────────────────────────────────┐
│  Create Your VerifyUS Profile                           │
│                                                          │
│  Sign in with:                                           │
│                                                          │
│  [Continue with Google]                                 │
│  [Continue with Email]                                  │
│  [Continue with Phone]                                  │
│  [Continue with Twitter]                                │
│  [Continue with Apple]                                  │
│                                                          │
│  Takes 10 seconds. No password needed.                  │
└─────────────────────────────────────────────────────────┘
```

**Behind the scenes:**
- Privy creates embedded wallet automatically
- User never sees wallet address or private keys
- No seed phrase, no browser extension needed
- All blockchain operations handled by Privy SDK

**After login, user completes profile:**

```
┌─────────────────────────────────────────────────────────┐
│  Complete Your Verification Profile                     │
│                                                          │
│  Full Name: [_______________]                           │
│  (Email/Phone already saved from Privy login)           │
│                                                          │
│  Work Authorization (Choose one):                       │
│  ○ US Passport                                          │
│  ○ State ID / Driver's License                         │
│  ○ SSN + Address Verification                          │
│  ○ US Bank Account                                      │
│                                                          │
│  [Next: Verify Documents]                               │
└─────────────────────────────────────────────────────────┘
```

---

### Step 3: Document Verification (In-Browser, Privacy-Preserving)

**UI shows progress:**

```
┌─────────────────────────────────────────────────────────┐
│  Verifying Your Documents...                            │
│                                                          │
│  ✓ Document uploaded                                    │
│  ✓ Checking authenticity...                             │
│  ⏳ Creating secure proof...                            │
│  ⏳ Finalizing verification                             │
│                                                          │
│  [Cancel]                                                │
└─────────────────────────────────────────────────────────┘
```

**What's actually happening:**
1. zkPass TransGate extension generates proof in browser
2. Platform receives proof (not raw document)
3. Platform pays gas fees (invisible to user)
4. Proof stored on-chain (user doesn't know)
5. Verification badge added to profile

**User sees:**
```
┌─────────────────────────────────────────────────────────┐
│  ✅ Verification Complete!                              │
│                                                          │
│  Your profile is verified. You can now apply to any     │
│  job on VerifyUS-enabled platforms.                     │
│                                                          │
│  Verified:                                               │
│  ✓ US Work Authorization                                │
│  ✓ Physical Location (United States)                   │
│  ✓ Real Person (Not Bot)                               │
│                                                          │
│  [Start Applying to Jobs]                               │
└─────────────────────────────────────────────────────────┘
```

---

### Step 4: Apply to Jobs (Selective Sharing)

**When user clicks "Apply" on a job posting:**

```
┌─────────────────────────────────────────────────────────┐
│  Apply to: Senior Software Engineer @ Acme Corp         │
│                                                          │
│  What would you like to share?                          │
│                                                          │
│  Required by employer:                                   │
│  ☑ Work Authorization Status (Verified)                │
│  ☑ Physical Location (US-based)                        │
│                                                          │
│  Optional (you choose):                                  │
│  ☑ LinkedIn Profile                                     │
│  ☑ Phone Number                                         │
│  ☐ Home Address                                         │
│  ☐ Age Range (25-35)                                    │
│                                                          │
│  Not shared (privacy-protected):                        │
│  🔒 Passport number                                     │
│  🔒 SSN                                                 │
│  🔒 Date of birth                                       │
│                                                          │
│  [Submit Application]                                    │
└─────────────────────────────────────────────────────────┘
```

**Employer sees:**
```
┌─────────────────────────────────────────────────────────┐
│  Applicant: John Smith                                  │
│                                                          │
│  ✅ VerifyUS Verified                                   │
│  ✓ Authorized to work in US                            │
│  ✓ Located in United States                            │
│  ✓ Real person (not bot)                               │
│                                                          │
│  Shared Info:                                            │
│  LinkedIn: linkedin.com/in/johnsmith                    │
│  Phone: (555) 123-4567                                  │
│  Age Range: 25-35                                       │
│                                                          │
│  [View Full Application]                                │
└─────────────────────────────────────────────────────────┘
```

**Employer does NOT see:**
- Passport number
- SSN
- Exact date of birth
- Home address (unless user chose to share)
- Any blockchain/crypto references

---

## Technical Architecture (Behind the Scenes)

### Account Abstraction Flow (Using Privy)

```
User creates account via Privy
    ↓
Privy creates embedded wallet (user never sees it)
    ↓
User logs in with email, SMS, or social (Google, Twitter, etc.)
    ↓
Privy handles all key management (secure enclaves)
    ↓
User's "profile ID" = Privy user ID
    ↓
Platform calls Privy SDK to sign transactions
    ↓
Gas fees paid by platform (Privy paymaster)
    ↓
User never sees wallet, keys, or transactions
```

**Tech Stack:**
- **Account Abstraction:** Privy (embedded wallets + account abstraction)
- **Authentication:** Email, SMS, Google, Twitter, Apple (Privy handles all)
- **Key Management:** Privy secure enclaves (no custom KMS needed)
- **Paymaster:** Privy built-in paymaster (sponsors gas fees)

**Why Privy?**
- ✅ Battle-tested embedded wallet infrastructure
- ✅ Built-in account abstraction (no ERC-4337 complexity)
- ✅ Multiple login methods (email, SMS, social)
- ✅ Built-in paymaster (platform sponsors gas)
- ✅ No custom key management needed
- ✅ SOC 2 compliant, security audited
- ✅ Used by top apps (Phantom, Blackbird, Friend.tech)

**Code Example:**
```typescript
// api/services/privy.ts
import { PrivyClient } from '@privy-io/server-auth'

const privyClient = new PrivyClient(
  process.env.PRIVY_APP_ID,
  process.env.PRIVY_APP_SECRET
)

// User creates account (frontend)
// Privy SDK handles wallet creation automatically
const { login } = usePrivy()
await login() // User logs in with email/SMS/social

// Backend: Submit verification proof using user's embedded wallet
async function submitVerificationProof(privyUserId: string, zkProof: string) {
  // Get user's embedded wallet address from Privy
  const user = await privyClient.getUserById(privyUserId)
  const walletAddress = user.wallet.address

  // Call Privy to sign transaction with user's embedded wallet
  const tx = await privyClient.wallet.sendTransaction({
    userId: privyUserId,
    to: VERIFYUS_CONTRACT_ADDRESS,
    data: encodeVerificationProof(zkProof),
    value: '0'
  })

  // Platform pays gas via Privy paymaster (configured in Privy dashboard)
  // User sees: "✅ Verification Complete!"
  return tx
}
```

**Privy Login Flow (Frontend):**
```typescript
// components/VerifyUSLogin.tsx
import { usePrivy } from '@privy-io/react-auth'

export function VerifyUSLogin() {
  const { login, user, authenticated } = usePrivy()

  if (authenticated) {
    return <p>Logged in as {user.email || user.phone}</p>
  }

  return (
    <button onClick={login}>
      Create VerifyUS Profile
    </button>
  )
}

// User clicks button -> Privy modal appears
// User can choose: Email, SMS, Google, Twitter, Apple
// No wallet install, no seed phrases, no crypto jargon
```

---

### Gas Monetization (Who Pays?)

**Option 1: Platform Pays (Freemium Model)**
- Free for job hunters (acquisition strategy)
- Employers pay $2-3 per verified applicant
- Platform absorbs gas costs ($0.01-0.05 per proof)

**Option 2: Employer Pays (B2B SaaS Model)**
- Employer signs up for VerifyUS
- Pays monthly fee ($500/mo for 200 verifications)
- Gas fees included in subscription

**Option 3: Hybrid (Subsidized by Employers)**
- Job hunter creates profile (free)
- When they apply, employer's account is charged
- Job hunter sees: "This employer uses VerifyUS - no cost to you!"

**Recommendation:** Option 1 (Platform Pays)
- Best UX (completely free for job hunters)
- Fastest growth (no friction)
- Gas costs are low ($0.01-0.05 per proof)
- At 10,000 verifications/month: $100-500 in gas
- Revenue from employers: $20K-30K/month
- **Gas costs = 0.5-2.5% of revenue (negligible)**

---

### Selective Sharing Architecture

**Database Schema:**
```sql
-- User's verified attributes (stored encrypted)
CREATE TABLE user_verifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  wallet_address TEXT,

  -- Verification proofs (ZK proofs, not raw data)
  work_authorization_proof TEXT, -- Encrypted ZK proof
  location_proof TEXT,           -- Encrypted ZK proof
  identity_proof TEXT,           -- Encrypted ZK proof

  -- Metadata (not shared with employers)
  verified_at TIMESTAMP,
  expires_at TIMESTAMP,

  -- User-controlled sharing preferences
  linkedin_profile TEXT,
  phone_number TEXT,
  address TEXT,
  age_range TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Per-application sharing logs (audit trail)
CREATE TABLE application_shares (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  employer_id UUID REFERENCES employers(id),
  job_id UUID,

  -- What was shared with this specific employer
  shared_fields JSONB, -- {"work_auth": true, "location": true, "linkedin": true, "phone": false, ...}

  -- ZK proof sent to employer (not raw data)
  verification_token TEXT, -- Time-limited token proving verification status

  created_at TIMESTAMP DEFAULT NOW()
);
```

**Sharing Flow (Code Example):**
```typescript
// api/services/selective-sharing.ts

interface SharingPreferences {
  workAuthorization: boolean  // Required by platform
  location: boolean           // Required by platform
  identityVerified: boolean   // Required by platform

  linkedin?: boolean          // Optional
  phone?: boolean             // Optional
  address?: boolean           // Optional
  ageRange?: boolean          // Optional
}

async function createApplicationToken(
  userId: string,
  employerId: string,
  jobId: string,
  preferences: SharingPreferences
): Promise<string> {

  // Get user's verified proofs
  const verification = await db.userVerifications.findOne({ userId })

  // Build employer-specific token (only includes what user chose to share)
  const tokenPayload = {
    // Always included (verification status only, not raw data)
    verified: {
      workAuthorization: !!verification.work_authorization_proof,
      location: !!verification.location_proof,
      identity: !!verification.identity_proof
    },

    // Conditionally included based on user preferences
    ...(preferences.linkedin && { linkedin: verification.linkedin_profile }),
    ...(preferences.phone && { phone: verification.phone_number }),
    ...(preferences.address && { address: verification.address }),
    ...(preferences.ageRange && { ageRange: verification.age_range }),

    // Metadata
    userId,
    employerId,
    jobId,
    sharedAt: new Date(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  }

  // Sign token (employer can verify it came from VerifyUS)
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '90d' })

  // Log what was shared (audit trail)
  await db.applicationShares.create({
    userId,
    employerId,
    jobId,
    sharedFields: preferences,
    verificationToken: token
  })

  return token
}

// Employer receives this token via ATS webhook
async function validateApplicationToken(token: string): Promise<VerificationResult> {
  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  return {
    verified: decoded.verified, // {workAuthorization: true, location: true, identity: true}
    sharedInfo: {
      linkedin: decoded.linkedin, // Only if user chose to share
      phone: decoded.phone,       // Only if user chose to share
      // etc.
    },
    expiresAt: decoded.expiresAt
  }
}
```

---

## Privacy Guarantees

### What VerifyUS Platform Sees:
- ✅ User's email, phone (for account recovery)
- ✅ Encrypted ZK proofs (can't decrypt to raw documents)
- ✅ Verification status (verified or not)
- ✅ What user chose to share with each employer (audit log)

### What VerifyUS Platform NEVER Sees:
- ❌ Passport number
- ❌ SSN
- ❌ Date of birth
- ❌ Raw document images
- ❌ Exact GPS coordinates

**Technical Enforcement:**
- zkPass generates proofs client-side (in browser extension)
- Raw documents never uploaded to server
- Platform receives only cryptographic proof
- Proof reveals "yes/no" (authorized or not), nothing else

---

### What Employers See:
- ✅ Verification status (✅ Verified or ❌ Not Verified)
- ✅ What user chose to share (LinkedIn, phone, age range, etc.)
- ✅ Verification expiry date

### What Employers NEVER See:
- ❌ Passport number
- ❌ SSN
- ❌ Date of birth (only age range if user shared)
- ❌ Home address (unless user shared)
- ❌ Any blockchain/wallet addresses
- ❌ Raw documents

**Technical Enforcement:**
- Employers receive JWT token with limited fields
- Token signed by VerifyUS (tamper-proof)
- Token expires after 90 days
- Employers can only see what user explicitly chose to share

---

## User Dashboard (Profile Management)

```
┌─────────────────────────────────────────────────────────┐
│  Your VerifyUS Profile                                   │
│                                                          │
│  Status: ✅ Verified (Expires: Dec 31, 2026)            │
│                                                          │
│  Verified Attributes:                                    │
│  ✓ US Work Authorization                                │
│  ✓ Physical Location (United States)                   │
│  ✓ Real Person (Not Bot)                               │
│                                                          │
│  [Renew Verification] (auto-renews 90 days)             │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  Recent Applications (What you shared):                  │
│                                                          │
│  ▸ Acme Corp - Senior Engineer                          │
│    Shared: Work auth, Location, LinkedIn, Phone         │
│    Applied: Mar 10, 2026                                │
│                                                          │
│  ▸ TechCo - Frontend Developer                          │
│    Shared: Work auth, Location, LinkedIn                │
│    Applied: Mar 8, 2026                                 │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  Privacy Settings:                                       │
│  Default sharing (for all applications):                │
│  ☑ Work Authorization (Required)                        │
│  ☑ Location (Required)                                  │
│  ☑ LinkedIn Profile                                     │
│  ☐ Phone Number                                         │
│  ☐ Age Range                                            │
│  ☐ Home Address                                         │
│                                                          │
│  [Save Defaults]                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Integration with Job Platforms

### Option 1: Embeddable Widget (Greenhouse, Lever, etc.)

**Employer adds one line to job posting:**
```html
<script src="https://verifyus.com/widget.js" data-employer-id="acme-corp"></script>
```

**Widget appears on job page:**
```
┌─────────────────────────────────────────────────────────┐
│  🛡️ This employer uses VerifyUS                         │
│                                                          │
│  Get verified in 2 minutes and skip manual checks       │
│                                                          │
│  [Apply with VerifyUS] [Apply Normally]                 │
└─────────────────────────────────────────────────────────┘
```

**If user clicks "Apply with VerifyUS":**
1. Redirected to VerifyUS (SSO if already has account)
2. Choose what to share (selective sharing UI)
3. Click "Submit Application"
4. Redirected back to employer's ATS
5. Application auto-filled with verified data

---

### Option 2: ATS Integration (Direct API)

**Greenhouse Custom Field:**
```
Job Application Form:
  Name: [___]
  Email: [___]

  ☑ Verify with VerifyUS
     [Connect VerifyUS Profile] ← Button

  Status: ✅ Verified (US-based, work authorized)
```

**Backend flow:**
1. Applicant clicks "Connect VerifyUS Profile"
2. OAuth flow to VerifyUS
3. User chooses what to share
4. VerifyUS sends webhook to Greenhouse
5. Custom field auto-populated: "✅ Verified"

---

## Cost Analysis (Account Abstraction)

### Gas Costs (Per Verification)

**Ethereum Mainnet:**
- Submit ZK proof: ~50,000 gas
- Gas price: 20 gwei (average)
- Cost: 50,000 × 20 gwei = 0.001 ETH = **$2** (at $2000/ETH)

**Too expensive!**

**Layer 2 (Polygon, Optimism, Base):**
- Submit ZK proof: ~50,000 gas
- Gas price: 0.1 gwei (L2 average)
- Cost: 50,000 × 0.1 gwei = 0.000005 ETH = **$0.01** (at $2000/ETH)

**Perfect!**

**Recommendation:** Use Polygon or Base (L2)
- Gas cost: $0.01 per verification
- At 10,000 verifications/month: $100/month
- Revenue from employers: $20K-30K/month
- **Gas = 0.3-0.5% of revenue** ✅

---

### Total Cost Per Verification (Including Account Abstraction)

```
Tier 1: Basic Verification
  - zkPass (work authorization): $0
  - IPQualityScore (IP/VPN check): $0.50
  - Stripe Identity (photo ID): $1.50
  - Smarty (address verification): $0.10
  - ClientJS (device fingerprint): $0
  - Gas fees (L2): $0.01
  ─────────────────────────────────────
  Total: $2.11 per verification
```

```
Tier 2: Enhanced Verification
  - Everything in Tier 1: $2.11
  - FaceTec (liveness): $0.50
  - LinkedIn OAuth: $0
  - Twilio Verify (phone OTP): $0.05
  - Hunter.io (email): $0.01
  - Claude LLM (social proof): $0.03
  - Gas fees (L2): $0.01
  ─────────────────────────────────────
  Total: $2.71 per verification
```

**Gas costs = negligible** (1-2% of total cost)

---

## Security Considerations

### Key Management (Privy Handles Everything)

**No custom key management needed!**

Privy handles all key security:
- ✅ Keys stored in secure enclaves (TEEs)
- ✅ SOC 2 Type II certified
- ✅ Regular security audits
- ✅ No single point of failure (distributed key shares)
- ✅ Rate limiting built-in
- ✅ Audit logging included

**What we store:**
- Privy user ID (e.g., `privy:clg...`)
- User's email/phone (from Privy)
- Verification metadata (proof hashes, expiry dates)

**What we DON'T store:**
- Private keys (Privy's responsibility)
- Seed phrases (Privy's responsibility)
- Wallet passwords (Privy's responsibility)

**Compliance:**
- Privy is SOC 2 compliant
- GDPR compliant (data deletion APIs)
- CCPA compliant
- We inherit their compliance posture

---

### Proof Expiry (Auto-Renewal)

**Problem:** ZK proofs should expire (prevent stale verifications)

**Solution:** Auto-renew every 90 days

**Flow:**
1. User verifies once (proof valid for 90 days)
2. Day 80: Platform sends email "Your verification expires in 10 days"
3. User clicks "Renew Verification"
4. Re-verify current location (prove still in US)
5. New proof generated (valid for another 90 days)

**Code:**
```typescript
// api/jobs/renew-verifications.ts
import cron from 'node-cron'

// Run daily at 9am
cron.schedule('0 9 * * *', async () => {
  const expiringVerifications = await db.userVerifications.findMany({
    where: {
      expires_at: {
        gte: new Date(),
        lte: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // Next 10 days
      }
    }
  })

  for (const verification of expiringVerifications) {
    await sendRenewalEmail(verification.user_id, verification.expires_at)
  }
})
```

---

## Migration Path (From zkPass Extension to VerifyUS Platform)

### Phase 1: Hybrid (Support Both)
- Users can use zkPass extension directly (current flow)
- OR use VerifyUS platform (new flow with account abstraction)
- Platform detects which method user is using

### Phase 2: Deprecate Extension
- All new users onboarded to platform flow
- Existing extension users migrated (import existing proofs)
- Extension becomes optional (for power users who want self-custody)

### Phase 3: Platform-Only
- Extension deprecated
- All users use VerifyUS platform
- Account abstraction is default

---

## Competitive Advantage

**VerifyUS Platform vs. Direct zkPass:**

| Feature | Direct zkPass | VerifyUS Platform |
|---------|---------------|-------------------|
| **Setup time** | 5+ min (install extension, connect wallet) | 2 min (fill form) |
| **Blockchain knowledge** | Required (wallets, gas, etc.) | Not required |
| **Gas fees** | User pays ($2 on mainnet) | Platform pays ($0.01 on L2) |
| **Selective sharing** | Not built-in | Native feature |
| **Multi-job applications** | Manual per job | Reuse profile |
| **Employer integration** | Complex (ATS webhook + on-chain verification) | Simple (API token) |
| **User experience** | Web3 (scary for normies) | Web2 (familiar) |

**Result:** 10x better UX, 100x cheaper, 1000x easier for employers

---

## Next Steps

1. **Set up Privy integration** (2-3 days)
   - Create Privy app at https://console.privy.io
   - Install `@privy-io/react-auth` and `@privy-io/server-auth`
   - Configure paymaster (platform sponsors gas on Polygon/Base)
   - Test embedded wallet creation + login flow

2. **Design selective sharing UI** (1 week)
   - Figma mockups for sharing preferences screen
   - Test with 5 job hunters (user research)

3. **Build VerifyUS platform MVP** (2-3 weeks)
   - Privy login flow (frontend)
   - Document verification flow (zkPass + Privy wallet)
   - Employer dashboard
   - Application token generation (selective sharing)

4. **Test with Enticeable pilot** (4 weeks)
   - Onboard 3 recruitment platforms
   - Measure: completion rate, false positives, employer satisfaction

5. **Iterate based on feedback** (ongoing)
   - Optimize gas costs (switch L2s if needed)
   - Add more login methods (Discord, LinkedIn OAuth, etc.)
   - Expand selective sharing options

---

## Open Questions

1. **Self-custody option?**
   - Privy supports wallet export (users can get their seed phrase if they want)
   - Should we enable this? Or keep it simple (embedded only)?
   - Most users won't care, but power users might

2. **Portability?**
   - Can users export their verification to another platform?
   - Proofs live on-chain (public), so technically portable
   - But application tokens (selective sharing) are VerifyUS-specific

3. **Regulatory?**
   - Privy is not a custodial wallet service (they don't hold funds)
   - But we should still get legal review (especially for SSN verification)
   - Privy has KYC/AML guidance docs we can follow

4. **Multi-chain?**
   - Privy supports multiple chains (Ethereum, Polygon, Base, Optimism, etc.)
   - Start with one L2 (Base or Polygon) for MVP
   - Can expand later if needed

5. **Proof revocation?**
   - What if user's work authorization expires?
   - Can employers check real-time validity or only at application time?
   - Should we add on-chain proof expiry mechanism?

6. **Privy pricing?**
   - Free tier: 1,000 monthly active wallets
   - Growth: $99/mo for 10,000 MAW
   - At pilot scale (1,000 users), we're on free tier
   - Need to budget for Growth plan if we scale past 1,000 MAW
