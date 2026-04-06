import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Search, Shield, X, Check } from "lucide-react";

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

const comparisonRows = [
  { label: "Real Google search volumes", us: true, them: false },
  { label: "Live rank checking", us: true, them: false },
  { label: "Full technical site audit", us: true, them: true },
  { label: "Competitor analysis", us: true, them: false },
  { label: "No signup required", us: true, them: false },
  { label: "100% free", us: true, them: false },
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
  const [showComparison, setShowComparison] = useState(false);
  const [visibleRows, setVisibleRows] = useState(0);
  const [comparisonDone, setComparisonDone] = useState(false);

  const hasKeywords = keywords && keywords.length > 0;
  const topKeywords = hasKeywords
    ? keywords
        .filter((k) => k.monthlySearches > 0)
        .sort((a, b) => b.monthlySearches - a.monthlySearches)
        .slice(0, 5)
    : [];

  // Comparison flash appears at step 1 (right after "absorbing your site data")
  const comparisonStepIndex = 1;
  // Keyword step appears after comparison
  const keywordStepIndex = hasKeywords ? 3 : 2;

  // Build the full message list — inject comparison + keyword steps
  const buildMessages = () => {
    let msgs = [...baseMessages];
    // Insert comparison step at index 1
    msgs = [
      ...msgs.slice(0, comparisonStepIndex),
      "This isn't like other SEO tools…",
      ...msgs.slice(comparisonStepIndex),
    ];
    // Insert keyword step
    if (hasKeywords) {
      msgs = [
        ...msgs.slice(0, comparisonStepIndex + 2),
        "Discovering what people actually search for…",
        ...msgs.slice(comparisonStepIndex + 2),
      ];
    }
    return msgs;
  };

  const messages = buildMessages();
  const totalSteps = messages.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => {
        if (i < totalSteps - 1) {
          const next = i + 1;
          // Comparison step
          if (next === comparisonStepIndex) {
            setShowComparison(true);
          }
          if (next === comparisonStepIndex + 1) {
            setComparisonDone(true);
          }
          // Keyword step
          if (hasKeywords && next === keywordStepIndex) {
            setShowKeywords(true);
          }
          if (hasKeywords && next === keywordStepIndex + 1) {
            setKeywordsDone(true);
          }
          return next;
        }
        return i;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [totalSteps, hasKeywords, keywordStepIndex]);

  // Cascade comparison rows
  useEffect(() => {
    if (!showComparison) return;
    setVisibleRows(0);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleRows(count);
      if (count >= comparisonRows.length) clearInterval(interval);
    }, 350);
    return () => clearInterval(interval);
  }, [showComparison]);

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
  const isComparisonPhase = showComparison && !comparisonDone;

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

        {/* Comparison flash — appears early in scan */}
        {isComparisonPhase && (
          <div className="mt-6 max-w-sm mx-auto text-left">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-accent" />
              <p className="text-xs font-semibold text-accent uppercase tracking-wider">
                The only free tool that does all of this
              </p>
            </div>
            <div className="rounded-lg border border-border/40 bg-card/60 overflow-hidden">
              <div className="grid grid-cols-[1fr,4rem,4rem] text-[10px] uppercase tracking-wider text-muted-foreground px-4 py-2 border-b border-border/30">
                <span></span>
                <span className="text-center text-accent font-bold">Us</span>
                <span className="text-center">Others</span>
              </div>
              {comparisonRows.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[1fr,4rem,4rem] items-center px-4 py-2 border-b border-border/20 last:border-b-0 transition-all duration-500 ${
                    i < visibleRows
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  }`}
                >
                  <span className="text-sm text-foreground">{row.label}</span>
                  <span className="flex justify-center">
                    {row.us ? (
                      <Check className="h-4 w-4 text-accent" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/40" />
                    )}
                  </span>
                  <span className="flex justify-center">
                    {row.them ? (
                      <Check className="h-4 w-4 text-muted-foreground/60" />
                    ) : (
                      <X className="h-4 w-4 text-destructive/60" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fading comparison */}
        {comparisonDone && !showKeywords && (
          <div className="mt-6 max-w-sm mx-auto animate-fade-out">
            <p className="text-xs text-muted-foreground">
              ✓ You're getting what others charge hundreds for — for free.
            </p>
          </div>
        )}

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