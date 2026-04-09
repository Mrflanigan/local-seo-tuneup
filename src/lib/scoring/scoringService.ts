import type {
  FirecrawlScrapeResult,
  SiteContext,
  ScoringResult,
  CategoryResult,
  Finding,
  FindingEvidence,
  LetterGrade,
  ScanInput,
} from "./types";
import { CHECK_METADATA } from "./checkMetadata";

// ── Helpers ──────────────────────────────────────────────

function grade(score: number): LetterGrade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  return "F";
}

function phoneRegex() {
  return /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
}

function emailRegex() {
  return /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
}

function truncate(s: string, len = 80) {
  return s.length > len ? s.slice(0, len) + "…" : s;
}

function finding(
  id: string,
  passed: boolean,
  points: number,
  maxPoints: number,
  generic: string,
  personalized: string,
  evidence?: FindingEvidence[]
): Finding {
  return { id, passed, points, maxPoints, generic, personalized, evidence };
}

// ── Context Extraction ──────────────────────────────────

function extractContext(
  data: FirecrawlScrapeResult,
  input: ScanInput
): SiteContext {
  const { html, markdown, metadata } = data;

  // Business name
  let businessName: string | null =
    (metadata?.ogSiteName as string) ?? null;
  if (!businessName && metadata?.title) {
    businessName = metadata.title.split(/[|–—-]/)[0].trim() || null;
  }
  if (!businessName) {
    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
    if (h1Match) businessName = h1Match[1].replace(/<[^>]+>/g, "").trim();
  }

  // Phone
  const phoneMatch = html.match(phoneRegex());
  const phone = phoneMatch ? phoneMatch[0] : null;

  // Email
  const emailMatch = html.match(emailRegex());
  const emailAddr = emailMatch ? emailMatch[0] : null;

  // Services
  const servicePatterns = [
    "plumbing", "electrical", "hvac", "roofing", "remodeling",
    "landscaping", "painting", "cleaning", "flooring", "cabinets",
    "renovation", "repair", "installation", "maintenance", "construction",
    "demolition", "inspection", "design", "consulting", "hauling",
  ];
  const lowerMd = markdown.toLowerCase();
  const services = servicePatterns.filter((s) => lowerMd.includes(s));

  // Locations
  const locations: string[] = [];
  if (input.city) {
    if (lowerMd.includes(input.city.toLowerCase())) locations.push(input.city);
  }
  const cityStateRegex = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),?\s*([A-Z]{2})\b/g;
  let csMatch;
  while ((csMatch = cityStateRegex.exec(html)) !== null) {
    const loc = `${csMatch[1]}, ${csMatch[2]}`;
    if (!locations.includes(loc)) locations.push(loc);
  }

  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
  const h1Text = h1Match ? h1Match[1].replace(/<[^>]+>/g, "").trim() : null;

  return {
    businessName,
    services,
    locations,
    phone,
    email: emailAddr,
    pageTitle: metadata?.title ?? null,
    metaDescription: metadata?.description ?? null,
    h1Text,
  };
}

// ── Local Presence & GBP (30 pts) ────────────────────────

