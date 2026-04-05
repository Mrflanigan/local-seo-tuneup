# AI Guardrails for SEO Osmosis (MVP Baseline)

This document defines what the AI should and should NOT change by default.

## Critical Systems (Do NOT change unless explicitly asked)

### Scoring Engine
- **Files:**
  - `src/lib/scoring/*`
  - `supabase/functions/_shared/scoring.ts`
- **Purpose:** Computes the 27-check Site Audit (Local Presence, On-Page SEO, Technical SEO, Content & UX, Google Readiness).

### Phrase Optics
- **Files:**
  - `src/lib/phrase-optics-utils.ts`
  - `src/types/phrase-optics.ts`
  - `supabase/functions/_shared/phraseOptics.ts`
  - `supabase/functions/checkup/index.ts` (phrase search logic)
- **Components:**
  - `PhraseOpticsRing`
  - Phrase Optics sections on the Report page
- **Purpose:** Computes phrase ranking and Optics Score based on Firecrawl search.

### PageSpeed Insights Integration
- **Files:**
  - PSI fetch logic in `supabase/functions/checkup/index.ts`
- **Purpose:** Fetches Performance, Accessibility, Best Practices, SEO scores from Google's PSI API.

### Competitor Scan
- **Files:**
  - `supabase/functions/competitor-scan/*`
- **Purpose:** Scrapes and scores top competitors for the user's phrase and city.

## Allowed Changes (Safe by Default)

The AI can safely:
- Improve copy and labels on the Report page (without changing data structures).
- Add new documentation files in `docs/`.
- Create new components that consume existing APIs and types without changing those APIs.
- Add small UI enhancements that do not alter core logic.

## Changes That Require Explicit Instructions

The AI must NOT make these changes unless the prompt says so clearly:
- Refactor or rename the scoring engine.
- Change how OpticsScore is calculated.
- Modify how PSI or Firecrawl are called.
- Change database schema.

## When in Doubt

- Ask for permission before making large structural changes.
- Prefer additive changes (new utilities, new components) over modifying existing ones.
- This MVP Baseline should remain working and stable at all times.
