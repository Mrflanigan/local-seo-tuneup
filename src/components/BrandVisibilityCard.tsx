import type { BrandVisibilityData } from "@/lib/scoring/types";
import { CheckCircle2, XCircle, AlertTriangle, Globe, Search, Building2 } from "lucide-react";

interface Props {
  data: BrandVisibilityData;
}

function StatusIcon({ found, position }: { found: boolean; position: number | null }) {
  if (found && (position ?? 99) <= 3) return <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />;
  if (found) return <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />;
  return <XCircle className="h-5 w-5 text-red-500 shrink-0" />;
}

function SearchRow({
  icon,
  label,
  query,
  found,
  position,
}: {
  icon: React.ReactNode;
  label: string;
  query: string;
  found: boolean;
  position: number | null;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <StatusIcon found={found} position={position} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Search: <span className="font-mono text-foreground/70">"{query}"</span>
          {found ? (
            <span className="ml-2 text-green-500">
              Found at #{position}
            </span>
          ) : (
            <span className="ml-2 text-red-400">Not found</span>
          )}
        </p>
      </div>
    </div>
  );
}

export default function BrandVisibilityCard({ data }: Props) {
  const checks = [data.indexed, data.domainSearch, data.brandNameSearch].filter(Boolean);
  const passed = checks.filter((c) => c!.found).length;
  const total = checks.length;

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">Brand Visibility</h3>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground">
          {passed}/{total} passed
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {data.summary}
      </p>

      <div className="divide-y divide-border/50">
        <SearchRow
          icon={<Globe className="h-3.5 w-3.5 text-muted-foreground" />}
          label="Google Index"
          query={data.indexed.query}
          found={data.indexed.found}
          position={data.indexed.position}
        />
        <SearchRow
          icon={<Search className="h-3.5 w-3.5 text-muted-foreground" />}
          label="Domain Ranking"
          query={data.domainSearch.query}
          found={data.domainSearch.found}
          position={data.domainSearch.position}
        />
        {data.brandNameSearch && (
          <SearchRow
            icon={<Building2 className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Brand Name Search"
            query={data.brandNameSearch.query}
            found={data.brandNameSearch.found}
            position={data.brandNameSearch.position}
          />
        )}
      </div>

      <p className="text-[10px] text-muted-foreground/50 mt-4">
        Informational only — does not affect your 100-point score.
      </p>
    </div>
  );
}
