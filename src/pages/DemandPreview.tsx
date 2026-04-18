import { useLocation, useNavigate } from "react-router-dom";
import { cleanUrl } from "@/lib/utils";
import { useState } from "react";
import { ArrowLeft, Globe, Building2, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScan } from "@/contexts/ScanContext";
import ScanNarrative from "@/components/ScanNarrative";
import SeedExpansionReveal, { type SeedExpansion } from "@/components/SeedExpansionReveal";
import InterpretationCard, { type InputInterpretation } from "@/components/InterpretationCard";
import type { BusinessType } from "@/lib/scoring/types";
import peakBg from "@/assets/getstarted-peak.jpg";

interface IntentBucket {
  id: string;
  name: string;
  keywords: { keyword: string; search_volume: number }[];
  total_search_volume: number;
  canonical_phrases: string[];
}

interface BucketDifficultyInfo {
  avgCompetitorRank: number;
  level: string;
  color: string;
  topCompetitors: string[];
}

interface DemandState {
  description: string;
  whoYouServe?: string;
  city: string;
  phrases: string[];
  volumes: { keyword: string; monthlySearches: number; competition: string | null; cpc: number | null }[] | null;
  intentBuckets: IntentBucket[] | null;
  bucketDifficulty: Record<string, BucketDifficultyInfo> | null;
  totalDemand: number | null;
  seedExpansion?: SeedExpansion | null;
  interpretation?: InputInterpretation | null;
}

