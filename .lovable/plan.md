

# Copy & Behavior Updates: AI Readiness + Methodology

Three files touched, no architecture changes.

## 1. Methodology Page (`src/pages/Methodology.tsx`)

**a) Merge AI bullets into one (lines 300-305)**
Replace the three AI-focused bullet points under "At the same time…" with a single bullet:
> We embed AI‑friendly signals — like consistent business details, question‑driven FAQs, and trustworthy proof — without complicating your fixes.

**b) Add concrete example (after the bullet lists, ~line 305)**
Insert after the merged bullet list:
> For example, for a plumber in Austin, we clarified "emergency leak fixes for homeowners" so it better matches real searches like "best plumber near me for burst pipes."

**c) Stronger CTA closing (replace lines 309-311)**
Replace the "You don't have to think about any of that…" paragraph with:
> Run your complimentary scan to see these signals in action for your site — no AI expertise required.

Make it a clickable link to `/get-started`.

**d) Update review badge (line 241)**
Update scores to 9.7/10 SMB and 8.9/10 SEO from Review #5.

## 2. AI Readiness Card (`src/components/AIReadinessCard.tsx`)

**a) Transparency line (after title, line 44)**
Add under the title/score header:
> *This is an early AI‑readiness lens based on your existing scan data. It's directional, not a definitive grade.*

**b) Prompt visibility proxy note (append to description, line 46-49)**
Add to the existing description paragraph:
> We also look for clear "service in [city]" style phrases in your headings and FAQs, so your site better matches the way real people ask AI tools for local help.

## 3. Entity Consistency Check (`src/lib/scoring/aiReadiness.ts`)

**Add 5th check: Entity consistency (20 pts)**
- Rebalance existing 4 checks from 25 pts each to 20 pts each (total stays 100).
- New check compares business name consistency between page title, H1, and schema markup. Checks if NAP details in body text match schema. Detects "service in [city]" patterns in headings.
- Scoring: name consistent across title/H1/schema (+8), NAP matches schema (+6), "service in city" heading patterns found (+6).
- Detail text when failing: "Your business name or address appears differently in your page content vs. your schema. This can confuse AI systems and search engines when they try to match you to local queries."

**Update types** — no type changes needed since checks are already dynamic arrays.

## Files changed
1. `src/pages/Methodology.tsx` — copy edits + review score update
2. `src/components/AIReadinessCard.tsx` — transparency line + description update
3. `src/lib/scoring/aiReadiness.ts` — rebalance to 20pts × 5 checks, add entity consistency check

