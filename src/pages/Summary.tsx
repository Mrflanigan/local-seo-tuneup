import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

const summaryText = `# Rise to the Top — Project Summary & Roadmap
## For strategic planning & Perplexity collaboration

---

## WHAT WE DO TODAY

### The Product
A free SEO health scanner that scores any website and shows business owners exactly why they're NOT on Google page one — then sells them the fix.

### Current Flow
User enters URL + City + Business Type → Edge Function (checkup) → Firecrawl Scrape (27 checks) + Google PSI API (4 scores) + Firecrawl Search (Phrase Optics ranking check) → Combined Report (Score Ring + Letter Grade) → Email Gate → Lead Capture → CTA: "Get Your Game Plan" → Stripe checkout

### What Each Scan Measures

**1. Site Audit (27 checks, 100 points)**
Scrapes the page HTML/markdown via Firecrawl, then scores:

- Local Presence & GBP (30 pts): Phone, business name, NAP, LocalBusiness schema, Maps embed, reviews, local keywords
- On-Page SEO (25 pts): Title tag, meta description, H1/headings, keyword usage, URL slug, image alts, internal links
- Technical SEO (25 pts): HTTPS, meta robots, canonical, mobile viewport, render-blocking, speed proxies
- Content & UX (10 pts): Word count, content structure/FAQ, CTAs, contact visibility
- Google Readiness Extras (10 pts): Extra structured data, no spam, trust indicators

**2. PageSpeed Insights (Google's own API)**
- Performance, Accessibility, Best Practices, SEO scores (0-100 each)
- Core Web Vitals: LCP, FID, CLS, FCP, Speed Index, TBT, TTI

**3. Phrase Optics (search ranking check)**
- User enters target search phrases (e.g., "plumber Everett WA")
- We search via Firecrawl and find where their domain ranks
- Position scoring: #1 = 100pts, #2 = 90, ... #10 = 10, beyond = 0
- Averaged across all phrases into a 0-100 Optics Score

**4. Competitor Scan**
- Searches "[service] [city]" via Firecrawl
- Scrapes and scores top 3 competitors
- Shows side-by-side comparison

### Additional Features Built
- Before/after snapshot system (save scans to DB for case studies)
- Business type toggle (local vs online — online excludes local signals, scores out of 77 normalized to 100)
- LocalStorage persistence (survives page refresh)
- Case study page for topchoicemovinginc.com
- Lead capture with email queue system
- Stripe checkout integration

---

## WHAT WE WANT TO DO

### The Vision
Be the simplest, most honest SEO tool for small business owners. Not another dashboard with 50 tabs — a clear answer: "Here's your score. Here's what's wrong. Here's how to fix it. Here's proof it worked."

### Key Goals
1. Phrase Optics as the real score — Site audit tells you what's broken, but phrase ranking is the outcome that matters. Page one = winning.
2. Track progress over time — Before/after snapshots per client, showing score improvements and ranking changes
3. Siloed architecture — Each scan type is an independent edge function. If one breaks, the others keep working.
4. Admin panel — Internal dashboard to test individual scans, view raw outputs, manage client data without touching the customer-facing report
5. Automated phrase discovery — Know what the best search phrases ARE for each business type, not just where the client ranks for phrases they guess

### The Sales Pitch
"You scored 47 out of 100. Your competitors scored 78. For the phrase 'best plumber Everett WA,' you're on page 3. We can get you to page 1. Here's exactly what needs to change."

---

## TOOLS WE'RE EVALUATING

### Currently Using
- Firecrawl (connected): Page scraping + search/ranking — Per-credit pricing
- Google PageSpeed Insights API: Performance & Core Web Vitals — Free
- Supabase / Lovable Cloud: Database, edge functions, auth — Included
- Stripe: Payment processing — Standard fees

### Potential Additions
- Google Search Console API: Real ranking data from Google itself — impressions, clicks, actual positions. Free but requires site owner OAuth. HIGH priority.
- DataForSEO API: Keyword search volume, difficulty scores, SERP features, bulk ranking checks — ~$50-500/mo. HIGH priority.
- Perplexity API (connector available): AI-powered research — discover top phrases per business category — Per-query. MEDIUM priority.
- Moz API: Domain Authority, backlink counts — ~$99/mo. MEDIUM priority.
- Ahrefs API: Backlinks, keyword difficulty, traffic estimates — Expensive. LOW for now.
- SerpAPI: Real-time SERP results as structured data — ~$50/mo. LOW (Firecrawl covers this).

### What We CAN'T Measure Today (The Gaps)
- Backlinks / Domain Authority — huge ranking factor, requires Moz or Ahrefs
- Google Business Profile completeness — can't scrape GBP programmatically
- Actual search volume — we know IF they rank, but not how many people search that phrase
- Keyword difficulty — how hard is it to rank for this phrase?
- Off-page signals — social mentions, citations, directory listings

---

## ARCHITECTURE — CURRENT STATE

Pages: Index (landing), GetStarted (URL input + scan), Report (full report), CaseStudy (before/after), Osmosis (service explanation)

Key Components: ScoreRing (animated gauge), PhraseOpticsRing (phrase ranking gauge), PageSpeedInsights (Core Web Vitals), PathToPageOne (gap analysis + top fixes), CompetitorComparison (side-by-side), WhatGoogleSees (site context)

Scoring: src/lib/scoring/ — types.ts + scoringService.ts (27-check engine)

Edge Functions: checkup (MONOLITH — needs splitting), competitor-scan, save-lead, save-snapshot, get-snapshots, firecrawl-scrape, identify-business, plus _shared/ (scoring.ts + firecrawlClient.ts)

### Known Issues / Tech Debt
1. checkup/ is a monolith — scraping, scoring, phrase search, and PageSpeed all in one function. Needs splitting into silos.
2. Scoring engine is duplicated — exists in both src/lib/scoring/ and supabase/functions/_shared/. Currently only the edge function version runs.
3. No admin panel — testing requires running full scans through the customer UI
4. Phrase discovery is manual — user has to guess their own search phrases

---

## QUESTIONS FOR PERPLEXITY
1. What are the highest-volume, highest-intent search phrases for local service businesses by category?
2. What does Google's ranking algorithm weight most heavily for local pack results specifically?
3. What's the minimum viable set of signals to predict whether a site will rank on page 1 for a given local phrase?
4. Are there free/cheap APIs for keyword search volume that don't require Ahrefs/Semrush pricing?
5. What do Kyle Roof's single-variable SEO tests reveal about actual signal weights?
6. What's the competitive landscape for "simple SEO audit tools for small business" — who's winning and why?

---

Document generated April 5, 2026 — Rise to the Top project`;

const Summary = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Project Summary</h1>
        <Button onClick={handleCopy} variant="outline" size="lg" className="gap-2">
          {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
          {copied ? "Copied!" : "Copy All"}
        </Button>
      </div>
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed select-all">
        {summaryText}
      </pre>
    </div>
  );
};

export default Summary;