export default function DemandPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { scan, startScan } = useScan();

  const state = (location.state as DemandState) || {
    description: "", city: "", phrases: [], volumes: null, intentBuckets: null, bucketDifficulty: null, totalDemand: null, seedExpansion: null, interpretation: null,
  };

  const [url, setUrl] = useState("");
  const [businessName, setBusinessName] = useState("");

  const totalVolume = state.totalDemand
    ?? (state.volumes ? state.volumes.reduce((sum, v) => sum + (v.monthlySearches || 0), 0) : null);

  // Get top phrases from the biggest bucket, or fall back to volumes
  const topPhrases: { keyword: string; volume: number }[] = [];
  if (state.intentBuckets && state.intentBuckets.length > 0) {
    const sorted = [...state.intentBuckets].sort((a, b) => b.total_search_volume - a.total_search_volume);
    for (const bucket of sorted) {
      for (const kw of bucket.keywords) {
        if (topPhrases.length < 5) {
          topPhrases.push({ keyword: kw.keyword, volume: kw.search_volume });
        }
      }
    }
  } else if (state.volumes) {
    for (const v of state.volumes.slice(0, 5)) {
      topPhrases.push({ keyword: v.keyword, volume: v.monthlySearches });
    }
  }

  const cityDisplay = state.city || "your area";

  const handleScan = (e?: React.FormEvent) => {
    e?.preventDefault();
    const normalizedUrl = cleanUrl(url);
    if (!normalizedUrl) return;
    const inferredType: BusinessType = state.city ? "local" : "online";

    startScan(
      normalizedUrl,
      state.city || undefined,
      inferredType,
      state.phrases.length > 0 ? state.phrases : undefined,
      businessName.trim() || undefined,
      state.description || undefined,
    );
  };

  const isScanning = scan.loading;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src={peakBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex min-h-screen w-full flex-col px-8 sm:px-16 py-6">
        {/* Top bar */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/demand-intake")}
            className="h-auto px-0 text-base font-semibold text-white/80 hover:bg-transparent hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
          <div className="text-base font-semibold tracking-[0.2em] text-white/40">
            DEMAND SNAPSHOT
          </div>
        </div>

        {/* Demand Snapshot content — fixed-min-height slot to prevent layout shift on swap */}
        <div className="mt-auto pt-16 mb-6 space-y-6 min-h-[28rem]">

          {isScanning ? (
            <ScanNarrative url={scan.url} />
          ) : totalVolume !== null && totalVolume > 0 ? (
            <>
              {/* Headline */}
              <p className="text-xl sm:text-2xl font-semibold text-white/90 leading-snug">
                Because we asked about you, we found the people looking for you.
              </p>

              {/* Context copy */}
              <p className="text-base sm:text-lg text-white/60 leading-relaxed">
                Most tools jump straight to your website. We started with your company — what you do
                best and where you do it. Because we asked that first, we were able to find the exact
                searches real people in <span className="text-white font-medium">{cityDisplay}</span> are
                typing when they need a business like yours.
              </p>

              {/* Intent buckets with difficulty */}
              {state.intentBuckets && state.intentBuckets.length > 0 ? (
                <div className="space-y-4">
                  {state.intentBuckets.slice(0, 4).map((bucket) => {
                    const diff = state.bucketDifficulty?.[bucket.id];
                    return (
                      <div key={bucket.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                            {bucket.name}
                          </span>
                          {diff && (
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${diff.color}20`, color: diff.color }}
                            >
                              {diff.level} · DR {diff.avgCompetitorRank}
                            </span>
                          )}
                        </div>
                        {bucket.keywords.slice(0, 3).map((kw, i) => (
                          <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/10">
                            <span className="text-base text-white font-medium">
                              "{kw.keyword}"
                            </span>
                            <span className="text-primary font-bold text-base whitespace-nowrap ml-4">
                              {kw.search_volume.toLocaleString()} <span className="text-white/50 font-normal text-sm">/ mo</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ) : topPhrases.length > 0 ? (
                <div className="space-y-2">
                  {topPhrases.map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-base sm:text-lg text-white font-medium">
                        "{p.keyword}"
                      </span>
                      <span className="text-primary font-bold text-base sm:text-lg whitespace-nowrap ml-4">
                        {p.volume.toLocaleString()} <span className="text-white/50 font-normal text-sm">/ month</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Show our work — AI expansion reveal */}
              {state.seedExpansion && (
                <SeedExpansionReveal
                  description={state.description}
                  expansion={state.seedExpansion}
                />
              )}

              {/* Jaw-drop number */}
              <div className="py-4 space-y-2">
                <p className="text-sm text-white/50 uppercase tracking-widest font-semibold">
                  Total local demand
                </p>
                <div className="flex items-baseline gap-4 flex-wrap">
                  <span className="text-5xl sm:text-7xl font-bold text-primary tracking-tight">
                    {totalVolume.toLocaleString()}
                  </span>
                  <span className="text-xl sm:text-2xl text-white/60 font-light">
                    searches every month
                  </span>
                </div>
                <p className="text-base text-white/50 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary/70" />
                  We didn't assume demand. We looked it up.
                </p>
              </div>

              <div className="h-px bg-white/10" />

              {/* Bridge to scan */}
              <div className="space-y-2">
                <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
                  These words and phrases will fuel your <span className="text-white font-semibold">60-second site scan</span>.
                </p>
                <p className="text-base text-white/60 leading-relaxed">
                  Next, we'll check whether your website actually shows up for this demand — or
                  quietly hands these customers to somebody else.
                </p>
              </div>
            </>
          ) : state.phrases.length > 0 ? (
            <>
              <p className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                We heard you.
              </p>
              <p className="text-lg text-white/70 leading-relaxed">
                We identified {state.phrases.length} service area{state.phrases.length !== 1 ? "s" : ""} from your description.
                Now let's check if your website is positioned to capture that demand.
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                We heard you.
              </p>
              <p className="text-lg text-white/70 leading-relaxed">
                Now let's look at your website and see how well it connects you to the people
                searching for what you do.
              </p>
            </>
          )}
        </div>

        {/* Site input */}
        <form onSubmit={handleScan} className="w-full space-y-4 mb-6">
          <p className="text-lg font-semibold text-white tracking-tight">
            Now — your website.
          </p>

          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <Input
              type="text"
              placeholder="yourdomain.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10 h-14 text-lg bg-white/5 border-white/15 text-white placeholder:text-white/50 focus:border-primary rounded-xl"
              disabled={scan.loading}
            />
          </div>

          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <Input
              type="text"
              placeholder="Business name (optional)"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="pl-10 h-12 text-sm bg-white/5 border-white/15 text-white placeholder:text-white/50 focus:border-primary rounded-xl"
              disabled={scan.loading}
            />
          </div>

          <Button
            type="submit"
            disabled={scan.loading || !url.trim()}
            className="h-14 px-10 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 disabled:opacity-100 disabled:bg-primary disabled:text-primary-foreground tracking-tight"
            size="lg"
          >
            {scan.loading ? (
              <span className="flex items-center gap-3">
                <Search className="h-5 w-5 animate-pulse" />
                Scanning…
              </span>
            ) : (
              "Run My 60-Second Site Scan"
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="pb-4 text-right">
          <p className="text-[11px] tracking-widest text-white/40 uppercase">
            Burj Khalifa · Dubai · 2,717 ft · Tallest structure ever built
          </p>
        </div>
      </div>
    </div>
  );
}
