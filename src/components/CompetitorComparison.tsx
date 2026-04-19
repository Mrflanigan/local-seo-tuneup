import { useState } from "react";
import { Trophy, Target, TrendingUp, Loader2, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScoringResult } from "@/lib/scoring/types";
import { scanCompetitors, type CompetitorResult } from "@/lib/api/checkup";
import { selectWinPhrases } from "@/lib/phrase-optics-utils";

interface Props {
  result: ScoringResult;
  url: string;
  city?: string;
  searchPhrases?: string[];
}

function getGradeColor(grade: string) {
  switch (grade) {
    case "A": return "text-green-500";
    case "B": return "text-blue-500";
    case "C": return "text-yellow-500";
    case "D": return "text-orange-500";
    default: return "text-destructive";
  }
}

function findGaps(
  userResult: ScoringResult,
  competitor: CompetitorResult
): string[] {
  const userStrengths = new Set(
    userResult.categories
      .flatMap((c) => c.findings)
      .filter((f) => f.passed)
      .map((f) => f.id)
  );

  return competitor.strengths
    .filter((s) => !userStrengths.has(s))
    .slice(0, 3);
}

const gapLabels: Record<string, string> = {
  "title": "Optimized title tag",
  "meta-desc": "Strong meta description",
  "headings": "Clean heading hierarchy",
  "keyword-usage": "Strategic keyword placement",
  "img-alts": "Image alt text coverage",
  "internal-links": "Strong internal linking",
  "https": "HTTPS security",
  "meta-robots": "Proper robots directives",
  "canonical": "Canonical tag set",
  "viewport": "Mobile viewport configured",
  "og-tags": "Open Graph social tags",
  "structured-data": "Schema markup",
  "phone": "Phone number visible",
  "biz-name": "Business name prominent",
  "nap": "Full NAP information",
  "local-schema": "LocalBusiness schema",
  "maps": "Google Maps embed",
  "review-signals": "Review/rating signals",
  "local-keywords": "Local keyword usage",
  "content-length": "Substantial content depth",
  "cta": "Clear calls-to-action",
  "mobile": "Mobile-friendly design",
  "performance": "Fast page speed",
  "url-slug": "SEO-friendly URLs",
};

