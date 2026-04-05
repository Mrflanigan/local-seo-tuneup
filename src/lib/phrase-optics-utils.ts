import type { PhraseResult, PhraseOpticsSummary } from "@/types/phrase-optics";

// ── Known big directories / brands ──────────────────────
const BIG_BRANDS = [
  "yelp.com", "angi.com", "angieslist.com", "homeadvisor.com",
  "thumbtack.com", "houzz.com", "bbb.org", "yellowpages.com",
  "nextdoor.com", "facebook.com", "linkedin.com", "instagram.com",
  "amazon.com", "walmart.com", "lowes.com", "homedepot.com",
  "mapquest.com", "manta.com", "porch.com", "bark.com",
  "taskrabbit.com", "expertise.com", "chamberofcommerce.com",
];

// ── Scoring ──────────────────────────────────────────────

export function mapPositionToOpticsScore(position: number | null): number {
  if (position === null || position > 10) return position !== null && position <= 20 ? 5 : 0;
  return Math.max(0, 110 - position * 10);
}

// ── Page-1 Potential ─────────────────────────────────────

export function computePageOnePotential(params: {
  position: number | null;
  hasGoodOnPageAlignment: boolean;
  competitionLevel: "LOCAL" | "MIXED" | "BIG_BRANDS";
}): "FAST_TRACK" | "POSSIBLE" | "LONG_SHOT" {
  const { position, hasGoodOnPageAlignment, competitionLevel } = params;

  // Already on or near page 1
  if (position !== null && position <= 10) {
    return "FAST_TRACK";
  }

  // Striking distance (page 2-3)
  if (position !== null && position >= 11 && position <= 30 && hasGoodOnPageAlignment && competitionLevel === "LOCAL") {
    return "FAST_TRACK";
  }

  // Not found or beyond page 3
  if (position === null || position > 30) {
    return competitionLevel === "BIG_BRANDS" ? "LONG_SHOT" : "POSSIBLE";
  }

  // Position 11-30 but missing alignment or non-local competition
  if (competitionLevel === "BIG_BRANDS") return "LONG_SHOT";
  return "POSSIBLE";
}

// ── Competition Level ────────────────────────────────────

export function describeCompetitionLevel(serpDomains: string[]): "LOCAL" | "MIXED" | "BIG_BRANDS" {
  if (serpDomains.length === 0) return "LOCAL";

  const bigCount = serpDomains.filter(d => {
    const normalized = d.replace(/^www\./, "").toLowerCase();
    return BIG_BRANDS.some(b => normalized === b || normalized.endsWith("." + b));
  }).length;

  const ratio = bigCount / serpDomains.length;
  if (ratio >= 0.6) return "BIG_BRANDS";
  if (ratio >= 0.3) return "MIXED";
  return "LOCAL";
}

// ── On-page alignment check ─────────────────────────────

function checkOnPageAlignment(phrase: string, signals: {
  title?: string | null;
  h1?: string | null;
  h2s?: string[];
  urlSlug?: string | null;
}): boolean {
  const lower = phrase.toLowerCase();
  const words = lower.split(/\s+/).filter(w => w.length > 2);
  let hits = 0;

  if (signals.title && words.some(w => signals.title!.toLowerCase().includes(w))) hits++;
  if (signals.h1 && words.some(w => signals.h1!.toLowerCase().includes(w))) hits++;
  if (signals.h2s?.some(h2 => words.some(w => h2.toLowerCase().includes(w)))) hits++;
  if (signals.urlSlug && words.some(w => signals.urlSlug!.toLowerCase().includes(w))) hits++;

  return hits >= 2;
}

// ── Notes generator ─────────────────────────────────────

function generateNotes(result: PhraseResult): string {
  const posLabel = result.currentPosition
    ? `You're #${result.currentPosition} (page ${Math.ceil(result.currentPosition / 10)})`
    : "You're not visible yet";

  const compLabel =
    result.competitionLevel === "BIG_BRANDS" ? "most page-one results are big directories"
    : result.competitionLevel === "MIXED" ? "there's a mix of local businesses and directories"
    : "mostly local competitors";

  const alignLabel = result.pageOnePotential === "FAST_TRACK"
    ? "with strong signals to push forward"
    : result.pageOnePotential === "POSSIBLE"
    ? "with room to build authority"
    : "in a very competitive space";

  return `${posLabel} — ${compLabel}, ${alignLabel}.`;
}

// ── Main Builder ─────────────────────────────────────────

