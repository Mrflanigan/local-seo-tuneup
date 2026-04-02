import type {
  FirecrawlScrapeResult,
  SiteContext,
  ScoringResult,
  CategoryResult,
  Finding,
  LetterGrade,
  ScanInput,
} from "./types";

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

// ── Context Extraction ──────────────────────────────────

function extractContext(
  data: FirecrawlScrapeResult,
  input: ScanInput
): SiteContext {
  const { html, markdown, metadata } = data;

  // Business name: og:site_name → title before | or - → first H1
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

  // Services – common local-biz service keywords found in content
  const servicePatterns = [
    "plumbing", "electrical", "hvac", "roofing", "remodeling",
    "landscaping", "painting", "cleaning", "flooring", "cabinets",
    "renovation", "repair", "installation", "maintenance", "construction",
    "demolition", "inspection", "design", "consulting", "hauling",
  ];
  const lowerMd = markdown.toLowerCase();
  const services = servicePatterns.filter((s) => lowerMd.includes(s));

  // Locations – city from input + any city-like references
  const locations: string[] = [];
  if (input.city) {
    if (lowerMd.includes(input.city.toLowerCase())) locations.push(input.city);
  }
  // Look for common state abbreviations near city names
  const cityStateRegex =
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),?\s*([A-Z]{2})\b/g;
  let csMatch;
  while ((csMatch = cityStateRegex.exec(html)) !== null) {
    const loc = `${csMatch[1]}, ${csMatch[2]}`;
    if (!locations.includes(loc)) locations.push(loc);
  }

  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
  const h1Text = h1Match
    ? h1Match[1].replace(/<[^>]+>/g, "").trim()
    : null;

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

// ── Category Scorers ─────────────────────────────────────

function scoreLocalPresence(
  data: FirecrawlScrapeResult,
  ctx: SiteContext,
  input: ScanInput
): CategoryResult {
  const { html, markdown } = data;
  const findings: Finding[] = [];
  const lowerHtml = html.toLowerCase();
  const lowerMd = markdown.toLowerCase();

  // 1. Phone number visible (8 pts)
  const hasPhone = !!ctx.phone;
  findings.push({
    id: "phone",
    passed: hasPhone,
    points: hasPhone ? 8 : 0,
    maxPoints: 8,
    generic: hasPhone ? "Phone number is visible on the page." : "No phone number found on the page.",
    personalized: hasPhone
      ? `Your phone number (${ctx.phone}) is prominently displayed, making it easy for local customers to call.`
      : "We couldn't find a phone number on your page — adding one helps local customers reach you instantly.",
  });

  // 2. Physical address / NAP (7 pts)
  const addressPattern = /\d{1,5}\s\w+\s(?:st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|ln|lane|ct|court|way|pl|place)/i;
  const hasAddress = addressPattern.test(html);
  findings.push({
    id: "address",
    passed: hasAddress,
    points: hasAddress ? 7 : 0,
    maxPoints: 7,
    generic: hasAddress ? "Physical address found." : "No physical address detected.",
    personalized: hasAddress
      ? "Your street address is visible, reinforcing your local presence for Google."
      : "Adding your full street address helps Google verify your business location.",
  });

  // 3. Google Maps embed (5 pts)
  const hasMaps = lowerHtml.includes("google.com/maps") || lowerHtml.includes("maps.googleapis");
  findings.push({
    id: "maps",
    passed: hasMaps,
    points: hasMaps ? 5 : 0,
    maxPoints: 5,
    generic: hasMaps ? "Google Maps embed detected." : "No Google Maps embed found.",
    personalized: hasMaps
      ? "Great — you have a Google Maps embed, which helps visitors find your location."
      : "Embedding a Google Map on your site helps customers find you and signals local relevance to Google.",
  });

  // 4. Local keywords (5 pts)
  const cityName = input.city?.toLowerCase();
  const hasLocalKeywords = cityName
    ? lowerMd.includes(cityName)
    : ctx.locations.length > 0;
  findings.push({
    id: "local-keywords",
    passed: hasLocalKeywords,
    points: hasLocalKeywords ? 5 : 0,
    maxPoints: 5,
    generic: hasLocalKeywords ? "Local keywords found in content." : "No local/city keywords detected.",
    personalized: hasLocalKeywords
      ? `Your content mentions ${ctx.locations.length > 0 ? ctx.locations[0] : input.city}, which helps Google associate your site with that area.`
      : `Consider adding your city name${input.city ? ` ("${input.city}")` : ""} throughout your content to boost local search visibility.`,
  });

  // 5. GBP / Google Business link (5 pts)
  const hasGBP = lowerHtml.includes("business.google.com") || lowerHtml.includes("g.page") || lowerHtml.includes("google.com/maps/place");
  findings.push({
    id: "gbp-link",
    passed: hasGBP,
    points: hasGBP ? 5 : 0,
    maxPoints: 5,
    generic: hasGBP ? "Google Business Profile link found." : "No Google Business Profile link detected.",
    personalized: hasGBP
      ? "You're linking to your Google Business Profile — this reinforces your local credibility."
      : "Linking to your Google Business Profile can strengthen trust and help customers leave reviews.",
  });

  const score = findings.reduce((s, f) => s + f.points, 0);
  return { id: "local-presence", label: "Local Presence & GBP", icon: "MapPin", score, maxScore: 30, findings };
}