export default function CompetitorComparison({ result, url, city, searchPhrases }: Props) {
  const [competitors, setCompetitors] = useState<CompetitorResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const location = city || result.siteContext.locations[0];
  // Priority: user's typed phrase > win phrase from optics > detected service > fallback
  const service = searchPhrases?.[0]
    || selectWinPhrases(result.phraseOptics?.phraseResults ?? []).primary?.phrase
    || result.siteContext.services[0]
    || "business";
  const defaultQuery = location ? `${service} in ${location}` : service;

  const handleScan = async () => {
    setLoading(true);
    try {
      const data = await scanCompetitors({
        service,
        city: location,
        userUrl: url,
      });
      setCompetitors(data.competitors);
      setSearchQuery(data.query);
      setScanned(true);
    } catch (err) {
      console.error("Competitor scan failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!scanned) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <Swords className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            How Do You Stack Up?
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto leading-relaxed">
          We'll search Google for{" "}
          <strong className="text-foreground">"{defaultQuery}"</strong>, scan your top competitors,
          and show you exactly what they're doing that you're not — and what it would take to overtake them.
        </p>
        <Button
          onClick={handleScan}
          disabled={loading}
          className="h-11 px-6 font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning competitors…
            </>
          ) : (
            <>
              <Target className="mr-2 h-4 w-4" />
              See Who's Beating You
            </>
          )}
        </Button>
        {loading && (
          <p className="text-xs text-muted-foreground mt-3 animate-pulse">
            Finding and scoring your top competitors — this takes 20–30 seconds
          </p>
        )}
      </div>
    );
  }

  if (competitors.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Google didn't surface direct competitors for that exact search. Try a more specific service or city to give it cleaner signal.
        </p>
      </div>
    );
  }

  const userScore = result.overallScore;
  const topCompetitor = competitors.reduce((best, c) =>
    c.overallScore > best.overallScore ? c : best
  );
  const scoreDiff = topCompetitor.overallScore - userScore;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-3">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Your Competition for "{searchQuery}"
          </h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {scoreDiff > 0 ? (
            <>
              The top-ranked competitor scores{" "}
              <strong className="text-foreground">
                {scoreDiff} points higher
              </strong>{" "}
              than you. Here's exactly what they're doing differently — and what
              it would take to overtake them.
            </>
          ) : (
            <>
              You're actually scoring higher than the competition! But there's
              still room to widen the gap and lock in your lead.
            </>
          )}
        </p>
      </div>

      {/* Comparison Cards */}
      <div className="space-y-4">
        {/* User's Score */}
        <div className="rounded-xl border-2 border-primary bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                <span className={`text-xl font-bold text-primary`}>
                  {result.letterGrade}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {result.siteContext.businessName || "Your Site"}{" "}
                  <span className="text-xs text-primary font-normal ml-1">
                    (You)
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {new URL(url).hostname}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">
                {userScore}
              </p>
              <p className="text-xs text-muted-foreground">/100</p>
            </div>
          </div>
        </div>

        {/* Competitors */}
        {competitors.map((comp, i) => {
          const gaps = findGaps(result, comp);
          return (
            <div
              key={comp.url}
              className="rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted">
                    <span
                      className={`text-xl font-bold ${getGradeColor(
                        comp.letterGrade
                      )}`}
                    >
                      {comp.letterGrade}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {comp.businessName || comp.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new URL(comp.url).hostname} · Rank #{i + 1}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">
                    {comp.overallScore}
                  </p>
                  <p className="text-xs text-muted-foreground">/100</p>
                </div>
              </div>

              {/* Category Comparison */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {comp.categories.map((cat) => {
                  const userCat = result.categories.find(
                    (c) => c.id === cat.id
                  );
                  const userCatScore = userCat?.score ?? 0;
                  const diff = cat.score - userCatScore;
                  return (
                    <div key={cat.id} className="text-xs p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground truncate">
                        {cat.label}
                      </p>
                      <p className="font-semibold text-foreground">
                        {cat.score}/{cat.maxScore}
                        {diff !== 0 && (
                          <span
                            className={`ml-1 ${
                              diff > 0
                                ? "text-destructive"
                                : "text-green-500"
                            }`}
                          >
                            ({diff > 0 ? "+" : ""}
                            {diff} vs you)
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Gaps */}
              {gaps.length > 0 && (
                <div className="border-t border-border/50 pt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    They have, you don't:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {gaps.map((g) => (
                      <span
                        key={g}
                        className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full"
                      >
                        {gapLabels[g] || g.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* What It Takes */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h3 className="text-base font-semibold text-foreground mb-2">
          What It Would Take to Overtake Them
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {scoreDiff > 15 ? (
            <>
              Closing a {scoreDiff}-point gap sounds like a lot, but most of
              it comes from{" "}
              <strong className="text-foreground">
                technical fixes that take hours, not months
              </strong>
              : adding schema markup, optimizing meta tags, fixing heading
              hierarchy, and strengthening local signals. These aren't redesign
              projects — they're code-level tweaks that compound over time.
            </>
          ) : scoreDiff > 0 ? (
            <>
              You're only{" "}
              <strong className="text-foreground">
                {scoreDiff} points away
              </strong>{" "}
              from the top. A handful of targeted technical fixes — meta tags,
              schema markup, local keywords — could close that gap in days, not
              months.
            </>
          ) : (
            <>
              You're already ahead on score, but rankings depend on more than
              just on-page signals. Strengthening your technical foundation
              ensures competitors can't easily overtake you as Google re-crawls
              their sites.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
