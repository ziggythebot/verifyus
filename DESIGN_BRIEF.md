# VerifyUS Design Brief

## Visual Direction

**Vibe:** Security meets sophistication. Think government-grade verification that doesn't feel like a DMV website. We're preventing fraud, not filing taxes.

**NOT:**
- ❌ Generic SaaS gradients
- ❌ Illustration vomit (no isometric people working at desks)
- ❌ Stock photography of diverse teams high-fiving
- ❌ Purple-to-pink gradients
- ❌ Bubbly rounded everything

**YES:**
- ✅ Sharp, precise, deliberate
- ✅ Real photography (IDs, documents, actual verification moments)
- ✅ Data visualization that means something
- ✅ Restrained use of color (not a Skittles explosion)
- ✅ Typography hierarchy that works

---

## Color System

**Primary Palette:**
- **Verification Green:** `#059669` (emerald-600) - Reserved ONLY for verified states, success moments
- **Trust Blue:** `#0284c7` (sky-600) - Backgrounds, CTAs, neutral verified states
- **Slate Base:** `#0f172a` (slate-900) - Text, strong hierarchy
- **Warm Gray:** `#78716c` (stone-500) - Supporting text, captions

**Accent Colors (Use Sparingly):**
- **Alert Red:** `#dc2626` (red-600) - Fraud flags, rejected states ONLY
- **Warning Amber:** `#f59e0b` (amber-500) - Pending states, review needed
- **Data Viz Teal:** `#14b8a6` (teal-500) - Charts, graphs, secondary data

**Backgrounds:**
- **Primary BG:** `#ffffff` (clean white, not warm white)
- **Secondary BG:** `#f8fafc` (slate-50) - Section breaks, cards
- **Tertiary BG:** `#e2e8f0` (slate-200) - Hover states, disabled

**Rule:** If something isn't verified, pending, or rejected - it shouldn't be green, amber, or red. Don't just color things because they look nice.

---

## Typography

**Font Stack:**
```
Primary: Inter (variable weight, -0.01em tracking for headings)
Mono: JetBrains Mono (for verification codes, IDs, technical data)
```

**Hierarchy:**
- **H1:** 48px/52px, -0.02em, font-weight 700, slate-900
- **H2:** 32px/40px, -0.01em, font-weight 600, slate-900
- **H3:** 24px/32px, -0.01em, font-weight 600, slate-800
- **Body:** 16px/24px, font-weight 400, slate-600
- **Small:** 14px/20px, font-weight 400, slate-500
- **Caption:** 12px/16px, font-weight 500, stone-500, uppercase, 0.05em tracking

**Numbers/Stats:**
- Use tabular figures (`font-variant-numeric: tabular-nums`)
- Font-weight 600 for emphasis
- Mono font for verification IDs, timestamps, technical data

---

## Layout & Spacing

**Grid:** 12-column, 1440px max-width, 80px outer gutters, 24px column gap

**Spacing Scale (8px base):**
- `xs`: 8px - Tight grouping
- `sm`: 16px - Related elements
- `md`: 24px - Section spacing
- `lg`: 40px - Major sections
- `xl`: 64px - Page sections
- `2xl`: 96px - Hero to content

**Card System:**
- Border: 1px solid slate-200
- Border-radius: 12px (not 16px, not 8px)
- Padding: 24px (sm screens), 32px (md+)
- Shadow: `0 1px 3px 0 rgb(0 0 0 / 0.1)` (default)
- Shadow (hover): `0 4px 6px -1px rgb(0 0 0 / 0.1)`
- NO glassmorphism, NO neumorphism, NO drop shadows >10px

**Buttons:**
- Height: 44px (touch-friendly)
- Padding: 12px 24px
- Border-radius: 8px
- Font-weight: 500
- Transition: all 150ms ease

Primary:
```css
bg: sky-600
text: white
hover: sky-700
active: sky-800
```

Secondary:
```css
bg: white
text: slate-700
border: 1px solid slate-300
hover: bg slate-50
```