function scoreOnPageSEO(
  data: FirecrawlScrapeResult,
  ctx: SiteContext
): CategoryResult {
  const { html } = data;
  const findings: Finding[] = [];

  // 1. Title tag (8 pts)
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  const title = titleMatch ? titleMatch[1].trim() : null;
  const hasGoodTitle = !!title && title.length >= 10 && title.length <= 70;
  findings.push({
    id: "title",
    passed: hasGoodTitle,
    points: hasGoodTitle ? 8 : title ? 4 : 0,
    maxPoints: 8,
    generic: hasGoodTitle ? "Title tag is well-optimized." : title ? "Title tag could be improved." : "Missing title tag.",
    personalized: hasGoodTitle
      ? `Your title — "${truncate(title!, 60)}" — is a good length and descriptive.`
      : title
        ? `Your title "${truncate(title, 60)}" is ${title.length < 10 ? "too short" : "too long"} — aim for 30-60 characters with your main service and city.`
        : "Your page is missing a title tag — this is critical for showing up in Google search results.",
  });

  // 2. Meta description (7 pts)
  const metaDesc = ctx.metaDescription;
  const hasGoodMeta = !!metaDesc && metaDesc.length >= 50 && metaDesc.length <= 160;
  findings.push({
    id: "meta-desc",
    passed: hasGoodMeta,
    points: hasGoodMeta ? 7 : metaDesc ? 3 : 0,
    maxPoints: 7,
    generic: hasGoodMeta ? "Meta description is well-written." : metaDesc ? "Meta description needs improvement." : "Missing meta description.",
    personalized: hasGoodMeta
      ? `Your meta description — "${truncate(metaDesc!, 70)}" — is well-crafted and should display nicely in search results.`
      : metaDesc
        ? `Your meta description is ${metaDesc.length < 50 ? "too short" : "too long"}. Aim for 120-155 characters describing what you do and where.`
        : "Adding a meta description tells Google (and searchers) what your page is about — this directly affects click-through rates.",
  });

  // 3. H1 tag (5 pts)
  const h1 = ctx.h1Text;
  const hasH1 = !!h1 && h1.length > 0;
  const multipleH1s = (html.match(/<h1/gi) || []).length > 1;
  findings.push({
    id: "h1",
    passed: hasH1 && !multipleH1s,
    points: hasH1 ? (multipleH1s ? 3 : 5) : 0,
    maxPoints: 5,
    generic: hasH1 ? (multipleH1s ? "Multiple H1 tags found." : "H1 tag present.") : "Missing H1 tag.",
    personalized: hasH1
      ? multipleH1s
        ? `Your page has multiple H1 tags — Google prefers a single H1 that clearly states your main offering.`
        : `Your H1 — "${truncate(h1!, 50)}" — clearly communicates what your page is about.`
      : "Your page is missing an H1 heading — add one that describes your primary service and location.",
  });

  // 4. Image alt tags (5 pts)
  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const imgsWithAlt = imgTags.filter((t) => /alt\s*=\s*"[^"]+"/i.test(t)).length;
  const altRatio = imgTags.length > 0 ? imgsWithAlt / imgTags.length : 1;
  const goodAlts = altRatio >= 0.8;
  findings.push({
    id: "img-alts",
    passed: goodAlts,
    points: goodAlts ? 5 : Math.round(altRatio * 5),
    maxPoints: 5,
    generic: goodAlts ? "Images have alt text." : `${imgsWithAlt}/${imgTags.length} images have alt text.`,
    personalized: goodAlts
      ? `${imgsWithAlt} of ${imgTags.length} images have descriptive alt text — great for accessibility and SEO.`
      : `Only ${imgsWithAlt} of ${imgTags.length} images have alt text. Adding descriptive alt tags helps Google understand your images and improves accessibility.`,
  });

  const score = findings.reduce((s, f) => s + f.points, 0);
  return { id: "on-page-seo", label: "On-Page SEO", icon: "Search", score, maxScore: 25, findings };
}

