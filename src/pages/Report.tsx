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
  const topIssues = result.categories
    .flatMap((c) => c.findings.filter((f) => !f.passed))
    .sort((a, b) => b.maxPoints - a.maxPoints)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10">
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
        <div className="text-center mb-10">
          <ScoreRing score={result.overallScore} grade={result.letterGrade} />
          <h2 className="text-2xl font-bold text-foreground mt-4 mb-2">
            {result.siteContext.businessName
              ? `${result.siteContext.businessName}'s Google Checkup`
              : "Your Google Compatibility Score"}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {result.personalizedSummary}
          </p>
        </div>

        {/* Teaser: top issues */}
        {!unlocked && topIssues.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6 mb-4">
            <h3 className="font-semibold text-foreground mb-3">Top Opportunities</h3>
            <ul className="space-y-2">
              {topIssues.map((f) => (
                <li key={f.id} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-destructive font-bold">✕</span>
                  {f.personalized || f.generic}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Blurred preview or full report */}
        {!unlocked ? (
          <>
            <div className="space-y-4">
              {result.categories.slice(0, 2).map((cat) => (
                <SectionCard key={cat.id} category={cat} blurred />
              ))}
            </div>
            <EmailGate onUnlock={() => setUnlocked(true)} />
          </>
        ) : (
          <div className="space-y-4">
            {result.categories.map((cat) => (
              <SectionCard key={cat.id} category={cat} />
            ))}
            <CTABanner />
          </div>
        )}
      </div>
    </div>
  );
}
