import { Rocket, Wrench, Shield, TrendingUp, Zap, CheckCircle2 } from "lucide-react";
import type { ScoringResult } from "@/lib/scoring/types";

interface Props {
  result: ScoringResult;
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

export default function PathToPageOne({ result }: Props) {
  const fixCount = getFixCount(result);
  const projected = getProjectedScore(result);
  const topFixes = getTopFixes(result);
  const scoreDelta = projected - result.overallScore;
  const name = result.siteContext.businessName;

  return (
    <div className="space-y-6">
      {/* The Hook */}
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 sm:p-8 text-center">
        <Rocket className="h-8 w-8 text-accent mx-auto mb-4" />
        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          Let's get down to it.
        </h3>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
          You want to be on page one — and you want more than your share when
          you get there.{" "}
          <span className="text-foreground font-medium">Here's how.</span>
        </p>
      </div>

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

      {/* The Options — outcome-based tiers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground text-center">
          Your options to get there
        </h3>

        {/* Tier 1: Fix What's Broken */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 hover:border-primary/30 transition-colors">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 shrink-0">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-foreground mb-1">
                Fix What's Broken
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                A one-time fix scoped to exactly what your scan found — {fixCount} issue{fixCount !== 1 ? "s" : ""}.
                No mystery line items, no filler. You pay for what's actually wrong and nothing else.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>One-time · Scoped to your actual results</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tier 2: Stay Ahead */}
        <div className="rounded-xl border border-accent/20 bg-card p-5 sm:p-6 hover:border-accent/40 transition-colors relative">
          <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
            Most Popular
          </div>
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-accent/10 shrink-0">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-foreground mb-1">
                Stay Ahead
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Rankings shift. Competitors adjust. Google changes the rules.
                We fix what's broken <em>and</em> keep watching — monthly scans,
                competitor tracking, and adjustments so you don't slip.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                <span>Fix + ongoing monitoring · Rankings protection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tier 3: We Handle It */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 hover:border-primary/30 transition-colors">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 shrink-0">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-foreground mb-1">
                We Handle Everything
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                You run your business. We run your online presence — full implementation,
                content, competitor strategy, and reporting. You just see results.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>Full service · You focus on your business</span>
              </div>
            </div>
          </div>
        </div>

        {/* Anti-fluff callout */}
        <div className="rounded-lg border border-border/50 bg-secondary/30 p-4 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">What we don't charge for:</span>{" "}
            "SEO audits" that restate the obvious, keyword reports you'll never read,
            or monthly retainers for work that's already done.{" "}
            <span className="text-foreground font-medium">
              You get what you pay for — nothing more, nothing less.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
