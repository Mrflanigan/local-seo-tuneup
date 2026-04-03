import { useState, useEffect } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import type { ScoringResult } from "@/lib/scoring/types";
import { saveLead, saveSnapshot } from "@/lib/api/checkup";
import ScoreRing from "@/components/ScoreRing";
import WhatGoogleSees from "@/components/WhatGoogleSees";
import YearAgoProjection from "@/components/YearAgoProjection";
import CompetitorComparison from "@/components/CompetitorComparison";
import CTABanner from "@/components/CTABanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ExternalLink, Send, Camera, Check } from "lucide-react";
import { toast } from "sonner";

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [wantsGameplan, setWantsGameplan] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const state = location.state as {
    result: ScoringResult;
    url: string;
    city?: string;
  } | null;
  if (!state) return <Navigate to="/" replace />;

  const { result, url, city } = state;
  const name = result.siteContext.businessName;

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

        {/* Score + Opener */}
        <div className="text-center mb-8">
          <ScoreRing score={result.overallScore} grade={result.letterGrade} />
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-4 mb-2">
            {name
              ? `${name}, your site looks good — but here's what Google thinks`
              : "Your site looks good — but here's what Google thinks"}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-sm sm:text-base">
            We scanned your site the same way Google's crawler would. Here's the
            honest breakdown — what's working, what's not, and why it matters for
            getting found by local customers.
          </p>
        </div>

        {/* Full narrative report — no gate */}
        <WhatGoogleSees result={result} />

        {/* Personalized impact projection */}
        <div className="mt-8">
          <YearAgoProjection result={result} city={city} />
        </div>

        {/* Competitor Comparison */}
        <div className="mt-8">
          <CompetitorComparison result={result} url={url} city={city} />
        </div>

        {/* Soft email CTA */}
        {!submitted ? (
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 mt-8 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Want a step-by-step fix-it plan?
            </h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto leading-relaxed">
              Drop your email and we'll send you a prioritized gameplan — which
              fixes to tackle first, what they'll cost, and the expected impact on
              your local rankings.
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
                Send Me the Gameplan
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-3">
              No spam. Just your personalized report and one follow-up.
            </p>
          </div>
        ) : (
          <CTABanner />
        )}
      </div>
    </div>
  );
}
