import { Rocket, TrendingUp, Zap, Target } from "lucide-react";
import type { ScoringResult } from "@/lib/scoring/types";
import type { PhraseResult } from "@/types/phrase-optics";
import { getPathToPageOnePlan } from "@/lib/phrase-optics-utils";

interface Props {
  result: ScoringResult;
  url?: string;
}

function getFixCount(result: ScoringResult): number {
  return result.categories.reduce(
    (sum, cat) => sum + cat.findings.filter((f) => !f.passed).length,
    0
  );
}

function getProjectedScore(result: ScoringResult): number {
  return Math.min(
    100,
    result.categories.reduce((sum, cat) => sum + cat.maxScore, 0)
  );
}

function getTopFixes(result: ScoringResult, count = 3): string[] {
  const failed: { label: string; points: number }[] = [];
  for (const cat of result.categories) {
    for (const f of cat.findings) {
      if (!f.passed) {
        failed.push({ label: f.personalized || f.generic, points: f.maxPoints - f.points });
      }
    }
  }
  return failed
    .sort((a, b) => b.points - a.points)
    .slice(0, count)
    .map((f) => f.label);
}

/** Pick the best phrase to feature (highest potential, or highest score). */
function getPrimaryPhrase(phraseResults: PhraseResult[]): PhraseResult | null {
  if (phraseResults.length === 0) return null;
  const priority = { FAST_TRACK: 3, POSSIBLE: 2, LONG_SHOT: 1 };
  return [...phraseResults].sort((a, b) =>
    priority[b.pageOnePotential] - priority[a.pageOnePotential]
    || b.opticsScore - a.opticsScore
  )[0];
}

export default function PathToPageOne({ result }: Props) {
  const fixCount = getFixCount(result);
  const projected = getProjectedScore(result);
  const topFixes = getTopFixes(result);
  const scoreDelta = projected - result.overallScore;

  const phraseResults: PhraseResult[] = result.phraseOptics?.phraseResults ?? [];
  const primaryPhrase = getPrimaryPhrase(phraseResults);

  return (
    <div className="space-y-6">
      {/* The Hook */}
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 sm:p-8 text-center">
        <Rocket className="h-8 w-8 text-accent mx-auto mb-4" />
        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          Here's what we'd fix first to get you more calls.
        </h3>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
          You want to be on page one — where customers actually click.{" "}
          <span className="text-foreground font-medium">Here's the plan.</span>
        </p>
      </div>

      {/* Phrase-specific mini-plan */}
      {primaryPhrase && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Your Best Shot: "{primaryPhrase.phrase}"
              </h3>
              <p className="text-xs text-muted-foreground">
                {primaryPhrase.currentPosition
                  ? `Currently #${primaryPhrase.currentPosition}`
                  : "Not yet visible"} · {primaryPhrase.pageOnePotential.replace("_", " ")}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {getPathToPageOnePlan(primaryPhrase.pageOnePotential)}
          </p>
        </div>
      )}

      {/* The Gap */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Your Score Today vs. Where You Could Be
            </h3>
            <p className="text-xs text-muted-foreground">
              {fixCount} fixable issue{fixCount !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {/* Score bar */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Now</span>
              <span className="text-muted-foreground">Projected</span>
            </div>
            <div className="relative h-4 rounded-full bg-secondary overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-destructive/60 transition-all"
                style={{ width: `${result.overallScore}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-accent/40 transition-all"
                style={{ width: `${projected}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
                style={{ width: `${result.overallScore}%` }}
              />
            </div>
            <div className="flex justify-between text-sm mt-1.5">
              <span className="font-bold text-foreground">{result.overallScore}</span>
              <span className="font-bold text-accent">{projected}</span>
            </div>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-accent/10 border border-accent/20">
            <span className="text-2xl font-bold text-accent">+{scoreDelta}</span>
            <p className="text-xs text-muted-foreground">points</p>
          </div>
        </div>

        {/* Top fixes preview */}
        {topFixes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Biggest opportunities
            </p>
            <ul className="space-y-1.5">
              {topFixes.map((fix, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <Zap className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                  <span className="line-clamp-1">{fix}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
