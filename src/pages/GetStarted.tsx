import { useState, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UrlInputForm from "@/components/UrlInputForm";
import ScanningView from "@/components/ScanningView";
import KeywordTeaser from "@/components/KeywordTeaser";
import { Button } from "@/components/ui/button";
import { runCheckup } from "@/lib/api/checkup";
import { supabase } from "@/integrations/supabase/client";
import type { ScoringResult, BusinessType } from "@/lib/scoring/types";
import { toast } from "sonner";
import peakBg from "@/assets/getstarted-peak.jpg";

type KeywordVolume = { keyword: string; monthlySearches: number; competition: string | null; cpc: number | null };

export default function GetStarted() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scanUrl, setScanUrl] = useState("");

  // Teaser state
  const [teaserKeywords, setTeaserKeywords] = useState<KeywordVolume[] | null>(null);
  const [pendingScan, setPendingScan] = useState<{
    url: string; city?: string; businessType?: BusinessType;
    searchPhrases?: string[]; businessName?: string; description?: string;
    keywordVolumes: KeywordVolume[] | null;
  } | null>(null);

  const continueScan = useCallback(async (params: NonNullable<typeof pendingScan>) => {
    setTeaserKeywords(null);
    setPendingScan(null);
    setLoading(true);
    setScanUrl(params.url);

    try {
      const result: ScoringResult = await runCheckup({
        url: params.url,
        city: params.city,
        businessType: params.businessType,
        searchPhrases: params.searchPhrases,
      });
      try {
        localStorage.setItem("lastScan", JSON.stringify({
          result, url: params.url, city: params.city, businessType: params.businessType,
          searchPhrases: params.searchPhrases, businessName: params.businessName,
          description: params.description, keywordVolumes: params.keywordVolumes, ts: Date.now(),
        }));
      } catch { /* storage full */ }
      navigate("/report", {
        state: {
          result, url: params.url, city: params.city,
          businessType: params.businessType, searchPhrases: params.searchPhrases,
          businessName: params.businessName, keywordVolumes: params.keywordVolumes,
        },
      });
    } catch (err) {
      toast.error("Something went wrong scanning that site. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleSubmit = async (
    url: string, city?: string, businessType?: BusinessType,
    _searchPhrases?: string[], businessName?: string, description?: string
  ) => {
    let searchPhrases: string[] | undefined = _searchPhrases;
    let keywordVolumes: KeywordVolume[] | null = null;

    // Step 1: Get real keywords from DataForSEO
    if (description) {
      setLoading(true);
      setScanUrl(url);
      try {
        const { data, error } = await supabase.functions.invoke('generate-phrases', {
          body: { description, city, businessName },
        });
        if (!error && data?.success && data.phrases?.length > 0) {
          searchPhrases = data.phrases;
          keywordVolumes = data.volumes || null;
        }
      } catch (e) {
        console.warn('Phrase generation failed, continuing without:', e);
      }
      setLoading(false);
    }

    const scanParams = { url, city, businessType, searchPhrases, businessName, description, keywordVolumes };

    // Step 2: If we got keyword volumes, show the teaser ONCE
    const teaserKey = `kw_teaser_${url}`;
    if (keywordVolumes && keywordVolumes.length > 0 && !sessionStorage.getItem(teaserKey)) {
      sessionStorage.setItem(teaserKey, "shown");
      setTeaserKeywords(keywordVolumes);
      setPendingScan(scanParams);
      return; // Wait for teaser dismiss
    }

    // No teaser — go straight to scan
    await continueScan(scanParams);
  };

  const handleTeaserDismiss = () => {
    if (pendingScan) {
      continueScan(pendingScan);
    }
  };

  if (loading) return <ScanningView url={scanUrl} />;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src={peakBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Keyword teaser overlay */}
      {teaserKeywords && (
        <KeywordTeaser keywords={teaserKeywords} onDismiss={handleTeaserDismiss} />
      )}

      <div className="relative z-10 flex min-h-screen w-full flex-col px-8 sm:px-16 py-6">
        <div className="mb-8 flex items-start justify-between gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/")}
            className="h-auto px-0 text-base font-semibold text-white/80 hover:bg-transparent hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
          <div className="text-base font-semibold tracking-[0.2em] text-white/40">
            PAGE 2
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full">
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white"
              style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
            >
              Enter your website to run your free Google checkup.
            </h1>
            <p className="text-lg text-white/70 mb-10">
              Tell us what you do — we'll find the search terms that matter and show you where you stand.
            </p>

            <UrlInputForm onSubmit={handleSubmit} loading={loading} />

            <p
              className="text-sm text-white/40 mt-6"
              style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
            >
              No signup · Free instant audit · Real data from your site
            </p>
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