function scoreTechnicalSEO(
  data: FirecrawlScrapeResult,
  input: ScanInput
): CategoryResult {
  const { html } = data;
  const findings: Finding[] = [];
  const lowerHtml = html.toLowerCase();

  // 1. HTTPS (8 pts)
  const isHttps = input.url.startsWith("https");
  findings.push({
    id: "https",
    passed: isHttps,
    points: isHttps ? 8 : 0,
    maxPoints: 8,
    generic: isHttps ? "Site uses HTTPS." : "Site does not use HTTPS.",
    personalized: isHttps
      ? "Your site is served over HTTPS — this is essential for trust and Google ranking."
      : "Your site isn't using HTTPS — Google penalizes non-secure sites and browsers show warnings to visitors.",
  });

  // 2. Mobile viewport (7 pts)
  const hasViewport = lowerHtml.includes('name="viewport"') || lowerHtml.includes("name='viewport'");
  findings.push({
    id: "viewport",
    passed: hasViewport,
    points: hasViewport ? 7 : 0,
    maxPoints: 7,
    generic: hasViewport ? "Mobile viewport meta tag present." : "Missing mobile viewport meta tag.",
    personalized: hasViewport
      ? "Your site has a mobile viewport tag, which means it should render well on phones — critical since most local searches are mobile."
      : "Your site is missing a mobile viewport tag. Over 60% of local searches happen on phones, so this is a must-fix.",
  });

  // 3. Canonical tag (5 pts)
  const hasCanonical = lowerHtml.includes('rel="canonical"') || lowerHtml.includes("rel='canonical'");
  findings.push({
    id: "canonical",
    passed: hasCanonical,
    points: hasCanonical ? 5 : 0,
    maxPoints: 5,
    generic: hasCanonical ? "Canonical tag present." : "No canonical tag found.",
    personalized: hasCanonical
      ? "You have a canonical tag set, which helps prevent duplicate content issues in Google's index."
      : "Adding a canonical tag tells Google which version of your page to index, avoiding duplicate content penalties.",
  });

  // 4. Structured data (5 pts)
  const hasSchema = lowerHtml.includes("application/ld+json") || lowerHtml.includes("itemtype=");
  findings.push({
    id: "structured-data",
    passed: hasSchema,
    points: hasSchema ? 5 : 0,
    maxPoints: 5,
    generic: hasSchema ? "Structured data (Schema.org) detected." : "No structured data found.",
    personalized: hasSchema
      ? "Your site uses structured data (Schema.org), which can earn rich snippets in Google search results."
      : "Adding LocalBusiness schema markup can help Google display your hours, reviews, and contact info directly in search results.",
  });

  const score = findings.reduce((s, f) => s + f.points, 0);
  return { id: "technical-seo", label: "Technical SEO", icon: "Settings", score, maxScore: 25, findings };
}

