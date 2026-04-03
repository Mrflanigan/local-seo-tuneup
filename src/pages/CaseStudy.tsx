import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getSnapshots, type SnapshotRecord } from "@/lib/api/checkup";
import ScoreRing from "@/components/ScoreRing";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Calendar, ArrowRight, Wrench, CheckCircle2, XCircle } from "lucide-react";
import type { ScoringResult, CategoryResult, Finding } from "@/lib/scoring/types";

/* ── Small helpers ──────────────────────────────────── */

function CategoryBar({ label, score, maxScore, color }: { label: string; score: number; maxScore: number; color: string }) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{score}/{maxScore}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SnapshotCard({ snapshot, side }: { snapshot: SnapshotRecord; side: "before" | "after" }) {
  const report = snapshot.report_json as ScoringResult;
  const colors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-rose-500"];
  const date = new Date(snapshot.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className={`rounded-xl border p-5 space-y-5 ${side === "before" ? "border-rose-500/30 bg-rose-500/5" : "border-emerald-500/30 bg-emerald-500/5"}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${side === "before" ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
          {side}
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" /> {date}
        </span>
      </div>

      <div className="flex justify-center">
        <ScoreRing score={snapshot.overall_score} grade={snapshot.letter_grade as "A" | "B" | "C" | "D" | "F"} />
      </div>

      <div className="space-y-3">
        {report.categories?.map((cat: CategoryResult, i: number) => (
          <CategoryBar key={cat.id} label={cat.label} score={cat.score} maxScore={cat.maxScore} color={colors[i % colors.length]} />
        ))}
      </div>

      {snapshot.notes && (
        <p className="text-xs text-muted-foreground italic border-t border-border pt-3 mt-3">
          {snapshot.notes}
        </p>
      )}
    </div>
  );
}

/* ── Technical Breakdown ────────────────────────────── */

interface FindingDiff {
  id: string;
  label: string;
  status: "fixed" | "regressed" | "unchanged-pass" | "unchanged-fail";
  beforePoints: number;
  afterPoints: number;
  maxPoints: number;
  description: string;
}

function buildTechnicalBreakdown(before: SnapshotRecord, after: SnapshotRecord) {
  const bReport = before.report_json as ScoringResult;
  const aReport = after.report_json as ScoringResult;

  const categoryDiffs: {
    id: string;
    label: string;
    beforeScore: number;
    afterScore: number;
    maxScore: number;
    diff: number;
    findings: FindingDiff[];
  }[] = [];

  for (const aCat of aReport.categories || []) {
    const bCat = bReport.categories?.find((c) => c.id === aCat.id);
    const bFindings = bCat?.findings || [];

    const findings: FindingDiff[] = [];

    for (const aF of aCat.findings || []) {
      const bF = bFindings.find((f: Finding) => f.id === aF.id);
      const wasPassing = bF?.passed ?? false;
      const nowPassing = aF.passed;

      let status: FindingDiff["status"];
      if (!wasPassing && nowPassing) status = "fixed";
      else if (wasPassing && !nowPassing) status = "regressed";
      else if (nowPassing) status = "unchanged-pass";
      else status = "unchanged-fail";

      findings.push({
        id: aF.id,
        label: aF.personalized || aF.generic,
        status,
        beforePoints: bF?.points ?? 0,
        afterPoints: aF.points,
        maxPoints: aF.maxPoints,
        description: aF.personalized || aF.generic,
      });
    }

    categoryDiffs.push({
      id: aCat.id,
      label: aCat.label,
      beforeScore: bCat?.score ?? 0,
      afterScore: aCat.score,
      maxScore: aCat.maxScore,
      diff: aCat.score - (bCat?.score ?? 0),
      findings,
    });
  }

  return categoryDiffs;
}

const categoryIcons: Record<string, string> = {
  "local-presence": "📍",
  "on-page-seo": "🏷️",
  "technical-seo": "⚙️",
  "content-ux": "📝",
  "extras": "⭐",
};

const technicalExplanations: Record<string, string> = {
  "local-presence": "Local presence signals tell Google where your business operates. NAP (Name, Address, Phone) consistency, Google Business Profile schema markup, and geo-tagged content are crawled by Googlebot to determine local pack eligibility. Missing these signals means Google can't confidently rank you for \"near me\" searches.",
  "on-page-seo": "On-page SEO is the foundation of how search engines understand your content. Title tags (< 60 chars), meta descriptions (< 160 chars), header hierarchy (single H1 → H2s → H3s), and keyword density in the first 100 words are all direct ranking factors in Google's core algorithm.",
  "technical-seo": "Technical SEO covers the infrastructure that allows crawlers to access, render, and index your pages. This includes HTTPS/SSL certificates, mobile viewport meta tags, canonical URLs, structured data (JSON-LD), robots.txt directives, XML sitemaps, and Core Web Vitals (LCP, FID, CLS).",
  "content-ux": "Content & UX signals measure engagement quality. Google uses dwell time, bounce rate, and interaction signals via Chrome User Experience Report (CrUX). Thin content (< 300 words), missing alt text on images, poor readability scores, and lack of internal linking all depress rankings.",
  "extras": "Bonus signals include social proof markup (reviews schema), Open Graph tags for social sharing, favicon presence, and accessibility compliance (ARIA labels). While individually minor, these compound into a trust signal that differentiates competitive listings.",
};

function TechnicalBreakdown({ before, after }: { before: SnapshotRecord; after: SnapshotRecord }) {
  const breakdown = buildTechnicalBreakdown(before, after);
  const totalFixed = breakdown.reduce((sum, c) => sum + c.findings.filter((f) => f.status === "fixed").length, 0);
  const totalRegressed = breakdown.reduce((sum, c) => sum + c.findings.filter((f) => f.status === "regressed").length, 0);
  const totalStillFailing = breakdown.reduce((sum, c) => sum + c.findings.filter((f) => f.status === "unchanged-fail").length, 0);

  return (
    <div className="mt-10 space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
          <Wrench className="h-3.5 w-3.5" /> Technical Analysis
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          What We Did — And Why It Matters
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          A complete technical audit of every change made, explained in terms of how Google's
          crawler and ranking algorithm interpret your site.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{totalFixed}</div>
          <div className="text-xs text-muted-foreground mt-1">Issues Fixed</div>
        </div>
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{totalStillFailing}</div>
          <div className="text-xs text-muted-foreground mt-1">Still Needs Work</div>
        </div>
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-center">
          <div className="text-2xl font-bold text-rose-400">{totalRegressed}</div>
          <div className="text-xs text-muted-foreground mt-1">Regressions</div>
        </div>
      </div>

      {/* Category-by-category deep dive */}
      {breakdown.map((cat) => {
        const fixed = cat.findings.filter((f) => f.status === "fixed");
        const regressed = cat.findings.filter((f) => f.status === "regressed");
        const stillFailing = cat.findings.filter((f) => f.status === "unchanged-fail");
        const passing = cat.findings.filter((f) => f.status === "unchanged-pass");
        const icon = categoryIcons[cat.id] || "📊";
        const explanation = technicalExplanations[cat.id];

        return (
          <div key={cat.id} className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Category header */}
            <div className="p-5 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <span>{icon}</span> {cat.label}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{cat.beforeScore}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className={cat.diff > 0 ? "text-emerald-400 font-semibold" : cat.diff < 0 ? "text-rose-400 font-semibold" : "text-muted-foreground"}>
                    {cat.afterScore}/{cat.maxScore}
                  </span>
                  {cat.diff !== 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${cat.diff > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                      {cat.diff > 0 ? "+" : ""}{cat.diff}
                    </span>
                  )}
                </div>
              </div>
              {explanation && (
                <p className="text-xs text-muted-foreground leading-relaxed mt-2 border-l-2 border-primary/30 pl-3">
                  <span className="font-semibold text-primary/70">Why this matters: </span>
                  {explanation}
                </p>
              )}
            </div>

            {/* Findings list */}
            <div className="divide-y divide-border">
              {fixed.map((f) => (
                <div key={f.id} className="px-5 py-3 flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Fixed</span>
                      <span className="text-xs text-muted-foreground">+{f.afterPoints - f.beforePoints} pts</span>
                    </div>
                    <p className="text-sm text-foreground mt-1 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}

              {regressed.map((f) => (
                <div key={f.id} className="px-5 py-3 flex items-start gap-3">
                  <XCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">Regressed</span>
                      <span className="text-xs text-muted-foreground">{f.afterPoints - f.beforePoints} pts</span>
                    </div>
                    <p className="text-sm text-foreground mt-1 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}

              {stillFailing.map((f) => (
                <div key={f.id} className="px-5 py-3 flex items-start gap-3 opacity-70">
                  <XCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Needs Work</span>
                      <span className="text-xs text-muted-foreground">{f.afterPoints}/{f.maxPoints} pts</span>
                    </div>
                    <p className="text-sm text-foreground mt-1 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}

              {passing.length > 0 && (
                <div className="px-5 py-3">
                  <p className="text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 inline mr-1 text-emerald-400/50" />
                    {passing.length} check{passing.length !== 1 ? "s" : ""} already passing — no changes needed
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Bottom methodology note */}
      <div className="rounded-lg border border-border bg-card/50 p-5 text-center">
        <p className="text-xs text-muted-foreground leading-relaxed max-w-xl mx-auto">
          <span className="font-semibold text-foreground">Methodology:</span> Each scan uses Firecrawl to render the page exactly as Googlebot
          sees it — full DOM, metadata, structured data, and outbound links. Scoring follows Google's published
          webmaster guidelines and known ranking factors. No guesswork, no vanity metrics — just the signals
          that directly impact your position in search results.
        </p>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────── */

export default function CaseStudy() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlFilter = searchParams.get("url") || "";
  const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSnapshots(urlFilter || undefined)
      .then(setSnapshots)
      .catch((err) => console.error("Failed to load snapshots:", err))
      .finally(() => setLoading(false));
  }, [urlFilter]);

  const beforeSnaps = snapshots.filter((s) => s.label === "before");
  const afterSnaps = snapshots.filter((s) => s.label === "after");
  const before = beforeSnaps[0];
  const after = afterSnaps[afterSnaps.length - 1];
  const scoreDiff = before && after ? after.overall_score - before.overall_score : 0;

  const hostname = urlFilter ? (() => { try { return new URL(urlFilter.startsWith("http") ? urlFilter : `https://${urlFilter}`).hostname; } catch { return urlFilter; } })() : "";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {hostname ? `Case Study: ${hostname}` : "Client Progression"}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            Real data showing exactly what changed and the measurable impact on search visibility.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-20">Loading snapshots…</div>
        ) : snapshots.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            <p className="text-lg mb-2">No snapshots yet</p>
            <p className="text-sm">Run a scan and save a snapshot to start tracking progression.</p>
          </div>
        ) : (
          <>
            {before && after && (
              <div className="rounded-xl border border-border bg-card p-5 mb-8 text-center">
                <div className="flex items-center justify-center gap-4 text-3xl font-bold">
                  <span className="text-rose-400">{before.overall_score}</span>
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  <span className="text-emerald-400">{after.overall_score}</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <TrendingUp className={`h-5 w-5 ${scoreDiff >= 0 ? "text-emerald-400" : "text-rose-400"}`} />
                  <span className={`text-lg font-semibold ${scoreDiff >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {scoreDiff >= 0 ? "+" : ""}{scoreDiff} points
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {before && <SnapshotCard snapshot={before} side="before" />}
              {after ? (
                <SnapshotCard snapshot={after} side="after" />
              ) : (
                <div className="rounded-xl border border-dashed border-muted-foreground/30 p-5 flex items-center justify-center text-muted-foreground text-sm">
                  After snapshot not yet captured — run a new scan after making improvements
                </div>
              )}
            </div>

            {/* Technical Breakdown — only when we have both */}
            {before && after && (
              <TechnicalBreakdown before={before} after={after} />
            )}

            {snapshots.length > 2 && (
              <div className="mt-10">
                <h2 className="text-lg font-semibold text-foreground mb-4">All Snapshots</h2>
                <div className="space-y-3">
                  {snapshots.map((s) => (
                    <div key={s.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-3">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${s.label === "before" ? "bg-rose-500/20 text-rose-400" : s.label === "after" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"}`}>
                        {s.label}
                      </span>
                      <span className="font-semibold text-foreground">{s.overall_score}/100</span>
                      <span className="text-xs text-muted-foreground">{s.letter_grade}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(s.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