export function buildPhraseOpticsSummary(args: {
  rankings: Array<{
    phrase: string;
    position: number | null;
    page: number | null;
    totalResults: number;
    topResult?: { title: string; url: string };
  }>;
  userDomain: string;
  onPageSignals?: {
    title?: string | null;
    h1?: string | null;
    h2s?: string[];
    urlSlug?: string | null;
  };
}): PhraseOpticsSummary {
  const { rankings, userDomain, onPageSignals } = args;

  const phraseResults: PhraseResult[] = rankings.map(r => {
    // Extract SERP domains from top results for competition analysis
    const serpDomains: string[] = [];
    // We only have topResult from current data, not full SERP list
    // Competition level will improve when we pass full SERP data
    if (r.topResult?.url) {
      try {
        serpDomains.push(new URL(r.topResult.url).hostname);
      } catch { /* ignore */ }
    }

    const competitionLevel = describeCompetitionLevel(serpDomains);
    const hasGoodOnPageAlignment = onPageSignals
      ? checkOnPageAlignment(r.phrase, onPageSignals)
      : false;

    const opticsScore = mapPositionToOpticsScore(r.position);
    const pageOnePotential = computePageOnePotential({
      position: r.position,
      hasGoodOnPageAlignment,
      competitionLevel,
    });

    const result: PhraseResult = {
      phrase: r.phrase,
      landingUrl: r.position ? `https://${userDomain}` : null,
      currentPosition: r.position,
      opticsScore,
      pageOnePotential,
      competitionLevel,
    };

    result.notes = generateNotes(result);
    return result;
  });

  const scores = phraseResults.map(p => p.opticsScore);
  const overallOpticsScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  return {
    overallOpticsScore,
    phraseResults,
    searchedAt: new Date().toISOString(),
  };
}

// ── UI Helper Labels ─────────────────────────────────────

export function getPotentialLabel(potential: "FAST_TRACK" | "POSSIBLE" | "LONG_SHOT"): string {
  switch (potential) {
    case "FAST_TRACK": return "Fast track to page 1";
    case "POSSIBLE": return "Possible with authority building";
    case "LONG_SHOT": return "Long shot – very competitive phrase";
  }
}

export function getCompetitionLabel(level: "LOCAL" | "MIXED" | "BIG_BRANDS"): string {
  switch (level) {
    case "LOCAL": return "Competing mostly with local businesses";
    case "MIXED": return "Mix of local businesses and directories";
    case "BIG_BRANDS": return "Competing with big brands/directories";
  }
}

export function getPathToPageOnePlan(potential: "FAST_TRACK" | "POSSIBLE" | "LONG_SHOT"): string {
  switch (potential) {
    case "FAST_TRACK":
      return "We focus on tightening your on‑page signals and a few key citations to move you to page 1.";
    case "POSSIBLE":
      return "We improve your on‑page signals and build local authority so you can break into page 1.";
    case "LONG_SHOT":
      return "We either re-target a more winnable phrase or commit to a longer campaign to compete with national players.";
  }
}

export function getOpticsExplanation(score: number): string {
  if (score > 70) return "You're on the map — now we can chase the top spots.";
  if (score >= 40) return "You're findable for some searches, but leaving big opportunities on the table.";
  return "You're mostly invisible for your chosen phrases.";
}

// ── Win Phrase Selection ─────────────────────────────────

export interface WinPhraseSelection {
  primary: PhraseResult | null;
  secondary: PhraseResult | null;
}

export function selectWinPhrases(phrases: PhraseResult[]): WinPhraseSelection {
  if (!phrases || phrases.length === 0) {
    return { primary: null, secondary: null };
  }

  // Filter out obvious long-shots first
  const candidates = phrases.filter((p) => p.pageOnePotential !== "LONG_SHOT");
  const sorted = (candidates.length > 0 ? candidates : phrases)
    .slice()
    .sort((a, b) => {
      const scoreDiff = (b.opticsScore ?? 0) - (a.opticsScore ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      const posA = a.currentPosition ?? 999;
      const posB = b.currentPosition ?? 999;
      return posA - posB;
    });

  return {
    primary: sorted[0] ?? null,
    secondary: sorted[1] ?? null,
  };
}

// ── 3-Step Path to Page One Plan ─────────────────────────

export function buildPathToPageOnePlan(args: {
  phrase: PhraseResult;
  osmosisScore: number;
}): string[] {
  const { phrase, osmosisScore } = args;
  const steps: string[] = [];

  // Step 1: on-page optimization for the phrase
  steps.push(
    `Make your main "${phrase.phrase}" page crystal clear for Google: put this phrase in the page title, main heading, and a few times in the content in natural language.`
  );

  // Step 2: fix site issues or maintain strength
  if (osmosisScore < 70) {
    steps.push(
      "Fix the most important issues on your site so Google is comfortable ranking you higher — things like missing business details, slow loading, or weak mobile experience."
    );
  } else {
    steps.push(
      "Keep your technical foundation strong and make it easy for visitors to call, text, or book from that page."
    );
  }

  // Step 3: build authority based on potential
  if (phrase.pageOnePotential === "FAST_TRACK") {
    steps.push(
      "Build a handful of strong local signals: update your Google Business Profile, get a few new reviews that mention this service, and add a citation or two on trusted directories."
    );
  } else if (phrase.pageOnePotential === "POSSIBLE") {
    steps.push(
      "Build consistent local authority over the next few months: regular Google Business posts, steady review generation, and content that demonstrates your expertise in this service."
    );
  } else {
    steps.push(
      "Consider targeting a more specific version of this phrase (e.g., add your city or a niche qualifier), or commit to a longer campaign to build enough authority to compete."
    );
  }

  return steps;
}