function scoreLocalPresence(
  data: FirecrawlScrapeResult,
  ctx: SiteContext,
  input: ScanInput
): CategoryResult {
  const { html, markdown } = data;
  const findings: Finding[] = [];
  const lowerHtml = html.toLowerCase();
  const lowerMd = markdown.toLowerCase();

  // 1. Phone number visible (5 pts)
  const hasPhone = !!ctx.phone;
  findings.push(finding("phone", hasPhone, hasPhone ? 5 : 0, 5,
    hasPhone ? "Phone number is visible on the page." : "No phone number found on the page.",
    hasPhone
      ? `Your phone number (${ctx.phone}) is prominently displayed, making it easy for local customers to call.`
      : "We couldn't find a phone number on your page — adding one helps local customers reach you instantly.",
    hasPhone ? [{ heuristic: "Phone number detected", snippet: ctx.phone! }] : undefined
  ));

  // 2. Business name visible (3 pts)
  const hasName = !!ctx.businessName;
  findings.push(finding("biz-name", hasName, hasName ? 3 : 0, 3,
    hasName ? "Business name found on the page." : "No clear business name detected.",
    hasName
      ? `Your business name "${ctx.businessName}" is clearly visible on the page.`
      : "We couldn't identify a clear business name — make sure it's in your H1 or title tag.",
    hasName ? [{ heuristic: "Business name found", snippet: ctx.businessName! }] : undefined
  ));

  // 3. Full address / NAP (5 pts)
  const addressPattern = /\d{1,5}\s\w+\s(?:st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|ln|lane|ct|court|way|pl|place)\b/i;
  const hasAddress = addressPattern.test(html);
  const addressMatch = html.match(addressPattern);
  const zipPattern = /\b\d{5}(-\d{4})?\b/;
  const hasZip = zipPattern.test(html);
  const zipMatch = html.match(zipPattern);
  const napScore = (hasAddress && hasZip && hasPhone) ? 5 : (hasAddress || hasPhone) ? 3 : 0;
  const napParts = [ctx.businessName, addressMatch?.[0], zipMatch?.[0], ctx.phone].filter(Boolean);
  findings.push(finding("nap", napScore >= 5, napScore, 5,
    napScore >= 5 ? "Full NAP (Name, Address, Phone) present." : "NAP information is incomplete.",
    napScore >= 5
      ? "Your full name, address, and phone number are all visible — this is the foundation of local SEO."
      : `Your NAP is incomplete (${[!hasName && "name", !hasAddress && "address", !hasPhone && "phone", !hasZip && "ZIP code"].filter(Boolean).join(", ")} missing). Google relies on consistent NAP data to rank local businesses.`,
    napParts.length > 0 ? [{ heuristic: "NAP string detected", snippet: napParts.join(" · ") }] : undefined
  ));

  // 4. LocalBusiness schema (5 pts)
  const jsonLdBlocks = html.match(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  let hasLocalSchema = false;
  let schemaFields: string[] = [];
  let localSchemaSnippet: string | undefined;
  for (const block of jsonLdBlocks) {
    const inner = block.replace(/<\/?script[^>]*>/gi, "");
    try {
      const parsed = JSON.parse(inner);
      const obj = Array.isArray(parsed) ? parsed[0] : parsed;
      if (obj?.["@type"] && /LocalBusiness|Store|Restaurant|ProfessionalService|HomeAndConstructionBusiness|Plumber|Electrician|HVACBusiness|RoofingContractor|LocksmithService/i.test(obj["@type"])) {
        hasLocalSchema = true;
        if (obj.name) schemaFields.push("name");
        if (obj.address) schemaFields.push("address");
        if (obj.telephone) schemaFields.push("telephone");
        if (obj.geo) schemaFields.push("geo");
        if (obj.openingHours || obj.openingHoursSpecification) schemaFields.push("openingHours");
        try { localSchemaSnippet = JSON.stringify(obj, null, 2).slice(0, 500); } catch {}
      }
    } catch { /* ignore malformed JSON-LD */ }
  }
  const schemaScore = hasLocalSchema ? (schemaFields.length >= 4 ? 5 : schemaFields.length >= 2 ? 3 : 2) : 0;
  findings.push(finding("local-schema", hasLocalSchema, schemaScore, 5,
    hasLocalSchema ? "LocalBusiness schema markup detected." : "No LocalBusiness schema markup found.",
    hasLocalSchema
      ? `Your LocalBusiness schema includes ${schemaFields.join(", ")} — ${schemaFields.length >= 4 ? "excellent coverage" : "consider adding more fields like geo and openingHours"}.`
      : "Adding LocalBusiness schema tells Google your name, address, hours, and services in a machine-readable format — a key local SEO signal.",
    hasLocalSchema && localSchemaSnippet ? [{ heuristic: "LocalBusiness JSON-LD", snippet: localSchemaSnippet }] : undefined
  ));

  // 5. Google Maps embed or directions link (4 pts)
  const hasMaps = lowerHtml.includes("google.com/maps") || lowerHtml.includes("maps.googleapis");
  findings.push(finding("maps", hasMaps, hasMaps ? 4 : 0, 4,
    hasMaps ? "Google Maps embed or link detected." : "No Google Maps embed found.",
    hasMaps
      ? "You have a Google Maps embed or link, helping visitors find your location easily."
      : "Embedding a Google Map helps customers find you and signals local relevance to Google."
  ));

  // 6. Review signals (4 pts)
  const hasReviewSchema = lowerHtml.includes('"aggregaterating"') || lowerHtml.includes('"review"') || /itemtype\s*=\s*["'][^"']*review/i.test(html);
  const hasReviewText = /google\s*reviews?|yelp\s*reviews?|testimonials?|customer\s*reviews?|star\s*rating/i.test(lowerMd);
  const hasReviews = hasReviewSchema || hasReviewText;
  findings.push(finding("review-signals", hasReviews, hasReviews ? 4 : 0, 4,
    hasReviews ? "Review or rating signals found." : "No review signals detected.",
    hasReviews
      ? (hasReviewSchema
        ? "You have review/rating schema markup — this can show star ratings directly in Google search results."
        : "You mention reviews on your page, which builds trust. Adding Review schema markup could earn you star ratings in search results.")
      : "Adding customer reviews and Review schema markup can earn star ratings in Google results — a major trust signal."
  ));

  // 7. Local keyword usage (4 pts)
  const cityName = input.city?.toLowerCase();
  const hasCityInContent = cityName ? lowerMd.includes(cityName) : ctx.locations.length > 0;
  const hasCityInTitle = cityName ? (ctx.pageTitle?.toLowerCase().includes(cityName) ?? false) : false;
  const localKwScore = hasCityInContent && hasCityInTitle ? 4 : hasCityInContent ? 3 : hasCityInTitle ? 2 : 0;
  findings.push(finding("local-keywords", localKwScore >= 3, localKwScore, 4,
    localKwScore >= 3 ? "City/local keywords used in content and title." : "Local keyword usage could be improved.",
    localKwScore >= 3
      ? `Your content and title reference ${ctx.locations[0] || input.city || "your city"}, helping Google associate your site with that area.`
      : `Consider adding your city name${input.city ? ` ("${input.city}")` : ""} to your title tag and throughout your content for stronger local signals.`
  ));

  const score = findings.reduce((s, f) => s + f.points, 0);
  return { id: "local-presence", label: "Local Presence & GBP", icon: "MapPin", score, maxScore: 30, findings };
}

// ── On-Page SEO (25 pts) ─────────────────────────────────

function scoreOnPageSEO(
  data: FirecrawlScrapeResult,
  ctx: SiteContext,
  input: ScanInput
): CategoryResult {
  const { html, markdown } = data;
  const findings: Finding[] = [];
  const lowerHtml = html.toLowerCase();

  // 1. Title tag (5 pts)
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  const title = titleMatch ? titleMatch[1].trim() : null;
  const titleLen = title?.length ?? 0;
  const titleGoodLength = titleLen >= 35 && titleLen <= 65;
  const cityLower = input.city?.toLowerCase();
  const titleHasCity = cityLower && title ? title.toLowerCase().includes(cityLower) : false;
  const titleHasService = ctx.services.length > 0 && title ? ctx.services.some(s => title.toLowerCase().includes(s)) : false;
  const titleScore = !title ? 0 : (titleGoodLength ? 3 : 1) + (titleHasCity ? 1 : 0) + (titleHasService ? 1 : 0);
  findings.push(finding("title", titleScore >= 4, Math.min(titleScore, 5), 5,
    !title ? "Missing title tag." : titleScore >= 4 ? "Title tag is well-optimized." : "Title tag could be improved.",
    !title
      ? "Your page is missing a title tag — this is critical for appearing in Google search results."
      : `Your title "${truncate(title!, 55)}" is ${titleGoodLength ? "a good length" : (titleLen < 35 ? "too short" : "too long")}${titleHasCity ? ", includes your city" : ""}${titleHasService ? ", mentions your service" : ""}. ${titleScore < 4 ? "Aim for 35-65 chars with your main service and city." : "Nice work!"}`,
    title ? [{ heuristic: "Title tag", snippet: title, detail: `${titleLen} characters` }] : undefined
  ));

  // 2. Meta description (5 pts)
  const metaDesc = ctx.metaDescription;
  const metaLen = metaDesc?.length ?? 0;
  const metaGoodLength = metaLen >= 70 && metaLen <= 160;
  const metaHasCity = cityLower && metaDesc ? metaDesc.toLowerCase().includes(cityLower) : false;
  const metaHasService = ctx.services.length > 0 && metaDesc ? ctx.services.some(s => metaDesc.toLowerCase().includes(s)) : false;
  const metaScore = !metaDesc ? 0 : (metaGoodLength ? 3 : 1) + (metaHasCity ? 1 : 0) + (metaHasService ? 1 : 0);
  findings.push(finding("meta-desc", metaScore >= 4, Math.min(metaScore, 5), 5,
    !metaDesc ? "Missing meta description." : metaScore >= 4 ? "Meta description is well-written." : "Meta description needs improvement.",
    !metaDesc
      ? "Adding a meta description tells Google and searchers what your page is about — this directly affects click-through rates."
      : `Your meta description "${truncate(metaDesc!, 65)}" is ${metaGoodLength ? "a good length" : (metaLen < 70 ? "too short" : "too long")}. ${metaScore < 4 ? "Include your service + city for best results." : "Well-crafted for search results!"}`,
    metaDesc ? [{ heuristic: "Meta description", snippet: metaDesc, detail: `${metaLen} characters` }] : undefined
  ));

  // 3. H1 and heading hierarchy (4 pts)
  const h1Count = (html.match(/<h1/gi) || []).length;
  const h2Count = (html.match(/<h2/gi) || []).length;
  const h1 = ctx.h1Text;
  const h1Score = h1Count === 0 ? 0 : h1Count === 1 ? (h2Count > 0 ? 4 : 3) : 2;
  findings.push(finding("headings", h1Score >= 3, h1Score, 4,
    h1Count === 0 ? "Missing H1 tag." : h1Count === 1 ? "H1 and heading hierarchy look good." : "Multiple H1 tags detected.",
    h1Count === 0
      ? "Your page is missing an H1 heading — add one that describes your primary service and location."
      : h1Count === 1
        ? `Your H1 "${truncate(h1!, 45)}" is clear.${h2Count > 0 ? ` You have ${h2Count} H2 subheadings for good structure.` : " Consider adding H2 subheadings to break up content."}`
        : `Your page has ${h1Count} H1 tags — Google prefers a single H1 that clearly states your main offering.`,
    h1 ? [{ heuristic: "H1 tag", snippet: h1 }] : undefined
  ));

  // 4. Keyword usage heuristic (3 pts)
  const lowerMd = markdown.toLowerCase();
  const firstParagraph = lowerMd.slice(0, 500);
  let kwHits = 0;
  if (ctx.services.length > 0) {
    const topService = ctx.services[0];
    if (title?.toLowerCase().includes(topService)) kwHits++;
    if (h1?.toLowerCase().includes(topService)) kwHits++;
    if (firstParagraph.includes(topService)) kwHits++;
  }
  const kwScore = Math.min(kwHits, 3);
  findings.push(finding("keyword-usage", kwScore >= 2, kwScore, 3,
    kwScore >= 2 ? "Service keywords appear in key page areas." : "Service keywords could be used more strategically.",
    kwScore >= 2
      ? `Your primary service keyword "${ctx.services[0]}" appears in ${kwHits} key areas (title, H1, opening paragraph) — good keyword placement.`
      : ctx.services.length > 0
        ? `Try placing "${ctx.services[0]}" in your title, H1, and opening paragraph for stronger relevance signals.`
        : "We couldn't identify strong service keywords — make sure your main service appears in the title, H1, and first paragraph."
  ));

  // 5. URL slug (2 pts)
  const slug = input.url.replace(/https?:\/\/[^/]+/, "").replace(/\/$/, "");
  const hasReadableSlug = slug.length > 1 && /^[\w/-]+$/.test(slug);
  const slugHasKeyword = ctx.services.length > 0 && hasReadableSlug && ctx.services.some(s => slug.toLowerCase().includes(s));
  const slugScore = slugHasKeyword ? 2 : hasReadableSlug ? 1 : slug.length <= 1 ? 1 : 0;
  findings.push(finding("url-slug", slugScore >= 1, slugScore, 2,
    slugScore >= 1 ? "URL is human-readable." : "URL could be more descriptive.",
    slugScore >= 2
      ? `Your URL includes a service keyword — clean and descriptive for search engines.`
      : slug.length <= 1
        ? "This appears to be your homepage URL — consider creating service-specific pages with descriptive URLs like /plumbing-services."
        : "Use human-readable, keyword-rich URLs (e.g., /plumbing-repair-austin) for better SEO."
  ));

  // 6. Image alt tags (3 pts)
  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const imgsWithAlt = imgTags.filter((t) => /alt\s*=\s*"[^"]+"/i.test(t)).length;
  const altRatio = imgTags.length > 0 ? imgsWithAlt / imgTags.length : 1;
  const altScore = imgTags.length === 0 ? 2 : altRatio >= 0.8 ? 3 : Math.round(altRatio * 3);
  findings.push(finding("img-alts", altScore >= 2, altScore, 3,
    altScore >= 2 ? "Images have alt text." : `${imgsWithAlt}/${imgTags.length} images have alt text.`,
    imgTags.length === 0
      ? "No images found — consider adding photos of your work, team, or location to make the page more engaging."
      : altRatio >= 0.8
        ? `${imgsWithAlt} of ${imgTags.length} images have descriptive alt text — great for accessibility and SEO.`
        : `Only ${imgsWithAlt} of ${imgTags.length} images have alt text. Add descriptive alt tags to help Google understand your images.`
  ));

  // 7. Internal links (3 pts)
  const hasContactLink = /href\s*=\s*["'][^"']*(?:contact|book|schedule|appointment|quote)/i.test(lowerHtml);
  const internalLinks = (html.match(/href\s*=\s*["']\/[^"']*["']/gi) || []).length;
  const intLinkScore = (hasContactLink ? 2 : 0) + (internalLinks >= 3 ? 1 : 0);
  findings.push(finding("internal-links", intLinkScore >= 2, Math.min(intLinkScore, 3), 3,
    intLinkScore >= 2 ? "Good internal linking structure." : "Internal linking could be improved.",
    hasContactLink
      ? `You link to a contact/booking page, and have ${internalLinks} internal links — this helps both users and Google navigate your site.`
      : "Add links to your contact page, service pages, and booking page to help visitors (and Google) navigate your site."
  ));

  // 8. Entity consistency — business name in title + H1 (2 pts)
  const bizName = ctx.businessName;
  const nameInTitle = bizName && ctx.pageTitle ? ctx.pageTitle.toLowerCase().includes(bizName.toLowerCase()) : false;
  const nameInH1 = bizName && ctx.h1Text ? ctx.h1Text.toLowerCase().includes(bizName.toLowerCase()) : false;
  const entityScore = !bizName ? 0 : (nameInTitle ? 1 : 0) + (nameInH1 ? 1 : 0);
  findings.push(finding("entity-consistency", entityScore >= 2, entityScore, 2,
    !bizName ? "Could not verify entity consistency — no business name detected."
      : entityScore >= 2 ? "Business name appears in both title and H1."
      : entityScore === 1 ? "Business name appears in title or H1, but not both."
      : "Business name missing from both title and H1.",
    !bizName
      ? "We couldn't detect your business name, so we couldn't check if it appears in your title tag and H1. Make sure your business name is clearly visible."
      : entityScore >= 2
        ? `Your business name "${bizName}" appears in both your title tag and H1 heading — this tells Google exactly who you are on every search.`
        : entityScore === 1
          ? `Your business name "${bizName}" appears in your ${nameInTitle ? "title tag" : "H1"} but not your ${nameInTitle ? "H1" : "title tag"}. Adding it to both reinforces your identity to Google.`
          : `Your business name "${bizName}" doesn't appear in your title tag or H1 heading. Google uses these to understand who your page belongs to — adding your name to both is a quick, high-impact fix.`,
    bizName ? [{ heuristic: "Entity consistency check", detail: `Title: ${nameInTitle ? "✓" : "✗"} | H1: ${nameInH1 ? "✓" : "✗"}`, snippet: `Title: "${truncate(ctx.pageTitle || "(none)", 60)}" | H1: "${truncate(ctx.h1Text || "(none)", 60)}"` }] : undefined
  ));

  const score = findings.reduce((s, f) => s + f.points, 0);
  return { id: "on-page-seo", label: "On-Page SEO", icon: "Search", score, maxScore: 27, findings };
}

// ── Technical SEO (25 pts) ───────────────────────────────

function scoreTechnicalSEO(
  data: FirecrawlScrapeResult,
  input: ScanInput
): CategoryResult {
  const { html } = data;
  const findings: Finding[] = [];
  const lowerHtml = html.toLowerCase();

  // 1. HTTPS (5 pts)
  const isHttps = input.url.startsWith("https");
  const hasMixedContent = isHttps && /(?:src|href)\s*=\s*["']http:\/\//i.test(html);
  const httpsScore = !isHttps ? 0 : hasMixedContent ? 3 : 5;
  findings.push(finding("https", httpsScore >= 3, httpsScore, 5,
    !isHttps ? "Site does not use HTTPS." : hasMixedContent ? "HTTPS with mixed content detected." : "Site uses HTTPS.",
    !isHttps
      ? "Your site isn't using HTTPS — Google penalizes non-secure sites and browsers show warnings to visitors."
      : hasMixedContent
        ? "Your site uses HTTPS but loads some resources over HTTP. Fix mixed content to avoid browser warnings."
        : "Your site is served over HTTPS — essential for trust and Google ranking."
  ));

  // 2. Meta robots (4 pts)
  const robotsMeta = html.match(/<meta[^>]*name\s*=\s*["']robots["'][^>]*content\s*=\s*["']([^"']+)["']/i);
  const robotsContent = robotsMeta ? robotsMeta[1].toLowerCase() : "";
  const hasNoindex = robotsContent.includes("noindex");
  const hasNofollow = robotsContent.includes("nofollow");
  const robotsScore = hasNoindex ? 0 : hasNofollow ? 2 : 4;
  findings.push(finding("meta-robots", robotsScore >= 4, robotsScore, 4,
    hasNoindex ? "Page is set to noindex — Google won't index it!" : hasNofollow ? "Page has nofollow — links won't pass SEO value." : "No blocking robots directives found.",
    hasNoindex
      ? "Your page has a 'noindex' meta tag — this tells Google NOT to show your page in search results. Remove it unless intentional!"
      : hasNofollow
        ? "Your page has a 'nofollow' directive — internal links won't pass SEO value. This is unusual for a public page."
        : "Your page allows Google to index and follow links — no accidental blocking detected.",
    robotsMeta ? [{ heuristic: "Meta robots tag", snippet: `<meta name="robots" content="${robotsMeta[1]}">` }] : undefined
  ));

  // 3. Canonical tag (4 pts)
  const canonicalMatch = html.match(/<link[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']+)["']/i);
  const hasCanonical = !!canonicalMatch;
  const canonicalUrl = canonicalMatch ? canonicalMatch[1] : null;
  const isSelfReferential = canonicalUrl ? input.url.replace(/\/$/, "").includes(canonicalUrl.replace(/\/$/, "")) : false;
  const canonScore = !hasCanonical ? 0 : isSelfReferential ? 4 : 3;
  findings.push(finding("canonical", hasCanonical, canonScore, 4,
    hasCanonical ? "Canonical tag present." : "No canonical tag found.",
    hasCanonical
      ? isSelfReferential
        ? "You have a self-referential canonical tag — this correctly tells Google this is the authoritative version of the page."
        : `Your canonical tag points to "${truncate(canonicalUrl!, 50)}" — make sure this is intentional.`
      : "Adding a canonical tag tells Google which version of your page to index, avoiding duplicate content penalties.",
    canonicalUrl ? [{ heuristic: "Canonical URL", snippet: canonicalUrl }] : undefined
  ));

  // 4. Mobile viewport (4 pts)
  const viewportMatch = html.match(/<meta[^>]*name\s*=\s*["']viewport["'][^>]*content\s*=\s*["']([^"']+)["']/i);
  const viewportContent = viewportMatch ? viewportMatch[1] : "";
  const hasWidthDevice = viewportContent.includes("width=device-width");
  const hasInitialScale = viewportContent.includes("initial-scale");
  const viewportScore = hasWidthDevice && hasInitialScale ? 4 : hasWidthDevice ? 3 : viewportMatch ? 2 : 0;
  findings.push(finding("viewport", viewportScore >= 3, viewportScore, 4,
    viewportScore >= 3 ? "Mobile viewport tag properly configured." : !viewportMatch ? "Missing mobile viewport tag." : "Viewport tag could be improved.",
    viewportScore >= 3
      ? "Your mobile viewport is properly configured — critical since most local searches happen on phones."
      : "Your site is missing a proper mobile viewport tag. Over 60% of local searches happen on phones — this is a must-fix."
  ));

  // 5. Render-blocking resources (2 pts)
  const cssInHead = (html.match(/<head[\s\S]*?<\/head>/i)?.[0] || "").match(/<link[^>]*rel\s*=\s*["']stylesheet["'][^>]*>/gi) || [];
  const syncJsInHead = (html.match(/<head[\s\S]*?<\/head>/i)?.[0] || "").match(/<script(?![^>]*(?:async|defer))[^>]*src\s*=/gi) || [];
  const renderBlockingCount = cssInHead.length + syncJsInHead.length;
  const rbScore = renderBlockingCount <= 3 ? 2 : renderBlockingCount <= 6 ? 1 : 0;
  findings.push(finding("render-blocking", rbScore >= 1, rbScore, 2,
    rbScore >= 1 ? "Few render-blocking resources." : `${renderBlockingCount} render-blocking resources in <head>.`,
    rbScore >= 1
      ? `Only ${renderBlockingCount} render-blocking resource(s) in your <head> — your page should load quickly.`
      : `${renderBlockingCount} render-blocking resources (${cssInHead.length} CSS, ${syncJsInHead.length} sync JS) in your <head>. Consider deferring scripts and inlining critical CSS for faster load.`
  ));

  // 6. Speed proxies (2 pts)
  const inlineScripts = html.match(/<script(?![^>]*src)[^>]*>[\s\S]{500,}<\/script>/gi) || [];
  const thirdPartyScripts = (html.match(/<script[^>]*src\s*=\s*["']https?:\/\/(?!.*(?:googleapis|gstatic|google))[^"']+["'][^>]*>/gi) || []).length;
  const largeInline = inlineScripts.length;
  const speedScore = (largeInline === 0 && thirdPartyScripts <= 5) ? 2 : (largeInline <= 2 && thirdPartyScripts <= 10) ? 1 : 0;
  findings.push(finding("speed-proxies", speedScore >= 1, speedScore, 2,
    speedScore >= 1 ? "Page weight looks reasonable." : "Page may be slow to load.",
    speedScore >= 1
      ? `Your page has ${largeInline} large inline scripts and ${thirdPartyScripts} third-party scripts — reasonable for fast loading.`
      : `${largeInline} large inline script(s) and ${thirdPartyScripts} third-party scripts may slow your page. Visitors (and Google) penalize slow pages.`
  ));

  // 7. robots.txt (2 pts)
  const ch = input.crawlHygiene;
  const robotsExists = ch?.robotsTxt?.exists ?? false;
  const robotsBlocksAll = ch?.robotsTxt?.blocksAll ?? false;
  const rtScore = !ch ? 1 : robotsBlocksAll ? 0 : robotsExists ? 2 : 0;
  const robotsTxtEvidence: FindingEvidence[] = [];
  if (ch?.robotsTxt?.content) {
    robotsTxtEvidence.push({ heuristic: "robots.txt contents", snippet: ch.robotsTxt.content.slice(0, 400) });
  }
  if (ch?.robotsTxt?.sitemapDirectives && ch.robotsTxt.sitemapDirectives.length > 0) {
    robotsTxtEvidence.push({ heuristic: "Sitemap directives in robots.txt", snippet: ch.robotsTxt.sitemapDirectives.join("\n") });
  }
  findings.push(finding("robots-txt", rtScore >= 1, rtScore, 2,
    !ch ? "robots.txt check not available." : robotsBlocksAll ? "robots.txt is blocking all crawlers!" : robotsExists ? "robots.txt found and looks okay." : "No robots.txt found.",
    !ch ? "We couldn't check your robots.txt in this scan. This file tells Google which pages to crawl."
      : robotsBlocksAll ? "Your robots.txt contains 'Disallow: /' which blocks Google from crawling your entire site. Unless this is intentional, remove that line immediately."
      : robotsExists ? "Your robots.txt is present and isn't blocking important pages — Google can crawl your site normally."
      : "Your site is missing a robots.txt file. While Google will still crawl your site, adding one gives you control over which pages get indexed. Most website platforms generate one automatically — check your settings.",
    robotsTxtEvidence.length > 0 ? robotsTxtEvidence : undefined
  ));

  // 8. XML Sitemap (2 pts)
  const sitemapFound = ch?.sitemap?.found ?? false;
  const sitemapSource = ch?.sitemap?.source;
  const sitemapUrl = ch?.sitemap?.url;
  const sitemapInRobots = sitemapSource === "robots";
  const smScore = !ch ? 1 : sitemapFound && sitemapInRobots ? 2 : sitemapFound ? 1 : 0;
  findings.push(finding("xml-sitemap", smScore >= 1, smScore, 2,
    !ch ? "Sitemap check not available." : sitemapFound && sitemapInRobots ? "XML sitemap found and referenced in robots.txt." : sitemapFound ? "XML sitemap found, but not referenced in robots.txt." : "No XML sitemap found.",
    !ch ? "We couldn't check for an XML sitemap in this scan. A sitemap helps Google discover all your pages."
      : sitemapFound && sitemapInRobots ? "Your XML sitemap exists and is linked from robots.txt — this is the ideal setup for Google to discover all your pages quickly."
      : sitemapFound ? `Your XML sitemap exists at a common location, but isn't referenced in your robots.txt. Add a 'Sitemap:' directive to robots.txt so Google finds it automatically.`
      : "No XML sitemap was found. A sitemap helps Google discover and index all your pages — especially important if you have service pages, location pages, or blog posts. Most website platforms can generate one automatically.",
    sitemapUrl ? [{ heuristic: "Sitemap URL", snippet: sitemapUrl }] : undefined
  ));

  // 9. Redirect chain (3 pts) — scored from redirectChain data if available
  // Note: actual redirect chain data is fetched in the edge function and attached to the result.
  // Here we add a placeholder finding that will be updated if redirectChain data exists.
  // The edge function passes redirectChain data which gets scored in scoreWebsite().

  const score = findings.reduce((s, f) => s + f.points, 0);
  return { id: "technical-seo", label: "Technical SEO", icon: "Settings", score, maxScore: 25, findings };
}

// ── Content & UX (10 pts) ────────────────────────────────

function scoreContentUX(
  data: FirecrawlScrapeResult,
  ctx: SiteContext
): CategoryResult {
  const { html, markdown } = data;
  const findings: Finding[] = [];
  const lowerMd = markdown.toLowerCase();

  // 1. Word count (3 pts)
  const wordCount = markdown.split(/\s+/).filter(Boolean).length;
  const wcScore = wordCount >= 300 ? 3 : wordCount >= 150 ? 2 : wordCount >= 50 ? 1 : 0;
  findings.push(finding("word-count", wcScore >= 2, wcScore, 3,
    wcScore >= 2 ? `Page has ${wordCount} words — good depth.` : `Page has only ${wordCount} words.`,
    wcScore >= 2
      ? `Your page has ${wordCount} words of content — Google has plenty to work with when determining relevance.`
      : `Your page has only ${wordCount} words. Google generally favors pages with 300+ words of unique, helpful content about your services.`
  ));

  // 2. Content structure / FAQ (3 pts)
  const headingCount = (html.match(/<h[2-6]/gi) || []).length;
  const hasFAQ = /\?\s*<\/h[2-4]>/i.test(html) || lowerMd.includes("faq") || lowerMd.includes("frequently asked");
  const structScore = (headingCount >= 3 ? 2 : headingCount >= 1 ? 1 : 0) + (hasFAQ ? 1 : 0);
  findings.push(finding("content-structure", structScore >= 2, Math.min(structScore, 3), 3,
    structScore >= 2 ? "Content is well-structured with headings." : "Content structure could be improved.",
    structScore >= 2
      ? `Your page has ${headingCount} subheadings${hasFAQ ? " and an FAQ section" : ""} — well-structured content that helps users and Google understand your services.`
      : `Your page has only ${headingCount} subheading(s). Break your content into sections with H2/H3 headings.${!hasFAQ ? " Consider adding an FAQ section to answer common questions." : ""}`
  ));

  // 3. CTAs (2 pts)
  const ctaPatterns = /call\s+(us|now|today)|get\s+(a\s+)?(free\s+)?quote|request\s+(a\s+)?estimate|book\s+(a\s+)?(call|appointment|consultation)|contact\s+us|schedule|free\s+estimate/i;
  const hasCTA = ctaPatterns.test(markdown);
  const ctaButton = /<(button|a)[^>]*>[^<]*(call|book|contact|quote|schedule|estimate)[^<]*<\/(button|a)>/i.test(html);
  const ctaScore = ctaButton ? 2 : hasCTA ? 1 : 0;
  findings.push(finding("cta", ctaScore >= 1, ctaScore, 2,
    ctaScore >= 1 ? "Call-to-action found." : "No clear call-to-action detected.",
    ctaScore >= 1
      ? ctaButton
        ? "You have a clear CTA button — this makes it easy for visitors to take action."
        : "You mention a call-to-action in text — consider making it a prominent button for more conversions."
      : "Adding a clear call-to-action like 'Get a Free Quote' or 'Call Now' can significantly increase leads."
  ));

  // 4. Contact info visible (2 pts)
  const hasContact = !!ctx.phone || !!ctx.email;
  findings.push(finding("contact-visible", hasContact, hasContact ? 2 : 0, 2,
    hasContact ? "Contact information is visible." : "No contact info found.",
    hasContact
      ? `Your contact info${ctx.phone ? ` (${ctx.phone})` : ""}${ctx.email ? ` and email (${ctx.email})` : ""} is visible — this builds trust with visitors and Google.`
      : "Making your phone number and email visible on every page helps both customers and Google verify your business."
  ));

  const score = findings.reduce((s, f) => s + f.points, 0);
  return { id: "content-ux", label: "Content & UX", icon: "FileText", score, maxScore: 10, findings };
}

// ── Google Readiness Extras (10 pts) ─────────────────────

function scoreExtras(
  data: FirecrawlScrapeResult,
  _ctx: SiteContext
): CategoryResult {
  const { html, markdown } = data;
  const findings: Finding[] = [];
  const lowerHtml = html.toLowerCase();
  const lowerMd = markdown.toLowerCase();

  // 1. Extra structured data (4 pts) — FAQPage, Service, Organization, Breadcrumb
  const extraSchemaTypes = ["faqpage", "service", "organization", "breadcrumblist", "product", "offer"];
  const jsonLdBlocks = html.match(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  const foundTypes: string[] = [];
  for (const block of jsonLdBlocks) {
    const inner = block.replace(/<\/?script[^>]*>/gi, "");
    try {
      const parsed = JSON.parse(inner);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const obj of items) {
        const type = (obj?.["@type"] || "").toLowerCase();
        if (extraSchemaTypes.some(t => type.includes(t))) {
          foundTypes.push(obj["@type"]);
        }
      }
    } catch { /* ignore */ }
  }
  // Also check microdata
  if (/itemtype\s*=\s*["'][^"']*breadcrumb/i.test(html)) foundTypes.push("BreadcrumbList");
  const extraSchemaScore = foundTypes.length >= 2 ? 4 : foundTypes.length === 1 ? 2 : 0;
  findings.push(finding("extra-schema", extraSchemaScore > 0, extraSchemaScore, 4,
    extraSchemaScore > 0 ? `Extra schema types found: ${foundTypes.join(", ")}.` : "No additional structured data beyond basics.",
    extraSchemaScore > 0
      ? `Your site includes ${foundTypes.join(", ")} schema — these can earn rich snippets and enhanced search features.`
      : "Adding FAQPage, Service, or Breadcrumb schema can earn you enhanced search features like FAQ dropdowns and breadcrumb navigation in results."
  ));

  // 2. No obvious spam (3 pts) — now with evidence-backed heuristics
  const spamPatterns = /casino|poker|essay\s*writing|payday\s*loan|viagra|cialis|crypto\s*trading|forex\s*signal/i;
  const spamLinks = (html.match(/<a[^>]*href\s*=\s*["'][^"']*["'][^>]*>[^<]*<\/a>/gi) || [])
    .filter(link => spamPatterns.test(link));
  const spamEvidence: FindingEvidence[] = [];

  // Heuristic 1: Suspicious outbound links
  if (spamLinks.length > 0) {
    spamEvidence.push({
      heuristic: "Suspicious outbound links detected",
      snippet: spamLinks.slice(0, 3).map(l => l.replace(/<[^>]+>/g, "").trim()).join(" | "),
      detail: `Found ${spamLinks.length} link(s) matching known spam patterns (gambling, pharma, essay writing).`,
    });
  }

  // Heuristic 2: Keyword stuffing — same phrase repeated excessively
  const words = lowerMd.split(/\s+/);
  const totalWords = words.length;
  if (totalWords >= 100) {
    // Check 2-3 word phrases
    const phraseCounts: Record<string, number> = {};
    for (let i = 0; i < words.length - 1; i++) {
      const bi = words[i] + " " + words[i + 1];
      if (bi.length > 5) phraseCounts[bi] = (phraseCounts[bi] || 0) + 1;
      if (i < words.length - 2) {
        const tri = bi + " " + words[i + 2];
        if (tri.length > 8) phraseCounts[tri] = (phraseCounts[tri] || 0) + 1;
      }
    }
    const stuffingThreshold = Math.max(6, Math.floor(totalWords / 50));
    const stuffedPhrases = Object.entries(phraseCounts)
      .filter(([, count]) => count >= stuffingThreshold)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    for (const [phrase, count] of stuffedPhrases) {
      // Find a snippet around the phrase
      const idx = lowerMd.indexOf(phrase);
      const snippetStart = Math.max(0, idx - 40);
      const snippetEnd = Math.min(lowerMd.length, idx + phrase.length + 40);
      const snippet = "…" + lowerMd.slice(snippetStart, snippetEnd).replace(/\n/g, " ") + "…";
      spamEvidence.push({
        heuristic: "Potential keyword stuffing",
        snippet,
        detail: `The phrase "${phrase}" appears ${count} times in ~${totalWords} words (threshold: ${stuffingThreshold}). This density may look unnatural to Google.`,
      });
    }
  }

  // Heuristic 3: Location stuffing — long list of cities/ZIPs in one block
  const cityListPattern = /(?:(?:[A-Z][a-z]+(?:\s[A-Z][a-z]+)*,?\s*(?:[A-Z]{2})?\s*(?:\d{5})?)\s*[,|·•]\s*){5,}/g;
  const cityListMatches = html.match(cityListPattern);
  if (cityListMatches) {
    for (const match of cityListMatches.slice(0, 2)) {
      spamEvidence.push({
        heuristic: "Potential location stuffing",
        snippet: truncate(match.replace(/<[^>]+>/g, ""), 120),
        detail: "A long list of cities or ZIP codes in one block can look like doorway content to Google.",
      });
    }
  }

  const hasSpam = spamLinks.length > 0 || spamPatterns.test(lowerMd) || spamEvidence.some(e => e.heuristic.includes("stuffing"));
  findings.push(finding("no-spam", !hasSpam, hasSpam ? 0 : 3, 3,
    !hasSpam ? "No spammy content or links detected." : "Potentially spammy content or links found.",
    !hasSpam
      ? "Your page is clean — no suspicious outbound links or spammy content patterns detected."
      : `We found ${spamEvidence.length} potential issue(s): ${spamEvidence.map(e => e.heuristic.toLowerCase()).join(", ")}. Review the evidence below for specifics.`,
    spamEvidence.length > 0 ? spamEvidence : undefined
  ));

  // 3. Trust indicators — testimonials, social links (3 pts)
  const hasTestimonials = /testimonials?|what\s+(our\s+)?(?:clients?|customers?)\s+say|reviews?\s+from/i.test(lowerMd);
  const socialPatterns = /facebook\.com|instagram\.com|twitter\.com|x\.com|linkedin\.com|youtube\.com|yelp\.com|nextdoor\.com/i;
  const hasSocial = socialPatterns.test(lowerHtml);
  const trustScore = (hasTestimonials ? 2 : 0) + (hasSocial ? 1 : 0);
  findings.push(finding("trust-indicators", trustScore >= 2, Math.min(trustScore, 3), 3,
    trustScore >= 2 ? "Trust indicators found (testimonials, social links)." : "Trust indicators could be strengthened.",
    trustScore >= 2
      ? `Your page includes ${hasTestimonials ? "testimonials" : ""}${hasTestimonials && hasSocial ? " and " : ""}${hasSocial ? "social media links" : ""} — these build credibility with visitors.`
      : `${!hasTestimonials ? "Adding customer testimonials" : ""}${!hasTestimonials && !hasSocial ? " and " : ""}${!hasSocial ? "Linking to your social profiles" : ""} can strengthen trust signals for both visitors and Google.`
  ));

  const score = findings.reduce((s, f) => s + f.points, 0);
  return { id: "extras", label: "Google Readiness Extras", icon: "Award", score, maxScore: 10, findings };
}

// ── Summary Generator ────────────────────────────────────

function generatePersonalizedSummary(
  ctx: SiteContext,
  categories: CategoryResult[],
  overallScore: number
): string {
  const name = ctx.businessName || "Your website";
  const strengths = categories
    .flatMap((c) => c.findings.filter((f) => f.passed))
    .slice(0, 3)
    .map((f) => f.personalized);

  const topIssue = categories
    .flatMap((c) => c.findings.filter((f) => !f.passed))
    .sort((a, b) => b.maxPoints - a.maxPoints)[0];

  let summary = `${name} scored ${overallScore}/100 on our Google Compatibility Checkup. `;

  if (strengths.length > 0) {
    summary += `Here's what you're doing well: ${strengths[0]} `;
  }

  if (topIssue) {
    summary += `The biggest opportunity we found: ${topIssue.personalized}`;
  }

  return summary;
}

// ── Main Entry Point ─────────────────────────────────────

export function scoreWebsite(
  data: FirecrawlScrapeResult,
  input: ScanInput
): ScoringResult {
  const ctx = extractContext(data, input);

  const categories: CategoryResult[] = [
    scoreLocalPresence(data, ctx, input),
    scoreOnPageSEO(data, ctx, input),
    scoreTechnicalSEO(data, input),
    scoreContentUX(data, ctx),
    scoreExtras(data, ctx),
  ];

  // Build schema completeness data from local-schema finding
  let schemaCompleteness: import("./types").SchemaCompletenessData | undefined;
  const localSchemaFinding = categories.find(c => c.id === "local-presence")?.findings.find(f => f.id === "local-schema");
  if (localSchemaFinding) {
    const { html } = data;
    const jsonLdBlocks = html.match(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
    const requiredFields = ["@type", "name", "address", "telephone", "url"];
    const recommendedFields = ["geo", "openingHoursSpecification", "priceRange", "image", "sameAs", "description", "areaServed", "email", "aggregateRating", "review"];
    let existingSchema: Record<string, unknown> | null = null;

    for (const block of jsonLdBlocks) {
      const inner = block.replace(/<\/?script[^>]*>/gi, "");
      try {
        const parsed = JSON.parse(inner);
        const obj = Array.isArray(parsed) ? parsed[0] : parsed;
        if (obj?.["@type"] && /LocalBusiness|Store|Restaurant|ProfessionalService|HomeAndConstructionBusiness|Plumber|Electrician|HVACBusiness|RoofingContractor|LocksmithService/i.test(obj["@type"])) {
          existingSchema = obj;
          break;
        }
      } catch { /* ignore */ }
    }

    if (existingSchema) {
      const foundFields = [...requiredFields, ...recommendedFields].filter(f => existingSchema![f] != null);
      const missingRequired = requiredFields.filter(f => existingSchema![f] == null);
      const missingRecommended = recommendedFields.filter(f => existingSchema![f] == null);
      const total = requiredFields.length + recommendedFields.length;
      const completenessPercent = Math.round((foundFields.length / total) * 100);

      // Generate paste-ready JSON-LD
      const pasteReady: Record<string, unknown> = { "@context": "https://schema.org", ...existingSchema };
      for (const field of missingRequired) {
        if (field === "address") pasteReady[field] = { "@type": "PostalAddress", streetAddress: "YOUR_STREET", addressLocality: ctx.locations[0]?.split(",")[0]?.trim() || "YOUR_CITY", addressRegion: "YOUR_STATE", postalCode: "YOUR_ZIP" };
        else if (field !== "@type") pasteReady[field] = `YOUR_${field.toUpperCase()}`;
      }
      for (const field of missingRecommended) {
        if (field === "geo") pasteReady[field] = { "@type": "GeoCoordinates", latitude: "YOUR_LAT", longitude: "YOUR_LNG" };
        else if (field === "openingHoursSpecification") pasteReady[field] = [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "17:00" }];
        else if (field === "sameAs") pasteReady[field] = ["YOUR_FACEBOOK_URL", "YOUR_INSTAGRAM_URL"];
        else if (field === "aggregateRating") pasteReady[field] = { "@type": "AggregateRating", ratingValue: "YOUR_RATING", reviewCount: "YOUR_REVIEW_COUNT" };
        else pasteReady[field] = `YOUR_${field.toUpperCase()}`;
      }

      schemaCompleteness = {
        foundFields,
        missingRequired,
        missingRecommended,
        totalRequired: requiredFields.length,
        totalRecommended: recommendedFields.length,
        completenessPercent,
        existingSchema,
        pasteReadyJsonLd: JSON.stringify(pasteReady, null, 2),
      };
    }
  }

  // Attach impact/effort metadata to every finding
  for (const cat of categories) {
    for (const f of cat.findings) {
      const meta = CHECK_METADATA[f.id];
      if (meta) {
        f.impact = meta.impact;
        f.effort = meta.effort;
      }
    }
  }

  const businessType = input.businessType || "local";
  
  // Checks that are "bonus" for online businesses
  const onlineBonusChecks = ["phone", "nap", "local-schema", "maps", "local-keywords"];
  
  const rawScore = categories.reduce((s, c) => s + c.score, 0);
  
  if (businessType === "online") {
    // Calculate base score (without bonus checks) and bonus points
    let baseEarned = 0;
    let baseMax = 0;
    let bonusEarned = 0;
    
    for (const cat of categories) {
      for (const finding of cat.findings) {
        if (onlineBonusChecks.includes(finding.id)) {
          bonusEarned += finding.points;
        } else {
          baseEarned += finding.points;
          baseMax += finding.maxPoints;
        }
      }
    }
    
    // Normalize base to 100, then add bonus points on top
    const applicableMax = baseMax;
    const normalizedBase = applicableMax > 0
      ? Math.round((baseEarned / applicableMax) * 100)
      : baseEarned;
    const overallScore = normalizedBase + bonusEarned;
    const letterGrade = grade(Math.min(overallScore, 100));
    const personalizedSummary = generatePersonalizedSummary(ctx, categories, overallScore);
    
  return {
    overallScore,
    rawScore,
    applicableMax,
    businessType,
    letterGrade,
    categories,
    siteContext: ctx,
    personalizedSummary,
    schemaCompleteness,
  };
}
  
  // Local business: straight score out of 100
  const applicableMax = 100;
  const overallScore = rawScore;
  const letterGrade = grade(overallScore);
  const personalizedSummary = generatePersonalizedSummary(ctx, categories, overallScore);

  return {
    overallScore,
    rawScore,
    applicableMax,
    businessType,
    letterGrade,
    categories,
    siteContext: ctx,
    personalizedSummary,
  };
}
