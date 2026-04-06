import { useState, useEffect } from "react";
import { Eye, TrendingUp, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KeywordVolume {
  keyword: string;
  monthlySearches: number;
  competition: string | null;
  cpc: number | null;
}

interface KeywordTeaserProps {
  keywords: KeywordVolume[];
  onDismiss: () => void;
}

export default function KeywordTeaser({ keywords, onDismiss }: KeywordTeaserProps) {
  const [countdown, setCountdown] = useState(15);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setFading(true);
          setTimeout(onDismiss, 600);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onDismiss]);

  const handleDismiss = () => {
    setFading(true);
    setTimeout(onDismiss, 600);
  };

  // Show top 5 keywords sorted by volume
  const top = keywords
    .filter((k) => k.monthlySearches > 0)
    .sort((a, b) => b.monthlySearches - a.monthlySearches)
    .slice(0, 5);

  if (top.length === 0) {
    onDismiss();
    return null;
  }

  const formatNumber = (n: number) => n.toLocaleString();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-accent/40 bg-card/95 shadow-2xl overflow-hidden">
        {/* Countdown bar */}
        <div className="absolute top-0 left-0 h-1 bg-accent/60 transition-all duration-1000 ease-linear"
          style={{ width: `${(countdown / 15) * 100}%` }}
        />

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-accent/20">
              <Eye className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Here's what people actually search
              </h2>
              <p className="text-xs text-muted-foreground">
                Real Google data · This preview disappears in {countdown}s
              </p>
            </div>
          </div>

          {/* Keyword list */}
          <div className="mt-5 space-y-2">
            {top.map((kw, i) => (
              <div
                key={kw.keyword}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-accent/15 text-accent text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground truncate">
                    {kw.keyword}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                  <TrendingUp className="h-3.5 w-3.5 text-accent" />
                  <span className="text-sm font-semibold text-accent tabular-nums">
                    {formatNumber(kw.monthlySearches)}
                  </span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                </div>
              </div>
            ))}
          </div>

          {/* Remaining keywords hint */}
          {keywords.length > 5 && (
            <p className="text-xs text-muted-foreground mt-3 text-center">
              + {keywords.length - 5} more keywords discovered
            </p>
          )}

          {/* Lock message */}
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <Lock className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">This is a one-time preview.</strong>{" "}
              Full keyword data, rankings, and competitor analysis are available in your report.
            </p>
          </div>

          <Button
            onClick={handleDismiss}
            className="w-full mt-4 font-semibold"
            size="lg"
          >
            Continue to My Scan →
          </Button>
        </div>
      </div>
    </div>
  );
}
