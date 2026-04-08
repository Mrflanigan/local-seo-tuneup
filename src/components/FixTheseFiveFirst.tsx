import type { ScoringResult, Finding, CategoryResult } from "@/lib/scoring/types";
import { AlertTriangle, User, PenLine, Code } from "lucide-react";

const IMPACT_ORDER = { High: 0, Medium: 1, Low: 2 } as const;
const EFFORT_ORDER = { Owner: 0, Content: 1, Developer: 2 } as const;

const EFFORT_LABEL: Record<string, { label: string; icon: typeof User }> = {
  Owner: { label: "You can do this", icon: User },
  Content: { label: "Content update", icon: PenLine },
  Developer: { label: "Developer task", icon: Code },
};

const IMPACT_COLORS: Record<string, string> = {
  High: "text-red-400 bg-red-400/10 border-red-400/20",
  Medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  Low: "text-muted-foreground bg-muted/30 border-border/50",
};

function getCategoryLabel(categories: CategoryResult[], findingId: string): string {
  for (const cat of categories) {
    if (cat.findings.some((f) => f.id === findingId)) return cat.label;
  }
  return "";
}

interface Props {
  result: ScoringResult;
}

export default function FixTheseFiveFirst({ result }: Props) {
  // Collect all failed findings with impact/effort
  const failed: (Finding & { categoryLabel: string })[] = result.categories
    .flatMap((cat) =>
      cat.findings
        .filter((f) => !f.passed && f.impact)
        .map((f) => ({ ...f, categoryLabel: cat.label }))
    );

  // Sort: High impact first, then within same impact prefer lower effort
  failed.sort((a, b) => {
    const impA = IMPACT_ORDER[a.impact ?? "Low"];
    const impB = IMPACT_ORDER[b.impact ?? "Low"];
    if (impA !== impB) return impA - impB;
    const effA = EFFORT_ORDER[a.effort ?? "Developer"];
    const effB = EFFORT_ORDER[b.effort ?? "Developer"];
    if (effA !== effB) return effA - effB;
    return b.maxPoints - a.maxPoints;
  });

  const top5 = failed.slice(0, 5);

  if (top5.length === 0) return null;

  return (
    <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 sm:p-6 mb-8">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-bold text-foreground">Fix These {top5.length} First</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        The changes that will make the biggest difference, in the order we'd tackle them.
      </p>
      <ol className="space-y-3">
        {top5.map((f, i) => {
          const effort = EFFORT_LABEL[f.effort ?? "Developer"];
          const EffortIcon = effort.icon;
          return (
            <li key={f.id} className="flex gap-3">
              <span className="shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-accent/20 text-accent text-sm font-bold mt-0.5">
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="font-semibold text-foreground text-sm">{f.generic}</span>
                  <span className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded border font-medium ${IMPACT_COLORS[f.impact ?? "Low"]}`}>
                    {f.impact} Impact
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-border/50 bg-muted/30 text-muted-foreground font-medium">
                    <EffortIcon className="h-2.5 w-2.5" />
                    {effort.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.personalized}</p>
                <span className="text-[10px] text-muted-foreground/60">{f.categoryLabel}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