Destructive:
```css
bg: white
text: red-600
border: 1px solid red-200
hover: bg red-50
```

---

## Component Design Specs

### 1. Landing Page

**Hero Section:**
- Full-bleed background: Subtle gradient `slate-900 → slate-800`, 5° diagonal
- Overlay: Semi-transparent verification badge pattern (opacity 0.03)
- Max-width: 640px centered
- H1: "Stop fraud before it costs you $50K per bad hire"
- Subhead: Single line, 20px, slate-300
- CTA: Primary button + "View pilot pricing" text link (slate-400)
- NO video backgrounds, NO auto-playing anything

**Problem Cards:**
```
Display: Grid 3-column (1-column mobile)
Card height: Equal (use flexbox)
Card design:
  - White background
  - 32px padding
  - Red accent bar (4px, left edge) - ONLY for fraud problems
  - Icon: Simple line icon, 32px, red-600
  - Headline: 20px, font-weight 600, slate-900
  - Description: 16px, slate-600, max 2 lines
  - Stat: 48px tabular mono, red-600
```

**How It Works:**
```
Timeline layout (vertical on mobile, horizontal on desktop)
Step circles: 64px, sky-600 fill, white number
Connecting line: 2px dashed slate-300
Each step:
  - Headline (18px, semibold)
  - Description (14px, slate-600)
  - Visual (screenshot or icon, NOT illustration)
```

**Pricing Table:**
```
3 columns, equal height
Recommended tier: sky-600 border-top (4px), "Recommended" badge
Price: 48px tabular, slate-900
Period: 14px, slate-500 (per applicant)
Features: Check icon (emerald-500) + text (14px)
CTA: Different per tier (Primary for recommended, Secondary for others)
```

---

### 2. Verification Flow (Applicant Side)

**Progress Bar:**
```
Position: Sticky top, white bg, 1px bottom border
Height: 72px
Content: "Step 2 of 3" (14px, slate-600) above bar
Bar: Full-width, slate-200 bg, sky-600 fill (animated)
Width: 33% → 66% → 100%
NO step labels cluttering it up
```

**Step Cards:**
```
Max-width: 560px centered
Background: White
Border: 1px slate-200
Border-radius: 12px
Padding: 40px

Step 1 (Document Upload):
  - Document type selector: Radio cards (border highlight on select)
  - Upload zone: Dashed border, slate-300, 200px tall
  - File preview: Actual thumbnail (not icon), 120px wide
  - Requirements list: Small text, slate-500, check icons

Step 2 (Liveness Check):
  - Camera feed: 400px square, rounded-lg
  - Face outline guide: White stroke overlay
  - Instructions: Below camera, 16px, slate-700
  - Capture button: Large, circular, sky-600

Step 3 (Address Confirm):
  - Pre-filled input (from previous data)
  - Edit button (text link, small)
  - Map preview: Static map, 400px wide, rounded
```

**Success Screen:**
```
Centered content, max 480px
Icon: Large checkmark, 96px, emerald-500 (animated once)
Headline: "Verified for 90 days"
Subtext: Expiry date in mono font
Badge preview: Actual badge design they'll see
CTA: "Apply to jobs" primary button
```

---

### 3. Employer Dashboard

**Layout:**
```
Sidebar (240px):
  - Logo top
  - Nav items (16px, slate-700, hover sky-600 bg)
  - Active state: sky-600 text, sky-50 bg, 3px left border
  - Bottom: API docs link, logout

Header (64px):
  - Breadcrumbs (14px, slate-500)
  - Search (if needed)
  - Profile dropdown (right)

Main Content (flex-1):
  - 24px padding all sides
  - Max-width: 1200px
```

**Stats Cards:**
```
Grid: 4 columns (2 on tablet, 1 on mobile)
Card design:
  - White bg, 1px border
  - 24px padding
  - Label: 12px uppercase, stone-500, 0.05em tracking
  - Value: 36px tabular, slate-900, font-weight 600
  - Change indicator:
    - Emerald-600 ↑ for good metrics (fraud blocked)
    - Red-600 ↓ for bad metrics (rejection rate)
    - 14px, font-weight 500
  - Sparkline (optional): 64px tall, sky-600 stroke, 2px
```

