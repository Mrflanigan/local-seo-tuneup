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

  // ── 1. Plain, owner-friendly language (25 pts) ──────────
  // We look for absence of jargon-heavy language and presence of
  // conversational, direct phrasing.
  const jargonTerms = [
    "synergy", "leverage", "paradigm", "disrupt", "scalable",
    "holistic approach", "turnkey solution", "best-in-class",
    "bleeding edge", "move the needle", "circle back",
    "low-hanging fruit", "deep dive", "thought leader",
    "value proposition", "core competency", "bandwidth",
  ];
  const jargonFound = jargonTerms.filter(t => lowerMd.includes(t));
  
  // Check for conversational phrases that signal owner-friendly tone
  const friendlySignals = [
    "you", "your", "we", "our", "call us", "contact us",
    "here's", "that's", "we'll", "you'll", "don't",
    "simple", "easy", "quick", "honest", "straightforward",
  ];
  const friendlyCount = friendlySignals.filter(s => lowerMd.includes(s)).length;
  const friendlyRatio = friendlyCount / friendlySignals.length;

  const langScore = jargonFound.length >= 3 ? 8
    : jargonFound.length >= 1 ? 15
    : friendlyRatio >= 0.4 ? 25
    : friendlyRatio >= 0.2 ? 20
    : 15;

  checks.push({
    id: "ai-plain-language",
    label: "Plain, owner-friendly language",
    passed: langScore >= 20,
    score: langScore,
    maxScore: 25,
    detail: jargonFound.length > 0
      ? `We found ${jargonFound.length} jargon term(s) (${jargonFound.slice(0, 3).join(", ")}). AI systems prefer clear, direct language that real people actually use.`
      : friendlyRatio >= 0.4
        ? "Your copy reads like you're talking to a real person — conversational and direct. AI systems pick up on this tone as trustworthy and helpful."
        : "Your language is clean, but could be more conversational. Speaking directly to the reader ('you', 'your', 'we') helps AI systems recognize your content as genuinely helpful.",
    fix: jargonFound.length > 0
      ? `Replace jargon like "${jargonFound[0]}" with plain language a busy owner would use. Write like you'd explain it over coffee.`
      : "Add more direct, second-person language ('you', 'your'). Describe your services the way a customer would search for them.",
  });

  // ── 2. Clear business identity (25 pts) ──────────────────
  // Who you are, what you do, where, and who you're best for
  const hasName = !!ctx.businessName;
  const hasServices = ctx.services.length > 0;
  const hasLocation = ctx.locations.length > 0;

  // Check for "best for" / audience signals
  const audienceSignals = [
    "homeowner", "business owner", "commercial", "residential",
    "family", "families", "small business", "property manager",
    "landlord", "contractor", "for you", "best for", "ideal for",
    "we serve", "we help", "our customers", "our clients",
  ];
  const hasAudience = audienceSignals.some(s => lowerMd.includes(s));

  let identityScore = 0;
  if (hasName) identityScore += 7;
  if (hasServices) identityScore += 7;
  if (hasLocation) identityScore += 6;
  if (hasAudience) identityScore += 5;

  const missingIdentity: string[] = [];
  if (!hasName) missingIdentity.push("business name");
  if (!hasServices) missingIdentity.push("services");
  if (!hasLocation) missingIdentity.push("location/area");
  if (!hasAudience) missingIdentity.push("who you're best for");

  checks.push({
    id: "ai-identity-clarity",
    label: "Clear business identity",
    passed: identityScore >= 18,
    score: identityScore,
    maxScore: 25,
    detail: missingIdentity.length === 0
      ? "Your site clearly states who you are, what you do, where you do it, and who you're best for. AI doesn't have to guess."
      : `AI systems need to know: who you are, what you do, where, and who you serve. Missing: ${missingIdentity.join(", ")}.`,
    fix: missingIdentity.length > 0
      ? `Add clear statements about your ${missingIdentity.join(" and ")}. Make these obvious in your first few paragraphs — AI reads top-down.`
      : "Looking good — keep your identity signals consistent across all pages.",
  });

  // ── 3. Question-shaped headings & FAQ (25 pts) ───────────
  // AI assistants match user questions to page content
  const headings = html.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi) || [];
  const headingTexts = headings.map(h => h.replace(/<[^>]+>/g, "").trim());
  const questionHeadings = headingTexts.filter(h => h.includes("?"));

  const hasFaqSection = lowerMd.includes("faq") || lowerMd.includes("frequently asked")
    || lowerMd.includes("common questions") || lowerMd.includes("questions we get");
  const hasFaqSchema = lowerHtml.includes('"faqpage"') || lowerHtml.includes("faqpage");

  let faqScore = 0;
  if (questionHeadings.length >= 3) faqScore += 10;
  else if (questionHeadings.length >= 1) faqScore += 5;
  if (hasFaqSection) faqScore += 8;
  if (hasFaqSchema) faqScore += 7;
  faqScore = Math.min(faqScore, 25);

  checks.push({
    id: "ai-faq-structure",
    label: "Question-shaped content & FAQ",
    passed: faqScore >= 15,
    score: faqScore,
    maxScore: 25,
    detail: faqScore >= 15
      ? `Found ${questionHeadings.length} question heading(s)${hasFaqSection ? ", an FAQ section" : ""}${hasFaqSchema ? ", and FAQPage schema" : ""}. AI assistants can easily reuse your answers.`
      : `Only ${questionHeadings.length} question-shaped heading(s) found${hasFaqSection ? "" : " and no FAQ section"}. AI tools like Perplexity and ChatGPT match user questions to your headings.`,
    fix: faqScore < 15
      ? "Add 3-5 FAQ items using real questions customers ask (e.g., 'How much does a roof repair cost?'). Use question marks in H2/H3 headings so AI can match them to user queries."
      : hasFaqSchema
        ? "Strong setup. Keep adding questions as you hear them from real customers."
        : "Good content — now add FAQPage schema markup so Google and AI tools can feature your answers directly.",
  });

  // ── 4. Trust proof & third-party signals (25 pts) ────────
  const hasTestimonials = /testimonials?|what\s+(our\s+)?(?:clients?|customers?)\s+say|reviews?\s+from/i.test(lowerMd);
  const hasReviewMentions = /google\s*reviews?|yelp\s*reviews?|\d+\s*(?:star|★)|rated\s*\d/i.test(lowerMd);
  const hasReviewSchema = lowerHtml.includes('"aggregaterating"') || lowerHtml.includes('"review"');
  const socialPatterns = /facebook\.com|instagram\.com|twitter\.com|x\.com|linkedin\.com|youtube\.com|yelp\.com|bbb\.org|angies?list|homeadvisor|thumbtack/i;
  const hasSocialLinks = socialPatterns.test(lowerHtml);
  const hasThirdPartyMentions = /featured\s+(?:in|on|by)|as\s+seen\s+(?:in|on)|certified|accredited|licensed|insured|bonded|member\s+of|affiliated\s+with/i.test(lowerMd);

  let trustScore = 0;
  if (hasTestimonials) trustScore += 7;
  if (hasReviewMentions) trustScore += 5;
  if (hasReviewSchema) trustScore += 5;
  if (hasSocialLinks) trustScore += 4;
  if (hasThirdPartyMentions) trustScore += 4;
  trustScore = Math.min(trustScore, 25);

  const missingTrust: string[] = [];
  if (!hasTestimonials) missingTrust.push("testimonials");
  if (!hasReviewMentions && !hasReviewSchema) missingTrust.push("review mentions/ratings");
  if (!hasSocialLinks) missingTrust.push("social/directory links");
  if (!hasThirdPartyMentions) missingTrust.push("third-party credentials");

  checks.push({
    id: "ai-trust-proof",
    label: "Visible trust proof",
    passed: trustScore >= 15,
    score: trustScore,
    maxScore: 25,
    detail: trustScore >= 15
      ? "Strong trust signals — AI systems can see real proof backing up your claims, making them more confident recommending you."
      : `AI systems look for independent proof before recommending a business. Missing: ${missingTrust.join(", ")}.`,
    fix: missingTrust.length > 0
      ? `Add ${missingTrust.slice(0, 2).join(" and ")} to your site. AI tools weight third-party validation heavily when deciding which businesses to recommend.`
      : "Your trust signals are solid — maintain them across all pages.",
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
