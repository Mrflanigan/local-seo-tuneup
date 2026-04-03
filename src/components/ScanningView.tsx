import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const messages = [
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
}

export default function ScanningView({ url }: ScanningViewProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i < messages.length - 1 ? i + 1 : i));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  let hostname = "";
  try {
    hostname = new URL(url).hostname;
  } catch {
    hostname = url;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-4 max-w-md">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-6" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Analyzing {hostname}
        </h2>
        <p className="text-muted-foreground transition-opacity duration-500" key={messageIndex}>
          {messages[messageIndex]}
        </p>
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
