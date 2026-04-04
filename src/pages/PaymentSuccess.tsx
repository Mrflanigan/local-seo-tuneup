import { useSearchParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { Rocket, Zap, Wrench, Shield, Crown, Flame, CheckCircle2, ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScoringResult } from "@/lib/scoring/types";

const TIER_LABELS: Record<string, { name: string; icon: typeof Rocket; tagline: string }> = {
  fix: { name: "Fix What's Broken", icon: Wrench, tagline: "One shot. Every issue. Done." },
  express: { name: "Show Up Tomorrow", icon: Flame, tagline: "Ads go live. You show up. They call." },
  stayAhead: { name: "Stay Ahead", icon: Shield, tagline: "We watch. We adjust. You stay on top." },
  handleIt: { name: "We Handle Everything", icon: Rocket, tagline: "You run your business. We run your rankings." },
  domination: { name: "Total Market Domination", icon: Crown, tagline: "Every channel. Every angle. No second place." },
};

function getFailedFindings(result: ScoringResult) {
  const findings: { label: string; category: string; impact: number }[] = [];
  for (const cat of result.categories) {
    for (const f of cat.findings) {
      if (!f.passed) {
        findings.push({
          label: f.personalized || f.generic,
          category: cat.label,
          impact: f.maxPoints - f.points,
        });
      }
    }
  }
  return findings.sort((a, b) => b.impact - a.impact);
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tierKey = searchParams.get("tier") || "fix";
  const tierInfo = TIER_LABELS[tierKey] || TIER_LABELS.fix;
  const TierIcon = tierInfo.icon;

  const result = useMemo<ScoringResult | null>(() => {
    try {
      const raw = sessionStorage.getItem("scanResult");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const _scanUrl = sessionStorage.getItem("scanUrl") || "";
  const findings = result ? getFailedFindings(result) : [];
  const businessName = result?.siteContext?.businessName;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* The lane they picked */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-accent/10 border border-accent/30 mb-5">
            <TierIcon className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {businessName ? `${businessName}, you picked your lane.` : "You picked your lane."}
          </h1>
          <p className="text-lg text-accent font-semibold mb-1">{tierInfo.name}</p>
          <p className="text-muted-foreground italic">{tierInfo.tagline}</p>
        </div>

        {/* What we're fixing — no fluff */}
        {findings.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Wrench className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Here's exactly what we're fixing.
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              No mystery. No "SEO audit" that restates the obvious. These are the {findings.length} issues
              your scan found — and we're on every one of them.
            </p>
            <ul className="space-y-2">
              {findings.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-foreground">{f.label}</span>
                    <span className="text-muted-foreground text-xs ml-2">({f.category})</span>
                  </div>
                  <span className="text-xs text-accent font-medium shrink-0">+{f.impact} pts</span>
                </li>
              ))}
            </ul>
            {result && (
              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Current score: <span className="font-bold text-foreground">{result.overallScore}</span>
                </span>
                <span className="text-sm text-muted-foreground">
                  After we're done: <span className="font-bold text-accent">
                    {Math.min(100, result.categories.reduce((s, c) => s + c.maxScore, 0))}
                  </span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* What we need from them — direct */}
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <KeyRound className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">
              One thing we need from you.
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            To fix your site, we need access. That's it. No meetings. No "discovery calls."
            Just access so we can get in and get it done.
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground mb-1">Option A — You give us CMS access</p>
              <p className="text-xs text-muted-foreground">
                WordPress login, Squarespace, Wix, whatever you're on.
                Reply to your confirmation email with the credentials. We handle the rest.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground mb-1">Option B — You have a developer</p>
              <p className="text-xs text-muted-foreground">
                Forward them the fix list above. Every item is specific — no interpretation needed.
                They'll know exactly what to do. If they don't, we'll talk to them directly.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline — no ambiguity */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              What happens now.
            </h2>
          </div>
          <div className="space-y-3">
            {[
              { time: "Right now", text: "Your confirmation and fix list hit your inbox." },
              { time: "Within 24 hours", text: "We start. No kickoff meeting. No onboarding form." },
              { time: "Within 7 days", text: "Fixes are live. We re-scan your site and send you the new score." },
              ...(tierKey !== "fix"
                ? [{ time: "Every month", text: "We scan again. We adjust. You stay ahead." }]
                : []),
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-accent/10 shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground">{step.time}</span>
                  <span className="text-sm text-muted-foreground ml-2">{step.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — confident close */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            A receipt and your full fix list are in your inbox. That's the last email you'll get from us
            until the work is done.
          </p>
          <Button variant="outline" onClick={() => navigate("/")}>
            Scan another site <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
