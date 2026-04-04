

# Move Action Form to Dedicated Page

## What changes

### 1. New file: `src/pages/GetStarted.tsx`
- Contains the `UrlInputForm` with all fields (business type, city, search phrases, URL)
- Contains the `handleSubmit` logic, `ScanningView`, and navigation to `/report` — all moved from Index.tsx
- Clean, focused layout: dark background, brief headline ("Let's check your site"), the form, and the tagline

### 2. Edit: `src/pages/Index.tsx`
- **Remove** the `UrlInputForm` import and both form instances (hero at line 185 and bottom CTA at line 297)
- **Remove** the scanning state/logic (`handleSubmit`, `loading`, `scanUrl`, `ScanningView`, `runCheckup` import)
- **Hero section**: Replace the form with a CTA button linking to `/get-started` — styled prominently with the Bookman serif font
- **Bottom CTA section**: Replace the form with the same CTA button
- Everything else stays: Denali hero, decorative text, social proof, How It Works, What We Scan, FAQ, footer

### 3. Edit: `src/App.tsx`
- Add route: `<Route path="/get-started" element={<GetStarted />} />`

## No changes to
- `UrlInputForm.tsx` — moves as-is
- Scoring, report, scanning logic — just relocated
- Any other pages or components

