import type { BacklinkSummaryData } from "@/lib/scoring/types";
import { Link2, Globe, Shield, TrendingUp } from "lucide-react";

interface BacklinkCardProps {
  data: BacklinkSummaryData;
}

function getRankLabel(rank: number): { label: string; color: string } {
  if (rank >= 70) return { label: "Strong", color: "text-green-400" };
  if (rank >= 40) return { label: "Moderate", color: "text-yellow-400" };
  if (rank >= 15) return { label: "Growing", color: "text-orange-400" };
  return { label: "New / Weak", color: "text-red-400" };
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function BacklinkCard({ data }: BacklinkCardProps) {
  const rankInfo = getRankLabel(data.domainRank);
  const followPercent = data.totalBacklinks > 0
    ? Math.round((data.followLinks / data.totalBacklinks) * 100)
    : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10">
          <Link2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Backlink Profile</h3>
          <p className="text-xs text-muted-foreground">
            How many other sites link to yours — a key trust signal for Google
          </p>
        </div>
      </div>

      {/* Domain Rank hero */}
      <div className="flex items-center justify-center gap-6 mb-5 p-4 rounded-lg bg-muted/30">
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground">{data.domainRank}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Domain Rank</div>
          <div className={`text-xs font-semibold mt-1 ${rankInfo.color}`}>{rankInfo.label}</div>
        </div>
        <div className="h-12 w-px bg-border" />
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground">{formatNumber(data.referringDomains)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Referring Domains</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20">
          <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <div className="text-sm font-semibold text-foreground">{formatNumber(data.totalBacklinks)}</div>
            <div className="text-xs text-muted-foreground">Total Backlinks</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20">
          <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <div className="text-sm font-semibold text-foreground">{followPercent}% follow</div>
            <div className="text-xs text-muted-foreground">Link Quality</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20">
          <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <div className="text-sm font-semibold text-foreground">{formatNumber(data.referringIps)}</div>
            <div className="text-xs text-muted-foreground">Unique IPs</div>
          </div>
        </div>
        {data.brokenBacklinks > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10">
            <Link2 className="h-4 w-4 text-destructive shrink-0" />
            <div>
              <div className="text-sm font-semibold text-destructive">{formatNumber(data.brokenBacklinks)}</div>
              <div className="text-xs text-muted-foreground">Broken Links</div>
            </div>
          </div>
        )}
      </div>

      {/* Interpretation */}
      <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
        {data.domainRank === 0
          ? "Your site has no measurable domain authority yet. Building even a handful of quality backlinks from local directories, partners, or industry sites will start moving this needle."
          : data.referringDomains < 10
            ? `You have ${data.referringDomains} unique site${data.referringDomains === 1 ? "" : "s"} linking to you. For local SEO, getting listed in quality directories and earning links from local organizations can quickly boost your authority.`
            : data.referringDomains < 50
              ? `${data.referringDomains} referring domains is a solid start. Focus on earning links from industry-relevant sites and local organizations to strengthen your profile.`
              : `${data.referringDomains} referring domains is a strong backlink profile. Continue building quality relationships and monitor for any broken links that need fixing.`}
      </p>
    </div>
  );
}
