import { CheckCircle2, XCircle } from "lucide-react";
import type { CategoryResult } from "@/lib/scoring/types";

interface SectionCardProps {
  category: CategoryResult;
  blurred?: boolean;
}

function scoreColor(pct: number): string {
  if (pct >= 80) return "hsl(142, 71%, 45%)";
  if (pct >= 60) return "hsl(48, 96%, 53%)";
  if (pct >= 40) return "hsl(25, 95%, 53%)";
  return "hsl(0, 84%, 60%)";
}

export default function SectionCard({ category, blurred }: SectionCardProps) {
  const pct = Math.round((category.score / category.maxScore) * 100);
  const color = scoreColor(pct);
  const strengths = category.findings.filter((f) => f.passed);
  const issues = category.findings.filter((f) => !f.passed);

  return (
    <div
      className={`rounded-xl border border-border bg-card p-5 sm:p-6 ${
        blurred ? "blur-sm select-none pointer-events-none" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">
          {category.label}
        </h3>
        <span
          className="text-sm font-bold px-2 py-0.5 rounded-full"
          style={{ color, backgroundColor: `${color}15` }}
        >
          {category.score}/{category.maxScore}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted mb-5">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            What you're doing right
          </h4>
          <ul className="space-y-2">
            {strengths.map((f) => (
              <li key={f.id} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <span className="text-sm text-foreground leading-relaxed">
                  {f.personalized || f.generic}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Issues */}
      {issues.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Easy wins to fix
          </h4>
          <ul className="space-y-2">
            {issues.map((f) => (
              <li key={f.id} className="flex items-start gap-2">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <span className="text-sm text-foreground leading-relaxed">
                  {f.personalized || f.generic}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
