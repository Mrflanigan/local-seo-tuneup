import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, ArrowRight, Check, RotateCcw, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { BusinessType } from "@/lib/scoring/types";

interface SearchResult {
  url: string;
  title: string;
  description: string;
}

interface IdentifyResponse {
  businessDescription: string;
  searchQuery: string;
  phrases: string[];
  city: string | null;
  results: SearchResult[];
}

interface SearchPhraseFlowProps {
  onSubmit: (url: string, city?: string, businessType?: BusinessType) => void;
  loading?: boolean;
}

type Step = "phrases" | "confirm" | "pick";

export default function SearchPhraseFlow({ onSubmit, loading }: SearchPhraseFlowProps) {
  const [step, setStep] = useState<Step>("phrases");
  const [phrase1, setPhrase1] = useState("");
  const [phrase2, setPhrase2] = useState("");
  const [city, setCity] = useState("");
  const [searching, setSearching] = useState(false);
  const [identifyData, setIdentifyData] = useState<IdentifyResponse | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    const phrases = [phrase1.trim(), phrase2.trim()].filter(Boolean);
    if (phrases.length === 0) return;

    setSearching(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("identify-business", {
        body: { phrases, city: city.trim() || undefined },
      });

      if (fnError) throw new Error(fnError.message);
      if (!data?.success) throw new Error(data?.error || "Search failed");

      setIdentifyData(data.data);
      setStep("confirm");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = () => {
    setStep("pick");
  };

  const handlePickResult = (url: string) => {
    // Determine business type — if they entered a city, likely local
    const businessType: BusinessType = city.trim() ? "local" : "online";
    onSubmit(url, city.trim() || undefined, businessType);
  };

  const handleStartOver = () => {
    setStep("phrases");
    setIdentifyData(null);
    setError("");
  };

  // Step 1: Enter search phrases
  if (step === "phrases") {
    return (
      <div className="w-full space-y-3" style={{ maxWidth: "100%" }}>
        <p className="text-sm text-foreground/80" style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}>
          What would someone Google to find your business?
        </p>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder='e.g. "emergency plumber"'
              value={phrase1}
              onChange={(e) => setPhrase1(e.target.value)}
              className="pl-10 h-12 text-sm text-foreground placeholder:text-foreground/60"
              disabled={searching || loading}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="2nd phrase (optional)"
              value={phrase2}
              onChange={(e) => setPhrase2(e.target.value)}
              className="pl-10 h-12 text-sm text-foreground placeholder:text-foreground/60"
              disabled={searching || loading}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>

        <div className="flex gap-3" style={{ width: "100%", maxWidth: "100%" }}>
          <div className="relative" style={{ flex: "1 1 40%", minWidth: 0 }}>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="City or ZIP"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="pl-10 h-14 text-lg text-foreground placeholder:text-foreground/60"
              style={{ width: "100%" }}
              disabled={searching || loading}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button
            type="button"
            onClick={handleSearch}
            className="h-14 px-8 text-base font-bold whitespace-nowrap shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-100 disabled:bg-primary disabled:text-primary-foreground italic"
            disabled={searching || loading || !phrase1.trim()}
            size="lg"
            style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
          >
            {searching ? "Searching…" : "Find My Business"}
          </Button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  // Step 2: Confirm business description
  if (step === "confirm" && identifyData) {
    return (
      <div className="w-full space-y-4" style={{ maxWidth: "100%" }}>
        <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5">
          <p className="text-sm text-foreground/70 mb-2">Based on your search phrases, it looks like you're a:</p>
          <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}>
            {identifyData.businessDescription}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            We searched: "{identifyData.searchQuery}"
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleConfirm}
            className="h-12 px-6 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 italic"
            style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
          >
            <Check className="h-4 w-4 mr-2" />
            That's right — show me results
          </Button>
          <Button
            variant="outline"
            onClick={handleStartOver}
            className="h-12 px-4 text-sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Try different phrases
          </Button>
        </div>
      </div>
    );
  }

  // Step 3: Pick your listing from search results
  if (step === "pick" && identifyData) {
    return (
      <div className="w-full space-y-4" style={{ maxWidth: "100%" }}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-foreground/80" style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}>
            Find your business below — or enter your URL directly:
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartOver}
            className="text-xs text-muted-foreground"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Start over
          </Button>
        </div>

        {/* Search results */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {identifyData.results.map((result, i) => (
            <button
              key={i}
              onClick={() => handlePickResult(result.url)}
              disabled={loading}
              className="w-full text-left rounded-lg border border-border hover:border-primary/50 bg-card/40 hover:bg-card/80 p-3 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <span className="text-xs font-mono text-muted-foreground mt-0.5 shrink-0">
                  #{i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary truncate">
                    {result.title}
                  </p>
                  <p className="text-xs text-primary/70 truncate">{result.url}</p>
                  {result.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {result.description}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5" />
              </div>
            </button>
          ))}
        </div>

        {/* Manual URL fallback */}
        <div className="pt-2 border-t border-border/40">
          <p className="text-xs text-muted-foreground mb-2">Don't see your business? Enter your URL:</p>
          <ManualUrlInput onSubmit={(url) => handlePickResult(url)} loading={loading} />
        </div>
      </div>
    );
  }

  return null;
}

function ManualUrlInput({ onSubmit, loading }: { onSubmit: (url: string) => void; loading?: boolean }) {
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    let cleanUrl = url.trim();
    if (!cleanUrl) return;
    if (!cleanUrl.startsWith("http")) cleanUrl = "https://" + cleanUrl;
    onSubmit(cleanUrl);
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="your domain or URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="pl-9 h-10 text-sm text-foreground placeholder:text-foreground/60"
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
      </div>
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !url.trim()}
        className="h-10 px-4 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 italic"
        style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
      >
        Scan This URL
      </Button>
    </div>
  );
}
