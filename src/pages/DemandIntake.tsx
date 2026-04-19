import { useEffect, useState } from "react";
import SEOHead from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import InterpretationCard, { type InputInterpretation } from "@/components/InterpretationCard";
import SeedExpansionReveal, { type SeedExpansion } from "@/components/SeedExpansionReveal";
import peakBg from "@/assets/getstarted-peak.jpg";

const INTAKE_KEY = "demandIntake.v1";

type IntakeDraft = { whatYouDo: string; whoYouServe: string; location: string };

function loadIntakeDraft(): IntakeDraft {
  try {
    const raw = localStorage.getItem(INTAKE_KEY);
    if (!raw) return { whatYouDo: "", whoYouServe: "", location: "" };
    const p = JSON.parse(raw);
    return {
      whatYouDo: typeof p?.whatYouDo === "string" ? p.whatYouDo : "",
      whoYouServe: typeof p?.whoYouServe === "string" ? p.whoYouServe : "",
      location: typeof p?.location === "string" ? p.location : "",
    };
  } catch {
    return { whatYouDo: "", whoYouServe: "", location: "" };
  }
}

type Phase = "form" | "loading" | "reveal";

interface ApiResult {
  phrases: string[];
  volumes: any;
  intentBuckets: any;
  bucketDifficulty: any;
  totalDemand: number | null;
  seedExpansion: SeedExpansion | null;
  interpretation: InputInterpretation | null;
}

