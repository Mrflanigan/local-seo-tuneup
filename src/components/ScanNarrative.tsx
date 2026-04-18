import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const PHASES = [
  "We've handed your real phrases to Google's eyes.",
  "We're checking if your pages make those matches obvious.",
  "We're checking whether your structure makes Google work too hard.",
  "We're sizing you up against nearby options for those exact phrases.",
];

const PHASE_MS = 4000;

interface ScanNarrativeProps {
  url: string;
}

/**
 * In-place scanning narrative. Replaces the keyword/stats block while
 * the scan runs. Fixed copy, timer-driven, loops on the final phase
 * until the parent unmounts (scan complete → navigate to /report).
 *
 * Honors prefers-reduced-motion: instant swap, no fade.
 */
export default function ScanNarrative({ url }: ScanNarrativeProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i < PHASES.length - 1 ? i + 1 : i));
    }, PHASE_MS);
    return () => clearInterval(interval);
  }, []);

  let hostname = url;
  try {
    hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
  } catch {
    /* keep raw */
  }

  return (
    <div className="space-y-6">
      {/* Headline matches the slot the keyword block occupied */}
      <p className="text-xl sm:text-2xl font-semibold text-white/90 leading-snug">
        Scanning <span className="text-white">{hostname}</span> against your
        market right now.
      </p>

      {/* The single rotating line — one thing animates, everything else holds still */}
      <div className="min-h-[7rem] sm:min-h-[6rem] flex items-start">
        <p
          key={index}
          className="text-lg sm:text-xl text-white leading-relaxed motion-safe:animate-fade-in motion-reduce:animate-none"
        >
          {PHASES[index]}
        </p>
      </div>

      {/* Quiet pulse — proves something is happening without a progress bar */}
      <div className="flex items-center gap-3 text-base text-white/50">
        <Search className="h-4 w-4 text-primary animate-pulse" />
        <span>
          Google picks the path of least friction. We're checking how easy
          you make it.
        </span>
      </div>

      {/* Step pips — minimal, no numbers, no labels */}
      <div className="flex gap-2 pt-2">
        {PHASES.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i <= index ? "w-10 bg-primary" : "w-6 bg-white/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
