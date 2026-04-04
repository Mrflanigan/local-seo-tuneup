import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ScoringResult } from "@/lib/scoring/types";

interface Props {
  result: ScoringResult;
  url?: string;
}

const TIER_CONFIG = {
  fix: { priceId: "price_1TIHQ62KBr5H993I4oAp6473", mode: "payment" as const },
  express: { priceId: "price_1TIHQV2KBr5H993I3825oQhQ", mode: "subscription" as const },
  stayAhead: { priceId: "price_1TIHQq2KBr5H993I7a0eigx9", mode: "subscription" as const },
  handleIt: { priceId: "price_1TIHRD2KBr5H993IoI0OwHUg", mode: "subscription" as const },
  domination: { priceId: "price_1TIHRV2KBr5H993IiWOsOkUn", mode: "subscription" as const },
};

interface Lane {
  key: keyof typeof TIER_CONFIG;
  name: string;
  price: string;
  period?: string;
  tagline: string;
  carEmoji: string;
  speed: "slow" | "mid" | "fast" | "blazing";
  color: string;
  features: string[];
}

const LANES: Lane[] = [
  {
    key: "fix",
    name: "Fix What's Broken",
    price: "$300",
    tagline: "Patch the holes. One and done.",
    carEmoji: "🚗",
    speed: "slow",
    color: "hsl(var(--primary))",
    features: ["One-time fix", "Scoped to your scan"],
  },
  {
    key: "stayAhead",
    name: "Stay Ahead",
    price: "$200",
    period: "/mo",
    tagline: "Fix it. Watch it. Keep it.",
    carEmoji: "🚙",
    speed: "mid",
    color: "hsl(var(--accent))",
    features: ["Fix included", "Monthly monitoring", "Most popular"],
  },
  {
    key: "handleIt",
    name: "We Handle Everything",
    price: "$500",
    period: "/mo",
    tagline: "You drive. We navigate.",
    carEmoji: "🏎️",
    speed: "fast",
    color: "hsl(var(--primary))",
    features: ["Full service", "Content + strategy", "Competitor tracking"],
  },
  {
    key: "domination",
    name: "Total Domination",
    price: "$1,000",
    period: "/mo",
    tagline: "No mirrors needed. Nobody's behind you.",
    carEmoji: "🚀",
    speed: "blazing",
    color: "hsl(var(--accent))",
    features: ["All channels", "Paid ads day 1", "Dedicated strategist"],
  },
];

const speedAnimation: Record<string, string> = {
  slow: "animate-[drift_6s_ease-in-out_infinite]",
  mid: "animate-[drift_4s_ease-in-out_infinite]",
  fast: "animate-[drift_2.5s_ease-in-out_infinite]",
  blazing: "animate-[drift_1.5s_ease-in-out_infinite]",
};

const dashSpeed: Record<string, string> = {
  slow: "animate-[dash_3s_linear_infinite]",
  mid: "animate-[dash_2s_linear_infinite]",
  fast: "animate-[dash_1s_linear_infinite]",
  blazing: "animate-[dash_0.5s_linear_infinite]",
};