export default function DemandIntake() {
  const navigate = useNavigate();
  const initial = loadIntakeDraft();
  const [whatYouDo, setWhatYouDo] = useState(initial.whatYouDo);
  const [whoYouServe, setWhoYouServe] = useState(initial.whoYouServe);
  const [location, setLocation] = useState(initial.location);

  const [phase, setPhase] = useState<Phase>("form");
  const [result, setResult] = useState<ApiResult | null>(null);

  // Persist draft
  useEffect(() => {
    try {
      localStorage.setItem(
        INTAKE_KEY,
        JSON.stringify({ whatYouDo, whoYouServe, location }),
      );
    } catch { /* ignore */ }
  }, [whatYouDo, whoYouServe, location]);

  const canSubmit =
    phase === "form" &&
    whatYouDo.trim().length >= 10 &&
    location.trim().length >= 2;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    setPhase("loading");

    try {
      const { data, error } = await supabase.functions.invoke("generate-phrases", {
        body: {
          description: whatYouDo.trim(),
          whoYouServe: whoYouServe.trim() || undefined,
          city: location.trim(),
        },
      });
      if (error) throw error;
      setResult({
        phrases: data?.phrases || [],
        volumes: data?.volumes || null,
        intentBuckets: data?.intentBuckets || null,
        bucketDifficulty: data?.bucketDifficulty || null,
        totalDemand: data?.totalDemand || null,
        seedExpansion: data?.seedExpansion || null,
        interpretation: data?.interpretation || null,
      });
      setPhase("reveal");
    } catch (err) {
      console.error("Demand lookup failed:", err);
      setResult({
        phrases: [],
        volumes: null,
        intentBuckets: null,
        bucketDifficulty: null,
        totalDemand: null,
        seedExpansion: null,
        interpretation: null,
      });
      setPhase("reveal");
    }
  };

  const handleContinue = () => {
    if (!result) return;
    navigate("/demand-preview", {
      state: {
        description: whatYouDo.trim(),
        whoYouServe: whoYouServe.trim() || "",
        city: location.trim(),
        phrases: result.phrases,
        volumes: result.volumes,
        intentBuckets: result.intentBuckets,
        bucketDifficulty: result.bucketDifficulty,
        totalDemand: result.totalDemand,
        seedExpansion: result.seedExpansion,
        interpretation: result.interpretation,
      },
    });
  };

  const handleRefine = () => {
    setPhase("form");
    setResult(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <SEOHead
        title="Find Your Customers — Discover Local Search Demand"
        description="Tell us what you do and where. We'll show you exactly what your customers are searching for and how much demand exists."
        path="/demand-intake"
      />
      <img
        src={peakBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-black/55" />

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
            {phase === "reveal" ? "CONSIDER IT HANDLED" : "STEP 1"}
          </div>
        </div>

        {/* ───────── FORM PHASE ───────── */}
        {phase === "form" && (
          <FormPhase
            whatYouDo={whatYouDo}
            whoYouServe={whoYouServe}
            location={location}
            setWhatYouDo={setWhatYouDo}
            setWhoYouServe={setWhoYouServe}
            setLocation={setLocation}
            canSubmit={canSubmit}
            onSubmit={handleSubmit}
            loading={false}
          />
        )}

        {/* ───────── LOADING PHASE ───────── */}
        {phase === "loading" && (
          <LoadingPhase
            whatYouDo={whatYouDo}
            location={location}
          />
        )}

        {/* ───────── REVEAL PHASE ───────── */}
        {phase === "reveal" && result && (
          <RevealPhase
            interpretation={result.interpretation}
            expansion={result.seedExpansion}
            description={whatYouDo.trim()}
            onContinue={handleContinue}
            onRefine={handleRefine}
          />
        )}

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

/* ─────────────────────────── Phase: Form ─────────────────────────── */

function FormPhase({
  whatYouDo, whoYouServe, location,
  setWhatYouDo, setWhoYouServe, setLocation,
  canSubmit, onSubmit, loading,
}: {
  whatYouDo: string; whoYouServe: string; location: string;
  setWhatYouDo: (v: string) => void;
  setWhoYouServe: (v: string) => void;
  setLocation: (v: string) => void;
  canSubmit: boolean;
  onSubmit: (e?: React.FormEvent) => void;
  loading: boolean;
}) {
  return (
    <>
      <div className="mt-auto pt-32 mb-6 space-y-6 animate-in fade-in duration-500">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs sm:text-sm font-semibold tracking-wider uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          SEO Reimagined · Osmosis™
        </div>
        <p className="text-2xl sm:text-3xl font-semibold text-white tracking-tight leading-snug">
          We're not just another run-of-the-mill AI audit.
          <br />
          <span className="text-primary">First, we find the people already looking for you.</span>
        </p>

        <div className="space-y-3 text-base sm:text-lg text-white/70 leading-relaxed">
          <p>
            We… <span className="text-white font-medium">start by forgetting you have a website.</span>
          </p>
          <p>
            Tell us three things. Our AI will translate them into how your customers actually search,
            then a real keyword database will show you how much demand is out there.
          </p>
          <p className="text-lg sm:text-xl">
            <span className="text-white/70">With us…</span>{" "}
            <span className="text-primary font-bold italic">Consider it handled!</span>
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="w-full space-y-4 mb-6">
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
            spellCheck
            autoCorrect="on"
            autoCapitalize="sentences"
          />
        </div>

        <div>
          <label className="text-base font-semibold text-white/80 block mb-2 tracking-tight">
            Who do you do it for?{" "}
            <span className="text-white/40 font-normal text-sm">(optional — we'll fill it in if you skip)</span>
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
          disabled={!canSubmit}
          className="h-14 px-10 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 disabled:opacity-50 tracking-tight"
          size="lg"
        >
          Let's Find Your Customers
        </Button>
      </form>
    </>
  );
}

/* ─────────────────────────── Phase: Loading ─────────────────────────── */

function LoadingPhase({ whatYouDo, location }: { whatYouDo: string; location: string }) {
  const steps = [
    "Reading what you told us…",
    "Translating into customer language…",
    "Asking the keyword database what people in your area actually search for…",
    "Counting the demand…",
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(p => Math.min(p + 1, steps.length - 1)), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-auto pt-24 pb-16 space-y-8 animate-in fade-in duration-500 min-h-[28rem]">
      <div className="flex items-baseline gap-3 flex-wrap">
        <Sparkles className="h-6 w-6 text-primary animate-pulse self-center" />
        <p className="text-2xl sm:text-3xl font-semibold tracking-tight">
          <span className="text-white/70">With us…</span>{" "}
          <span className="text-primary italic">Consider it handled!</span>
        </p>
      </div>

      <p className="text-base sm:text-lg text-white/60 max-w-2xl leading-relaxed">
        We're translating your description, your customer, and "{location}" into the way real people
        search — then checking how many of them are out there right now.
      </p>

      <ul className="space-y-2 max-w-2xl">
        {steps.map((s, idx) => {
          const active = idx === i;
          const done = idx < i;
          return (
            <li
              key={idx}
              className={`flex items-center gap-3 text-base transition-colors ${
                active ? "text-white" : done ? "text-white/50" : "text-white/30"
              }`}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full flex-shrink-0 ${
                  active ? "bg-primary animate-pulse" :
                  done ? "bg-white/40" : "bg-white/15"
                }`}
              />
              {s}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─────────────────────────── Phase: Reveal ─────────────────────────── */

function RevealPhase({
  interpretation, expansion, description,
  onContinue, onRefine,
}: {
  interpretation: InputInterpretation | null;
  expansion: SeedExpansion | null;
  description: string;
  onContinue: () => void;
  onRefine: () => void;
}) {
  return (
    <div className="mt-auto pt-12 pb-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <div className="flex items-baseline gap-3 flex-wrap">
          <Sparkles className="h-6 w-6 text-primary self-center" />
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight">
            <span className="text-white/70">With us…</span>{" "}
            <span className="text-primary italic">Consider it handled!</span>
          </p>
        </div>
        <p className="text-base sm:text-lg text-white/65 max-w-3xl leading-relaxed">
          You told us three things. Our AI translated them into how your customers actually think
          and search. Here's what we did with what you gave us.
        </p>
      </div>

      {interpretation && <InterpretationCard interpretation={interpretation} />}

      {expansion && (
        <SeedExpansionReveal description={description} expansion={expansion} />
      )}

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-2">
        <p className="text-base sm:text-lg text-white leading-relaxed">
          <span className="font-semibold">This is what your website should be doing for you every day.</span>{" "}
          <span className="text-white/70">
            Reading your business, translating it into customer language, and putting you in front
            of the people already searching. Stick with us — that's the work we do.
          </span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="button"
          onClick={onContinue}
          className="h-14 px-8 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 tracking-tight"
          size="lg"
        >
          See the demand & scan my site
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onRefine}
          className="h-14 px-6 text-base text-white/70 hover:text-white hover:bg-white/5"
        >
          Refine what I told you
        </Button>
      </div>
    </div>
  );
}