**Applicant Table:**
```
Full-width, white bg, 1px border
Header:
  - 12px uppercase, stone-500, 0.05em tracking
  - Sticky on scroll
  - 1px bottom border

Rows:
  - Height: 64px
  - Hover: slate-50 bg
  - Border-bottom: 1px slate-100

Columns:
  1. Name + Email (stack, name bold)
  2. Status badge:
     - Verified: emerald-50 bg, emerald-700 text, emerald-500 dot
     - Pending: amber-50 bg, amber-700 text, amber-500 dot
     - Rejected: red-50 bg, red-700 text, red-500 dot
     - Inline badge: 8px dot + text, 12px, font-weight 500
  3. Timestamp (mono, 14px, slate-500)
  4. Fraud score (0-100, red gradient for high scores)
  5. Actions (icon button, ghost style)

Pagination:
  - Bottom, right-aligned
  - "1-25 of 347" text + prev/next buttons
```

**Chart (Fraud Signals Over Time):**
```
Library: Recharts or Tremor
Style:
  - Line chart, NOT area chart
  - Grid: Horizontal lines only, slate-200
  - Line: sky-600, 2px stroke
  - Dots: 6px, sky-600 fill (on hover)
  - Tooltip: White bg, shadow-lg, 1px border
  - Axes: 12px, slate-500, tabular
  - Legend: Top-right, 14px
  - Height: 320px
  - Margin: 24px all sides

Data points:
  - Bot detection rate (sky-600)
  - VPN usage (amber-500)
  - Fake IDs (red-500)
```

---

## Iconography

**System:** Lucide icons (16px or 24px, stroke-width 2)

**Usage:**
- Checkmark: Verified states only
- Shield: Security features, trust indicators
- Alert Triangle: Warnings, pending review
- X Circle: Rejections, errors
- Clock: Pending, expiring soon
- Lock: Privacy, encryption
- Globe: Location verification
- User Check: Identity verified

**Do NOT use:**
- Generic "success" icons for non-verification things
- Emoji
- Multi-color icons
- Icons larger than 32px (except hero moments)

---

## Photography & Imagery

**DO use:**
- Real passport/ID photos (anonymized)
- Actual verification screens (iPhone mockups)
- Close-up shots of documents being scanned
- Data viz screenshots from real dashboards
- Behind-the-scenes fraud detection (if tasteful)

**DO NOT use:**
- Stock photos of people at computers
- Illustrations of stick figures getting verified
- Cartoons
- 3D renders of floating documents
- Generic "security" imagery (locks, fingerprints as decoration)

**Treatment:**
- Subtle desaturation (90% saturation)
- Sharp, high-res only
- Use `object-fit: cover` with defined aspect ratios
- Add 1px border to prevent bleeding into white bg

---

## Animation & Interaction

**Principles:**
- Fast (150ms max for most transitions)
- Purposeful (animation should convey state change)
- Subtle (no bounce, no elastic, no spring)

**Examples:**
```css
/* Button hover */
transition: all 150ms ease;

/* Card hover */
transition: shadow 200ms ease, transform 200ms ease;
transform: translateY(-2px); /* subtle lift */

/* Success checkmark */
@keyframes checkmark {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); }
}
/* Play ONCE on success, don't loop */

/* Loading states */
Skeleton: linear-gradient shimmer, 1.5s duration
Spinner: Only for async actions >500ms
Progress: Smooth width transition, 300ms ease
```

**NO:**
- Parallax scrolling
- Scroll-triggered animations everywhere
- Auto-playing carousels
- Looping animations (except loading states)
- Anything that moves without user action

---

## Responsive Breakpoints

```
xs: 0-639px (mobile)
sm: 640px-767px (large mobile)
md: 768px-1023px (tablet)
lg: 1024px-1279px (laptop)
xl: 1280px+ (desktop)
```

