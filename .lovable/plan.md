

# Updated Plan: Personalized Report Summaries

## What's Changing

The scoring service and report components will generate **customized, site-specific summaries** that reference actual content found on the scraped page -- business name, services mentioned, location references, specific page elements -- so the report feels like a human reviewed their site, not a generic checklist.

## How It Works

### 1. Extract site-specific details during scoring

Add an extraction step in `scoringService.ts` that pulls out:
- **Business name** (from title tag, og:site_name, or H1)
- **Services/keywords mentioned** (e.g., "kitchen remodeling," "emergency plumbing")
- **Location references** (city names, addresses found in content)
- **Specific page elements** (e.g., "your 'Request a Quote' button," "your Google Reviews badge")

Store these in a new `siteContext` object returned alongside scores.

### 2. Generate personalized strength descriptions

Instead of generic: "Has a meta description"
Write dynamic: "Your meta description -- 'Smith Plumbing serves the greater Austin area with 24/7 emergency service' -- is well-written and includes your location."

Instead of: "Phone number detected"
Write: "Your phone number (512-555-1234) is visible on the page, making it easy for local customers to call."

### 3. Implementation in scoring module

Each category scorer will return `personalizedStrengths` and `personalizedIssues` strings that interpolate extracted site data:

```text
types.ts additions:
  siteContext: {
    businessName: string | null
    services: string[]
    locations: string[]
    phone: string | null
    email: string | null
  }

  Each finding gets:
    generic: string        -- fallback label
    personalized: string   -- site-specific version using siteContext
```

### 4. Report components use personalized text

`SectionCard` and `ReportTeaser` will display the `personalized` string when available, falling back to `generic`. The teaser especially benefits -- showing a personalized compliment builds trust before the email gate.

### 5. Files affected

- `src/lib/scoring/types.ts` -- add `SiteContext` type, `personalized` field on findings
- `src/lib/scoring/scoringService.ts` -- add extraction logic + personalized string generation per check
- `src/components/SectionCard.tsx` -- render personalized text
- `src/components/ReportTeaser.tsx` -- show personalized summary paragraph

This keeps all personalization logic inside the scoring module so it's easy to iterate on the templates.