export default function LanePicker({ result, url }: Props) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [hoveredLane, setHoveredLane] = useState<string | null>(null);
  const [launched, setLaunched] = useState<string | null>(null);

  const handleCheckout = async (tierKey: keyof typeof TIER_CONFIG) => {
    setLaunched(tierKey);
    setLoadingTier(tierKey);

    // Let the launch animation play
    await new Promise((r) => setTimeout(r, 1200));

    try {
      const tier = TIER_CONFIG[tierKey];
      sessionStorage.setItem("scanResult", JSON.stringify(result));
      sessionStorage.setItem("scanUrl", url || "");
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: tier.priceId, mode: tier.mode, businessUrl: url, tierKey },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingTier(null);
      setTimeout(() => setLaunched(null), 500);
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes drift {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes dash {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
        @keyframes launch {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          60% { transform: translateY(-120px) scale(1.1); opacity: 1; }
          100% { transform: translateY(-400px) scale(0.6); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
      `}</style>

      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          Pick your lane.
        </h3>
        <p className="text-muted-foreground text-sm sm:text-base">
          Same destination — page one. How fast do you want to get there?
        </p>
      </div>

      {/* The Highway */}
      <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
        {/* Road surface */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
          {LANES.map((lane) => {
            const isHovered = hoveredLane === lane.key;
            const isLaunched = launched === lane.key;
            const isOtherLaunched = launched && launched !== lane.key;

            return (
              <button
                key={lane.key}
                onClick={() => handleCheckout(lane.key)}
                onMouseEnter={() => setHoveredLane(lane.key)}
                onMouseLeave={() => setHoveredLane(null)}
                disabled={loadingTier !== null}
                className={`
                  relative flex flex-col items-center text-center p-4 sm:p-6 pt-8
                  border-r border-border/30 last:border-r-0
                  transition-all duration-300 cursor-pointer
                  ${isHovered ? "bg-secondary/60" : "bg-card"}
                  ${isOtherLaunched ? "opacity-40" : "opacity-100"}
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
                `}
              >
                {/* Lane dashes */}
                <div
                  className={`absolute inset-0 opacity-[0.07] ${dashSpeed[lane.speed]}`}
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      to bottom,
                      transparent,
                      transparent 15px,
                      hsl(var(--foreground)) 15px,
                      hsl(var(--foreground)) 25px
                    )`,
                    backgroundSize: "2px 40px",
                    backgroundPosition: "center 0",
                    backgroundRepeat: "repeat-y",
                  }}
                />

                {/* Popular badge */}
                {lane.key === "stayAhead" && (
                  <div className="absolute -top-0 left-1/2 -translate-x-1/2 translate-y-1 px-2.5 py-0.5 rounded-b-md bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider z-10">
                    Most Popular
                  </div>
                )}

                {/* The Car */}
                <div
                  className={`
                    text-4xl sm:text-5xl mb-4 relative z-10
                    ${isLaunched ? "animate-[launch_1s_ease-in_forwards]" : ""}
                    ${!isLaunched ? speedAnimation[lane.speed] : ""}
                    ${isHovered && !isLaunched && lane.speed === "blazing" ? "animate-[shake_0.15s_ease-in-out_infinite]" : ""}
                  `}
                >
                  {lane.carEmoji}
                </div>

                {/* Speed label */}
                <div
                  className="text-[10px] uppercase tracking-widest font-bold mb-3 relative z-10"
                  style={{ color: lane.color }}
                >
                  {lane.speed === "slow" && "Steady"}
                  {lane.speed === "mid" && "Cruising"}
                  {lane.speed === "fast" && "Fast Lane"}
                  {lane.speed === "blazing" && "🔥 No Limits"}
                </div>

                {/* Price */}
                <div className="relative z-10 mb-1">
                  <span className="text-xl sm:text-2xl font-bold text-foreground">
                    {lane.price}
                  </span>
                  {lane.period && (
                    <span className="text-xs text-muted-foreground">{lane.period}</span>
                  )}
                </div>

                {/* Name */}
                <h4 className="text-sm font-semibold text-foreground mb-1 relative z-10">
                  {lane.name}
                </h4>

                {/* Tagline */}
                <p className="text-xs text-muted-foreground italic mb-3 relative z-10 leading-snug">
                  {lane.tagline}
                </p>

                {/* Features */}
                <ul className="space-y-1 relative z-10 mb-4">
                  {lane.features.map((f, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5 justify-center">
                      <span style={{ color: lane.color }}>✓</span> {f}
                    </li>
                  ))}
                </ul>

                {/* CTA hint */}
                <div
                  className={`
                    text-xs font-semibold py-1.5 px-4 rounded-full relative z-10
                    transition-all duration-200
                    ${isHovered ? "opacity-100 scale-100" : "opacity-60 scale-95"}
                  `}
                  style={{
                    backgroundColor: isHovered ? lane.color : "transparent",
                    color: isHovered ? "hsl(var(--accent-foreground))" : lane.color,
                    border: `1px solid ${lane.color}`,
                  }}
                >
                  {isLaunched ? "Launching…" : "Pick This Lane"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Express Lane callout */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-semibold">⚡ Need customers tomorrow?</span>{" "}
          Add paid ads to any lane for <span className="text-foreground font-semibold">$500/mo</span>.
          Think of it as nitro — instant visibility while we build your organic rankings.
        </p>
      </div>

      {/* Anti-fluff */}
      <div className="rounded-lg border border-border/50 bg-secondary/30 p-4 text-center">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">What we don't charge for:</span>{" "}
          "SEO audits" that restate the obvious, keyword reports you'll never read,
          or monthly retainers for work that's already done.{" "}
          <span className="text-foreground font-medium">
            You pay for results — nothing more, nothing less.
          </span>
        </p>
      </div>
    </div>
  );
}
