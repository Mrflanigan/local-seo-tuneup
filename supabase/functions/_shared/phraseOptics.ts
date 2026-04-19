// supabase/functions/_shared/phraseOptics.ts
// Phrase Optics utilities for edge functions (mirrors src/lib/phrase-optics-utils.ts)

export interface PhraseResult {
  phrase: string;
  landingUrl: string | null;
  currentPosition: number | null;
  opticsScore: number;
  pageOnePotential: "FAST_TRACK" | "POSSIBLE" | "LONG_SHOT";
  competitionLevel: "LOCAL" | "MIXED" | "BIG_BRANDS";
  notes?: string;
  searchVolume?: number | null;
}

export interface PhraseOpticsSummary {
  overallOpticsScore: number;
  phraseResults: PhraseResult[];
  searchedAt?: string;
}

const BIG_BRANDS = [
  "yelp.com", "angi.com", "angieslist.com", "homeadvisor.com",
  "thumbtack.com", "houzz.com", "bbb.org", "yellowpages.com",
  "nextdoor.com", "facebook.com", "linkedin.com", "instagram.com",
  "amazon.com", "walmart.com", "lowes.com", "homedepot.com",
  "mapquest.com", "manta.com", "porch.com", "bark.com",
  "taskrabbit.com", "expertise.com", "chamberofcommerce.com",
];

export function mapPositionToOpticsScore(position: number | null): number {
  if (position === null || position > 10) return position !== null && position <= 20 ? 5 : 0;
  return Math.max(0, 110 - position * 10);
}

export function computePageOnePotential(params: {
  position: number | null;
  hasGoodOnPageAlignment: boolean;
  competitionLevel: "LOCAL" | "MIXED" | "BIG_BRANDS";
}): "FAST_TRACK" | "POSSIBLE" | "LONG_SHOT" {
  const { position, hasGoodOnPageAlignment, competitionLevel } = params;
  if (position !== null && position <= 10) return "FAST_TRACK";
  if (position !== null && position >= 11 && position <= 30 && hasGoodOnPageAlignment && competitionLevel === "LOCAL") return "FAST_TRACK";
  if (position === null || position > 30) return competitionLevel === "BIG_BRANDS" ? "LONG_SHOT" : "POSSIBLE";
  if (competitionLevel === "BIG_BRANDS") return "LONG_SHOT";
  return "POSSIBLE";
}

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

function checkOnPageAlignment(phrase: string, signals: {
  title?: string | null;
  h1?: string | null;
  h2s?: string[];
  urlSlug?: string | null;
}): boolean {
  const words = phrase.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  let hits = 0;
  if (signals.title && words.some(w => signals.title!.toLowerCase().includes(w))) hits++;
  if (signals.h1 && words.some(w => signals.h1!.toLowerCase().includes(w))) hits++;
  if (signals.h2s?.some(h2 => words.some(w => h2.toLowerCase().includes(w)))) hits++;
  if (signals.urlSlug && words.some(w => signals.urlSlug!.toLowerCase().includes(w))) hits++;
  return hits >= 2;
}

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

export interface SearchResult {
  url: string;
  title?: string;
}

export interface PhraseRanking {
  phrase: string;
  position: number | null;
  page: number | null;
  totalResults: number;
  topResult?: { title: string; url: string };
  serpResults?: SearchResult[];
  searchVolume?: number | null;
}

export function buildPhraseOpticsSummary(args: {
  rankings: PhraseRanking[];
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
    // Extract SERP domains for competition analysis
    const serpDomains: string[] = [];
    const results = r.serpResults || (r.topResult ? [r.topResult] : []);
    for (const sr of results) {
      try { serpDomains.push(new URL(sr.url).hostname); } catch { /* ignore */ }
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
      searchVolume: r.searchVolume ?? null,
    };
    result.notes = generateNotes(result);
    return result;
  });

  const scores = phraseResults.map(p => p.opticsScore);
  const overallOpticsScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  return { overallOpticsScore, phraseResults, searchedAt: new Date().toISOString() };
}
