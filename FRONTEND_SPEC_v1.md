# Permit Intelligence Platform — Frontend Specification v1
**Created:** April 27, 2026  
**Status:** Ready for Implementation  
**Tech Stack:** React 18 + TypeScript + Tailwind CSS 3 + Vite

---

## 📋 Executive Summary

The current frontend is a minimalist MVP that doesn't reflect the sophistication, domain expertise, or business credibility your product deserves. **You're solving a €10k+/month problem for real estate developers.** The design should signal that immediately.

This spec transforms the site into a **modern B2B SaaS product** that:
- ✅ Builds trust and authority (not "someone's side project")
- ✅ Shows deep domain expertise (Dutch construction context, municipality variability)
- ✅ Clearly communicates value (€10k/month problem → your solution)
- ✅ Supports both business models (SaaS + Consultancy CTAs)
- ✅ Better UX for the core workflow (permit checking → results → next steps)
- ✅ Positions for investor credibility and customer confidence

---

## 🎨 Design System Overhaul

### Color Palette
**Current issue:** Beige + orange is too soft for a serious B2B tool. It doesn't signal "construction tech" or "expert Dutch company."

**New Palette:**
```
Primary:      #1a3a52  (Deep blue - trust, authority, professional)
Secondary:    #2563eb  (Vibrant blue - CTAs, highlights, energy)
Accent:       #10b981  (Emerald green - success, confidence, results)
Danger:       #ef4444  (Red - warnings, missing docs)
Neutral:      #0f172a → #f8fafc (charcoal to off-white)
```

**Why this works:**
- Deep blue = Dutch corporate/financial context (ING, ABN AMRO colors)
- Emerald green = construction industry standard (safety, approval)
- High contrast = accessibility + clarity
- Professional without pretension

### Typography
**Current:** Inter (good choice, keep it)
**Add hierarchy:**
```
Display (h1):     2.5rem / 600 weight    — Landing hero, main page titles
Headline (h2):    1.875rem / 600 weight  — Section titles
Subheading (h3):  1.25rem / 600 weight   — Card titles, subsections
Body (p):         1rem / 400 weight      — All body text
Small (sm):       0.875rem / 400 weight  — Labels, helper text, tags
Tiny (xs):        0.75rem / 500 weight   — Tags, badges, UI accents
```

### Spacing & Grid
- **Base unit:** 4px (use 4, 8, 12, 16, 24, 32, 40, 48, 64 multiples)
- **Max content width:** 1280px (more spacious than current 920px)
- **Padding:** 40px desktop, 24px tablet, 16px mobile
- **Card gaps:** 24px (more breathing room than current 12px)

### Shadows & Elevation
```
Subtle:    0 1px 2px rgba(0,0,0,0.05)
Small:     0 2px 8px rgba(0,0,0,0.08)
Medium:    0 4px 16px rgba(0,0,0,0.1)
Large:     0 12px 32px rgba(0,0,0,0.12)
Focus:     0 0 0 4px rgba(37, 99, 235, 0.1)
```

### Border Radius
```
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 20px
2xl: 24px
full: 9999px
```

---

## 📄 Multi-Page Structure

**Current:** Single-page application with two tabs  
**New:** Proper multi-page site with clear information hierarchy

```
/                          — Landing page (homepage)
/app                       — Main application (permit checker + tracker)
/pricing                   — Pricing page (clear models)
/features                  — Feature breakdown + use cases
/contact                   — Contact/demo request form
/blog (future)            — Blog/resources
```

**Navigation:**
- Sticky header (white bg, subtle shadow) with: logo, nav links (Features, Pricing, Contact), Login button
- Mobile: hamburger menu

---

## 🏠 Page 1: Landing Page (`/`)

