import { useState, useMemo } from "react";
import { loadLastScan } from "@/lib/utils";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import type { ScoringResult } from "@/lib/scoring/types";
import { saveLead, saveSnapshot } from "@/lib/api/checkup";
import { selectWinPhrases, buildPathToPageOnePlan, getPotentialLabel } from "@/lib/phrase-optics-utils";
import ScoreRing from "@/components/ScoreRing";
import WhatGoogleSees from "@/components/WhatGoogleSees";
import RedirectSanityCard from "@/components/RedirectSanityCard";
import SchemaCompletenessMeter from "@/components/SchemaCompletenessMeter";
import YearAgoProjection from "@/components/YearAgoProjection";
import CompetitorComparison from "@/components/CompetitorComparison";
import CTABanner from "@/components/CTABanner";
import PathToPageOne from "@/components/PathToPageOne";
import MountainLanePicker from "@/components/MountainLanePicker";
import PhraseOpticsRing from "@/components/PhraseOpticsRing";
import AIReadinessCard from "@/components/AIReadinessCard";
import FixTheseFiveFirst from "@/components/FixTheseFiveFirst";
import BrandVisibilityCard from "@/components/BrandVisibilityCard";
import PageSpeedInsights from "@/components/PageSpeedInsights";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ExternalLink, Send, Camera, Trophy } from "lucide-react";
import { toast } from "sonner";
import ReportFooter from "@/components/ReportFooter";
import FeedbackWidget from "@/components/FeedbackWidget";

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [wantsGameplan, setWantsGameplan] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [snapshotSaved, setSnapshotSaved] = useState<"before" | "after" | null>(null);
  const [savingSnapshot, setSavingSnapshot] = useState(false);

  const state = location.state as {
    result: ScoringResult;
    url: string;
    city?: string;
    businessType?: string;
    searchPhrases?: string[];
  } | null;

  // Fall back to localStorage if navigated here without state (e.g. page reload)
  const restored = useMemo(() => {
    if (state) return state;
    const last = loadLastScan();
    if (last) return last as typeof state;
    return null;
  }, [state]);

  if (!restored) return <Navigate to="/" replace />;

  const { result, url, city, searchPhrases } = restored;
  const name = result.siteContext.businessName;

  const handleSnapshotSave = async (label: "before" | "after") => {
    setSavingSnapshot(true);
    try {
      await saveSnapshot({
        url,
        city,
        label,
        overallScore: result.overallScore,
        letterGrade: result.letterGrade,
        report: result,
      });
      setSnapshotSaved(label);
      toast.success(`${label === "before" ? "Before" : "After"} snapshot saved!`);
    } catch (err) {
      console.error("Failed to save snapshot:", err);
      toast.error("Failed to save snapshot");
    } finally {
      setSavingSnapshot(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    try {
      await saveLead({ email, url, city, report: result, wantsGameplan });
      toast.success("You're all set! Check your inbox.");
    } catch (err) {
      console.error("Failed to save lead:", err);
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/get-started")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <div className="text-sm font-semibold tracking-[0.2em] text-muted-foreground">
            PAGE 3
          </div>
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

        {/* Snapshot Save Bar */}
        <div className="flex items-center justify-center gap-3 mb-8 p-3 rounded-lg border border-border bg-card">
          <Camera className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Save this scan as:</span>
          <Button
            size="sm"
            variant={snapshotSaved === "before" ? "default" : "outline"}
            disabled={savingSnapshot || snapshotSaved !== null}
            onClick={() => handleSnapshotSave("before")}
            className="text-xs"
          >
            📸 Before
          </Button>
          <Button
            size="sm"
            variant={snapshotSaved === "after" ? "default" : "outline"}
            disabled={savingSnapshot || snapshotSaved !== null}
            onClick={() => handleSnapshotSave("after")}
            className="text-xs"
          >
            ✅ After
          </Button>
          {snapshotSaved && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/case-study?url=${encodeURIComponent(url)}`)}
              className="text-xs text-primary"
            >
              View Progression →
            </Button>
          )}
        </div>
        {/* Hero: Phrase Optics first, then Site Health */}
        {result.phraseOptics && (
          <div className="mb-8 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">
              Can customers actually find you on Google?
            </h2>
            <p className="text-sm text-muted-foreground mb-1 max-w-md mx-auto">
              This shows how visible you are for the searches that actually bring you customers. We aim for page 1 for at least one or two of your best phrases.
            </p>
            <p className="text-[10px] text-muted-foreground/50 mb-5 max-w-sm mx-auto">
              Based on current ranking signals. Does not factor backlink profiles or domain authority.{" "}
              <button onClick={() => navigate("/methodology")} className="text-primary/60 hover:text-primary hover:underline">Learn more</button>
            </p>
            <div className="flex justify-center">
              <PhraseOpticsRing data={result.phraseOptics} />
            </div>

            {/* Win Phrase Plan */}
            {(() => {
              const winPhrases = selectWinPhrases(result.phraseOptics?.phraseResults ?? []);
              if (!winPhrases.primary) return null;
              const steps = buildPathToPageOnePlan({
                phrase: winPhrases.primary,
                osmosisScore: result.overallScore,
              });
              return (
                <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-5 sm:p-6 text-left max-w-lg mx-auto">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="h-5 w-5 text-accent" />
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Your Win Phrase: "{winPhrases.primary.phrase}"
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {winPhrases.primary.currentPosition
                          ? `Currently #${winPhrases.primary.currentPosition}`
                          : "Not yet visible"}{" "}
                        · {getPotentialLabel(winPhrases.primary.pageOnePotential)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Here's your 3-step path to page one for this phrase:
                  </p>
                  <ol className="space-y-2">
                    {steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-accent/20 text-accent text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="text-foreground/90 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                  {winPhrases.secondary && (
                    <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/50">
                      Runner-up phrase: "<strong className="text-foreground">{winPhrases.secondary.phrase}</strong>"
                      {winPhrases.secondary.currentPosition
                        ? ` (#${winPhrases.secondary.currentPosition})`
                        : " (not yet visible)"}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Supporting metric: Site Health */}
        <div className={`mb-8 flex flex-col items-center gap-4 ${result.phraseOptics ? "" : ""}`}>
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              {result.phraseOptics ? "How well your site is set up for Google to trust and recommend you" : "Site Health"}
            </p>
            <ScoreRing score={result.overallScore} grade={result.letterGrade} />
            {!result.phraseOptics && (
              <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">Site Health</p>
            )}
            <button onClick={() => navigate("/methodology")} className="mt-1 text-[10px] text-primary/70 hover:text-primary hover:underline">
              How we score →
            </button>
          </div>
        </div>
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-4 mb-2">
            {name
              ? `${name} — here's what's helping and what's quietly holding you back`
              : "Here's what's helping and what's quietly holding you back"}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-sm sm:text-base">
            We checked your site the same way Google does. Here's the honest
            breakdown — what you're doing right, and what to fix first to get more calls.
          </p>
          {result.businessType === "online" && result.overallScore > 100 && (
            <div className="mt-3 mx-auto max-w-md rounded-lg border border-accent/30 bg-accent/5 p-3">
              <p className="text-xs text-accent font-semibold mb-1">🏆 You scored above 100!</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                As an online business, your base score is out of 100. But you also have local signals
                that most online businesses don't — earning you <strong className="text-foreground">{result.overallScore - 100} bonus points</strong>.
                {(() => {
                  const bonusChecks = ["phone", "nap", "local-schema", "maps", "local-keywords"];
                  const earned = result.categories
                    .flatMap(c => c.findings)
                    .filter(f => bonusChecks.includes(f.id) && f.passed);
                  if (earned.length === 0) return null;
                  return ` Bonus from: ${earned.map(f => f.generic.split(".")[0]).join(", ")}.`;
                })()}
              </p>
            </div>
          )}
          {result.businessType === "online" && result.overallScore <= 100 && (
            <p className="text-xs text-muted-foreground/70 mt-2 max-w-md mx-auto">
              Scored as an <strong className="text-foreground">Online Business</strong> — local-only checks
              can earn bonus points above 100 if present.
            </p>
          )}
          {result.businessType === "local" && (
            <p className="text-xs text-muted-foreground/70 mt-2 max-w-md mx-auto">
              Scored as a <strong className="text-foreground">Local Business</strong> — all 100 points apply.
            </p>
          )}
        </div>

        {/* Lane statement */}
        <div className="rounded-lg border border-border/50 bg-card/40 p-4 mb-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
            This report is a snapshot, not a full MRI. It's built for local service businesses that need a fast, honest read on their search readiness.
            We don't try to replace your backlink tools, rank trackers, or SERP analysis platforms. If we ever go after those, we'll do it with the same goal: be best‑in‑class at what we choose to do, not everything.
          </p>
        </div>

        <p className="text-xs text-muted-foreground/70 text-center mb-8 max-w-md mx-auto leading-relaxed">
          <span className="font-medium text-muted-foreground">How to use this report:</span>{" "}
          Use it as a 60‑second health check and conversation starter, not a full forensic audit. Ideal for pre‑sales, quick check‑ins, and educating owners on what matters most next.
        </p>

        {/* Fix These 5 First — priority stack */}
        <FixTheseFiveFirst result={result} />

        {/* Brand Visibility — discovery checks */}
        {result.brandVisibility && (
          <div className="mb-8">
            <BrandVisibilityCard data={result.brandVisibility} />
          </div>
        )}

        {/* AI-Ready Messaging & Emotion Match */}
        {result.aiReadiness && (
          <div className="mb-8">
            <AIReadinessCard data={result.aiReadiness} />
          </div>
        )}

        {/* Full narrative report — no gate */}
        <WhatGoogleSees result={result} />

        {/* Google PageSpeed Insights — real data from Google */}
        {result.pageSpeed && (
          <div className="mt-8">
            <PageSpeedInsights data={result.pageSpeed} />
          </div>
        )}

        {/* Redirect & Canonical Sanity */}
        {result.redirectChain && (
          <div className="mt-8">
            <RedirectSanityCard data={result.redirectChain} />
          </div>
        )}

        {/* LocalBusiness Schema Completeness */}
        {result.schemaCompleteness && (
          <SchemaCompletenessMeter data={result.schemaCompleteness} />
        )}

        {/* Personalized impact projection */}
        <div className="mt-8">
          <YearAgoProjection result={result} city={city} />
        </div>

        {/* Competitor Comparison */}
        <div className="mt-8">
          <CompetitorComparison result={result} url={url} city={city} searchPhrases={searchPhrases} />
        </div>

        {/* Path to Page 1 — score gap + hook */}
        <div className="mt-8">
          <PathToPageOne result={result} url={url} />
        </div>

        {/* Pick Your Lane — the pricing */}
        <div className="mt-8">
          <MountainLanePicker result={result} url={url} />
        </div>

        {/* Soft email CTA */}
        {!submitted ? (
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 mt-8 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Want us to tell you exactly what to fix first?
            </h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto leading-relaxed">
              Drop your email and we'll send you a clear plan — which fixes matter
              most, what they'll cost, and how they'll help you get more customers from Google.
            </p>
            <form
              onSubmit={handleEmailSubmit}
              className="max-w-sm mx-auto space-y-3"
            >
              <Input
                type="email"
                placeholder="you@yourbusiness.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
              <div className="flex items-start gap-2 text-left">
                <Checkbox
                  id="gameplan"
                  checked={wantsGameplan}
                  onCheckedChange={(checked) => setWantsGameplan(!!checked)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="gameplan"
                  className="text-sm text-muted-foreground cursor-pointer leading-snug"
                >
                  I'd also like a 15-minute Local SEO Gameplan call
                </label>
              </div>
              <Button type="submit" className="w-full h-11 font-semibold">
                <Send className="mr-2 h-4 w-4" />
                Get My Implementation Plan
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-3">
              No spam. Just your personalized report and one follow-up.
            </p>
          </div>
        ) : (
          <CTABanner />
        )}

        <ReportFooter />
      </div>
      <FeedbackWidget url={url} />
    </div>
  );
}
