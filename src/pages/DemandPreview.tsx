import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, TrendingUp, Globe, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScan } from "@/contexts/ScanContext";
import ScanningView from "@/components/ScanningView";
import type { BusinessType } from "@/lib/scoring/types";
import peakBg from "@/assets/getstarted-peak.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScan } from "@/contexts/ScanContext";
import type { BusinessType } from "@/lib/scoring/types";
import peakBg from "@/assets/getstarted-peak.jpg";

interface DemandState {
  description: string;
  phrases: string[];
  volumes: { keyword: string; monthlySearches: number; competition: string | null; cpc: number | null }[] | null;
}

export default function DemandPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { scan, startScan } = useScan();

  const state = (location.state as DemandState) || { description: "", phrases: [], volumes: null };

  const [url, setUrl] = useState("");
  const [city, setCity] = useState("");
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

    const inferredType: BusinessType = city.trim() ? "local" : "online";

    startScan(
      cleanUrl,
      city.trim() || undefined,
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
      <div className="absolute inset-0 bg-black/50" />

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
            STEP 2 OF 2
          </div>
        </div>

        {/* Demand summary — full width */}
        <div className="mb-10">
          <h1
            className="text-3xl sm:text-4xl font-bold text-white mb-6"
            style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
          >
            Here's what we found.
          </h1>

          {serviceCount > 0 && (
            <div className="space-y-4 mb-8">
              <p className="text-lg text-white/80">
                From what you told us, we see <span className="text-white font-bold">{serviceCount} main service{serviceCount !== 1 ? "s" : ""}</span>:
              </p>

              <div className="flex flex-wrap gap-2">
                {state.phrases.map((phrase) => {
                  const vol = state.volumes?.find((v) => v.keyword === phrase);
                  return (
                    <div
                      key={phrase}
                      className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/90 flex items-center gap-2"
                    >
                      <span>{phrase}</span>
                      {vol && (
                        <span className="text-primary text-xs font-semibold flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {vol.monthlySearches.toLocaleString()}/mo
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {totalVolume !== null && totalVolume > 0 && (
                <p className="text-lg text-white/70">
                  In your general area, we're seeing approximately{" "}
                  <span className="text-white font-bold">{totalVolume.toLocaleString()} searches/month</span>{" "}
                  across these services.
                </p>
              )}

              <p className="text-lg text-white/80 mt-2">
                Next, we'll look at your website and see how well it connects you to this demand.
              </p>
            </div>
          )}

          {serviceCount === 0 && (
            <p className="text-lg text-white/70 mb-8">
              We couldn't extract specific phrases yet — but that's okay. Enter your site below and we'll analyze it against your description.
            </p>
          )}
        </div>

        {/* Site input — full width */}
        <form onSubmit={handleScan} className="w-full space-y-4">
          {/* URL */}
          <div className="space-y-1 text-left">
            <p className="text-sm text-white/70">Your website</p>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input
                type="text"
                placeholder="yourdomain.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                disabled={scan.loading}
              />
            </div>
          </div>

          {/* City */}
          <div className="space-y-1 text-left">
            <p className="text-sm text-white/70">Primary service area (city or ZIP)</p>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input
                type="text"
                placeholder="e.g. Seattle, WA"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="pl-10 h-12 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                disabled={scan.loading}
              />
            </div>
          </div>

          {/* Business name (optional) */}
          <div className="space-y-1 text-left">
            <p className="text-sm text-white/70">Business name (optional)</p>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input
                type="text"
                placeholder="e.g. Acme Remodeling"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="pl-10 h-12 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                disabled={scan.loading}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={scan.loading || !url.trim()}
            className="h-14 px-10 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 italic"
            size="lg"
            style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
          >
            Scan my website against this demand
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-auto pt-8 pb-4 text-right">
          <p className="text-[11px] tracking-widest text-white/50 uppercase">
            Burj Khalifa · Dubai · 2,717 ft · Tallest structure ever built
          </p>
        </div>
      </div>
    </div>
  );
}
