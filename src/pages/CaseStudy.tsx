import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getSnapshots, type SnapshotRecord } from "@/lib/api/checkup";
import ScoreRing from "@/components/ScoreRing";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Calendar, ArrowRight, Wrench, CheckCircle2, XCircle, AlertTriangle, Code2, Shield, FileCode, Gauge } from "lucide-react";
import type { ScoringResult, CategoryResult, Finding } from "@/lib/scoring/types";

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