### Header/Hero
**Goal:** Visitor understands the problem and solution in 10 seconds.

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Logo  [Nav Links]        [Login] [Sign Up] │
├─────────────────────────────────────────────┤
│                                             │
│         Hero: 60% width, centered          │
│                                             │
│  Headline (h1):                             │
│  "Know Your Permit Timeline Before You     │
│   Submit"                                   │
│                                             │
│  Subheading (h3):                           │
│  "Real estate developers in the Netherlands│
│   are losing €10k+/month on permit delays. │
│   We predict exact timelines. For your      │
│   project. For your municipality."          │
│                                             │
│  [Get Started]  [See Demo]                 │
│                                             │
│  Small supporting text:                     │
│  "7 municipalities analyzed | 2-min setup  │
│   | Direct DSO API integration"             │
│                                             │
└─────────────────────────────────────────────┘
```

**Design notes:**
- Hero image (right side): Illustration or screenshot of results card showing permit decision + timeline
- Primary CTA: "Get Started" (blue, takes to /app)
- Secondary CTA: "See Demo" (outline, shows video or walkthrough)
- Keep Tagline: "Understand permit requirements · Predict timelines · Master participation"

### Problem/Solution Section

**Problem Cards (3 columns, desktop / 1 column mobile):**
- Card 1: **"The Black Box"**
  - Icon: folder with question mark
  - Copy: "You submit your permit application and wait. Weeks pass. You don't know: stage of review, timeline, missing docs."
  - Stat: "Average wait: 26 weeks | Government target: 8 weeks"

- Card 2: **"The Cost"**
  - Icon: money / Euro symbol
  - Copy: "Every week of delay costs €10k+ in financing alone. You can't plan contractors, sales, or finances without knowing the timeline."
  - Stat: "€10k+/month in carrying costs per stalled project"

- Card 3: **"The Confusion"**
  - Icon: municipality building
  - Copy: "Each of the 342 Dutch municipalities has different rules, speeds, and documentation requirements. No one tells you what to expect."
  - Stat: "342 municipalities | 0 predictable timelines"

**Solution Section:**

**Headline:** "We've mapped the entire Dutch permit ecosystem"

**Grid (2 columns):**
- **Left column:** "What We Do"
  - Integrate with official DSO APIs
  - Monitor all 342 municipalities
  - Predict timeline based on your specific project
  - Track status in real-time
  - Guide participation requirements
  - Generate municipality-specific templates

- **Right column:** Screenshot/video showing the app interface with a permit result

### Features Section

**Headline:** "Built for Dutch Developers"

**4 Feature Cards (in grid):**

**1. Instant Permit Check**
- "Submit an address + activity type. Within seconds, know if you need a permit."
- Screenshot: form inputs + "Permit Required" decision
- Badge: "Direct DSO Integration"

**2. Timeline Prediction**
- "Every municipality processes applications differently. We predict YOUR timeline based on real data from YOUR municipality."
- Example stat: "Amsterdam residential: 18 weeks average | Almere complex projects: 16 weeks"
- Screenshot: timeline bar with key dates

**3. Participation Clarity**
- "Omgevingswet participation rules are confusing. We show you exactly what YOUR municipality requires — and give you templates to submit."
- Badge: "28 Municipalities Profiled"
- Screenshot: participation checklist

**4. Status Tracking**
- "Monitor your active applications. Get alerts when status changes. No more manual checking across 342 municipal portals."
- Badge: "Real-time Monitoring"
- Screenshot: tracker dashboard

**Section Bottom CTA:**
Button: "Analyze Your Project" (links to /app)

### Social Proof / Trust Section

**Headline:** "Trusted by Dutch Developers"

**Testimonial (from Dad):**
```
"I've been a property developer for 20 years. This is the first tool 
that actually shows me what to expect. Waw je bent ongelooflijk. 
Je moet je eigen consultancy beginnen per direct."

