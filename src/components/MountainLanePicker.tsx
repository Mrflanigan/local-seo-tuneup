import { useState } from "react";
import { toast } from "sonner";
import type { ScoringResult } from "@/lib/scoring/types";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Send, CheckCircle2 } from "lucide-react";

interface Props {
  result: ScoringResult;
  url?: string;
}

interface PathOption {
  key: string;
  emoji: string;
  name: string;
  price: string;
  period?: string;
  tagline: string;
  altitude: string;
  features: string[];
  gradient: string;
  elevation: number;
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
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleTierClick = (tierKey: string) => {
    setSelectedTier(selectedTier === tierKey ? null : tierKey);
    setSubmitted(false);
  };

  const handleInquiry = async () => {
    if (!contactEmail.trim()) {
      toast.error("We need your email to get back to you.");
      return;
    }

    setSubmitting(true);
    try {
      const selectedPath = PATHS.find((p) => p.key === selectedTier);
      const { error } = await supabase.functions.invoke("save-lead", {
        body: {
          email: contactEmail.trim(),
          url: url || "",
          report_json: {
            ...result,
            inquiry: {
              tier: selectedTier,
              tierName: selectedPath?.name,
              contactName: contactName.trim(),
              contactPhone: contactPhone.trim(),
              timestamp: new Date().toISOString(),
            },
          },
          wants_gameplan: true,
        },
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("We'll be in touch shortly.");
    } catch (err) {
      console.error("Inquiry error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes float-up {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
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
          Same summit — page one. Pick your path and we'll walk you through it.
        </p>
      </div>

      {/* Mountain Paths */}
      <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
          {PATHS.map((path, index) => {
            const isHovered = hoveredPath === path.key;
            const isSelected = selectedTier === path.key;

            return (
              <button
                key={path.key}
                type="button"
                onClick={() => handleTierClick(path.key)}
                onMouseEnter={() => setHoveredPath(path.key)}
                onMouseLeave={() => setHoveredPath(null)}
                className={`
                  relative flex flex-col items-center text-center p-4 sm:p-6 pt-8
                  border-r border-border/30 last:border-r-0
                  transition-all duration-500 cursor-pointer
                  ${isSelected ? "bg-accent/10 ring-2 ring-accent/40 ring-inset" : isHovered ? "bg-secondary/60" : "bg-card"}
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
                `}
              >
                {/* Elevation bar */}
                <div
                  className="absolute left-0 bottom-0 w-1 transition-all duration-700 rounded-t-full"
                  style={{
                    height: isHovered || isSelected ? `${path.elevation}%` : `${path.elevation * 0.4}%`,
                    background: `linear-gradient(to top, hsl(var(--accent) / 0.6), hsl(var(--primary) / 0.3))`,
                  }}
                />

                {/* Popular badge */}
                {path.key === "stayAhead" && (
                  <div className="absolute -top-0 left-1/2 -translate-x-1/2 translate-y-1 px-2.5 py-0.5 rounded-b-md bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider z-10">
                    Most Popular
                  </div>
                )}

                {/* Emoji */}
                <div
                  className="text-4xl sm:text-5xl mb-3 relative z-10 transition-transform duration-300 animate-[float-up_3s_ease-in-out_infinite]"
                  style={{ animationDelay: `${index * 0.3}s` }}
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
                    ${isSelected ? "opacity-100 scale-100" : isHovered ? "opacity-100 scale-100" : "opacity-60 scale-95"}
                  `}
                  style={{
                    backgroundColor: isSelected ? "hsl(var(--accent))" : isHovered ? "hsl(var(--accent))" : "transparent",
                    color: isSelected || isHovered ? "hsl(var(--accent-foreground))" : "hsl(var(--accent))",
                    border: "1px solid hsl(var(--accent) / 0.5)",
                    ...(isSelected ? { animation: "pulse-glow 2s ease-in-out infinite" } : {}),
                  }}
                >
                  {isSelected ? "✓ Selected" : "Tell Me More"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inquiry form — slides open when a tier is selected */}
      {selectedTier && !submitted && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 sm:p-6 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 mb-4">
            <Send className="h-5 w-5 text-accent" />
            <h4 className="text-lg font-semibold text-foreground">
              Interested in {PATHS.find((p) => p.key === selectedTier)?.name}? Let's talk.
            </h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Drop your info below. No sales pitch — we'll explain exactly what this looks like for your business and answer any questions.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="text"
              placeholder="Your name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="h-10 text-sm"
            />
            <Input
              type="email"
              placeholder="Email (required)"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="h-10 text-sm"
              required
            />
            <Input
              type="tel"
              placeholder="Phone (optional)"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="h-10 text-sm sm:col-span-2"
            />
          </div>
          <button
            type="button"
            onClick={handleInquiry}
            disabled={submitting}
            className="mt-4 w-full h-11 rounded-lg text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Sending…" : "I'm interested — reach out"}
          </button>
        </div>
      )}

      {/* Success state */}
      {submitted && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 sm:p-6 text-center animate-in fade-in duration-300">
          <CheckCircle2 className="h-10 w-10 text-accent mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-foreground mb-1">We got it.</h4>
          <p className="text-sm text-muted-foreground">
            We'll review your scan and reach out with a plan tailored to your business. No fluff, no runaround.
          </p>
        </div>
      )}

      {/* Express add-on */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-semibold">⚡ Need customers tomorrow?</span>{" "}
          Add paid ads to any path for <span className="text-foreground font-semibold">$500/mo</span>.
          Think of it as a jetpack — instant visibility while we build your organic rankings.
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
