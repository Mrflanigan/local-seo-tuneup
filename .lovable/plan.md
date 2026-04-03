
# LocalScore Launch Plan

## Brand Positioning
**Tagline**: "Your website looks great. But can Google read it?"
**Value prop**: The only local SEO audit tool that shows you exactly what Google sees in your code — personalized to your business, not generic advice.

## Pre-Launch Checklist

### 1. Our Own Site Scores 100
- [x] index.html fully optimized (meta tags, OG, canonical, JSON-LD)
- [x] LocalBusiness + FAQPage + BreadcrumbList + SoftwareApplication schema
- [x] Premium landing page with How It Works, FAQ, social proof
- [ ] Generate OG image (1200×630) for social sharing
- [ ] Add favicon / apple-touch-icon
- [ ] Verify our own scanner gives us 100

### 2. Free Audits for Credibility (Week 1-2)
- Audit 10-20 real local businesses (mix of industries)
- Reach out: "We're launching a local SEO tool and want to feature your business in our case studies."
- Capture before scores
- Document findings in a shareable format
- If any allow fixes: document the before/after score jump

### 3. Case Studies (Week 2-3)
- Build a `/case-studies` page
- Format: Business name, industry, city, before score → after score
- Include specific findings: "Missing LocalBusiness schema, no canonical tag, 3 images without alt text"
- Show what was fixed and the projected impact

### 4. Content for Our Own SEO (Week 1-4)
Blog posts to build authority:
- "What Are Meta Tags and Why Your Local Business Needs Them"
- "JSON-LD Schema Markup Explained for Small Business Owners"
- "The 5 Technical SEO Fixes Every Local Business Is Missing"
- "How Google Decides Who Ranks #1 in Local Search"
- "NAP Consistency: The Foundation of Local SEO"

### 5. Pricing Strategy
**Free tier**: Full audit + score + competitor comparison (the lead magnet)
**Gameplan call** ($0 intro / $97 later): 15-min walkthrough + prioritized fix list
**Implementation retainer**:
  - Starter: $497/mo (basic fixes, monthly audit)
  - Growth: $997/mo (full optimization, content, local citations)
  - Premium: $1,997/mo (everything + GBP management, review strategy)

### 6. Launch Sequence
1. Soft launch to 20 businesses → collect feedback + testimonials
2. Post case studies + before/after scores
3. Social launch: share anonymized competitor comparisons
4. Paid ads targeting: "[industry] SEO audit" keywords
5. Partner with web designers / agencies as white-label tool

## Technical Architecture Notes
- Firecrawl scrape → client-side scoring → personalized report
- 5 categories, 30+ signals, 100-point scale
- Competitor scan via edge function
- Email capture + lead storage in database