**Mobile-first adjustments:**
- Stack stats cards vertically
- Hide sidebar, show hamburger menu
- Table: Horizontal scroll OR card view (not compressed columns)
- Reduce padding: 16px instead of 24px
- Font sizes: -2px for H1, H2 on mobile

---

## States & Feedback

**Form Validation:**
```
Default: slate-300 border
Focus: sky-600 border, sky-100 bg
Error: red-600 border, red-50 bg, red-600 text below
Success: emerald-600 border, emerald-50 bg, emerald-600 check icon
```

**Loading States:**
```
Skeleton screens: slate-200 bg, animated shimmer
Text: "Loading..." in slate-400, 14px
Buttons: Disabled style + spinner (16px, white/slate depending on bg)
```

**Empty States:**
```
Centered content, max 400px
Icon: 64px, slate-300
Headline: "No applicants yet"
Description: How to get started
CTA: Primary button to take action
```

**Error States:**
```
NOT a generic "Oops! Something went wrong"
Specific error message in plain language
Suggestion for what to do next
Support link if needed
Retry button (secondary style)
```

---

## Technical Specs

**Framework hints:**
- Use Tailwind CSS (with above color tokens in config)
- Headless UI for modals, dropdowns (NOT material-ui)
- Recharts or Tremor for charts
- Framer Motion for animations (sparingly)
- Next.js Image component for all photos

**Performance:**
- Lazy load below-fold images
- Preload critical fonts
- No font files >200KB
- Optimize PNGs with TinyPNG
- Use WebP with PNG fallback

**Accessibility:**
- All interactive elements: 44px min touch target
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Focus states: 2px sky-600 outline, 2px offset
- Alt text for all images
- ARIA labels for icon-only buttons

---

## Example Component Code

```tsx
// Verification Status Badge
interface BadgeProps {
  status: 'verified' | 'pending' | 'rejected'
}

const statusConfig = {
  verified: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500'
  },
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500'
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500'
  }
}

export function VerificationBadge({ status }: BadgeProps) {
  const config = statusConfig[status]

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
```

```tsx
// Stats Card
interface StatsCardProps {
  label: string
  value: string | number
  change?: { value: number; positive: boolean }
}

export function StatsCard({ label, value, change }: StatsCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <p className="text-xs uppercase tracking-wide text-stone-500 mb-2">
        {label}
      </p>
      <p className="text-4xl font-semibold text-slate-900 tabular-nums">
        {value}
      </p>
      {change && (
        <p className={`text-sm font-medium mt-2 ${change.positive ? 'text-emerald-600' : 'text-red-600'}`}>
          {change.positive ? '↑' : '↓'} {Math.abs(change.value)}%
        </p>
      )}
    </div>
  )
}
```

---

## Design Checklist

Before shipping any page:

- [ ] All colors match the defined palette (no random hex codes)
- [ ] Typography uses Inter + proper hierarchy
- [ ] Spacing follows 8px scale
- [ ] Interactive elements are 44px min height
- [ ] Focus states visible on all clickable elements
- [ ] Color contrast passes WCAG AA
- [ ] Images optimized (<500KB each)
- [ ] Mobile layout tested at 375px width
- [ ] Loading/error/empty states designed
- [ ] No auto-playing animations
- [ ] Icons from Lucide (consistent stroke-width)
- [ ] Stats use tabular-nums font variant

---

## Don't Ship If...

- It looks like every other SaaS landing page
- You can't explain why a color is that color
- There are >5 colors on a single page
- Buttons have different heights/padding
- Typography hierarchy is unclear
- It uses Comic Sans (obviously)
- Empty states say "Oops!" or "Uh oh!"
- You're using illustrations to avoid real product screenshots
- Gradients are doing the heavy lifting instead of hierarchy
- It fails accessibility checks

---

**In Summary:**

Make it look like a government security clearance system had a baby with Stripe. Clean, precise, trustworthy. Not playful, not "fun", not trying to be your friend. This is serious software for serious fraud prevention.

If someone looks at it and thinks "that's a nice design", we failed. They should think "I trust this to verify applicants" and not consciously notice the design at all.
