import type { PhraseResult } from "@/types/phrase-optics";
import type { PhraseOpticsData } from "@/lib/scoring/types";
import {
  getPotentialLabel,
  getCompetitionLabel,
  getOpticsExplanation,
} from "@/lib/phrase-optics-utils";

interface PhraseOpticsRingProps {
  data: PhraseOpticsData;
}

export default function PhraseOpticsRing({ data }: PhraseOpticsRingProps) {
  // Support both legacy and new format
  const score = data.overallOpticsScore ?? data.opticsScore ?? 0;
  const phraseResults: PhraseResult[] = data.phraseResults ?? [];
  const hasNewFormat = phraseResults.length > 0;

  // Legacy rankings fallback
  const legacyRankings = data.rankings ?? [];

  const getColor = (s: number) => {
    if (s >= 70) return "hsl(var(--chart-2))";
    if (s >= 40) return "hsl(var(--accent))";
    return "hsl(var(--destructive))";
  };

  const color = getColor(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const potentialColor = (p: PhraseResult["pageOnePotential"]) => {
    switch (p) {
      case "FAST_TRACK": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "POSSIBLE": return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "LONG_SHOT": return "bg-destructive/15 text-destructive border-destructive/30";
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Ring */}
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
          <circle
            cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            transform="rotate(-90 70 70)" className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{score}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Optics</span>
        </div>
      </div>

      {/* Explanation */}
      <p className="mt-3 text-sm text-muted-foreground text-center max-w-xs">
        {getOpticsExplanation(score)}
      </p>

      {/* New format: Phrase table with potential & competition */}
      {hasNewFormat && (
        <div className="mt-5 w-full space-y-2.5">
          {phraseResults.map((r, i) => (
            <div key={i} className="rounded-lg border border-border bg-card px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-medium text-foreground truncate">"{r.phrase}"</p>
                <div className="ml-3 shrink-0 text-right">
                  {r.currentPosition ? (
                    <p className="text-lg font-bold" style={{ color }}>#{r.currentPosition}</p>
                  ) : (
                    <p className="text-sm font-semibold text-destructive">Not found</p>
                  )}
                </div>
              </div>

              {/* Potential pill */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${potentialColor(r.pageOnePotential)}`}>
                  {getPotentialLabel(r.pageOnePotential)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {getCompetitionLabel(r.competitionLevel)}
                </span>
              </div>

              {/* Notes */}
              {r.notes && (
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">{r.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legacy fallback */}
      {!hasNewFormat && legacyRankings.length > 0 && (
        <div className="mt-4 w-full space-y-2">
          {legacyRankings.map((r, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">"{r.phrase}"</p>
                {r.topResult && r.position !== 1 && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    #1 is {r.topResult.title || new URL(r.topResult.url).hostname}
                  </p>
                )}
              </div>
              <div className="ml-3 text-right shrink-0">
                {r.position ? (
                  <>
                    <p className="text-lg font-bold" style={{ color }}>#{r.position}</p>
                    <p className="text-[10px] text-muted-foreground">Page {r.page}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-destructive">Not found</p>
                    <p className="text-[10px] text-muted-foreground">Top {r.totalResults}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
