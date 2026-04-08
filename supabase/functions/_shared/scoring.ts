// supabase/functions/_shared/scoring.ts
// Self-contained scoring module for edge functions (mirrors src/lib/scoring/)

// ── Types ────────────────────────────────────────────────

export interface SiteContext {
  businessName: string | null;
  services: string[];
  locations: string[];
  phone: string | null;
  email: string | null;
  pageTitle: string | null;
  metaDescription: string | null;
  h1Text: string | null;
}

export interface Finding {
  id: string;
  passed: boolean;
  generic: string;
  personalized: string;
  points: number;
  maxPoints: number;
}

export type CategoryId = "local-presence" | "on-page-seo" | "technical-seo" | "content-ux" | "extras";

export interface CategoryResult {
  id: CategoryId;
  label: string;
  icon: string;
  score: number;
  maxScore: number;
  findings: Finding[];
}

export type LetterGrade = "A" | "B" | "C" | "D" | "F";

export type BusinessType = "local" | "online";

export interface ScoringResult {
  overallScore: number;
  rawScore: number;
  applicableMax: number;
  businessType: BusinessType;
  letterGrade: LetterGrade;
  categories: CategoryResult[];
  siteContext: SiteContext;
  personalizedSummary: string;
}

export interface FirecrawlScrapeResult {
  markdown: string;
  html: string;
  metadata?: { title?: string; description?: string; ogTitle?: string; ogDescription?: string; ogSiteName?: string; [key: string]: unknown };
  links?: string[];
}

export interface CrawlHygieneData {
  robotsTxt: { exists: boolean; blocksAll: boolean; sitemapDirectives: string[]; content?: string };
  sitemap: { found: boolean; url: string | null; source: "robots" | "common-location" | null };
}

export interface ScanInput {
  url: string;
  city?: string;
  state?: string;
  businessType?: BusinessType;
  crawlHygiene?: CrawlHygieneData;
}

// ── Helpers ──────────────────────────────────────────────

function grade(score: number): LetterGrade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  return "F";
}

function phoneRegex() { return /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g; }
function emailRegex() { return /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g; }
function truncate(s: string, len = 80) { return s.length > len ? s.slice(0, len) + "…" : s; }

function f(id: string, passed: boolean, points: number, maxPoints: number, generic: string, personalized: string): Finding {
  return { id, passed, points, maxPoints, generic, personalized };
}

// ── Context Extraction ──────────────────────────────────

function extractContext(data: FirecrawlScrapeResult, input: ScanInput): SiteContext {
  const { html, markdown, metadata } = data;
  let businessName: string | null = (metadata?.ogSiteName as string) ?? null;
  if (!businessName && metadata?.title) businessName = metadata.title.split(/[|–—-]/)[0].trim() || null;
  if (!businessName) { const m = html.match(/<h1[^>]*>(.*?)<\/h1>/is); if (m) businessName = m[1].replace(/<[^>]+>/g, "").trim(); }
  const phoneMatch = html.match(phoneRegex());
  const phone = phoneMatch ? phoneMatch[0] : null;
  const emailMatch = html.match(emailRegex());
  const emailAddr = emailMatch ? emailMatch[0] : null;
  const servicePatterns = ["plumbing","electrical","hvac","roofing","remodeling","landscaping","painting","cleaning","flooring","cabinets","renovation","repair","installation","maintenance","construction","demolition","inspection","design","consulting","hauling"];
  const lowerMd = markdown.toLowerCase();
  const services = servicePatterns.filter(s => lowerMd.includes(s));
  const locations: string[] = [];
  if (input.city && lowerMd.includes(input.city.toLowerCase())) locations.push(input.city);
  const csr = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),?\s*([A-Z]{2})\b/g;
  let csm; while ((csm = csr.exec(html)) !== null) { const loc = `${csm[1]}, ${csm[2]}`; if (!locations.includes(loc)) locations.push(loc); }
  const h1M = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
  const h1Text = h1M ? h1M[1].replace(/<[^>]+>/g, "").trim() : null;
  return { businessName, services, locations, phone, email: emailAddr, pageTitle: metadata?.title ?? null, metaDescription: metadata?.description ?? null, h1Text };
}

// ── Category Scorers ─────────────────────────────────────

