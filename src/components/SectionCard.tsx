import { CheckCircle2, XCircle } from "lucide-react";
import type { CategoryResult } from "@/lib/scoring/types";

interface SectionCardProps {
  category: CategoryResult;
  blurred?: boolean;
}

export default function SectionCard({ category, blurred }: SectionCardProps) {
  const pct = Math.round((category.score / category.maxScore) * 100);

  return (
    <div className={`rounded-xl border border-border bg-card p-6 ${blurred ? "blur-sm select-none pointer-events-none" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{category.label}</h3>
        <span className="text-sm font-medium text-muted-foreground">
          {category.score}/{category.maxScore} pts
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted mb-5">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            backgroundColor: pct >= 80 ? "hsl(142,71%,45%)" : pct >= 60 ? "hsl(48,96%,53%)" : "hsl(0,84%,60%)",
          }}
        />
      </div>

      <ul className="space-y-3">
        {category.findings.map((f) => (
          <li key={f.id} className="flex items-start gap-2">
            {f.passed ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            )}
            <span className="text-sm text-foreground leading-relaxed">
              {f.personalized || f.generic}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
