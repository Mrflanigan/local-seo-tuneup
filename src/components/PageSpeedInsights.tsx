import type { PageSpeedData } from "@/lib/scoring/types";

function scoreColor(score: number) {
  if (score >= 90) return "text-green-400";
  if (score >= 50) return "text-yellow-400";
  return "text-red-400";
}

function ringColor(score: number) {
  if (score >= 90) return "stroke-green-400";
  if (score >= 50) return "stroke-yellow-400";
  return "stroke-red-400";
}

function MiniRing({ score, label }: { score: number; label: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="68" height="68" className="-rotate-90">
        <circle cx="34" cy="34" r={r} fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="4" />
        <circle
          cx="34" cy="34" r={r} fill="none"
          className={ringColor(score)}
          strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <span className={`text-lg font-bold ${scoreColor(score)} -mt-12`}>{score}</span>
      <span className="text-[10px] text-muted-foreground mt-5 font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
}

function MetricRow({ label, value, unit, good, poor }: {
  label: string; value?: number; unit: string; good: number; poor: number;
}) {
  if (value == null) return null;
  const display = unit === "s" ? (value / 1000).toFixed(1) : value.toFixed(unit === "" ? 3 : 0);
  const displayUnit = unit === "s" ? "s" : unit;
  const color = value <= good ? "text-green-400" : value <= poor ? "text-yellow-400" : "text-red-400";

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{display}{displayUnit}</span>
    </div>
  );
}

export default function PageSpeedInsights({ data }: { data: PageSpeedData }) {
  const cwv = data.coreWebVitals;

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <img
          src="https://www.google.com/favicon.ico"
          alt="Google"
          className="h-4 w-4"
        />
        <h3 className="text-base font-semibold text-foreground">
          Google PageSpeed Insights
        </h3>
        <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">LIVE DATA</span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <MiniRing score={data.performance} label="Performance" />
        <MiniRing score={data.accessibility} label="Accessibility" />
        <MiniRing score={data.bestPractices} label="Best Practices" />
        <MiniRing score={data.seo} label="SEO" />
      </div>

      <div className="bg-muted/20 rounded-lg p-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Core Web Vitals</p>
        <MetricRow label="Largest Contentful Paint" value={cwv.lcp} unit="s" good={2500} poor={4000} />
        <MetricRow label="First Contentful Paint" value={cwv.fcp} unit="s" good={1800} poor={3000} />
        <MetricRow label="Total Blocking Time" value={cwv.tbt} unit="ms" good={200} poor={600} />
        <MetricRow label="Speed Index" value={cwv.si} unit="s" good={3400} poor={5800} />
        <MetricRow label="Cumulative Layout Shift" value={cwv.cls} unit="" good={0.1} poor={0.25} />
      </div>

      <p className="text-[10px] text-muted-foreground/60 mt-3 text-center">
        Powered by Google Lighthouse · Simulated mobile (lab data, not real-user field metrics) · {new Date(data.fetchedAt).toLocaleDateString()}
      </p>
    </div>
  );
}