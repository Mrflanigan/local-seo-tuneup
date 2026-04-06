import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Search } from "lucide-react";

interface KeywordVolume {
  keyword: string;
  monthlySearches: number;
  competition: string | null;
  cpc: number | null;
}

const baseMessages = [
  "SEO Osmosis™ is absorbing your site data…",
  "Checking your local presence and NAP data…",
  "Analyzing on-page SEO signals…",
  "Reviewing technical health…",
  "Evaluating content and user experience…",
  "Checking for structured data and extras…",
  "Almost done — building your personalized report…",
];

interface ScanningViewProps {
  url: string;
  keywords?: KeywordVolume[] | null;
}

export default function ScanningView({ url, keywords }: ScanningViewProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [showKeywords, setShowKeywords] = useState(false);
  const [visibleKeywords, setVisibleKeywords] = useState(0);
  const [keywordsDone, setKeywordsDone] = useState(false);

  const hasKeywords = keywords && keywords.length > 0;
  const topKeywords = hasKeywords
    ? keywords
        .filter((k) => k.monthlySearches > 0)
        .sort((a, b) => b.monthlySearches - a.monthlySearches)
        .slice(0, 5)
    : [];

  // Keyword step appears after message index 1 (after "Checking local presence")
  const keywordStepIndex = 2;

  // Build the full message list — inject keyword step
  const messages = hasKeywords
    ? [
        ...baseMessages.slice(0, keywordStepIndex),
        "Discovering what people actually search for…",
        ...baseMessages.slice(keywordStepIndex),
      ]
    : baseMessages;

  const totalSteps = messages.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => {
        if (i < totalSteps - 1) {
          const next = i + 1;
          // When we hit the keyword step, show keywords
          if (hasKeywords && next === keywordStepIndex) {
            setShowKeywords(true);
          }
          // When we move past keywords, mark done
          if (hasKeywords && next === keywordStepIndex + 1) {
            setKeywordsDone(true);
          }
          return next;
        }
        return i;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [totalSteps, hasKeywords]);

  // Cascade keywords in one at a time
  useEffect(() => {
    if (!showKeywords || topKeywords.length === 0) return;
    setVisibleKeywords(0);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleKeywords(count);
      if (count >= topKeywords.length) clearInterval(interval);
    }, 400);
    return () => clearInterval(interval);
  }, [showKeywords, topKeywords.length]);

  let hostname = "";
  try {
    hostname = new URL(url).hostname;
  } catch {
    hostname = url;
  }

  const formatNumber = (n: number) => n.toLocaleString();

  const isKeywordPhase = showKeywords && !keywordsDone;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-4 max-w-lg w-full">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-6" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Analyzing {hostname}
        </h2>
        <p
          className="text-muted-foreground transition-opacity duration-500"
          key={messageIndex}
        >
          {messages[messageIndex]}
        </p>

        {/* Keyword cascade — appears naturally during scan */}
        {isKeywordPhase && topKeywords.length > 0 && (
          <div className="mt-6 space-y-2 text-left max-w-sm mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-accent" />
              <p className="text-xs font-semibold text-accent uppercase tracking-wider">
                Real Google search data
              </p>
            </div>
            {topKeywords.map((kw, i) => (
              <div
                key={kw.keyword}
                className={`flex items-center justify-between rounded-lg border border-border/40 bg-card/60 px-4 py-2.5 transition-all duration-500 ${
                  i < visibleKeywords
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3"
                }`}
              >
                <span className="text-sm text-foreground truncate pr-3">
                  {kw.keyword}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <TrendingUp className="h-3.5 w-3.5 text-accent" />
                  <span className="text-sm font-semibold text-accent tabular-nums">
                    {formatNumber(kw.monthlySearches)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">/mo</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fading out keywords */}
        {keywordsDone && topKeywords.length > 0 && (
          <div className="mt-6 max-w-sm mx-auto animate-fade-out">
            <p className="text-xs text-muted-foreground">
              ✓ {topKeywords.length} high-volume keywords found — now scanning your rankings…
            </p>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {messages.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= messageIndex
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