function scoreContentUX(
  data: FirecrawlScrapeResult,
  ctx: SiteContext
): CategoryResult {
  const { markdown } = data;
  const findings: Finding[] = [];

  // 1. Word count (4 pts)
  const wordCount = markdown.split(/\s+/).filter(Boolean).length;
  const goodWordCount = wordCount >= 300;
  findings.push({
    id: "word-count",
    passed: goodWordCount,
    points: goodWordCount ? 4 : wordCount >= 150 ? 2 : 0,
    maxPoints: 4,
    generic: goodWordCount ? `Page has ${wordCount} words — good content depth.` : `Page has only ${wordCount} words.`,
    personalized: goodWordCount
      ? `Your page has ${wordCount} words of content — this gives Google plenty to work with when determining relevance.`
      : `Your page has only ${wordCount} words. Google generally favors pages with 300+ words of unique, helpful content about your services.`,
  });

  // 2. CTA presence (3 pts)
  const ctaPatterns = /call\s+(us|now|today)|get\s+(a\s+)?(free\s+)?quote|request\s+(a\s+)?estimate|book\s+(a\s+)?(call|appointment|consultation)|contact\s+us|schedule|free\s+estimate/i;
  const hasCTA = ctaPatterns.test(markdown);
  findings.push({
    id: "cta",
    passed: hasCTA,
    points: hasCTA ? 3 : 0,
    maxPoints: 3,
    generic: hasCTA ? "Call-to-action found." : "No clear call-to-action detected.",
    personalized: hasCTA
      ? "Your page includes a clear call-to-action, encouraging visitors to take the next step."
      : "Adding a clear call-to-action like 'Get a Free Quote' or 'Call Now' can significantly increase leads from your website.",
  });

  // 3. Contact info visible (3 pts)
  const hasContact = !!ctx.phone || !!ctx.email;
  findings.push({
    id: "contact-visible",
    passed: hasContact,
    points: hasContact ? 3 : 0,
    maxPoints: 3,
    generic: hasContact ? "Contact information is visible." : "No contact info found.",
    personalized: hasContact
      ? `Your contact info${ctx.phone ? ` (${ctx.phone})` : ""}${ctx.email ? ` and email (${ctx.email})` : ""} is visible — this builds trust with visitors and Google.`
      : "Making your phone number and email visible on every page helps both customers and Google verify your business.",
  });

  const score = findings.reduce((s, f) => s + f.points, 0);
  return { id: "content-ux", label: "Content & UX", icon: "FileText", score, maxScore: 10, findings };
}

function scoreExtras(
  data: FirecrawlScrapeResult,
  _ctx: SiteContext
): CategoryResult {
  const { html, markdown } = data;
  const findings: Finding[] = [];
  const lowerHtml = html.toLowerCase();
  const lowerMd = markdown.toLowerCase();

  // 1. JSON-LD / Schema (4 pts)
  const hasJsonLd = lowerHtml.includes("application/ld+json");
  findings.push({
    id: "json-ld",
    passed: hasJsonLd,
    points: hasJsonLd ? 4 : 0,
    maxPoints: 4,
    generic: hasJsonLd ? "JSON-LD structured data found." : "No JSON-LD structured data.",
    personalized: hasJsonLd
      ? "Your site uses JSON-LD structured data — this is the format Google prefers for rich results."
      : "Adding JSON-LD LocalBusiness markup is one of the easiest wins for standing out in Google search results.",
  });

  // 2. Reviews / testimonials (3 pts)
  const reviewPatterns = /reviews?|testimonials?|stars?|rating/i;
  const hasReviews = reviewPatterns.test(lowerMd);
  findings.push({
    id: "reviews",
    passed: hasReviews,
    points: hasReviews ? 3 : 0,
    maxPoints: 3,
    generic: hasReviews ? "Reviews or testimonials section detected." : "No reviews/testimonials found.",
    personalized: hasReviews
      ? "You're showcasing reviews or testimonials — social proof is powerful for converting local visitors."
      : "Adding customer reviews or testimonials builds trust and can improve your conversion rate significantly.",
  });

  // 3. Social links (3 pts)
  const socialPatterns = /facebook\.com|instagram\.com|twitter\.com|x\.com|linkedin\.com|youtube\.com|yelp\.com|nextdoor\.com/i;
  const hasSocial = socialPatterns.test(lowerHtml);
  findings.push({
    id: "social-links",
    passed: hasSocial,
    points: hasSocial ? 3 : 0,
    maxPoints: 3,
    generic: hasSocial ? "Social media links found." : "No social media links detected.",
    personalized: hasSocial
      ? "You're linking to your social profiles, which adds credibility and gives customers more ways to connect."
      : "Adding links to your social profiles (Facebook, Yelp, etc.) gives Google more signals about your business and helps customers find you.",
  });

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
    summary += `Here's what you're doing well: ${strengths[0].toLowerCase().startsWith("your") ? strengths[0] : strengths[0]} `;
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
    scoreOnPageSEO(data, ctx),
    scoreTechnicalSEO(data, input),
    scoreContentUX(data, ctx),
    scoreExtras(data, ctx),
  ];

  const overallScore = categories.reduce((s, c) => s + c.score, 0);
  const letterGrade = grade(overallScore);
  const personalizedSummary = generatePersonalizedSummary(ctx, categories, overallScore);

  return {
    overallScore,
    letterGrade,
    categories,
    siteContext: ctx,
    personalizedSummary,
  };
}