function scoreLocalPresence(data: FirecrawlScrapeResult, ctx: SiteContext, input: ScanInput): CategoryResult {
  const { html, markdown } = data;
  const findings: Finding[] = [];
  const lowerHtml = html.toLowerCase();
  const lowerMd = markdown.toLowerCase();

  const hasPhone = !!ctx.phone;
  findings.push(f("phone", hasPhone, hasPhone ? 5 : 0, 5, hasPhone ? "Phone number is visible on the page." : "No phone number found on the page.", hasPhone ? `Your phone number (${ctx.phone}) is prominently displayed, making it easy for local customers to call.` : "We couldn't find a phone number on your page — adding one helps local customers reach you instantly."));

  const hasName = !!ctx.businessName;
  findings.push(f("biz-name", hasName, hasName ? 3 : 0, 3, hasName ? "Business name found on the page." : "No clear business name detected.", hasName ? `Your business name "${ctx.businessName}" is clearly visible on the page.` : "We couldn't identify a clear business name — make sure it's in your H1 or title tag."));

  const addrPat = /\d{1,5}\s\w+\s(?:st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|ln|lane|ct|court|way|pl|place)\b/i;
  const hasAddress = addrPat.test(html);
  const hasZip = /\b\d{5}(-\d{4})?\b/.test(html);
  const napScore = (hasAddress && hasZip && hasPhone) ? 5 : (hasAddress || hasPhone) ? 3 : 0;
  findings.push(f("nap", napScore >= 5, napScore, 5, napScore >= 5 ? "Full NAP (Name, Address, Phone) present." : "NAP information is incomplete.", napScore >= 5 ? "Your full name, address, and phone number are all visible — this is the foundation of local SEO." : `Your NAP is incomplete (${[!hasName && "name", !hasAddress && "address", !hasPhone && "phone", !hasZip && "ZIP code"].filter(Boolean).join(", ")} missing). Google relies on consistent NAP data to rank local businesses.`));

  const jsonLdBlocks = html.match(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  let hasLocalSchema = false; let schemaFields: string[] = [];
  for (const block of jsonLdBlocks) { const inner = block.replace(/<\/?script[^>]*>/gi, ""); try { const parsed = JSON.parse(inner); const obj = Array.isArray(parsed) ? parsed[0] : parsed; if (obj?.["@type"] && /LocalBusiness|Store|Restaurant|ProfessionalService|HomeAndConstructionBusiness|Plumber|Electrician|HVACBusiness|RoofingContractor|LocksmithService/i.test(obj["@type"])) { hasLocalSchema = true; if (obj.name) schemaFields.push("name"); if (obj.address) schemaFields.push("address"); if (obj.telephone) schemaFields.push("telephone"); if (obj.geo) schemaFields.push("geo"); if (obj.openingHours || obj.openingHoursSpecification) schemaFields.push("openingHours"); } } catch { /* ignore */ } }
  const schemaScore = hasLocalSchema ? (schemaFields.length >= 4 ? 5 : schemaFields.length >= 2 ? 3 : 2) : 0;
  findings.push(f("local-schema", hasLocalSchema, schemaScore, 5, hasLocalSchema ? "LocalBusiness schema markup detected." : "No LocalBusiness schema markup found.", hasLocalSchema ? `Your LocalBusiness schema includes ${schemaFields.join(", ")} — ${schemaFields.length >= 4 ? "excellent coverage" : "consider adding more fields like geo and openingHours"}.` : "Adding LocalBusiness schema tells Google your name, address, hours, and services in a machine-readable format — a key local SEO signal."));

  const hasMaps = lowerHtml.includes("google.com/maps") || lowerHtml.includes("maps.googleapis");
  findings.push(f("maps", hasMaps, hasMaps ? 4 : 0, 4, hasMaps ? "Google Maps embed or link detected." : "No Google Maps embed found.", hasMaps ? "You have a Google Maps embed or link, helping visitors find your location easily." : "Embedding a Google Map helps customers find you and signals local relevance to Google."));

  const hasReviewSchema = lowerHtml.includes('"aggregaterating"') || lowerHtml.includes('"review"') || /itemtype\s*=\s*["'][^"']*review/i.test(html);
  const hasReviewText = /google\s*reviews?|yelp\s*reviews?|testimonials?|customer\s*reviews?|star\s*rating/i.test(lowerMd);
  const hasReviews = hasReviewSchema || hasReviewText;
  findings.push(f("review-signals", hasReviews, hasReviews ? 4 : 0, 4, hasReviews ? "Review or rating signals found." : "No review signals detected.", hasReviews ? (hasReviewSchema ? "You have review/rating schema markup — this can show star ratings directly in Google search results." : "You mention reviews on your page, which builds trust. Adding Review schema markup could earn you star ratings in search results.") : "Adding customer reviews and Review schema markup can earn star ratings in Google results — a major trust signal."));

  const cityName = input.city?.toLowerCase();
  const hasCityInContent = cityName ? lowerMd.includes(cityName) : ctx.locations.length > 0;
  const hasCityInTitle = cityName ? (ctx.pageTitle?.toLowerCase().includes(cityName) ?? false) : false;
  const localKwScore = hasCityInContent && hasCityInTitle ? 4 : hasCityInContent ? 3 : hasCityInTitle ? 2 : 0;
  findings.push(f("local-keywords", localKwScore >= 3, localKwScore, 4, localKwScore >= 3 ? "City/local keywords used in content and title." : "Local keyword usage could be improved.", localKwScore >= 3 ? `Your content and title reference ${ctx.locations[0] || input.city || "your city"}, helping Google associate your site with that area.` : `Consider adding your city name${input.city ? ` ("${input.city}")` : ""} to your title tag and throughout your content for stronger local signals.`));

  const score = findings.reduce((s, fi) => s + fi.points, 0);
  return { id: "local-presence", label: "Local Presence & GBP", icon: "MapPin", score, maxScore: 30, findings };
}

function scoreOnPageSEO(data: FirecrawlScrapeResult, ctx: SiteContext, input: ScanInput): CategoryResult {
  const { html, markdown } = data;
  const findings: Finding[] = [];
  const lowerHtml = html.toLowerCase();

  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  const title = titleMatch ? titleMatch[1].trim() : null;
  const titleLen = title?.length ?? 0;
  const titleGoodLength = titleLen >= 35 && titleLen <= 65;
  const cityLower = input.city?.toLowerCase();
  const titleHasCity = cityLower && title ? title.toLowerCase().includes(cityLower) : false;
  const titleHasService = ctx.services.length > 0 && title ? ctx.services.some(s => title.toLowerCase().includes(s)) : false;
  const titleScore = !title ? 0 : (titleGoodLength ? 3 : 1) + (titleHasCity ? 1 : 0) + (titleHasService ? 1 : 0);
  findings.push(f("title", titleScore >= 4, Math.min(titleScore, 5), 5, !title ? "Missing title tag." : titleScore >= 4 ? "Title tag is well-optimized." : "Title tag could be improved.", !title ? "Your page is missing a title tag — this is critical for appearing in Google search results." : `Your title "${truncate(title!, 55)}" is ${titleGoodLength ? "a good length" : (titleLen < 35 ? "too short" : "too long")}${titleHasCity ? ", includes your city" : ""}${titleHasService ? ", mentions your service" : ""}. ${titleScore < 4 ? "Aim for 35-65 chars with your main service and city." : "Nice work!"}`));

  const metaDesc = ctx.metaDescription;
  const metaLen = metaDesc?.length ?? 0;
  const metaGoodLength = metaLen >= 70 && metaLen <= 160;
  const metaHasCity = cityLower && metaDesc ? metaDesc.toLowerCase().includes(cityLower) : false;
  const metaHasService = ctx.services.length > 0 && metaDesc ? ctx.services.some(s => metaDesc.toLowerCase().includes(s)) : false;
  const metaScore = !metaDesc ? 0 : (metaGoodLength ? 3 : 1) + (metaHasCity ? 1 : 0) + (metaHasService ? 1 : 0);
  findings.push(f("meta-desc", metaScore >= 4, Math.min(metaScore, 5), 5, !metaDesc ? "Missing meta description." : metaScore >= 4 ? "Meta description is well-written." : "Meta description needs improvement.", !metaDesc ? "Adding a meta description tells Google and searchers what your page is about — this directly affects click-through rates." : `Your meta description "${truncate(metaDesc!, 65)}" is ${metaGoodLength ? "a good length" : (metaLen < 70 ? "too short" : "too long")}. ${metaScore < 4 ? "Include your service + city for best results." : "Well-crafted for search results!"}`));

  const h1Count = (html.match(/<h1/gi) || []).length;
  const h2Count = (html.match(/<h2/gi) || []).length;
  const h1 = ctx.h1Text;
  const h1Score = h1Count === 0 ? 0 : h1Count === 1 ? (h2Count > 0 ? 4 : 3) : 2;
  findings.push(f("headings", h1Score >= 3, h1Score, 4, h1Count === 0 ? "Missing H1 tag." : h1Count === 1 ? "H1 and heading hierarchy look good." : "Multiple H1 tags detected.", h1Count === 0 ? "Your page is missing an H1 heading — add one that describes your primary service and location." : h1Count === 1 ? `Your H1 "${truncate(h1!, 45)}" is clear.${h2Count > 0 ? ` You have ${h2Count} H2 subheadings for good structure.` : " Consider adding H2 subheadings to break up content."}` : `Your page has ${h1Count} H1 tags — Google prefers a single H1 that clearly states your main offering.`));

  const lowerMd = markdown.toLowerCase();
  const firstParagraph = lowerMd.slice(0, 500);
  let kwHits = 0;
  if (ctx.services.length > 0) { const ts = ctx.services[0]; if (title?.toLowerCase().includes(ts)) kwHits++; if (h1?.toLowerCase().includes(ts)) kwHits++; if (firstParagraph.includes(ts)) kwHits++; }
  const kwScore = Math.min(kwHits, 3);
  findings.push(f("keyword-usage", kwScore >= 2, kwScore, 3, kwScore >= 2 ? "Service keywords appear in key page areas." : "Service keywords could be used more strategically.", kwScore >= 2 ? `Your primary service keyword "${ctx.services[0]}" appears in ${kwHits} key areas (title, H1, opening paragraph) — good keyword placement.` : ctx.services.length > 0 ? `Try placing "${ctx.services[0]}" in your title, H1, and opening paragraph for stronger relevance signals.` : "We couldn't identify strong service keywords — make sure your main service appears in the title, H1, and first paragraph."));

  const slug = input.url.replace(/https?:\/\/[^/]+/, "").replace(/\/$/, "");
  const hasReadableSlug = slug.length > 1 && /^[\w/-]+$/.test(slug);
  const slugHasKeyword = ctx.services.length > 0 && hasReadableSlug && ctx.services.some(s => slug.toLowerCase().includes(s));
  const slugScore = slugHasKeyword ? 2 : hasReadableSlug ? 1 : slug.length <= 1 ? 1 : 0;
  findings.push(f("url-slug", slugScore >= 1, slugScore, 2, slugScore >= 1 ? "URL is human-readable." : "URL could be more descriptive.", slugScore >= 2 ? "Your URL includes a service keyword — clean and descriptive for search engines." : slug.length <= 1 ? "This appears to be your homepage URL — consider creating service-specific pages with descriptive URLs like /plumbing-services." : "Use human-readable, keyword-rich URLs (e.g., /plumbing-repair-austin) for better SEO."));

  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const imgsWithAlt = imgTags.filter(t => /alt\s*=\s*"[^"]+"/i.test(t)).length;
  const altRatio = imgTags.length > 0 ? imgsWithAlt / imgTags.length : 1;
  const altScore = imgTags.length === 0 ? 2 : altRatio >= 0.8 ? 3 : Math.round(altRatio * 3);
  findings.push(f("img-alts", altScore >= 2, altScore, 3, altScore >= 2 ? "Images have alt text." : `${imgsWithAlt}/${imgTags.length} images have alt text.`, imgTags.length === 0 ? "No images found — consider adding photos of your work, team, or location to make the page more engaging." : altRatio >= 0.8 ? `${imgsWithAlt} of ${imgTags.length} images have descriptive alt text — great for accessibility and SEO.` : `Only ${imgsWithAlt} of ${imgTags.length} images have alt text. Add descriptive alt tags to help Google understand your images.`));

  const hasContactLink = /href\s*=\s*["'][^"']*(?:contact|book|schedule|appointment|quote)/i.test(lowerHtml);
  const internalLinks = (html.match(/href\s*=\s*["']\/[^"']*["']/gi) || []).length;
  const intLinkScore = (hasContactLink ? 2 : 0) + (internalLinks >= 3 ? 1 : 0);
  findings.push(f("internal-links", intLinkScore >= 2, Math.min(intLinkScore, 3), 3, intLinkScore >= 2 ? "Good internal linking structure." : "Internal linking could be improved.", hasContactLink ? `You link to a contact/booking page, and have ${internalLinks} internal links — this helps both users and Google navigate your site.` : "Add links to your contact page, service pages, and booking page to help visitors (and Google) navigate your site."));

  const score = findings.reduce((s, fi) => s + fi.points, 0);
  return { id: "on-page-seo", label: "On-Page SEO", icon: "Search", score, maxScore: 25, findings };
}

function scoreTechnicalSEO(data: FirecrawlScrapeResult, input: ScanInput): CategoryResult {
  const { html } = data;
  const findings: Finding[] = [];

  const isHttps = input.url.startsWith("https");
  const hasMixedContent = isHttps && /(?:src|href)\s*=\s*["']http:\/\//i.test(html);
  const httpsScore = !isHttps ? 0 : hasMixedContent ? 3 : 5;
  findings.push(f("https", httpsScore >= 3, httpsScore, 5, !isHttps ? "Site does not use HTTPS." : hasMixedContent ? "HTTPS with mixed content detected." : "Site uses HTTPS.", !isHttps ? "Your site isn't using HTTPS — Google penalizes non-secure sites and browsers show warnings to visitors." : hasMixedContent ? "Your site uses HTTPS but loads some resources over HTTP. Fix mixed content to avoid browser warnings." : "Your site is served over HTTPS — essential for trust and Google ranking."));

  const robotsMeta = html.match(/<meta[^>]*name\s*=\s*["']robots["'][^>]*content\s*=\s*["']([^"']+)["']/i);
  const robotsContent = robotsMeta ? robotsMeta[1].toLowerCase() : "";
  const hasNoindex = robotsContent.includes("noindex");
  const hasNofollow = robotsContent.includes("nofollow");
  const robotsScore = hasNoindex ? 0 : hasNofollow ? 2 : 4;
  findings.push(f("meta-robots", robotsScore >= 4, robotsScore, 4, hasNoindex ? "Page is set to noindex — Google won't index it!" : hasNofollow ? "Page has nofollow." : "No blocking robots directives found.", hasNoindex ? "Your page has a 'noindex' meta tag — this tells Google NOT to show your page in search results. Remove it unless intentional!" : hasNofollow ? "Your page has a 'nofollow' directive — internal links won't pass SEO value." : "Your page allows Google to index and follow links — no accidental blocking detected."));

  const canonicalMatch = html.match(/<link[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']+)["']/i);
  const hasCanonical = !!canonicalMatch;
  const canonicalUrl = canonicalMatch ? canonicalMatch[1] : null;
  const isSelfReferential = canonicalUrl ? input.url.replace(/\/$/, "").includes(canonicalUrl.replace(/\/$/, "")) : false;
  const canonScore = !hasCanonical ? 0 : isSelfReferential ? 4 : 3;
  findings.push(f("canonical", hasCanonical, canonScore, 4, hasCanonical ? "Canonical tag present." : "No canonical tag found.", hasCanonical ? (isSelfReferential ? "You have a self-referential canonical tag — this correctly tells Google this is the authoritative version of the page." : `Your canonical tag points to "${truncate(canonicalUrl!, 50)}" — make sure this is intentional.`) : "Adding a canonical tag tells Google which version of your page to index, avoiding duplicate content penalties."));

  const viewportMatch = html.match(/<meta[^>]*name\s*=\s*["']viewport["'][^>]*content\s*=\s*["']([^"']+)["']/i);
  const viewportContent = viewportMatch ? viewportMatch[1] : "";
  const hasWidthDevice = viewportContent.includes("width=device-width");
  const hasInitialScale = viewportContent.includes("initial-scale");
  const viewportScore = hasWidthDevice && hasInitialScale ? 4 : hasWidthDevice ? 3 : viewportMatch ? 2 : 0;
  findings.push(f("viewport", viewportScore >= 3, viewportScore, 4, viewportScore >= 3 ? "Mobile viewport tag properly configured." : !viewportMatch ? "Missing mobile viewport tag." : "Viewport tag could be improved.", viewportScore >= 3 ? "Your mobile viewport is properly configured — critical since most local searches happen on phones." : "Your site is missing a proper mobile viewport tag. Over 60% of local searches happen on phones — this is a must-fix."));

  const headContent = html.match(/<head[\s\S]*?<\/head>/i)?.[0] || "";
  const cssInHead = (headContent.match(/<link[^>]*rel\s*=\s*["']stylesheet["'][^>]*>/gi) || []).length;
  const syncJsInHead = (headContent.match(/<script(?![^>]*(?:async|defer))[^>]*src\s*=/gi) || []).length;
  const renderBlockingCount = cssInHead + syncJsInHead;
  const rbScore = renderBlockingCount <= 3 ? 2 : renderBlockingCount <= 6 ? 1 : 0;
  findings.push(f("render-blocking", rbScore >= 1, rbScore, 2, rbScore >= 1 ? "Few render-blocking resources." : `${renderBlockingCount} render-blocking resources in <head>.`, rbScore >= 1 ? `Only ${renderBlockingCount} render-blocking resource(s) in your <head> — your page should load quickly.` : `${renderBlockingCount} render-blocking resources in your <head>. Consider deferring scripts and inlining critical CSS for faster load.`));

  const inlineScripts = html.match(/<script(?![^>]*src)[^>]*>[\s\S]{500,}<\/script>/gi) || [];
  const thirdPartyScripts = (html.match(/<script[^>]*src\s*=\s*["']https?:\/\/(?!.*(?:googleapis|gstatic|google))[^"']+["'][^>]*>/gi) || []).length;
  const largeInline = inlineScripts.length;
  const speedScore = (largeInline === 0 && thirdPartyScripts <= 5) ? 2 : (largeInline <= 2 && thirdPartyScripts <= 10) ? 1 : 0;
  findings.push(f("speed-proxies", speedScore >= 1, speedScore, 2, speedScore >= 1 ? "Page weight looks reasonable." : "Page may be slow to load.", speedScore >= 1 ? `Your page has ${largeInline} large inline scripts and ${thirdPartyScripts} third-party scripts — reasonable for fast loading.` : `${largeInline} large inline script(s) and ${thirdPartyScripts} third-party scripts may slow your page.`));

  // 7. robots.txt (2 pts)
  const ch = input.crawlHygiene;
  const robotsExists = ch?.robotsTxt?.exists ?? false;
  const robotsBlocksAll = ch?.robotsTxt?.blocksAll ?? false;
  const rtScore = !ch ? 1 : robotsBlocksAll ? 0 : robotsExists ? 2 : 0;
  findings.push(f("robots-txt", rtScore >= 1, rtScore, 2,
    !ch ? "robots.txt check not available." : robotsBlocksAll ? "robots.txt is blocking all crawlers!" : robotsExists ? "robots.txt found and looks okay." : "No robots.txt found.",
    !ch ? "We couldn't check your robots.txt in this scan. This file tells Google which pages to crawl."
      : robotsBlocksAll ? "Your robots.txt contains 'Disallow: /' which blocks Google from crawling your entire site. Unless this is intentional, remove that line immediately."
      : robotsExists ? "Your robots.txt is present and isn't blocking important pages — Google can crawl your site normally."
      : "Your site is missing a robots.txt file. While Google will still crawl your site, adding one gives you control over which pages get indexed. Most website platforms generate one automatically — check your settings."
  ));

  // 8. XML Sitemap (2 pts)
  const sitemapFound = ch?.sitemap?.found ?? false;
  const sitemapSource = ch?.sitemap?.source;
  const sitemapInRobots = sitemapSource === "robots";
  const smScore = !ch ? 1 : sitemapFound && sitemapInRobots ? 2 : sitemapFound ? 1 : 0;
  findings.push(f("xml-sitemap", smScore >= 1, smScore, 2,
    !ch ? "Sitemap check not available." : sitemapFound && sitemapInRobots ? "XML sitemap found and referenced in robots.txt." : sitemapFound ? "XML sitemap found, but not referenced in robots.txt." : "No XML sitemap found.",
    !ch ? "We couldn't check for an XML sitemap in this scan. A sitemap helps Google discover all your pages."
      : sitemapFound && sitemapInRobots ? "Your XML sitemap exists and is linked from robots.txt — this is the ideal setup for Google to discover all your pages quickly."
      : sitemapFound ? `Your XML sitemap exists at ${ch?.sitemap?.url || "a common location"}, but isn't referenced in your robots.txt. Add a 'Sitemap:' directive to robots.txt so Google finds it automatically.`
      : "No XML sitemap was found. A sitemap helps Google discover and index all your pages — especially important if you have service pages, location pages, or blog posts. Most website platforms can generate one automatically."
  ));

  const score = findings.reduce((s, fi) => s + fi.points, 0);
  return { id: "technical-seo", label: "Technical SEO", icon: "Settings", score, maxScore: 25, findings };
}

function scoreContentUX(data: FirecrawlScrapeResult, ctx: SiteContext): CategoryResult {
  const { html, markdown } = data;
  const findings: Finding[] = [];
  const lowerMd = markdown.toLowerCase();

  const wordCount = markdown.split(/\s+/).filter(Boolean).length;
  const wcScore = wordCount >= 300 ? 3 : wordCount >= 150 ? 2 : wordCount >= 50 ? 1 : 0;
  findings.push(f("word-count", wcScore >= 2, wcScore, 3, wcScore >= 2 ? `Page has ${wordCount} words — good depth.` : `Page has only ${wordCount} words.`, wcScore >= 2 ? `Your page has ${wordCount} words of content — Google has plenty to work with when determining relevance.` : `Your page has only ${wordCount} words. Google generally favors pages with 300+ words of unique, helpful content about your services.`));

  const headingCount = (html.match(/<h[2-6]/gi) || []).length;
  const hasFAQ = /\?\s*<\/h[2-4]>/i.test(html) || lowerMd.includes("faq") || lowerMd.includes("frequently asked");
  const structScore = (headingCount >= 3 ? 2 : headingCount >= 1 ? 1 : 0) + (hasFAQ ? 1 : 0);
  findings.push(f("content-structure", structScore >= 2, Math.min(structScore, 3), 3, structScore >= 2 ? "Content is well-structured with headings." : "Content structure could be improved.", structScore >= 2 ? `Your page has ${headingCount} subheadings${hasFAQ ? " and an FAQ section" : ""} — well-structured content.` : `Your page has only ${headingCount} subheading(s). Break content into sections with H2/H3 headings.${!hasFAQ ? " Consider adding an FAQ section." : ""}`));

  const ctaPatterns = /call\s+(us|now|today)|get\s+(a\s+)?(free\s+)?quote|request\s+(a\s+)?estimate|book\s+(a\s+)?(call|appointment|consultation)|contact\s+us|schedule|free\s+estimate/i;
  const hasCTA = ctaPatterns.test(markdown);
  const ctaButton = /<(button|a)[^>]*>[^<]*(call|book|contact|quote|schedule|estimate)[^<]*<\/(button|a)>/i.test(html);
  const ctaScore = ctaButton ? 2 : hasCTA ? 1 : 0;
  findings.push(f("cta", ctaScore >= 1, ctaScore, 2, ctaScore >= 1 ? "Call-to-action found." : "No clear call-to-action detected.", ctaScore >= 1 ? (ctaButton ? "You have a clear CTA button — this makes it easy for visitors to take action." : "You mention a call-to-action in text — consider making it a prominent button.") : "Adding a clear call-to-action like 'Get a Free Quote' or 'Call Now' can significantly increase leads."));

  const hasContact = !!ctx.phone || !!ctx.email;
  findings.push(f("contact-visible", hasContact, hasContact ? 2 : 0, 2, hasContact ? "Contact information is visible." : "No contact info found.", hasContact ? `Your contact info${ctx.phone ? ` (${ctx.phone})` : ""}${ctx.email ? ` and email (${ctx.email})` : ""} is visible — this builds trust.` : "Making your phone number and email visible helps both customers and Google verify your business."));

  const score = findings.reduce((s, fi) => s + fi.points, 0);
  return { id: "content-ux", label: "Content & UX", icon: "FileText", score, maxScore: 10, findings };
}

function scoreExtras(data: FirecrawlScrapeResult, _ctx: SiteContext): CategoryResult {
  const { html, markdown } = data;
  const findings: Finding[] = [];
  const lowerHtml = html.toLowerCase();
  const lowerMd = markdown.toLowerCase();

  const extraSchemaTypes = ["faqpage","service","organization","breadcrumblist","product","offer"];
  const jsonLdBlocks = html.match(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  const foundTypes: string[] = [];
  for (const block of jsonLdBlocks) { const inner = block.replace(/<\/?script[^>]*>/gi, ""); try { const parsed = JSON.parse(inner); const items = Array.isArray(parsed) ? parsed : [parsed]; for (const obj of items) { const type = (obj?.["@type"] || "").toLowerCase(); if (extraSchemaTypes.some(t => type.includes(t))) foundTypes.push(obj["@type"]); } } catch { /* ignore */ } }
  if (/itemtype\s*=\s*["'][^"']*breadcrumb/i.test(html)) foundTypes.push("BreadcrumbList");
  const extraSchemaScore = foundTypes.length >= 2 ? 4 : foundTypes.length === 1 ? 2 : 0;
  findings.push(f("extra-schema", extraSchemaScore > 0, extraSchemaScore, 4, extraSchemaScore > 0 ? `Extra schema types found: ${foundTypes.join(", ")}.` : "No additional structured data beyond basics.", extraSchemaScore > 0 ? `Your site includes ${foundTypes.join(", ")} schema — these can earn rich snippets.` : "Adding FAQPage, Service, or Breadcrumb schema can earn you enhanced search features."));

  const spamPatterns = /casino|poker|essay\s*writing|payday\s*loan|viagra|cialis|crypto\s*trading|forex\s*signal/i;
  const spamLinks = (html.match(/<a[^>]*href\s*=\s*["'][^"']*["'][^>]*>[^<]*<\/a>/gi) || []).filter(link => spamPatterns.test(link));
  const hasSpam = spamLinks.length > 0 || spamPatterns.test(lowerMd);
  findings.push(f("no-spam", !hasSpam, hasSpam ? 0 : 3, 3, !hasSpam ? "No spammy content or links detected." : "Potentially spammy content or links found.", !hasSpam ? "Your page is clean — no suspicious outbound links or spammy content detected." : `We found ${spamLinks.length} suspicious link(s) or content that could trigger spam filters.`));

  const hasTestimonials = /testimonials?|what\s+(our\s+)?(?:clients?|customers?)\s+say|reviews?\s+from/i.test(lowerMd);
  const socialPatterns = /facebook\.com|instagram\.com|twitter\.com|x\.com|linkedin\.com|youtube\.com|yelp\.com|nextdoor\.com/i;
  const hasSocial = socialPatterns.test(lowerHtml);
  const trustScore = (hasTestimonials ? 2 : 0) + (hasSocial ? 1 : 0);
  findings.push(f("trust-indicators", trustScore >= 2, Math.min(trustScore, 3), 3, trustScore >= 2 ? "Trust indicators found." : "Trust indicators could be strengthened.", trustScore >= 2 ? `Your page includes ${hasTestimonials ? "testimonials" : ""}${hasTestimonials && hasSocial ? " and " : ""}${hasSocial ? "social media links" : ""} — these build credibility.` : `${!hasTestimonials ? "Adding customer testimonials" : ""}${!hasTestimonials && !hasSocial ? " and " : ""}${!hasSocial ? "Linking to your social profiles" : ""} can strengthen trust signals.`));

  const score = findings.reduce((s, fi) => s + fi.points, 0);
  return { id: "extras", label: "Google Readiness Extras", icon: "Award", score, maxScore: 10, findings };
}

// ── Summary + Entry Point ────────────────────────────────

function generatePersonalizedSummary(ctx: SiteContext, categories: CategoryResult[], overallScore: number): string {
  const name = ctx.businessName || "Your website";
  const strengths = categories.flatMap(c => c.findings.filter(fi => fi.passed)).slice(0, 3).map(fi => fi.personalized);
  const topIssue = categories.flatMap(c => c.findings.filter(fi => !fi.passed)).sort((a, b) => b.maxPoints - a.maxPoints)[0];
  let summary = `${name} scored ${overallScore}/100 on our Google Compatibility Checkup. `;
  if (strengths.length > 0) summary += `Here's what you're doing well: ${strengths[0]} `;
  if (topIssue) summary += `The biggest opportunity we found: ${topIssue.personalized}`;
  return summary;
}

export function scoreWebsite(data: FirecrawlScrapeResult, input: ScanInput): ScoringResult {
  const ctx = extractContext(data, input);
  const categories: CategoryResult[] = [
    scoreLocalPresence(data, ctx, input),
    scoreOnPageSEO(data, ctx, input),
    scoreTechnicalSEO(data, input),
    scoreContentUX(data, ctx),
    scoreExtras(data, ctx),
  ];
  
  const businessType: BusinessType = input.businessType || "local";
  const onlineBonusChecks = ["phone", "nap", "local-schema", "maps", "local-keywords"];
  
  const rawScore = categories.reduce((s, c) => s + c.score, 0);
  
  if (businessType === "online") {
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
    
    const applicableMax = baseMax;
    const normalizedBase = applicableMax > 0
      ? Math.round((baseEarned / applicableMax) * 100)
      : baseEarned;
    const overallScore = normalizedBase + bonusEarned;
    const letterGrade = grade(Math.min(overallScore, 100));
    const personalizedSummary = generatePersonalizedSummary(ctx, categories, overallScore);
    return { overallScore, rawScore, applicableMax, businessType, letterGrade, categories, siteContext: ctx, personalizedSummary };
  }
  
  const applicableMax = 100;
  const overallScore = rawScore;
  const letterGrade = grade(overallScore);
  const personalizedSummary = generatePersonalizedSummary(ctx, categories, overallScore);
  return { overallScore, rawScore, applicableMax, businessType, letterGrade, categories, siteContext: ctx, personalizedSummary };
}
