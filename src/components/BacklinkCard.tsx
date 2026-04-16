import type { BacklinkSummaryData } from "@/lib/scoring/types";
import { Link2, Globe, Shield, Server, AlertTriangle } from "lucide-react";

interface BacklinkCardProps {
  data: BacklinkSummaryData;
}

type AuthorityLabel = "underpowered" | "competitive" | "authoritative";

interface AuthorityClassification {
  label: AuthorityLabel;
  display: string;
  badgeClass: string;
}

function classifyAuthority(domainRank: number, referringDomains: number): AuthorityClassification {
  if (domainRank > 40 || referringDomains > 150) {
    return {
      label: "authoritative",
      display: "Authoritative",
      badgeClass: "bg-green-500/15 text-green-400 border-green-500/30",
    };
  }
  if ((domainRank >= 20 && domainRank <= 40) || (referringDomains >= 30 && referringDomains <= 150)) {
    return {
      label: "competitive",
      display: "Competitive",
      badgeClass: "bg-primary/15 text-primary border-primary/30",
    };
  }
  return {
    label: "underpowered",
    display: "Underpowered",
    badgeClass: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  };
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function getNarrative(label: AuthorityLabel, brokenCount: number): { summary: string; impact: string; broken?: string; fixHook: string } {
  const hasBroken = brokenCount > 0;

  if (label === "underpowered") {
    return {
      summary: "Your link profile is light for this space, so Google doesn't yet see you as a major player.",
      impact: "That means the toughest, most competitive phrases will be an uphill climb until your authority grows.",
      broken: hasBroken
        ? `You also have ${brokenCount} broken backlink${brokenCount === 1 ? "" : "s"}—fixing those can recover strength you already earned without chasing new links.`
        : undefined,
      fixHook: "We'll prioritize fixes that help you win where your current authority can compete, instead of chasing impossible phrases.",
    };
  }

  if (label === "competitive") {
    return {
      summary: "You're in the same strength range as other sites on page one.",
      impact: "With focused content and on-page improvements, you can realistically move up for the phrases we highlighted.",
      broken: hasBroken
        ? `Recovering ${brokenCount} broken backlink${brokenCount === 1 ? "" : "s"} is an easy way to solidify your current authority.`
        : undefined,
      fixHook: hasBroken
        ? "We can include recovering your broken backlinks in the $150 Fix Package so you don't lose strength you already paid for."
        : "Your Fix Package will focus on the on-page and content moves that turn this authority into rankings.",
    };
  }

  return {
    summary: "You have as much or more authority than many sites you compete with.",
    impact: "If rankings are lagging, it's likely a content, technical, or intent-match problem—not a link strength problem.",
    broken: hasBroken
      ? `Even with strong authority, reclaiming ${brokenCount} broken backlink${brokenCount === 1 ? "" : "s"} is low-hanging fruit.`
      : undefined,
    fixHook: hasBroken
      ? "We can include recovering your broken backlinks in the $150 Fix Package so you don't lose strength you already paid for."
      : "Your Fix Package will focus on the content and technical fixes that unlock this authority.",
  };
}

export default function BacklinkCard({ data }: BacklinkCardProps) {
  const authority = classifyAuthority(data.domainRank, data.referringDomains);
  const followPercent = data.totalBacklinks > 0
    ? Math.round((data.followLinks / data.totalBacklinks) * 100)
    : 0;
  const narrative = getNarrative(authority.label, data.brokenBacklinks);

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10">
          <Link2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Backlink Strength</h3>
          <p className="text-xs text-muted-foreground">Can you compete here?</p>
        </div>
      </div>

      {/* Domain Rank hero with authority badge */}
      <div className="flex items-center justify-between gap-4 mb-5 p-4 rounded-lg bg-muted/30">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{data.domainRank}</span>
            <span className="text-xs text-muted-foreground">/ 100 Domain Rank</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatNumber(data.referringDomains)} referring domain{data.referringDomains === 1 ? "" : "s"}
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${authority.badgeClass}`}>
          {authority.display}
        </div>
      </div>

      {/* Supporting stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
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
            <div className="text-xs text-muted-foreground">Follow Links</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20">
          <Server className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <div className="text-sm font-semibold text-foreground">{formatNumber(data.referringIps)}</div>
            <div className="text-xs text-muted-foreground">Unique IPs</div>
          </div>
        </div>
        <div className={`flex items-center gap-2 p-3 rounded-lg ${data.brokenBacklinks > 0 ? "bg-destructive/10" : "bg-muted/20"}`}>
          <AlertTriangle className={`h-4 w-4 shrink-0 ${data.brokenBacklinks > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          <div>
            <div className={`text-sm font-semibold ${data.brokenBacklinks > 0 ? "text-destructive" : "text-muted-foreground"}`}>
              {data.brokenBacklinks > 0 ? formatNumber(data.brokenBacklinks) : "None detected"}
            </div>
            <div className="text-xs text-muted-foreground">Broken Backlinks</div>
          </div>
        </div>
      </div>

      {/* Narrative */}
      <div className="space-y-2 text-sm leading-relaxed">
        <p className="text-foreground font-medium">{narrative.summary}</p>
        <p className="text-muted-foreground">{narrative.impact}</p>
        {narrative.broken && (
          <p className="text-muted-foreground">{narrative.broken}</p>
        )}
      </div>

      {/* Fix Package hook */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Fix Package: </span>
          {narrative.fixHook}
        </p>
      </div>
    </div>
  );
}
