import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import peakBg from "@/assets/getstarted-peak.jpg";

export default function DemandIntake() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const desc = description.trim();
    if (!desc || desc.length < 10) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-phrases", {
        body: { description: desc, city: city.trim() || undefined },
      });

      if (error) throw error;

      navigate("/demand-preview", {
        state: {
          description: desc,
          city: city.trim() || "",
          phrases: data?.phrases || [],
          volumes: data?.volumes || null,
        },
      });
    } catch (err) {
      console.error("Demand lookup failed:", err);
      navigate("/demand-preview", {
        state: {
          description: desc,
          city: city.trim() || "",
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

        {/* Content — pushed to lower portion */}
        <div className="mt-auto pt-48 mb-6 space-y-6">
          <p className="text-2xl sm:text-3xl font-semibold text-white tracking-tight leading-snug">
            We're not just an SEO Audit — We Do Two Scans.
            <br />
            <span className="text-primary">The first is based on your business. Not your website.</span>
          </p>

          <div className="space-y-3 text-base sm:text-lg text-white/70 leading-relaxed">
            <p>
              We… <span className="text-white font-medium">start by forgetting you have a website.</span> If you're looking at this globally, it doesn't matter — yet.
            </p>
            <p>
              Our first priority is to understand your business: What you do best and who you do it for.
              Then we deploy one of the world's best keyword research companies to find how many people
              are already searching for what you do — and what words they use.
            </p>
            <p>
              Once we understand your business and how people search for you, it's just a question of:
              <span className="text-white font-medium italic ml-1">"Does your site clearly connect you to those searches, or not?"</span>
            </p>
          </div>
        </div>

        {/* Input area — full width */}
        <form onSubmit={handleSubmit} className="w-full space-y-4 mb-6">
          <label className="text-lg sm:text-xl font-semibold text-white block tracking-tight mb-2">
            In your own words, what do you do best, and who do you do it for?
          </label>

          <Textarea
            placeholder="e.g. We remodel bathrooms and kitchens for homeowners in north Seattle."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px] text-base sm:text-lg resize-none bg-white/5 border-white/15 text-white placeholder:text-white/50 focus:border-primary rounded-xl"
            disabled={loading}
            spellCheck={true}
            autoCorrect="on"
            autoCapitalize="sentences"
          />

          {/* Location — prominent, not optional */}
          <div>
            <label className="text-base font-semibold text-primary block mb-2 tracking-tight">
              Where do your customers come from?
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/70" />
              <Input
                type="text"
                placeholder="City, state, or ZIP code"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="pl-10 h-14 text-base bg-white/10 border-primary/40 text-white placeholder:text-white/50 focus:border-primary focus:bg-white/15 rounded-xl"
                disabled={loading}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || description.trim().length < 10}
            className="h-14 px-10 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 disabled:opacity-100 disabled:bg-primary disabled:text-primary-foreground tracking-tight"
            size="lg"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <Search className="h-5 w-5 animate-pulse" />
                Finding the demand…
              </span>
            ) : (
              "Let's Find Your Customers"
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="pb-4 text-right">
          <p className="text-[11px] tracking-widest text-white/40 uppercase">
            Burj Khalifa · Dubai · 2,717 ft · Tallest structure ever built
          </p>
        </div>
      </div>
    </div>
  );
}