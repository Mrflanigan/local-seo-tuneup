import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ScoringResult } from "@/lib/scoring/types";
import { Input } from "@/components/ui/input";
import { KeyRound } from "lucide-react";

interface Props {
  result: ScoringResult;
  url?: string;
}

const TIER_CONFIG = {
  fix: { priceId: "price_1TIHQ62KBr5H993I4oAp6473", mode: "payment" as const },
  stayAhead: { priceId: "price_1TIHQq2KBr5H993I7a0eigx9", mode: "subscription" as const },
  handleIt: { priceId: "price_1TIHRD2KBr5H993IoI0OwHUg", mode: "subscription" as const },
  domination: { priceId: "price_1TIHRV2KBr5H993IiWOsOkUn", mode: "subscription" as const },
};

interface PathOption {
  key: keyof typeof TIER_CONFIG;
  emoji: string;
  name: string;
  price: string;
  period?: string;
  tagline: string;
  altitude: string;
  features: string[];
  gradient: string;
  elevation: number; // percentage of mountain height for visual
}

const PATHS: PathOption[] = [
  {
    key: "fix",
    emoji: "🥾",
    name: "Start Climbing",
    price: "$300",
    tagline: "Lace up. Fix what's broken. Start moving.",
    altitude: "Base Camp",
    features: ["One-time fix", "Scoped to your scan"],
    gradient: "from-emerald-900/40 to-emerald-800/20",
    elevation: 25,
  },
  {
    key: "stayAhead",
    emoji: "🗺️",
    name: "Get a Map",
    price: "$200",
    period: "/mo",
    tagline: "Know the terrain. Never get lost.",
    altitude: "Trail Head",
    features: ["Fix included", "Monthly monitoring", "Route updates"],
    gradient: "from-blue-900/40 to-blue-800/20",
    elevation: 50,
  },
  {
    key: "handleIt",
    emoji: "⛰️",
    name: "Guided Trip",
    price: "$500",
    period: "/mo",
    tagline: "Expert sherpas. You enjoy the view.",
    altitude: "Summit Push",
    features: ["Full service", "Content + strategy", "Competitor tracking"],
    gradient: "from-purple-900/40 to-purple-800/20",
    elevation: 75,
  },
  {
    key: "domination",
    emoji: "🚁",
    name: "Helicopter",
    price: "$1,000",
    period: "/mo",
    tagline: "Skip the climb. Own the summit.",
    altitude: "The Peak",
    features: ["All channels", "Paid ads day 1", "Dedicated strategist"],
    gradient: "from-amber-900/40 to-amber-800/20",
    elevation: 100,
  },
];

