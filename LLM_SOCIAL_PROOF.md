# LLM-Powered Social Proof Layer

**Concept:** Use Claude (Anthropic) to analyze social profiles and web presence for "proof of life" — determining if a person is real vs. a bot/fake profile.

---

## The Insight

**Current bot detection:** Rule-based (profile age > 180 days, connections > 50, etc.)
- Bots learn the rules and adapt
- Sophisticated bots pass these checks

**LLM-powered detection:** Semantic analysis
- Analyzes LinkedIn posts, comments, engagement patterns
- Checks consistency across platforms (LinkedIn, Twitter, GitHub)
- Detects AI-generated content (bots writing their own bios)
- Evaluates "humanness" of writing style
- Flags suspicious patterns (all generic content, no personality)

**Key advantage:** Bots can fake data, but they can't fake *personality* and *consistency* over time.

---

## What the LLM Analyzes

### 1. LinkedIn Profile
**Inputs to Claude:**
```typescript
const linkedInData = {
  profile: {
    headline: "Senior Software Engineer at Google",
    summary: "Passionate about building scalable systems...",
    experience: [...],
    education: [...],
    skills: [...],
    recommendations: [...]
  },
  activity: {
    posts: [...], // Last 20 posts
    comments: [...], // Last 50 comments
    reactions: [...] // What they react to
  },
  network: {
    connections: 1234,
    connectionsInCommon: 45,
    followers: 567
  },
  metadata: {
    accountAge: "3 years",
    lastActive: "2 days ago",
    profileCompleteness: "95%"
  }
}
```

**Claude's task:**
> Analyze this LinkedIn profile and activity. Is this a real person or a fake/bot profile? Consider:
> - Consistency of voice across posts and bio
> - Quality of content (generic vs. specific, personal)
> - Engagement patterns (do they interact genuinely?)
> - Timeline consistency (logical career progression)
> - Writing style (human vs. AI-generated)
> - Network authenticity (real connections vs. mass follow)
>
> Return a score (0-100) and reasoning.

---

### 2. Cross-Platform Verification
**Inputs to Claude:**
```typescript
const socialProfiles = {
  linkedin: linkedInData,
  twitter: {
    handle: "@johndoe",
    tweets: [...], // Last 50 tweets
    followers: 1234,
    following: 567,
    accountAge: "2018-03-15"
  },
  github: {
    username: "johndoe",
    repos: [...], // Public repos
    contributions: contributionGraph,
    followers: 123
  },
  personalWebsite: {
    url: "https://johndoe.com",
    content: scrapedContent,
    lastUpdated: "2024-01-15"
  }
}
```

**Claude's task:**
> Cross-reference these social profiles. Are they consistent? Consider:
> - Does the same person's personality come through?
> - Are employment dates consistent across platforms?
> - Does their GitHub match their claimed skills?
> - Is there evidence of long-term, genuine activity?
> - Any red flags (inconsistent timelines, contradictions)?
>
> Return consistency score (0-100) and any red flags.

---

### 3. AI-Generated Content Detection
**Inputs to Claude:**
```typescript
const content = {
  linkedInSummary: "I am a passionate software engineer...",
  twitterBio: "Tech enthusiast | Coffee lover | Building the future",
  blogPosts: [...] // If personal blog exists
}
```

**Claude's task:**
> Analyze this content. Does it feel human-written or AI-generated? Consider:
> - Generic phrasing (common in AI-generated bios)
> - Lack of specificity (no personal anecdotes, details)
> - Overly polished (no typos, too perfect grammar)
> - Clichés and buzzwords (AI loves "passionate," "enthusiast")
> - Personality markers (humor, quirks, unique voice)
>
> Return humanness score (0-100) and reasoning.

---

## Implementation

### Architecture

```
Applicant
  ↓
1. LinkedIn OAuth (authenticate + fetch profile)
  ↓
2. Optional: Twitter/GitHub OAuth (cross-platform verification)
  ↓
3. Scrape public data (blog, personal website)
  ↓
4. Send to Claude API (analyze all data)
  ↓
5. Claude returns:
   - Authenticity score (0-100)
   - Reasoning (why real or fake)
   - Red flags (if any)
  ↓
6. Store score + reasoning in database
  ↓
7. Flag for manual review if score < 50
```

---

### Code Implementation

```typescript
// api/services/llm-social-proof.ts

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

interface SocialProofAnalysis {
  authenticityScore: number // 0-100
  reasoning: string
  redFlags: string[]
  isLikelyReal: boolean
  confidence: number // How confident is the LLM
}

async function analyzeSocialProof(
  linkedInData: any,
  twitterData?: any,
  githubData?: any
): Promise<SocialProofAnalysis> {

  const prompt = `
