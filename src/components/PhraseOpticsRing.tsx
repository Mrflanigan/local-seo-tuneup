import type { PhraseOpticsData } from "@/lib/scoring/types";

interface PhraseOpticsRingProps {
  data: PhraseOpticsData;
}

export default function PhraseOpticsRing({ data }: PhraseOpticsRingProps) {
  const score = data.opticsScore;

  // Color based on score
  const getColor = (s: number) => {
    if (s >= 70) return "hsl(var(--chart-2))";  // green
    if (s >= 40) return "hsl(var(--accent))";    // gold/amber
    return "hsl(var(--destructive))";             // red
  };

  const color = getColor(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Ring */}
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="10"
          />
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 70 70)"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{score}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Optics</span>
        </div>
      </div>

      {/* Phrase breakdown */}
      <div className="mt-4 w-full space-y-2">
        {data.rankings.map((r, i) => (
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
                  <p className="text-lg font-bold" style={{ color }}>
                    #{r.position}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Page {r.page}
                  </p>
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
    </div>
  );
}