export default function MountainLanePicker({ result, url }: Props) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [launched, setLaunched] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const navigate = useNavigate();

  const BYPASS_CODE = "OSMOSIS2026";

  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === BYPASS_CODE) {
      setCouponApplied(true);
      toast.success("Coupon applied! Select any tier to proceed.");
    } else {
      toast.error("Invalid coupon code.");
    }
  };

  const handleCheckout = async (tierKey: keyof typeof TIER_CONFIG) => {
    if (couponApplied) {
      sessionStorage.setItem("scanResult", JSON.stringify(result));
      sessionStorage.setItem("scanUrl", url || "");
      navigate(`/payment-success?tier=${tierKey}`);
      return;
    }

    setLaunched(tierKey);
    setLoadingTier(tierKey);
    await new Promise((r) => setTimeout(r, 1200));

    try {
      const tier = TIER_CONFIG[tierKey];
      sessionStorage.setItem("scanResult", JSON.stringify(result));
      sessionStorage.setItem("scanUrl", url || "");
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: tier.priceId, mode: tier.mode, businessUrl: url, tierKey },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
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
        @keyframes float-up {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes ascend {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-80px) scale(1.15); opacity: 1; }
          100% { transform: translateY(-300px) scale(0.5); opacity: 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px hsl(var(--accent) / 0.2); }
          50% { box-shadow: 0 0 40px hsl(var(--accent) / 0.4); }
        }
      `}</style>

      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          How do you want to reach the top?
        </h3>
        <p className="text-muted-foreground text-sm sm:text-base">
          Same summit — page one. Pick your path up.
        </p>
      </div>

      {/* Mountain Paths */}
      <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
        {/* Mountain silhouette background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `polygon(0% 100%, 15% 60%, 25% 70%, 40% 30%, 50% 45%, 65% 15%, 75% 35%, 85% 20%, 100% 50%, 100% 100%)`,
          }}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
          {PATHS.map((path, index) => {
            const isHovered = hoveredPath === path.key;
            const isLaunched = launched === path.key;
            const isOtherLaunched = launched && launched !== path.key;

            return (
              <button
                key={path.key}
                onClick={() => handleCheckout(path.key)}
                onMouseEnter={() => setHoveredPath(path.key)}
                onMouseLeave={() => setHoveredPath(null)}
                disabled={loadingTier !== null}
                className={`
                  relative flex flex-col items-center text-center p-4 sm:p-6 pt-8
                  border-r border-border/30 last:border-r-0
                  transition-all duration-500 cursor-pointer
                  ${isHovered ? "bg-secondary/60" : "bg-card"}
                  ${isOtherLaunched ? "opacity-30 scale-95" : "opacity-100"}
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
                `}
              >
                {/* Elevation bar — shows how high this path takes you */}
                <div className="absolute left-0 bottom-0 w-1 transition-all duration-700 rounded-t-full"
                  style={{
                    height: isHovered ? `${path.elevation}%` : `${path.elevation * 0.4}%`,
                    background: `linear-gradient(to top, hsl(var(--accent) / 0.6), hsl(var(--primary) / 0.3))`,
                  }}
                />

                {/* Popular badge */}
                {path.key === "stayAhead" && (
                  <div className="absolute -top-0 left-1/2 -translate-x-1/2 translate-y-1 px-2.5 py-0.5 rounded-b-md bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider z-10">
                    Most Popular
                  </div>
                )}

                {/* The emoji / icon */}
                <div
                  className={`
                    text-4xl sm:text-5xl mb-3 relative z-10 transition-transform duration-300
                    ${isLaunched ? "animate-[ascend_1.2s_ease-in_forwards]" : ""}
                    ${!isLaunched ? "animate-[float-up_3s_ease-in-out_infinite]" : ""}
                  `}
                  style={{
                    animationDelay: !isLaunched ? `${index * 0.3}s` : undefined,
                  }}
                >
                  {path.emoji}
                </div>

                {/* Altitude label */}
                <div
                  className="text-[10px] uppercase tracking-widest font-bold mb-3 relative z-10"
                  style={{ color: "hsl(var(--accent))" }}
                >
                  {path.altitude}
                </div>

                {/* Price */}
                <div className="relative z-10 mb-1">
                  <span className="text-xl sm:text-2xl font-bold text-foreground">
                    {path.price}
                  </span>
                  {path.period && (
                    <span className="text-xs text-muted-foreground">{path.period}</span>
                  )}
                </div>

                {/* Name */}
                <h4 className="text-sm font-semibold text-foreground mb-1 relative z-10">
                  {path.name}
                </h4>

                {/* Tagline */}
                <p className="text-xs text-muted-foreground italic mb-3 relative z-10 leading-snug">
                  {path.tagline}
                </p>

                {/* Features */}
                <ul className="space-y-1 relative z-10 mb-4">
                  {path.features.map((f, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5 justify-center">
                      <span className="text-accent">✓</span> {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div
                  className={`
                    text-xs font-semibold py-1.5 px-4 rounded-full relative z-10
                    transition-all duration-300
                    ${isHovered ? "opacity-100 scale-100" : "opacity-60 scale-95"}
                  `}
                  style={{
                    backgroundColor: isHovered ? "hsl(var(--accent))" : "transparent",
                    color: isHovered ? "hsl(var(--accent-foreground))" : "hsl(var(--accent))",
                    border: "1px solid hsl(var(--accent) / 0.5)",
                    ...(isHovered ? { animation: "pulse-glow 2s ease-in-out infinite" } : {}),
                  }}
                >
                  {isLaunched ? "Ascending…" : "Choose This Path"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Express add-on */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-semibold">⚡ Need customers tomorrow?</span>{" "}
          Add paid ads to any path for <span className="text-foreground font-semibold">$500/mo</span>.
          Think of it as a jetpack — instant visibility while we build your organic rankings.
        </p>
      </div>

      {/* Anti-fluff */}
      {/* Coupon Code */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Have a coupon?</span>
        </div>
        {couponApplied ? (
          <p className="text-sm text-accent font-semibold">✓ Coupon applied — pick any tier above!</p>
        ) : (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
              className="h-9 text-sm"
            />
            <button
              onClick={handleApplyCoupon}
              className="shrink-0 h-9 px-4 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Apply
            </button>
          </div>
        )}
      </div>

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