You are a fraud detection expert analyzing social media profiles to determine if a person is real or a bot/fake profile.

LinkedIn Data:
${JSON.stringify(linkedInData, null, 2)}

${twitterData ? `Twitter Data:\n${JSON.stringify(twitterData, null, 2)}` : ''}
${githubData ? `GitHub Data:\n${JSON.stringify(githubData, null, 2)}` : ''}

Analyze this person's online presence. Consider:

1. **Authenticity markers:**
   - Consistent voice/personality across posts
   - Specific, personal details (not generic)
   - Genuine engagement (thoughtful comments, not spam)
   - Logical career progression
   - Real connections (not mass-followed)

2. **Red flags:**
   - AI-generated content (generic, buzzword-heavy)
   - Inconsistent timelines across platforms
   - No personality (all professional, no personal)
   - Suspicious engagement patterns (likes but no comments)
   - New profile with perfect completion (bots rush)

3. **Cross-platform consistency:**
   - Do employment dates match?
   - Does claimed expertise match GitHub activity?
   - Is the writing style consistent?

Return your analysis as JSON:
{
  "authenticityScore": <0-100>,
  "reasoning": "<why you scored this way>",
  "redFlags": ["<flag 1>", "<flag 2>"],
  "isLikelyReal": <true/false>,
  "confidence": <0-100>
}
`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: prompt
    }]
  })

  const response = message.content[0].text
  const analysis = JSON.parse(response)

  return analysis
}
```

---

### Prompt Engineering (Key Techniques)

**1. Few-shot examples (teach Claude patterns):**
```typescript
const prompt = `
Here are examples of real vs. fake profiles:

REAL PROFILE:
- LinkedIn: "Just shipped a nasty bug fix at 2am. CSS grid is the devil. But hey, prod is stable now 😅"
- Twitter: Mix of work tweets, personal stuff (dog photos), sarcasm
- GitHub: Regular commits, messy commit messages, actual code
- Red flags: None
- Score: 95

FAKE PROFILE:
- LinkedIn: "I am a passionate software engineer with expertise in cutting-edge technologies..."
- Twitter: Only RT's job postings, no original content
- GitHub: Account created same day as LinkedIn, no commits
- Red flags: Generic bio, new account, no personality
- Score: 15

Now analyze this profile:
${JSON.stringify(profileData)}
`
```

**2. Chain-of-thought reasoning:**
```typescript
const prompt = `
Analyze this profile step-by-step:

Step 1: Check profile age and completeness
- How old is the account?
- Is it suspiciously complete for a new account?

Step 2: Analyze content quality
- Is the writing generic or specific?
- Does it show personality?
- Are there personal anecdotes?

Step 3: Check engagement patterns
- Do they post original content or just spam?
- Are comments thoughtful or generic?

Step 4: Cross-reference platforms
- Do timelines match?
- Is there consistency?

Step 5: Final verdict
- Real or fake?
- Confidence level?

Profile data:
${JSON.stringify(profileData)}
`
```

**3. Confidence scoring:**
```typescript
// Have Claude express uncertainty
const prompt = `
...return your confidence level:
- 95-100: Very confident this is real/fake
- 70-95: Confident, but some ambiguity
- 50-70: Uncertain, needs manual review
- <50: Not enough data to judge
`
```

---

## Cost Analysis

### Anthropic API Pricing
- Claude 3.5 Sonnet: $3 per million input tokens, $15 per million output tokens
- Average analysis: 5K input tokens + 1K output tokens
- **Cost per analysis: ~$0.03**

### Compared to alternatives:
- Manual review: $25 (30 min at $50/hr)
- Traditional bot detection: Free but less accurate
- **LLM approach: $0.03 + better accuracy**

---

## Scoring Rubric (What Claude Looks For)

### Authenticity Markers (+points)

