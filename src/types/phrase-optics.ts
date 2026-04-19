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
