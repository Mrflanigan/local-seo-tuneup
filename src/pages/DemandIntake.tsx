import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import peakBg from "@/assets/getstarted-peak.jpg";

export default function DemandIntake() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const desc = description.trim();
    if (!desc || desc.length < 10) return;

    setLoading(true);
    try {
      // Scan 1: demand-only — no URL, no city yet
      const { data, error } = await supabase.functions.invoke("generate-phrases", {
        body: { description: desc },
      });

      if (error) throw error;

      // Navigate to demand preview with results
      navigate("/demand-preview", {
        state: {
          description: desc,
          phrases: data?.phrases || [],
          volumes: data?.volumes || null,
        },
      });
    } catch (err) {
      console.error("Demand lookup failed:", err);
      // Still navigate with whatever we got
      navigate("/demand-preview", {
        state: {
          description: desc,
          phrases: [],
          volumes: null,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src={peakBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex min-h-screen w-full flex-col px-8 sm:px-16 py-6">
        {/* Top bar */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/")}
            className="h-auto px-0 text-base font-semibold text-white/80 hover:bg-transparent hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
          <div className="text-base font-semibold tracking-[0.2em] text-white/40">
            PAGE 2
          </div>
        </div>

        {/* Intro paragraph — full width */}
        <div className="mb-12">
          <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-none">
            We're going to start by <span className="text-white font-semibold">forgetting you have a website.</span> For us, it doesn't matter.
          </p>
          <p className="text-lg sm:text-xl text-white/70 leading-relaxed mt-4 max-w-none">
            Our first priority is to understand your business: what you actually do best and who you do it for.
            Then we deploy one of the world's best search‑word companies to see how many people are searching
            for what you do, and what words they're using to find you.
          </p>
          <p className="text-lg sm:text-xl text-white/70 leading-relaxed mt-4 max-w-none">
            Once we understand your business and how people search for you, it's just a question of:
            <br />
            <span className="text-white font-semibold italic">
              "Does your site clearly connect you to those searches, or not?"
            </span>
          </p>
        </div>

        {/* Input area — full width */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-2 text-left">
            <label className="text-xl sm:text-2xl font-bold text-white block"
              style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
            >
              In your own words, what do you actually do best, and who do you do it for?
            </label>
            <p className="text-sm text-white/50">
              Example: "We remodel bathrooms and kitchens for homeowners in north Seattle."
            </p>
          </div>

          <Textarea
            placeholder="Tell us about your business..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px] text-lg text-foreground placeholder:text-foreground/50 resize-none bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
            disabled={loading}
            spellCheck={true}
            autoCorrect="on"
            autoCapitalize="sentences"
          />

          <Button
            type="submit"
            disabled={loading || description.trim().length < 10}
            className="h-14 px-10 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 italic"
            size="lg"
            style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <Search className="h-5 w-5 animate-pulse" />
                Finding the demand…
              </span>
            ) : (
              "Find the demand"
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-auto pt-8 pb-4 text-right">
          <p className="text-[11px] tracking-widest text-white/50 uppercase">
            Burj Khalifa · Dubai · 2,717 ft · Tallest structure ever built
          </p>
        </div>
      </div>
    </div>
  );
}
