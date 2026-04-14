import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import peakBg from "@/assets/getstarted-peak.jpg";

export default function DemandIntake() {
  const navigate = useNavigate();
  const [whatYouDo, setWhatYouDo] = useState("");
  const [whoYouServe, setWhoYouServe] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = whatYouDo.trim().length >= 10 && location.trim().length >= 2;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-phrases", {
        body: {
          description: whatYouDo.trim(),
          whoYouServe: whoYouServe.trim() || undefined,
          city: location.trim(),
        },
      });

      if (error) throw error;

      navigate("/demand-preview", {
        state: {
          description: whatYouDo.trim(),
          whoYouServe: whoYouServe.trim() || "",
          city: location.trim(),
          phrases: data?.phrases || [],
          volumes: data?.volumes || null,
          intentBuckets: data?.intentBuckets || null,
          totalDemand: data?.totalDemand || null,
        },
      });
    } catch (err) {
      console.error("Demand lookup failed:", err);
      navigate("/demand-preview", {
        state: {
          description: whatYouDo.trim(),
          whoYouServe: whoYouServe.trim() || "",
          city: location.trim(),
          phrases: [],
          volumes: null,
          intentBuckets: null,
          totalDemand: null,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <SEOHead title="Find Your Customers — Discover Local Search Demand" description="Tell us what you do and where. We'll show you exactly what your customers are searching for and how much demand exists." path="/demand-intake" />
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
            STEP 1
          </div>
        </div>

        {/* Content */}
        <div className="mt-auto pt-48 mb-6 space-y-6">
          <p className="text-2xl sm:text-3xl font-semibold text-white tracking-tight leading-snug">
            We're not just an SEO Audit — We Do Two Things.
            <br />
            <span className="text-primary">First, we find the people already looking for you.</span>
          </p>

          <div className="space-y-3 text-base sm:text-lg text-white/70 leading-relaxed">
            <p>
              We… <span className="text-white font-medium">start by forgetting you have a website.</span>
            </p>
            <p>
              Our first priority is to understand your business: What you do best, who you do it for,
              and where. Then we deploy one of the world's best keyword research platforms to find how
              many people are already searching for exactly what you do — in your area.
            </p>
            <p>
              Once we understand your business and how people search for you, it's just a question of:
              <span className="text-white font-medium italic ml-1">"Does your site clearly connect you to those searches, or not?"</span>
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4 mb-6">
          {/* What do you do best? */}
          <div>
            <label className="text-lg sm:text-xl font-semibold text-white block tracking-tight mb-2">
              What do you do best?
            </label>
            <Textarea
              placeholder="e.g. We fix roof leaks and handle full roof replacements for homeowners."
              value={whatYouDo}
              onChange={(e) => setWhatYouDo(e.target.value)}
              className="min-h-[100px] text-base sm:text-lg resize-none bg-white/5 border-white/15 text-white placeholder:text-white/50 focus:border-primary rounded-xl"
              disabled={loading}
              spellCheck={true}
              autoCorrect="on"
              autoCapitalize="sentences"
            />
          </div>

          {/* Who do you do it for? (optional) */}
          <div>
            <label className="text-base font-semibold text-white/80 block mb-2 tracking-tight">
              Who do you do it for?{" "}
              <span className="text-white/40 font-normal text-sm">(optional)</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Homeowners, small businesses, property managers"
              value={whoYouServe}
              onChange={(e) => setWhoYouServe(e.target.value)}
              className="h-12 text-base bg-white/5 border-white/15 text-white placeholder:text-white/50 focus:border-primary rounded-xl"
              disabled={loading}
            />
          </div>

          {/* Where do you serve? (required) */}
          <div>
            <label className="text-base font-semibold text-primary block mb-2 tracking-tight">
              Where do you serve people?
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/70" />
              <Input
                type="text"
                placeholder="City, state, or area"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 h-14 text-base bg-white/10 border-primary/40 text-white placeholder:text-white/50 focus:border-primary focus:bg-white/15 rounded-xl"
                disabled={loading}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !canSubmit}
            className="h-14 px-10 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 disabled:opacity-100 disabled:bg-primary disabled:text-primary-foreground tracking-tight"
            size="lg"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <span className="h-5 w-5 animate-pulse">🔍</span>
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