— [Dad Name], Founder, [Dad's Company]
```

**Stats:**
- 28 municipalities analyzed
- 2-minute setup
- €10k+ average monthly savings per project
- Powered by official Dutch government APIs

### Pricing Preview

**Headline:** "Simple Pricing"

**Two Model Section:**

**Left (SaaS Model):**
- **"Per Project"**
- €99–€499 per analysis
- Pay as you analyze
- Suitable for developers analyzing 1–5 projects/year
- Button: "Try for Free"

**Right (Consultancy Model):**
- **"Done-for-You Consultancy"**
- €500–€2000 per project
- Full analysis + municipality coordination + support
- Suitable for complex projects or non-technical teams
- Button: "Schedule Consultation"

**Link:** "See Full Pricing" (to /pricing page)

### Footer

```
┌─────────────────────────────────────────────┐
│  Logo     Permit Intelligence Platform      │
│                                             │
│  Product     Company      Legal             │
│  • Features  • About      • Privacy         │
│  • Pricing   • Blog       • Terms           │
│  • Contact   • Careers                      │
│                                             │
│  [Twitter] [LinkedIn] [Email]               │
│                                             │
│  © 2026 Permit Intelligence Platform        │
│  Built in Amsterdam for the Netherlands     │
└─────────────────────────────────────────────┘
```

---

## 🔧 Page 2: Application (`/app`)

**Current state:** Works, but UX can improve. Focus: clarity + results confidence

### Layout: Two-Phase Workflow

**Phase 1: Input Form** (top)
```
┌──────────────────────────────────────────────────┐
│ [Tab 1] Analyze Project  [Tab 2] Track Case      │
├──────────────────────────────────────────────────┤
│                                                  │
│ TAB 1: ANALYZE                                   │
│                                                  │
│ [Address Input]           ← autocomplete, PDOK   │
│ [Activity Type]           ← searchable dropdown  │
│ [Housing Units (opt)]                           │
│                                                  │
│                         [Analyze]  [Clear]       │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│ RESULTS (when form submitted)                    │
│                                                  │
│ [Result Cards in proper grid]                    │
│ [Download / Email buttons]                       │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Form Improvements

**Address Input:**
- Wider input, better placeholder text
- Autocomplete: show municipality next to each result (builder confidence)
- Clear visual feedback on selection
- Show RD coordinates when selected (transparency)

**Activity Type Dropdown:**
- Current: simple search
- **Improve:** Group activities by category
  - Residential
  - Commercial
  - Industrial
  - Mixed-Use
  - Other
- Show which activities are most common per municipality
- Better copy for activities (avoid jargon, explain in parentheses)

**Housing Units:**
- Keep optional but move to collapsible "Advanced Options"
- Add tooltip: "Affects participation assessment"

### Results Section: Redesigned

**Container:** Full-width, card-based layout (not grid)

**Result 1: Location Card**
```
┌────────────────────────────────────┐
│ 📍 Location                        │
├────────────────────────────────────┤
│ Keizersgracht 123, Amsterdam 1015  │
│ Municipality: Amsterdam            │
│ RD Coordinates: 120445, 486123     │
│                                    │
│ [View on Map]                      │
└────────────────────────────────────┘
```

**Result 2: Permit Decision Card** (most important — make it prominent)
```
┌────────────────────────────────────┐
│ ✅ Permit Required                 │
│ Broad Procedure Expected            │
├────────────────────────────────────┤
│                                    │
│ Status: Permit Required            │
│ Procedure Type: Broad (8–26 weeks) │
│ Confidence: 96%                    │
│                                    │
│ You will need to:                  │
│ • Complete application form        │
│ • Provide architectural plans      │
│ • Conduct participation assessment │
│ • Obtain neighbor approval         │
│                                    │
│ Why this decision? [See Details]   │
└────────────────────────────────────┘
```

**Result 3: Timeline Prediction Card** (key differentiator)
```
┌────────────────────────────────────┐
│ ⏱️  Estimated Timeline              │
│ Amsterdam: ~14 weeks               │
├────────────────────────────────────┤
│                                    │
│ ┌─────────────────────────────┐   │
│ │ [████████░░░░░░░░] 14 weeks │   │
│ └─────────────────────────────┘   │
│                                    │
│ Based on data from 18 residential  │
│ projects in Amsterdam (2024–2026)  │
│                                    │
│ This estimate includes:            │
│ • Completeness check (2 weeks)     │
│ • Compliance review (3 weeks)      │
│ • Public notification (6 weeks)    │
│ • Decision period (3 weeks)        │
│                                    │
│ ⚠️  Actual timeline may vary by 3–5 │
│    weeks depending on complexity   │
│                                    │
│ [What affects my timeline?]        │
└────────────────────────────────────┘
```

**Result 4: Participation Card**
```
┌────────────────────────────────────┐
│ 👥 Participation Requirements       │
│ Amsterdam Participatiehandreiking   │
├────────────────────────────────────┤
│                                    │
│ ☐ Questionnaire (Amsterdam)        │
│   • Identify stakeholders          │
│   • Document engagement            │
│   • Prepare participation report   │
│                                    │
│ ☐ Public Notice Period (6 weeks)   │
│   • Announce project publicly      │
│   • Accept comments/objections     │
│   • Document responses             │
│                                    │
│ [Download Template] [Learn More]   │
└────────────────────────────────────┘
```

**Result 5: Next Steps Card**
```
┌────────────────────────────────────┐
│ 📋 Next Steps                      │
├────────────────────────────────────┤
│                                    │
│ 1. Confirm participation scope     │
│    with municipality               │
│    [Municipality Contact Info]     │
│                                    │
│ 2. Prepare required documents      │
│    • Architectural plans           │
│    • Participation evidence        │
│    • Environmental report          │
│                                    │
│ 3. Submit via Omgevingsloket       │
│    [Link to Omgevingsloket]        │
│                                    │
│ 4. Monitor status                  │
│    [Start Tracking] or             │
│    [Subscribe to Updates]          │
│                                    │
└────────────────────────────────────┘
```

### Action Buttons (Bottom of Results)

**Primary Actions:**
- **Download Word Template** (blue, prominent) — downloads municipality-specific .doc
- **Email Report** — send results + next steps to email
- **Start Tracking Case** — prepare to track application status once submitted
- **Book Consultation** — CTA for consultancy model

---

## 💰 Page 3: Pricing (`/pricing`)

**Current:** Doesn't exist (redirects to pricing.html)  
**New:** Dedicated page with clear model comparison

### Layout

**Header:**
```
"Simple, Transparent Pricing"

"Choose the model that fits your workflow. Switch anytime."
```

**Two-Model Comparison (side by side, desktop / stacked mobile):**

### Model 1: SaaS (Self-Service)

**Card:**
```
┌─────────────────────────────────┐
│ Self-Service SaaS               │
│                                 │
│ "For Developers Analyzing Their │
│  Own Projects"                  │
├─────────────────────────────────┤
│                                 │
│ Price:                          │
│ €99  per analysis               │
│ €499 per project (complex)      │
│                                 │
│ What's Included:                │
│ ✓ Instant permit check          │
│ ✓ Timeline prediction           │
│ ✓ Participation guidance        │
│ ✓ Word template download        │
│ ✓ Case tracking                 │
│ ✓ Email reports                 │
│ ✗ Direct municipality outreach  │
│ ✗ Personal support              │
│                                 │
│ Best for:                       │
│ • Small-to-medium developers    │
│ • Straightforward projects      │
│ • Tech-comfortable teams        │
│                                 │
│ [Try for Free] [Create Account] │
└─────────────────────────────────┘
```

### Model 2: Consultancy (Done-for-You)

**Card:**
```
┌─────────────────────────────────┐
│ Done-for-You Consultancy        │
│                                 │
│ "For Developers Who Want        │
│  Expert Guidance"               │
├─────────────────────────────────┤
│                                 │
│ Price:                          │
│ €500–€2000  per project         │
│ (Depends on complexity)         │
│                                 │
│ What's Included:                │
│ ✓ Everything in SaaS +          │
│ ✓ Full permit analysis          │
│ ✓ Direct municipality contact   │
│ ✓ Participation coordination    │
│ ✓ Document review & guidance    │
│ ✓ Status monitoring             │
│ ✓ Personal support              │
│ ✓ Expedited timeline (if poss.) │
│                                 │
│ Best for:                       │
│ • Large, complex projects       │
│ • Teams without permit exp.     │
│ • High-risk applications        │
│                                 │
│ [Schedule Call]  [Learn More]   │
└─────────────────────────────────┘
```

### FAQ Section

```
Q: Can I switch between models?
A: Yes, anytime. Start with self-service, upgrade to consultancy when needed.

Q: What's included in "complex" pricing?
A: Projects with >20 housing units, mixed-use, or specialized activities 
   (industrial, healthcare, etc.). Contact us for a quote.

Q: Do you offer team/volume discounts?
A: Yes. Developers analyzing 10+ projects/year get 20% discount. 
   Contact sales.

Q: Is there a free trial?
A: Yes — one free analysis to test the platform. No credit card required.

Q: What municipalities are covered?
A: 28 municipalities fully profiled and live. Adding 10–15 new municipalities 
   monthly. Check coverage map. [Coverage Map]

Q: Do I need to be logged in to analyze?
A: No. Guest analysis is available. Create an account to save results 
   and track projects.
```

---

## 📧 Page 4: Contact/Demo (`/contact`)

**Two-Section Form:**

### Left Column: Contact Form
```
Name *
Email *
Company *
Project Type (dropdown)
Message / Questions
Preferred Contact Method:
  ○ Email  ○ Phone  ○ Zoom

[Submit]
```

### Right Column: Info + CTAs
```
Schedule a Demo

We'll walk you through:
• Your specific municipality
• What your permit process looks like
• Timeline estimates for your project
• Next steps & support options

[Schedule 30-min Zoom Call]

Quick Questions?

Email: hello@permitintelligence.nl
Phone: +31 (0) 20 xxx xxxx
Hours: Mon–Fri, 9am–6pm CET

Newsletter

Get updates on new municipalities, 
Dutch construction news, and Omgevingswet 
changes that affect you.

[Email] [Subscribe]
```

---

## 🎯 Implementation Roadmap

### Phase 1: Foundation (Week 1–2)
- [ ] Set up React 18 + TypeScript + Vite project
- [ ] Install Tailwind CSS 3
- [ ] Create design system components (buttons, cards, inputs, etc.)
- [ ] Build Header + Navigation
- [ ] Migrate landing page HTML to React component
- [ ] Set up routing (React Router v6)

### Phase 2: Core Pages (Week 2–3)
- [ ] Build /app page with improved form & results layout
- [ ] Integrate existing API endpoints (PDOK, DSO, participation)
- [ ] Migrate /pricing page
- [ ] Build /contact page
- [ ] Mobile responsiveness (all pages)

### Phase 3: Polish & Optimization (Week 3–4)
- [ ] Animations & transitions
- [ ] Dark mode support (optional, nice-to-have)
- [ ] Performance optimization
- [ ] SEO metadata
- [ ] Analytics integration
- [ ] Testing

### Phase 4: Deployment (Week 4)
- [ ] Build optimization
- [ ] Deploy to Railway
- [ ] Monitor performance
- [ ] Gather user feedback

---

## 🔄 Component Library

**Standardized Components to Build:**

### Buttons
- Primary (blue, solid)
- Secondary (outline)
- Success (green, solid)
- Danger (red, outline)
- Ghost (transparent)
- Sizes: small, base, large
- States: default, hover, active, disabled, loading

### Cards
- Standard card (white, shadow)
- Elevated card (larger shadow)
- Result card (specific for results section)
- Feature card (landing page)

### Form Inputs
- Text input
- Email input
- Number input
- Dropdown select
- Checkbox
- Radio
- Text area
- All with: label, helper text, error states, disabled states

### Badges & Tags
- Status badges (success/warning/error/info)
- Inline tags (municipality, activity type, etc.)

### Modals
- Standard modal
- Confirmation modal
- Loading modal

### Navigation
- Header/navbar
- Footer
- Breadcrumbs (for /app)

---

## 📊 Analytics & Tracking

**Key Events to Track:**

```
Landing Page:
- Hero CTA clicks ("Get Started", "See Demo")
- Feature card clicks
- Pricing section interaction
- Contact form submission

App:
- Analysis form submission
- Result card views
- Download template clicks
- Email report submissions
- Case tracking start

Conversions:
- Sign-up completion
- First analysis
- Consultancy request
```

---

## 🚀 Success Metrics

**Measure these after launch:**

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Time to value (landing → analysis) | Unknown | <3 min | 2 weeks post-launch |
| Form completion rate | ~80% | >90% | 4 weeks |
| Analysis result clarity (survey) | 4/10 | 8/10 | 6 weeks |
| CTA click-through (pricing/contact) | Low | >15% | 8 weeks |
| Mobile usability score (Lighthouse) | Unknown | >85 | 2 weeks |
| SEO ranking (key terms) | Not ranked | Top 10 | 3 months |

---

## 💡 Why This Spec Will Work

1. **Authority & Trust:** Design signals "we know this problem deeply" to Dutch developers
2. **Multi-page structure:** Separates education (landing) from usage (app) — better UX
3. **Clear value:** Every page answers "Why should I use this?" within 10 seconds
4. **Business flexibility:** Pricing page supports both SaaS + Consultancy models (you can pivot without redesign)
5. **Conversion-optimized:** Multiple CTAs, clear next steps, social proof
6. **Developer-friendly:** React + TypeScript + Tailwind = easy to maintain + hire for
7. **Scalable:** Component-based, design system locked in, ready for feature additions

---

## 📝 Next Steps

1. **Review this spec** — does the direction feel right?
2. **Prioritize:** Start with landing page + /app redesign, delay /pricing page if needed
3. **Design system first:** Build all Tailwind components before building pages
4. **Migrate incrementally:** Keep backend/API the same, swap frontend gradually
5. **Testing with dad:** Get him to try new design — his feedback matters most

---

**Questions? Comments? Ready to build?**

Let me know what you'd like to adjust, and I'll create detailed component specs or start the implementation.
