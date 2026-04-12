import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, TrendingUp, Globe, MapPin, Building2, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScan } from "@/contexts/ScanContext";
import ScanningView from "@/components/ScanningView";
import type { BusinessType } from "@/lib/scoring/types";
import peakBg from "@/assets/getstarted-peak.jpg";

interface DemandState {
  description: string;
  city: string;
  phrases: string[];
  volumes: { keyword: string; monthlySearches: number; competition: string | null; cpc: number | null }[] | null;
}

export default function DemandPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { scan, startScan } = useScan();

  const state = (location.state as DemandState) || { description: "", city: "", phrases: [], volumes: null };

  const [url, setUrl] = useState("");
  const [businessName, setBusinessName] = useState("");

  // Compute total monthly volume
  const totalVolume = state.volumes
    ? state.volumes.reduce((sum, v) => sum + (v.monthlySearches || 0), 0)
    : null;

  const serviceCount = state.phrases.length;

  const handleScan = (e?: React.FormEvent) => {
    e?.preventDefault();
    let cleanUrl = url.trim();
    if (!cleanUrl) return;
    if (!cleanUrl.startsWith("http")) cleanUrl = "https://" + cleanUrl;
    const inferredType: BusinessType = state.city ? "local" : "online";

    startScan(
      cleanUrl,
      state.city || undefined,
      inferredType,
      state.phrases.length > 0 ? state.phrases : undefined,
      businessName.trim() || undefined,
      state.description || undefined,
    );
  };

  // If scanning, show the scanning view
  if (scan.loading) {
    return <ScanningView url={scan.url} keywords={scan.keywords} rankPage={scan.rankPage} city={scan.city} businessName={scan.businessName} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src={peakBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-black/55" />

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
            PAGE 3
          </div>
        </div>

        {/* Demand results — volume-only, no phrases */}
        <div className="mt-auto pt-24 mb-6 space-y-6">

          {/* The big reveal — demand volume */}
          {totalVolume !== null && totalVolume > 0 ? (
            <>
              <p className="text-xl sm:text-2xl text-white/80 leading-relaxed">
                Based on what you told us…
              </p>

              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-5xl sm:text-7xl font-bold text-primary tracking-tight">
                  {totalVolume.toLocaleString()}
                </span>
                <span className="text-2xl sm:text-3xl text-white/70 font-light">
                  searches / month
                </span>
              </div>

              <p className="text-lg sm:text-xl text-white/70 leading-relaxed">
                That's how many people are actively looking for what you do — every single month.
                {serviceCount > 0 && (
                  <span className="text-white/50"> Across {serviceCount} service area{serviceCount !== 1 ? "s" : ""} we identified from your description.</span>
                )}
              </p>

              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Users className="h-4 w-4" />
                <span>Real search data from one of the world's largest keyword research platforms</span>
              </div>

              <div className="h-px bg-white/10 my-2" />

              <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
                The demand is already there. Now let's see if your website is connecting you to it — or leaving those customers for someone else.
              </p>
            </>
          ) : serviceCount > 0 ? (
            <>
              <p className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                We heard you.
              </p>
              <p className="text-lg text-white/70 leading-relaxed">
                We identified {serviceCount} service area{serviceCount !== 1 ? "s" : ""} from your description.
                Now let's check if your website is positioned to capture that demand.
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                We heard you.
              </p>
              <p className="text-lg text-white/70 leading-relaxed">
                Now let's look at your website and see how well it connects you to the people searching for what you do.
              </p>
            </>
          )}
        </div>

        {/* Site input — full width */}
        <form onSubmit={handleScan} className="w-full space-y-4 mb-6">
          <p className="text-lg font-semibold text-white tracking-tight">
            Now — your website.
          </p>

          {/* URL */}
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

          {/* City + Business name side by side */}
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
              "Scan My Site Against This Demand"
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
