

# Plan: Three GPT-Recommended Features

## Overview
Add three new checks to the scoring engine, with corresponding report cards. All scoring currently totals 100 points (30+25+25+10+10). We'll add small point values that fit within existing categories — no new categories needed.

---

## Feature 1: On-Page Entity Consistency Check (2 pts)

**Where it fits:** On-Page SEO category (currently 25 pts → becomes 27 pts)

**Detection logic:**
- Business name already extracted in `extractContext()` as `ctx.businessName`
- Title already in `ctx.pageTitle`, H1 in `ctx.h1Text`
- Check: does `businessName` appear (case-insensitive substring) in both title and H1?
- Score: 2 pts if in both, 1 pt if in one, 0 if neither

**Files to change:**
- `src/lib/scoring/scoringService.ts` — add check `"entity-consistency"` inside `scoreOnPageSEO()`, update maxScore from 25→27
- `src/lib/scoring/checkMetadata.ts` — add metadata entry
- `supabase/functions/_shared/scoring.ts` — mirror the same check
- `src/components/WhatGoogleSees.tsx` — add buzzword mapping in `getBuzzword()`

---

## Feature 2: HTTPS Redirect Chain Test (3 pts)

**Where it fits:** Technical SEO category (currently 25 pts → becomes 28 pts)

**Detection logic:**
- In the edge function (`checkup/index.ts`), add a `fetchRedirectChain()` function
- Test the 4 entry variants (http/https × with/without www) by following redirects manually (`redirect: "manual"` + following `Location` headers)
- Capture chain: array of `{url, status}` entries
- Also extract `<link rel="canonical">` from the scraped HTML and check if it matches the final resolved URL
- Pass this data as `redirectChain` on the result object

**Scoring:**
- 3 pts if all variants resolve to same canonical URL in ≤2 hops with status 200
- 2 pts if chains exist but ≤3 hops and final is 200
- 1 pt if chains >3 hops or final isn't 200
- 0 pts if redirect loops or errors

**Report card:**
- New component `RedirectSanityCard.tsx` — shows chain length, final URL, status code, canonical match
- Renders in Report.tsx after PageSpeedInsights

**Files to change:**
- `supabase/functions/checkup/index.ts` — add `fetchRedirectChain()`, call in parallel, attach to result
- `src/lib/scoring/types.ts` — add `RedirectChainData` interface to `ScoringResult`
- `src/lib/scoring/scoringService.ts` — add `"redirect-chain"` check in `scoreTechnicalSEO()`, update maxScore 25→28
- `src/lib/scoring/checkMetadata.ts` — add metadata entry
- `supabase/functions/_shared/scoring.ts` — mirror check
- `src/components/WhatGoogleSees.tsx` — add buzzword mapping
- `src/components/RedirectSanityCard.tsx` — new report card component
- `src/pages/Report.tsx` — render RedirectSanityCard

---

## Feature 3: LocalBusiness JSON-LD Completeness Meter (no extra points — enhances existing local-schema check)

**Where it fits:** Extends the existing `local-schema` check (5 pts) in Local Presence. No point change — the scoring already gives partial credit for field coverage. We add a completeness meter and paste-ready JSON-LD as a report enhancement.

**Detection logic:**
- Already parsing JSON-LD in `scoreLocalPresence()` 
- Extend to track all required fields (`@type`, `name`, `address`, `telephone`, `url`) and recommended fields (`geo`, `openingHoursSpecification`, `priceRange`, `image`, `sameAs`, `description`, `areaServed`, `email`, `aggregateRating`, `review`)
- Store parsed fields + missing fields on the finding's evidence
- Generate a paste-ready JSON-LD block with existing values + placeholder stubs for missing fields

**Report card:**
- New component `SchemaCompletenessMeter.tsx` — shows "7/15 fields complete" meter, missing field list, copy-paste JSON-LD block
- Renders in Report.tsx after FixTheseFiveFirst

**Files to change:**
- `src/lib/scoring/scoringService.ts` — extend local-schema parsing, store completeness data in evidence
- `supabase/functions/_shared/scoring.ts` — mirror
- `src/components/SchemaCompletenessMeter.tsx` — new component
- `src/pages/Report.tsx` — render SchemaCompletenessMeter (only when local-schema data exists)
- `src/components/WhatGoogleSees.tsx` — no change needed (already maps `local-schema`)

---

## Point Total Impact

| Category | Before | After |
|----------|--------|-------|
| Local Presence | 30 | 30 (no change) |
| On-Page SEO | 25 | 27 (+2 entity) |
| Technical SEO | 25 | 28 (+3 redirect) |
| Content & UX | 10 | 10 |
| Extras | 10 | 10 |
| **Total** | **100** | **105** |

For local businesses the max becomes 105. This is a small inflation but keeps the system simple. Alternative: reduce existing check weights to stay at 100. I'd recommend keeping 105 and noting it — the 5 extra points reward sites that have both entity consistency and clean redirects.

---

## Files Changed Summary (planned)

1. `src/lib/scoring/scoringService.ts` — 2 new checks
2. `src/lib/scoring/checkMetadata.ts` — 2 new metadata entries
3. `src/lib/scoring/types.ts` — add `RedirectChainData` interface
4. `supabase/functions/_shared/scoring.ts` — mirror 2 new checks
5. `supabase/functions/checkup/index.ts` — add redirect chain fetch
6. `src/components/WhatGoogleSees.tsx` — 2 new buzzword mappings
7. `src/components/RedirectSanityCard.tsx` — new component
8. `src/components/SchemaCompletenessMeter.tsx` — new component
9. `src/pages/Report.tsx` — render 2 new cards

