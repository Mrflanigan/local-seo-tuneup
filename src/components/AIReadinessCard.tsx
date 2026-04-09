import type { AiReadinessData } from "@/lib/scoring/types";
import { Bot, CheckCircle2, XCircle, Sparkles } from "lucide-react";

interface Props {
  data: AiReadinessData;
}

function scoreColor(score: number, max: number) {
  const ratio = score / max;
  if (ratio >= 0.7) return "text-green-400";
  if (ratio >= 0.4) return "text-yellow-400";
  return "text-red-400";
}

function barWidth(score: number, max: number) {
  return `${Math.round((score / max) * 100)}%`;
}

function barColor(score: number, max: number) {
  const ratio = score / max;
  if (ratio >= 0.7) return "bg-green-500/70";
  if (ratio >= 0.4) return "bg-yellow-500/70";
  return "bg-red-500/60";
}

export default function AIReadinessCard({ data }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            AI-Ready Messaging & Emotion Match
            <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">NEW</span>
          </h2>
        </div>
        <span className={`ml-auto text-2xl font-bold ${scoreColor(data.overallScore, 100)}`}>
          {data.overallScore}
          <span className="text-sm font-normal text-muted-foreground">/100</span>
        </span>
      </div>

      <p className="text-xs italic text-muted-foreground/70 mb-3">
        This is an early AI‑readiness lens based on your existing scan data. It's directional, not a definitive grade.
      </p>

      <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-lg">
        Modern search and AI tools do more than read keywords. They try to understand what people are feeling and
        what help they need next, then surface content that feels clear, trustworthy, and supportive.
        We also look for clear "service in [city]" style phrases in your headings and FAQs, so your site better
        matches the way real people ask AI tools for local help.
      </p>

      {/* Checks */}
      <div className="space-y-4">
        {data.checks.map((check) => (
          <div key={check.id} className="space-y-1.5">
            <div className="flex items-center gap-2">
              {check.passed ? (
                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400 shrink-0" />
              )}
              <span className="text-sm font-medium text-foreground">{check.label}</span>
              <span className={`ml-auto text-xs font-bold ${scoreColor(check.score, check.maxScore)}`}>
                {check.score}/{check.maxScore}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden ml-6">
              <div
                className={`h-full rounded-full transition-all ${barColor(check.score, check.maxScore)}`}
                style={{ width: barWidth(check.score, check.maxScore) }}
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed ml-6">
              {check.detail}
            </p>
          </div>
        ))}
      </div>

      {/* Top Fixes */}
      {data.topFixes.length > 0 && (
        <div className="mt-5 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Top fixes we recommend for you</h3>
          </div>
          <ol className="space-y-2">
            {data.topFixes.map((fix, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-accent/20 text-accent text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-muted-foreground leading-relaxed">{fix}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Why this matters */}
      <div className="mt-5 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Why this matters:</span> The clearer and more emotionally
          tuned your messaging is to real owners' situations, the easier it is for Google, Perplexity, and GPT‑style
          tools to understand your business and feel confident including your site when they answer people like you.
        </p>
      </div>
    </div>
  );
}
