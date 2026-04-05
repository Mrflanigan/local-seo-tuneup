import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UrlInputForm from "@/components/UrlInputForm";
import ScanningView from "@/components/ScanningView";
import { Button } from "@/components/ui/button";
import { runCheckup } from "@/lib/api/checkup";
import type { ScoringResult, BusinessType } from "@/lib/scoring/types";
import { toast } from "sonner";
import peakBg from "@/assets/getstarted-peak.jpg";

export default function GetStarted() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scanUrl, setScanUrl] = useState("");

  const handleSubmit = async (url: string, city?: string, businessType?: BusinessType, searchPhrases?: string[]) => {
    setLoading(true);
    setScanUrl(url);
    try {
      const result: ScoringResult = await runCheckup({ url, city, businessType });
      try {
        localStorage.setItem("lastScan", JSON.stringify({ result, url, city, businessType, ts: Date.now() }));
      } catch { /* storage full — not critical */ }
      navigate("/report", { state: { result, url, city, businessType } });
    } catch (err) {
      toast.error("Something went wrong scanning that site. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ScanningView url={scanUrl} />;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <img
        src={peakBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
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
              Let's check your site.
            </h1>
            <p className="text-lg text-white/70 mb-10">
              Enter your domain and a couple of search phrases your customers might use to find you.
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

        {/* Tribute */}
        <div className="mt-auto pb-4 text-right">
          <p className="text-[11px] tracking-widest text-white/20 uppercase">
            Burj Khalifa · Dubai · 2,717 ft · Tallest structure ever built
          </p>
        </div>
      </div>
    </div>
  );
}
