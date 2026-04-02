import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UrlInputForm from "@/components/UrlInputForm";
import { scrapeUrl } from "@/lib/api/firecrawl";
import { scoreWebsite } from "@/lib/scoring/scoringService";
import type { ScoringResult } from "@/lib/scoring/types";
import { toast } from "sonner";
import { CheckCircle2, Shield, Zap } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (url: string, city?: string) => {
    setLoading(true);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative mx-auto max-w-3xl px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Zap className="h-4 w-4" />
            Free Instant Analysis
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            How Google-Ready Is Your Website?
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Get a free, instant checkup of your website's local SEO health. See exactly what Google sees — and what's missing.
          </p>
          <UrlInputForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>

      {/* Trust strip */}
      <div className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <h3 className="font-semibold text-foreground">5-Point Analysis</h3>
            <p className="text-sm text-muted-foreground">Local presence, SEO, technical health, content, and Google extras.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h3 className="font-semibold text-foreground">Personalized Report</h3>
            <p className="text-sm text-muted-foreground">We reference your actual content, phone number, and services.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            <h3 className="font-semibold text-foreground">Instant Results</h3>
            <p className="text-sm text-muted-foreground">Get your score in seconds — no signup required to start.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
