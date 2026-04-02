import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import type { ScoringResult } from "@/lib/scoring/types";
import ScoreRing from "@/components/ScoreRing";
import SectionCard from "@/components/SectionCard";
import EmailGate from "@/components/EmailGate";
import CTABanner from "@/components/CTABanner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);

  const state = location.state as { result: ScoringResult; url: string } | null;
  if (!state) return <Navigate to="/" replace />;

  const { result, url } = state;

  // Find worst-scoring section and pull 1-2 issues from it
  const worstCategory = [...result.categories].sort(
    (a, b) => a.score / a.maxScore - b.score / b.maxScore
  )[0];
  const topIssues = worstCategory.findings
    .filter((f) => !f.passed)
    .sort((a, b) => b.maxPoints - a.maxPoints)
    .slice(0, 2);

  const handleUnlock = (email: string, _wantsGameplan: boolean) => {
    // TODO: Send email to backend for storage / follow-up
    setUnlocked(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> New Scan
          </Button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            {new URL(url).hostname}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Score Ring + Summary */}
        <div className="text-center mb-8">
          <ScoreRing score={result.overallScore} grade={result.letterGrade} />
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-4 mb-2">
            {result.siteContext.businessName
              ? `${result.siteContext.businessName}'s Google Checkup`
              : "Your Google Compatibility Score"}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-sm sm:text-base">
            {result.personalizedSummary}
          </p>
        </div>

        {!unlocked ? (
          <>
            {/* Teaser: friendly summary + top issues */}
            <div className="rounded-xl border border-border bg-card p-5 sm:p-6 mb-2">
              <p className="text-sm text-foreground mb-4 leading-relaxed">
                You've done some things right — here's where you're leaving easy
                wins on the table:
              </p>
              {topIssues.length > 0 && (
                <ul className="space-y-3">
                  {topIssues.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="text-destructive font-bold mt-0.5">✕</span>
                      <span className="leading-relaxed">
                        {f.personalized || f.generic}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Blurred preview */}
            <div className="space-y-4 mb-2">
              {result.categories.slice(0, 2).map((cat) => (
                <SectionCard key={cat.id} category={cat} blurred />
              ))}
            </div>

            {/* Email gate */}
            <EmailGate onUnlock={handleUnlock} />
          </>
        ) : (
          <>
            {/* Full report */}
            <div className="space-y-4">
              {result.categories.map((cat) => (
                <SectionCard key={cat.id} category={cat} />
              ))}
            </div>

            {/* CTA */}
            <CTABanner />
          </>
        )}
      </div>
    </div>
  );
}
