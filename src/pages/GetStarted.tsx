import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UrlInputForm from "@/components/UrlInputForm";
import ScanningView from "@/components/ScanningView";
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
  const [scanKeywords, setScanKeywords] = useState<KeywordVolume[] | null>(null);
  const [scanRankPage, setScanRankPage] = useState<number | null>(null);
  const [scanCity, setScanCity] = useState<string | undefined>();
  const [scanBusinessName, setScanBusinessName] = useState<string | undefined>();

  const handleSubmit = async (url: string, city?: string, businessType?: BusinessType, _searchPhrases?: string[], businessName?: string, description?: string) => {
    setLoading(true);
    setScanUrl(url);
    setScanKeywords(null);
    setScanRankPage(null);
    setScanCity(city);
    setScanBusinessName(businessName);

    try {
      // Step 1: If we have a description, generate real search phrases
      let searchPhrases: string[] | undefined = _searchPhrases;
      let keywordVolumes: KeywordVolume[] | null = null;
      if (description) {
        try {
          const { data, error } = await supabase.functions.invoke('generate-phrases', {
            body: { description, city, businessName },
          });
          if (!error && data?.success && data.phrases?.length > 0) {
            searchPhrases = data.phrases;
            keywordVolumes = data.volumes || null;
            // Pass keywords to scanning view so they appear during the scan
            if (keywordVolumes) {
              setScanKeywords(keywordVolumes);
            }
          }
        } catch (e) {
          console.warn('Phrase generation failed, continuing without:', e);
        }
      }

      // Step 2: Run the checkup
      const result: ScoringResult = await runCheckup({ url, city, businessType, searchPhrases });
      // Extract best rank page for the page-flash animation
      const bestRank = result.phraseOptics?.rankings
        ?.filter((r) => r.page !== null)
        ?.sort((a, b) => (a.page ?? 99) - (b.page ?? 99))[0];
      if (bestRank?.page) {
        setScanRankPage(bestRank.page);
      }
      try {
        localStorage.setItem("lastScan", JSON.stringify({ result, url, city, businessType, searchPhrases, businessName, description, keywordVolumes, ts: Date.now() }));
      } catch { /* storage full */ }
      // Small delay so user sees the rank page flash before navigating
      await new Promise((r) => setTimeout(r, 3000));
      navigate("/report", { state: { result, url, city, businessType, searchPhrases, businessName, keywordVolumes } });
    } catch (err) {
      toast.error("Something went wrong scanning that site. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ScanningView url={scanUrl} keywords={scanKeywords} rankPage={scanRankPage} city={scanCity} businessName={scanBusinessName} />;

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
              Enter your website to run your complimentary Google checkup.
            </h1>
            <p className="text-lg text-white/70 mb-10">
              Tell us what you do — we'll find the search terms that matter and show you where you stand.
            </p>

            <UrlInputForm onSubmit={handleSubmit} loading={loading} />

            <p
              className="text-sm text-white/40 mt-6"
              style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
            >
              No signup · Complimentary instant audit · Real data from your site
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
