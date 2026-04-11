import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, Globe, MapPin, Building2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScanningView from "@/components/ScanningView";
import { useScan } from "@/contexts/ScanContext";
import type { BusinessType } from "@/lib/scoring/types";
import peakBg from "@/assets/getstarted-peak.jpg";

type KeywordVolume = {
  keyword: string;
  monthlySearches: number;
  competition: string | null;
  cpc: number | null;
};

interface DemandState {
  description: string;
  phrases: string[];
  volumes: KeywordVolume[] | null;
}

export default function DemandPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { scan, startScan } = useScan();

  // Load demand data from navigation state or localStorage
  const demandData: DemandState | null = (() => {
    const state = location.state as DemandState | null;
    if (state?.description) return state;
    try {
      const raw = localStorage.getItem("demandResult");
      if (raw) return JSON.parse(raw) as DemandState;
    } catch {}
    return null;
  })();

  const [url, setUrl] = useState(() => {
    try { return localStorage.getItem("seo-form-inputs") ? JSON.parse(localStorage.getItem("seo-form-inputs")!).url || "" : ""; } catch { return ""; }
  });
  const [city, setCity] = useState(() => {
    try { return localStorage.getItem("seo-form-inputs") ? JSON.parse(localStorage.getItem("seo-form-inputs")!).city || "" : ""; } catch { return ""; }
  });
  const [businessName, setBusinessName] = useState(() => {
    try { return localStorage.getItem("seo-form-inputs") ? JSON.parse(localStorage.getItem("seo-form-inputs")!).businessName || "" : ""; } catch { return ""; }
  });

  // Persist form inputs
  useEffect(() => {
    try {
      localStorage.setItem("seo-form-inputs", JSON.stringify({ url, city, businessName }));
    } catch {}
  }, [url, city, businessName]);

  // If no demand data, redirect back
  useEffect(() => {
    if (!demandData) {
      navigate("/get-started");
    }
  }, [demandData, navigate]);

  if (!demandData) return null;

  const totalVolume = demandData.volumes
    ?.reduce((sum, v) => sum + v.monthlySearches, 0) || 0;

  const serviceCount = demandData.phrases.length;

  const handleScanSite = () => {
    let cleanUrl = url.trim();
    if (!cleanUrl) return;
    if (!cleanUrl.startsWith("http")) cleanUrl = "https://" + cleanUrl;
    const inferredType: BusinessType = city.trim() ? "local" : "online";

    startScan(
      cleanUrl,
      city.trim() || undefined,
      inferredType,
      demandData.phrases,
      businessName.trim() || undefined,
      demandData.description,
    );
  };

  if (scan.loading) {
    return (
      <ScanningView
        url={scan.url}
        keywords={scan.keywords || demandData.volumes}
        rankPage={scan.rankPage}
        city={scan.city}
        businessName={scan.businessName}
      />
    );
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
        <div className="mb-8 flex items-start justify-between gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/get-started")}
            className="h-auto px-0 text-base font-semibold text-white/80 hover:bg-transparent hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
          <div className="text-base font-semibold tracking-[0.2em] text-white/40">
            STEP 2 OF 2
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-2xl space-y-8">
            {/* Demand summary */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <h2
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
                >
                  Demand found
                </h2>
              </div>

              <p className="text-sm text-white/70 leading-relaxed">
                From what you told us, we see <span className="text-white font-semibold">{serviceCount} main search themes</span>:
              </p>

              {/* Phrase chips */}
              <div className="flex flex-wrap gap-2">
                {demandData.phrases.slice(0, 10).map((phrase) => {
                  const vol = demandData.volumes?.find((v) => v.keyword === phrase);
                  return (
                    <span
                      key={phrase}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white/90"
                    >
                      {phrase}
                      {vol && (
                        <span className="text-xs text-accent font-medium">
                          {vol.monthlySearches.toLocaleString()}/mo
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>

              {totalVolume > 0 && (
                <p className="text-sm text-white/60">
                  In your general area, we're seeing approximately{" "}
                  <span className="text-accent font-bold text-base">
                    {totalVolume.toLocaleString()}
                  </span>{" "}
                  searches/month across these services.
                </p>
              )}

              <p
                className="text-base text-white/80 pt-2 leading-relaxed"
                style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
              >
                Next, we'll look at your website and see how well it connects you to this demand.
              </p>
            </div>

            {/* Site input form */}
            <div className="space-y-3">
              {/* URL (required) */}
              <div className="space-y-1">
                <p className="text-xs text-white/60">Your website</p>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="yourbusiness.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-10 h-12 text-sm text-foreground placeholder:text-foreground/60 bg-white/10 border-white/20 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* City */}
              <div className="space-y-1">
                <p className="text-xs text-white/60">Primary service area</p>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="City or ZIP"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="pl-10 h-12 text-sm text-foreground placeholder:text-foreground/60 bg-white/10 border-white/20 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Business name (optional) */}
              <div className="space-y-1">
                <p className="text-xs text-white/60">Business name (optional)</p>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="e.g. Acme Remodeling"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="pl-10 h-12 text-sm text-foreground placeholder:text-foreground/60 bg-white/10 border-white/20 backdrop-blur-sm"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={handleScanSite}
                disabled={!url.trim() || scan.loading}
                className="h-14 px-10 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 italic disabled:opacity-50 w-full sm:w-auto"
                size="lg"
                style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
              >
                Scan my website against this demand
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-auto pb-4 text-right">
          <p className="text-[11px] tracking-widest text-white/50 uppercase">
            Burj Khalifa · Dubai · 2,717 ft · Tallest structure ever built
          </p>
        </div>
      </div>
    </div>
  );
}