| Signal | Points | Example |
|--------|--------|---------|
| **Personality in posts** | +20 | "Just debugged for 4 hours. Turns out it was a typo 🤦" |
| **Specific details** | +15 | "Shipped the new auth system at Stripe" (verifiable) |
| **Thoughtful comments** | +10 | Detailed replies to posts, not just "Great post!" |
| **Long-term activity** | +15 | Account active for 3+ years |
| **Cross-platform consistency** | +15 | LinkedIn employment matches GitHub repos |
| **Imperfections** | +10 | Typos, casual language (humans aren't perfect) |
| **Personal content** | +10 | Mix of work and personal (dog photos, hobbies) |
| **Varied engagement** | +5 | Likes, comments, shares, posts (not just one type) |

**Total max: 100 points**

---

### Red Flags (-points)

| Signal | Points | Example |
|--------|--------|---------|
| **Generic bio** | -20 | "Passionate professional with expertise in..." |
| **AI-generated content** | -25 | Buzzword-heavy, overly polished, no personality |
| **No original content** | -15 | Only shares/RT's, never posts original thoughts |
| **Suspicious timing** | -15 | New account with 100% completion |
| **Inconsistent timelines** | -20 | LinkedIn says 2020-2022, Twitter says 2021-2023 |
| **Mass connections** | -10 | 5000 connections, 0 endorsements |
| **Generic comments** | -10 | "Great post!", "Congrats!", "Nice!" on every post |
| **No GitHub activity** | -15 | Claims "Senior Engineer" but no code |

**Red flag score > 50: Flag for manual review**

---

## Enhanced Detection (Composite Score)

Combine LLM analysis with other signals:

```typescript
interface CompositeScore {
  llmAuthenticityScore: number        // Claude's analysis (0-100)
  profileAgeScore: number             // Account age (0-100)
  engagementScore: number             // Activity level (0-100)
  networkScore: number                // Connection quality (0-100)
  crossPlatformScore: number          // Consistency (0-100)
  behavioralScore: number             // Mouse/typing patterns (0-100)
  ipReputationScore: number           // IPQualityScore (0-100)

  // Weighted average
  finalScore: number
}

function calculateFinalScore(scores: CompositeScore): number {
  return (
    scores.llmAuthenticityScore * 0.30 +  // LLM = most important
    scores.crossPlatformScore * 0.20 +
    scores.profileAgeScore * 0.15 +
    scores.engagementScore * 0.15 +
    scores.networkScore * 0.10 +
    scores.behavioralScore * 0.05 +
    scores.ipReputationScore * 0.05
  )
}
```

---

## Example Prompts (Full)

### Prompt 1: LinkedIn-Only Analysis

```
You are a fraud detection expert. Analyze this LinkedIn profile to determine if it's a real person or a bot/fake profile created by a competitor recruiter.

CONTEXT: Recruitment agencies create fake LinkedIn profiles to:
1. Steal job listings from competitors
2. Gather intelligence on clients
3. Waste recruiters' time

These fake profiles typically:
- Have generic bios ("passionate professional...")
- Are very recently created but 100% complete
- Have no genuine engagement (just "Great post!" comments)
- Lack personality and specific details
- May have AI-generated content

LINKEDIN DATA:
{
  "profile": {
    "name": "John Doe",
    "headline": "Senior Software Engineer at Google",
    "summary": "Passionate software engineer with 10+ years of experience in full-stack development...",
    "experience": [
      {"company": "Google", "title": "Senior SWE", "duration": "2020-present"},
      {"company": "Facebook", "title": "SWE", "duration": "2018-2020"}
    ],
    "connections": 534,
    "accountCreated": "2023-01-15",
    "lastActive": "2 days ago"
  },
  "activity": {
    "posts": [
      "Excited to share that I've completed the AWS certification!",
      "Great article on microservices architecture: [link]",
      "Looking forward to the tech conference next week!"
    ],
    "comments": [
      "Great post!",
      "Congrats!",
      "Interesting perspective"
    ]
  }
}

Analyze this profile. Is it real or fake?

Return JSON:
{
  "authenticityScore": 0-100,
  "reasoning": "Detailed explanation",
  "redFlags": ["flag 1", "flag 2"],
  "isLikelyReal": true/false,
  "confidence": 0-100,
  "recommendation": "Accept" | "Manual Review" | "Reject"
}
```

---

### Prompt 2: Cross-Platform Analysis

```
You are analyzing social media profiles for fraud detection. This person applied for a job and provided LinkedIn, Twitter, and GitHub profiles.

Cross-reference these profiles. Are they consistent? Is this a real person?

LINKEDIN:
[LinkedIn data]

TWITTER:
[Twitter data]

GITHUB:
[GitHub data]

RED FLAGS TO CHECK:
1. Inconsistent employment dates
2. Different personalities across platforms
3. GitHub activity doesn't match claimed skills
4. Twitter is dormant but LinkedIn is active
5. No personal content anywhere (all professional)
6. Accounts all created around the same time

Return JSON with consistency analysis.
```

---

## Integration with VerifyUS

### Tier 2: Enhanced Verification

```typescript
// After LinkedIn OAuth
const linkedInData = await fetchLinkedInProfile(accessToken)

// Optional: Get Twitter/GitHub
const twitterData = await fetchTwitterProfile(twitterHandle)
const githubData = await fetchGitHubProfile(githubUsername)

// LLM analysis
const socialProofAnalysis = await analyzeSocialProof(
  linkedInData,
  twitterData,
  githubData
)

// Store results
await db.insert('social_proof_scores', {
  applicant_id,
  authenticity_score: socialProofAnalysis.authenticityScore,
  reasoning: socialProofAnalysis.reasoning,
  red_flags: socialProofAnalysis.redFlags,
  analyzed_at: new Date()
})

// Flag for review if low score
if (socialProofAnalysis.authenticityScore < 50) {
  await flagApplicant(applicant_id, {
    reason: 'Low social proof authenticity score',
    score: socialProofAnalysis.authenticityScore,
    red_flags: socialProofAnalysis.redFlags
  })
}
```

---

## Pricing Update (With LLM Layer)

### Tier 2: Enhanced Verification (with LLM)

**Previous:** $2.66
- zkPass, IPQS, Stripe Identity, etc.

**New:** $2.69
- Everything above
- **+ Claude analysis: $0.03**

**What it adds:**
- Semantic analysis of social profiles
- AI-generated content detection
- Cross-platform consistency check
- "Proof of life" scoring
- Better bot detection (vs. rule-based)

**ROI:**
- Catches sophisticated bots that pass rule-based checks
- Reduces false positives (real people with new profiles)
- ~$0.03 cost prevents $50K fraudulent hire

---

## Performance Optimization

### Caching Strategy
```typescript
// Cache LLM analysis for 90 days (same as proof expiration)
const cacheKey = `social_proof:${applicant_id}`
const cached = await redis.get(cacheKey)

if (cached) {
  return JSON.parse(cached)
}

const analysis = await analyzeSocialProof(...)
await redis.setex(cacheKey, 90 * 24 * 60 * 60, JSON.stringify(analysis))

return analysis
```

**Benefit:** Re-applying to multiple jobs doesn't re-analyze (saves $0.03 per application)

---

### Async Processing
```typescript
// Don't block applicant on LLM analysis
app.post('/api/v1/verify', async (req, res) => {
  // Sync verifications (fast)
  const basicVerification = await verifyBasic(applicantData)

  // Return immediately
  res.json({ verified: true, processing: true })

  // Async LLM analysis (30-60 seconds)
  await queue.add('llm-social-proof', {
    applicant_id,
    linkedInData: req.body.linkedInData
  })
})

// Worker processes LLM analysis in background
worker.process('llm-social-proof', async (job) => {
  const analysis = await analyzeSocialProof(job.data.linkedInData)

  // Update applicant record
  await updateApplicant(job.data.applicant_id, { social_proof_score: analysis.authenticityScore })

  // Flag if suspicious
  if (analysis.authenticityScore < 50) {
    await notifyEmployer(job.data.applicant_id, 'Low social proof score')
  }
})
```

**Benefit:** Applicant gets instant verification, LLM analysis happens in background

---

## A/B Testing Plan

**Hypothesis:** LLM-powered social proof detection catches more bots than rule-based detection.

**Test groups:**
- Control: Rule-based bot detection (profile age, connections, etc.)
- Treatment: LLM-powered analysis

**Metrics:**
- False positive rate (real people flagged as bots)
- False negative rate (bots that slip through)
- Manual review rate (how many need human check)
- Cost per verification

**Expected results:**
- LLM catches +20% more sophisticated bots
- Reduces false positives by 15% (smarter judgement)
- +$0.03 cost justified by fraud prevention

---

## Next Steps

1. **Implement LinkedIn OAuth** (if not already done)
2. **Sign up for Anthropic API**
3. **Build LLM analysis endpoint** (3-5 days)
4. **Test with pilot customers** (Enticeable)
5. **Measure:** False positive rate, bots caught, cost
6. **Iterate prompts** based on results

---

## Why This is Powerful

**Traditional bot detection:** "Profile age < 180 days = suspicious"
- Bots adapt: Create profiles 181 days before using them

**LLM bot detection:** "This profile has no personality, all posts are generic, cross-platform inconsistencies"
- Much harder for bots to fake genuine human personality over time
- Can't just game the rules

**The difference:** Rules-based = checklist. LLM = holistic judgment (like a human reviewer, but at scale).
