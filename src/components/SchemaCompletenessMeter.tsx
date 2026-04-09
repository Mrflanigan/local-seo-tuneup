import { Database, Copy, Check, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { SchemaCompletenessData } from "@/lib/scoring/types";
import { toast } from "sonner";

interface Props {
  data: SchemaCompletenessData;
}

export default function SchemaCompletenessMeter({ data }: Props) {
  const [copied, setCopied] = useState(false);
  const [showJsonLd, setShowJsonLd] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.pasteReadyJsonLd);
    setCopied(true);
    toast.success("JSON-LD copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const total = data.totalRequired + data.totalRecommended;
  const filled = data.foundFields.length;
  const barWidth = Math.round((filled / total) * 100);

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            LocalBusiness Schema Completeness
          </h3>
          <p className="text-xs text-muted-foreground">
            {filled}/{total} fields complete · {data.completenessPercent}%
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted/50 rounded-full h-3 mb-4">
        <div
          className={`h-3 rounded-full transition-all ${barWidth >= 80 ? "bg-green-500" : barWidth >= 50 ? "bg-accent" : "bg-destructive"}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* Missing fields */}
      {data.missingRequired.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            <p className="text-xs font-semibold text-destructive">Missing required fields</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.missingRequired.map(field => (
              <span key={field} className="text-[10px] font-mono bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.missingRecommended.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-accent" />
            <p className="text-xs font-semibold text-accent">Missing recommended fields</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.missingRecommended.map(field => (
              <span key={field} className="text-[10px] font-mono bg-accent/10 text-accent px-2 py-0.5 rounded">
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.foundFields.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            <p className="text-xs font-semibold text-green-600 dark:text-green-400">Fields present</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.foundFields.map(field => (
              <span key={field} className="text-[10px] font-mono bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded">
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Paste-ready JSON-LD */}
      <div className="border-t border-border/50 pt-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowJsonLd(!showJsonLd)}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {showJsonLd ? "Hide" : "Show"} paste-ready JSON-LD
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border/50 bg-muted/50 hover:bg-muted"
          >
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied!" : "Copy JSON-LD"}
          </button>
        </div>
        {showJsonLd && (
          <pre className="rounded-lg bg-background/60 border border-border/30 p-3 text-[11px] font-mono text-muted-foreground overflow-x-auto max-h-80 whitespace-pre-wrap">
            {data.pasteReadyJsonLd}
          </pre>
        )}
      </div>

      {/* Owner-friendly explanation */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-sm text-muted-foreground leading-relaxed">
          LocalBusiness schema is the structured data that tells Google your business name, address, hours, and services in a format it can instantly read.
          The more complete your schema, the better chance you have of appearing in local search features like the Map Pack, Knowledge Panel, and rich results.
          {data.missingRequired.length > 0
            ? ` You're missing ${data.missingRequired.length} required field${data.missingRequired.length > 1 ? "s" : ""} — adding ${data.missingRequired.length === 1 ? "it" : "these"} should be your first priority.`
            : data.missingRecommended.length > 0
              ? ` Your required fields are covered — adding the ${data.missingRecommended.length} recommended field${data.missingRecommended.length > 1 ? "s" : ""} will strengthen your local signals.`
              : " Your schema is fully complete — excellent work!"}
        </p>
      </div>
    </div>
  );
}
