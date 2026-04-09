import type { FirecrawlScrapeResult, SiteContext, AiReadinessData, AiReadinessCheck } from "./types";

/**
 * AI-Ready Messaging & Emotion Match — supplementary analysis.
 * Checks whether a site is structured for AI search engines to
 * understand the business and confidently recommend it.
 */
export function scoreAiReadiness(
  data: FirecrawlScrapeResult,
  ctx: SiteContext
): AiReadinessData {
  const { html, markdown } = data;
  const lowerMd = markdown.toLowerCase();
  const lowerHtml = html.toLowerCase();
  const checks: AiReadinessCheck[] = [];

  // ── 1. Plain, owner-friendly language (20 pts) ──────────
  const jargonTerms = [
    "synergy", "leverage", "paradigm", "disrupt", "scalable",
    "holistic approach", "turnkey solution", "best-in-class",
    "bleeding edge", "move the needle", "circle back",
    "low-hanging fruit", "deep dive", "thought leader",
    "value proposition", "core competency", "bandwidth",
  ];
  const jargonFound = jargonTerms.filter(t => lowerMd.includes(t));

  const friendlySignals = [
    "you", "your", "we", "our", "call us", "contact us",
    "here's", "that's", "we'll", "you'll", "don't",
    "simple", "easy", "quick", "honest", "straightforward",
  ];
  const friendlyCount = friendlySignals.filter(s => lowerMd.includes(s)).length;
  const friendlyRatio = friendlyCount / friendlySignals.length;

  const langScore = jargonFound.length >= 3 ? 6
    : jargonFound.length >= 1 ? 12
    : friendlyRatio >= 0.4 ? 20
    : friendlyRatio >= 0.2 ? 16
    : 12;

  checks.push({
    id: "ai-plain-language",
    label: "Plain, owner-friendly language",
    passed: langScore >= 16,
    score: langScore,
    maxScore: 20,
    detail: jargonFound.length > 0
      ? `We found ${jargonFound.length} jargon term(s) (${jargonFound.slice(0, 3).join(", ")}). AI systems prefer clear, direct language that real people actually use.`
      : friendlyRatio >= 0.4
        ? "Your copy reads like you're talking to a real person — conversational and direct. AI systems pick up on this tone as trustworthy and helpful."
        : "Your language is clean, but could be more conversational. Speaking directly to the reader ('you', 'your', 'we') helps AI systems recognize your content as genuinely helpful.",
    fix: jargonFound.length > 0
      ? `Replace jargon like "${jargonFound[0]}" with plain language a busy owner would use. Write like you'd explain it over coffee.`
      : "Add more direct, second-person language ('you', 'your'). Describe your services the way a customer would search for them.",
  });

  // ── 2. Clear business identity (20 pts) ──────────────────
  const hasName = !!ctx.businessName;
  const hasServices = ctx.services.length > 0;
  const hasLocation = ctx.locations.length > 0;

  const audienceSignals = [
    "homeowner", "business owner", "commercial", "residential",
    "family", "families", "small business", "property manager",
    "landlord", "contractor", "for you", "best for", "ideal for",
    "we serve", "we help", "our customers", "our clients",
  ];
  const hasAudience = audienceSignals.some(s => lowerMd.includes(s));

  let identityScore = 0;
  if (hasName) identityScore += 6;
  if (hasServices) identityScore += 5;
  if (hasLocation) identityScore += 5;
  if (hasAudience) identityScore += 4;

  const missingIdentity: string[] = [];
  if (!hasName) missingIdentity.push("business name");
  if (!hasServices) missingIdentity.push("services");
  if (!hasLocation) missingIdentity.push("location/area");
  if (!hasAudience) missingIdentity.push("who you're best for");

  checks.push({
    id: "ai-identity-clarity",
    label: "Clear business identity",
    passed: identityScore >= 14,
    score: identityScore,
    maxScore: 20,
    detail: missingIdentity.length === 0
      ? "Your site clearly states who you are, what you do, where you do it, and who you're best for. AI doesn't have to guess."
      : `AI systems need to know: who you are, what you do, where, and who you serve. Missing: ${missingIdentity.join(", ")}.`,
    fix: missingIdentity.length > 0
      ? `Add clear statements about your ${missingIdentity.join(" and ")}. Make these obvious in your first few paragraphs — AI reads top-down.`
      : "Looking good — keep your identity signals consistent across all pages.",
  });

  // ── 3. Question-shaped headings & FAQ (20 pts) ───────────
  const headings = html.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi) || [];
  const headingTexts = headings.map(h => h.replace(/<[^>]+>/g, "").trim());
  const questionHeadings = headingTexts.filter(h => h.includes("?"));

  const hasFaqSection = lowerMd.includes("faq") || lowerMd.includes("frequently asked")
    || lowerMd.includes("common questions") || lowerMd.includes("questions we get");
  const hasFaqSchema = lowerHtml.includes('"faqpage"') || lowerHtml.includes("faqpage");

  let faqScore = 0;
  if (questionHeadings.length >= 3) faqScore += 8;
  else if (questionHeadings.length >= 1) faqScore += 4;
  if (hasFaqSection) faqScore += 6;
  if (hasFaqSchema) faqScore += 6;
  faqScore = Math.min(faqScore, 20);

  checks.push({
    id: "ai-faq-structure",
    label: "Question-shaped content & FAQ",
    passed: faqScore >= 12,
    score: faqScore,
    maxScore: 20,
    detail: faqScore >= 12
      ? `Found ${questionHeadings.length} question heading(s)${hasFaqSection ? ", an FAQ section" : ""}${hasFaqSchema ? ", and FAQPage schema" : ""}. AI assistants can easily reuse your answers.`
      : `Only ${questionHeadings.length} question-shaped heading(s) found${hasFaqSection ? "" : " and no FAQ section"}. AI tools like Perplexity and ChatGPT match user questions to your headings.`,
    fix: faqScore < 12
      ? "Add 3-5 FAQ items using real questions customers ask (e.g., 'How much does a roof repair cost?'). Use question marks in H2/H3 headings so AI can match them to user queries."
      : hasFaqSchema
        ? "Strong setup. Keep adding questions as you hear them from real customers."
        : "Good content — now add FAQPage schema markup so Google and AI tools can feature your answers directly.",
  });

  // ── 4. Trust proof & third-party signals (20 pts) ────────
  const hasTestimonials = /testimonials?|what\s+(our\s+)?(?:clients?|customers?)\s+say|reviews?\s+from/i.test(lowerMd);
  const hasReviewMentions = /google\s*reviews?|yelp\s*reviews?|\d+\s*(?:star|★)|rated\s*\d/i.test(lowerMd);
  const hasReviewSchema = lowerHtml.includes('"aggregaterating"') || lowerHtml.includes('"review"');
  const socialPatterns = /facebook\.com|instagram\.com|twitter\.com|x\.com|linkedin\.com|youtube\.com|yelp\.com|bbb\.org|angies?list|homeadvisor|thumbtack/i;
  const hasSocialLinks = socialPatterns.test(lowerHtml);
  const hasThirdPartyMentions = /featured\s+(?:in|on|by)|as\s+seen\s+(?:in|on)|certified|accredited|licensed|insured|bonded|member\s+of|affiliated\s+with/i.test(lowerMd);

  let trustScore = 0;
  if (hasTestimonials) trustScore += 5;
  if (hasReviewMentions) trustScore += 4;
  if (hasReviewSchema) trustScore += 4;
  if (hasSocialLinks) trustScore += 4;
  if (hasThirdPartyMentions) trustScore += 3;
  trustScore = Math.min(trustScore, 20);

  const missingTrust: string[] = [];
  if (!hasTestimonials) missingTrust.push("testimonials");
  if (!hasReviewMentions && !hasReviewSchema) missingTrust.push("review mentions/ratings");
  if (!hasSocialLinks) missingTrust.push("social/directory links");
  if (!hasThirdPartyMentions) missingTrust.push("third-party credentials");

  checks.push({
    id: "ai-trust-proof",
    label: "Visible trust proof",
    passed: trustScore >= 12,
    score: trustScore,
    maxScore: 20,
    detail: trustScore >= 12
      ? "Strong trust signals — AI systems can see real proof backing up your claims, making them more confident recommending you."
      : `AI systems look for independent proof before recommending a business. Missing: ${missingTrust.join(", ")}.`,
    fix: missingTrust.length > 0
      ? `Add ${missingTrust.slice(0, 2).join(" and ")} to your site. AI tools weight third-party validation heavily when deciding which businesses to recommend.`
      : "Your trust signals are solid — maintain them across all pages.",
  });

  // ── 5. Entity consistency (20 pts) ───────────────────────
  // Business name, NAP, and "service in [city]" consistency
  const businessName = ctx.businessName || "";
  const lowerName = businessName.toLowerCase();

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const pageTitle = titleMatch ? titleMatch[1].toLowerCase().trim() : "";

  // Extract H1
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1Text = h1Match ? h1Match[1].replace(/<[^>]+>/g, "").toLowerCase().trim() : "";

  // Check schema for business name
  const schemaNameMatch = lowerHtml.match(/"name"\s*:\s*"([^"]+)"/);
  const schemaName = schemaNameMatch ? schemaNameMatch[1].toLowerCase() : "";

  const nameInTitle = lowerName.length > 2 && pageTitle.includes(lowerName);
  const nameInH1 = lowerName.length > 2 && h1Text.includes(lowerName);
  const nameInSchema = lowerName.length > 2 && schemaName.includes(lowerName);

  // NAP consistency: check if address-like patterns in body match schema
  const schemaAddrMatch = lowerHtml.match(/"streetaddress"\s*:\s*"([^"]+)"/);
  const hasSchemaAddr = !!schemaAddrMatch;
  const schemaAddr = schemaAddrMatch ? schemaAddrMatch[1].toLowerCase() : "";
  const bodyHasAddr = schemaAddr.length > 5 && lowerMd.includes(schemaAddr);

  // "Service in City" heading patterns
  const locations = ctx.locations.map(l => l.toLowerCase());
  const serviceInCityHeadings = headingTexts.filter(h => {
    const lh = h.toLowerCase();
    return locations.some(loc => lh.includes(loc)) && ctx.services.some(s => lh.toLowerCase().includes(s.toLowerCase()));
  });
  const hasServiceCityHeadings = serviceInCityHeadings.length > 0;

  let entityScore = 0;
  // Name consistency across title/H1/schema (+8)
  let nameMatches = 0;
  if (nameInTitle) nameMatches++;
  if (nameInH1) nameMatches++;
  if (nameInSchema) nameMatches++;
  if (lowerName.length <= 2) {
    entityScore += 4; // can't evaluate, give partial credit
  } else if (nameMatches >= 3) {
    entityScore += 8;
  } else if (nameMatches >= 2) {
    entityScore += 5;
  } else if (nameMatches >= 1) {
    entityScore += 3;
  }

  // NAP match (+6)
  if (!hasSchemaAddr) {
    entityScore += 0; // no schema address to compare
  } else if (bodyHasAddr) {
    entityScore += 6;
  } else {
    entityScore += 2;
  }

  // Service in city headings (+6)
  if (hasServiceCityHeadings) {
    entityScore += 6;
  } else if (locations.length > 0 && headingTexts.some(h => locations.some(l => h.toLowerCase().includes(l)))) {
    entityScore += 3; // city mentioned in headings but not with service
  }

  const entityIssues: string[] = [];
  if (lowerName.length > 2 && nameMatches < 3) entityIssues.push("business name isn't consistent across title, H1, and schema");
  if (hasSchemaAddr && !bodyHasAddr) entityIssues.push("address in schema doesn't match page content");
  if (!hasServiceCityHeadings && locations.length > 0) entityIssues.push("no 'service in [city]' headings found");

  checks.push({
    id: "ai-entity-consistency",
    label: "Entity consistency",
    passed: entityScore >= 14,
    score: entityScore,
    maxScore: 20,
    detail: entityIssues.length === 0
      ? "Your business name, location, and services are consistent across your page content and schema. AI and search engines can confidently identify you as one clear entity."
      : `Your business name or address appears differently in your page content vs. your schema. This can confuse AI systems and search engines when they try to match you to local queries. Issues: ${entityIssues.join("; ")}.`,
    fix: entityIssues.length > 0
      ? `Fix: ${entityIssues[0]}. Consistency across title, H1, schema, and page body helps AI systems connect all your signals into one confident recommendation.`
      : "Excellent consistency — keep your NAP and service descriptions aligned across all pages.",
  });

  // ── Aggregate ────────────────────────────────────────────
  const totalScore = checks.reduce((s, c) => s + c.score, 0);
  const totalMax = checks.reduce((s, c) => s + c.maxScore, 0);
  const overallScore = Math.round((totalScore / totalMax) * 100);

  const topFixes = checks
    .filter(c => !c.passed)
    .sort((a, b) => (a.score / a.maxScore) - (b.score / b.maxScore))
    .slice(0, 3)
    .map(c => c.fix);

  return { overallScore, checks, topFixes };
}
