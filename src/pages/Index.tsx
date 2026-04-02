import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UrlInputForm from "@/components/UrlInputForm";
import ScanningView from "@/components/ScanningView";
import { scrapeUrl } from "@/lib/api/firecrawl";
import { scoreWebsite } from "@/lib/scoring/scoringService";
import type { ScoringResult } from "@/lib/scoring/types";
import { toast } from "sonner";

export default function Index() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scanUrl, setScanUrl] = useState("");

  const handleSubmit = async (url: string, city?: string) => {
    setLoading(true);
    setScanUrl(url);
    try {
      const input = { url, city };
      const scraped = await scrapeUrl(input);
      const result: ScoringResult = scoreWebsite(scraped, input);
      navigate("/report", { state: { result, url } });
    } catch (err) {
      toast.error("Something went wrong scanning that site. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ScanningView url={scanUrl} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 sm:py-28 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
            Is Your Website Costing You
            <span className="text-primary"> Local Leads </span>
            in Google?
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Find out in 30 seconds. Get a free, instant checkup of your website's
            local SEO health — see exactly what Google sees, and what's missing.
          </p>
          <UrlInputForm onSubmit={handleSubmit} loading={loading} />
          <p className="text-xs text-muted-foreground mt-4">
            No signup required to start. Takes about 30 seconds.
          </p>
        </div>
      </div>

      {/* Trust strip */}
      <div className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">5</span>
            </div>
            <h3 className="font-semibold text-foreground">5-Point Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Local presence, on-page SEO, technical health, content, and Google extras.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">✓</span>
            </div>
            <h3 className="font-semibold text-foreground">Personalized Report</h3>
            <p className="text-sm text-muted-foreground">
              We reference your actual content, phone number, and services — not generic advice.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">⚡</span>
            </div>
            <h3 className="font-semibold text-foreground">Instant Results</h3>
            <p className="text-sm text-muted-foreground">
              Get your score in seconds. No signup needed to start.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
