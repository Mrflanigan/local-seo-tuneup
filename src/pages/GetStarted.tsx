import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UrlInputForm from "@/components/UrlInputForm";
import ScanningView from "@/components/ScanningView";
import { runCheckup } from "@/lib/api/checkup";
import type { ScoringResult, BusinessType } from "@/lib/scoring/types";
import { toast } from "sonner";

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
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-2xl px-6 py-20">
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
        >
          Let's check your site.
        </h1>
        <p className="text-muted-foreground mb-10">
          Enter your domain and a couple of search phrases your customers might use to find you.
        </p>

        <UrlInputForm onSubmit={handleSubmit} loading={loading} />

        <p
          className="text-xs text-muted-foreground/70 mt-5"
          style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
        >
          No signup · Free instant audit · Real data from your site
        </p>
      </div>
    </div>
  );
}
