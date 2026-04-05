import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UrlInputForm from "@/components/UrlInputForm";
import ScanningView from "@/components/ScanningView";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full flex-col px-8 sm:px-16 py-6">
        <div className="mb-8 flex items-start justify-between gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/")}
            className="h-auto px-0 text-base font-semibold text-foreground hover:bg-transparent hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
          <div className="text-base font-semibold tracking-[0.2em] text-muted-foreground">
            PAGE 2
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full">
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
            >
              Let's check your site.
            </h1>
            <p className="text-lg text-muted-foreground mb-10">
              Enter your domain and a couple of search phrases your customers might use to find you.
            </p>

            <UrlInputForm onSubmit={handleSubmit} loading={loading} />

            <p
              className="text-sm text-muted-foreground/70 mt-6"
              style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
            >
              No signup · Free instant audit · Real data from your site
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
