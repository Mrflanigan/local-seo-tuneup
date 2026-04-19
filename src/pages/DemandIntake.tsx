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

const INTAKE_KEY = "demandIntake.v2";
const INTAKE_RESULT_KEY = "demandIntake.result.v2";
// Legacy keys to clean up so old data doesn't bleed in
const LEGACY_INTAKE_KEY = "demandIntake.v1";
const LEGACY_INTAKE_RESULT_KEY = "demandIntake.result.v1";

type IntakeDraft = {
  primary: string;
  secondary: string;
  other: string;
  dontDo: string;
  whoYouServe: string;
  location: string;
};

const EMPTY_DRAFT: IntakeDraft = {
  primary: "",
  secondary: "",
  other: "",
  dontDo: "",
  whoYouServe: "",
  location: "",
};

function loadIntakeDraft(): IntakeDraft {
  try {
    const raw = localStorage.getItem(INTAKE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        primary: typeof p?.primary === "string" ? p.primary : "",
        secondary: typeof p?.secondary === "string" ? p.secondary : "",
        other: typeof p?.other === "string" ? p.other : "",
        dontDo: typeof p?.dontDo === "string" ? p.dontDo : "",
        whoYouServe: typeof p?.whoYouServe === "string" ? p.whoYouServe : "",
        location: typeof p?.location === "string" ? p.location : "",
      };
    }
    // One-time migration from v1
    const legacy = localStorage.getItem(LEGACY_INTAKE_KEY);
    if (legacy) {
      const p = JSON.parse(legacy);
      return {
        ...EMPTY_DRAFT,
        primary: typeof p?.whatYouDo === "string" ? p.whatYouDo : "",
        whoYouServe: typeof p?.whoYouServe === "string" ? p.whoYouServe : "",
        location: typeof p?.location === "string" ? p.location : "",
      };
    }
    return EMPTY_DRAFT;
  } catch {
    return EMPTY_DRAFT;
  }
}

type Phase = "form" | "loading" | "reveal";

function loadIntakeResult(): ApiResult | null {
  try {
    const raw = localStorage.getItem(INTAKE_RESULT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ApiResult;
  } catch {
    return null;
  }
}

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
  const initialResult = loadIntakeResult();

  const [primary, setPrimary] = useState(initial.primary);
  const [secondary, setSecondary] = useState(initial.secondary);
  const [other, setOther] = useState(initial.other);
  const [dontDo, setDontDo] = useState(initial.dontDo);
  const [whoYouServe, setWhoYouServe] = useState(initial.whoYouServe);
  const [location, setLocation] = useState(initial.location);

  const [phase, setPhase] = useState<Phase>(initialResult ? "reveal" : "form");
  const [result, setResult] = useState<ApiResult | null>(initialResult);

  // Clean up legacy keys once
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_INTAKE_KEY);
      localStorage.removeItem(LEGACY_INTAKE_RESULT_KEY);
    } catch { /* ignore */ }
  }, []);

  // Persist draft
  useEffect(() => {
    try {
      localStorage.setItem(
        INTAKE_KEY,
        JSON.stringify({ primary, secondary, other, dontDo, whoYouServe, location }),
      );
    } catch { /* ignore */ }
  }, [primary, secondary, other, dontDo, whoYouServe, location]);

  // Persist result so refresh keeps the reveal phase
  useEffect(() => {
    try {
      if (result) localStorage.setItem(INTAKE_RESULT_KEY, JSON.stringify(result));
      else localStorage.removeItem(INTAKE_RESULT_KEY);
    } catch { /* ignore */ }
  }, [result]);

  const canSubmit =
    phase === "form" &&
    primary.trim().length >= 5 &&
    location.trim().length >= 2;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    setPhase("loading");

    try {
      const { data, error } = await supabase.functions.invoke("generate-phrases", {
        body: {
          primaryService: primary.trim(),
          secondaryService: secondary.trim() || undefined,
          otherServices: other.trim() || undefined,
          whatYouDontDo: dontDo.trim() || undefined,
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
    const combinedDescription = [
      `Primary: ${primary.trim()}`,
      secondary.trim() && `Secondary: ${secondary.trim()}`,
      other.trim() && `Other: ${other.trim()}`,
    ].filter(Boolean).join(" | ");

    const previewState = {
      description: combinedDescription,
      primary: primary.trim(),
      secondary: secondary.trim(),
      other: other.trim(),
      dontDo: dontDo.trim(),
      whoYouServe: whoYouServe.trim() || "",
      city: location.trim(),
      phrases: result.phrases,
      volumes: result.volumes,
      intentBuckets: result.intentBuckets,
      bucketDifficulty: result.bucketDifficulty,
      totalDemand: result.totalDemand,
      seedExpansion: result.seedExpansion,
      interpretation: result.interpretation,
    };
    try { sessionStorage.setItem("demandPreview.state.v1", JSON.stringify(previewState)); } catch { /* ignore */ }
    navigate("/demand-preview", { state: previewState });
  };

  const handleRefine = () => {
    setPhase("form");
    setResult(null);
    try { localStorage.removeItem(INTAKE_RESULT_KEY); } catch { /* ignore */ }
  };

  const hasAnyInput = primary || secondary || other || dontDo || whoYouServe || location || result;

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
        <div className="mb-8 flex items-start justify-between gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (hasAnyInput) {
                if (!confirm("Go back to home? Your saved demand snapshot will stay — you can pick up where you left off.")) return;
              }
              navigate("/");
            }}
            className="h-auto px-0 text-base font-semibold text-white/80 hover:bg-transparent hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
          <div className="text-base font-semibold tracking-[0.2em] text-white/40">
            {phase === "reveal" ? "CONSIDER IT HANDLED" : "STEP 1"}
          </div>
        </div>

        {phase === "form" && (
          <FormPhase
            primary={primary} secondary={secondary} other={other} dontDo={dontDo}
            whoYouServe={whoYouServe} location={location}
            setPrimary={setPrimary} setSecondary={setSecondary} setOther={setOther}
            setDontDo={setDontDo} setWhoYouServe={setWhoYouServe} setLocation={setLocation}
            canSubmit={canSubmit}
            onSubmit={handleSubmit}
            loading={false}
          />
        )}

        {phase === "loading" && (
          <LoadingPhase primary={primary} location={location} />
        )}

        {phase === "reveal" && result && (
          <RevealPhase
            interpretation={result.interpretation}
            expansion={result.seedExpansion}
            description={primary.trim()}
            onContinue={handleContinue}
            onRefine={handleRefine}
          />
        )}

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
  primary, secondary, other, dontDo, whoYouServe, location,
  setPrimary, setSecondary, setOther, setDontDo, setWhoYouServe, setLocation,
  canSubmit, onSubmit, loading,
}: {
  primary: string; secondary: string; other: string; dontDo: string;
  whoYouServe: string; location: string;
  setPrimary: (v: string) => void;
  setSecondary: (v: string) => void;
  setOther: (v: string) => void;
  setDontDo: (v: string) => void;
  setWhoYouServe: (v: string) => void;
  setLocation: (v: string) => void;
  canSubmit: boolean;
  onSubmit: (e?: React.FormEvent) => void;
  loading: boolean;
}) {
  return (
    <>
      <div className="mt-auto pt-20 mb-6 space-y-6 animate-in fade-in duration-500">
        <p className="text-2xl sm:text-3xl font-semibold text-white tracking-tight leading-snug">
          We're not just another run-of-the-mill AI audit. We are{" "}
          <span className="text-white">SEO Reimagined —</span>{" "}
          <a
            href="/osmosis"
            className="text-primary italic underline decoration-primary/40 underline-offset-4 hover:decoration-primary transition-colors"
          >
            SEO-Osmosis™
          </a>
          <br />
          Big Difference. First, we find the people already looking for you.
        </p>

        <div className="space-y-3 text-base sm:text-lg text-white/70 leading-relaxed">
          <p>
            We… <span className="text-white font-medium">start by forgetting you have a website.</span>
          </p>
          <p>
            Tell us what you do — clearly separated, the way Google should see it but never does.
            Our AI will translate it into how your customers actually search.
          </p>
          <p className="text-lg sm:text-xl">
            <span className="text-white/70">With us…</span>{" "}
            <span className="text-primary font-bold italic">Consider it handled!</span>
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="w-full space-y-4 mb-6">
        {/* Primary — required */}
        <div>
          <label className="text-lg sm:text-xl font-semibold text-white block tracking-tight mb-2">
            Primary service <span className="text-primary">*</span>
            <span className="text-white/50 font-normal text-sm ml-2">(the #1 thing you do for most customers)</span>
          </label>
          <Input
            type="text"
            placeholder="Residential moving"
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
            className="h-12 text-base bg-white/10 border-primary/40 text-white placeholder:text-white/25 placeholder:italic focus:border-primary rounded-xl"
            disabled={loading}
            autoCapitalize="sentences"
          />
        </div>

        {/* Secondary — optional */}
        <div>
          <label className="text-base font-semibold text-white/85 block mb-2 tracking-tight">
            Secondary service{" "}
            <span className="text-white/40 font-normal text-sm">(optional — a real second offering)</span>
          </label>
          <Input
            type="text"
            placeholder="Packing & unpacking"
            value={secondary}
            onChange={(e) => setSecondary(e.target.value)}
            className="h-11 text-base bg-white/5 border-white/15 text-white placeholder:text-white/25 placeholder:italic focus:border-primary rounded-xl"
            disabled={loading}
          />
        </div>

        {/* Other — optional */}
        <div>
          <label className="text-base font-semibold text-white/85 block mb-2 tracking-tight">
            Other services{" "}
            <span className="text-white/40 font-normal text-sm">(optional — extras you also offer)</span>
          </label>
          <Input
            type="text"
            placeholder="Junk removal, storage"
            value={other}
            onChange={(e) => setOther(e.target.value)}
            className="h-11 text-base bg-white/5 border-white/15 text-white placeholder:text-white/25 placeholder:italic focus:border-primary rounded-xl"
            disabled={loading}
          />
        </div>

        {/* What you DON'T do — optional */}
        <div>
          <label className="text-base font-semibold text-white/85 block mb-2 tracking-tight">
            What you don't do{" "}
            <span className="text-white/40 font-normal text-sm">(optional — keeps us from suggesting wrong searches)</span>
          </label>
          <Input
            type="text"
            placeholder="Long-distance, commercial"
            value={dontDo}
            onChange={(e) => setDontDo(e.target.value)}
            className="h-11 text-base bg-white/5 border-white/15 text-white placeholder:text-white/25 placeholder:italic focus:border-primary rounded-xl"
            disabled={loading}
          />
        </div>

        {/* Who you serve */}
        <div>
          <label className="text-base font-semibold text-white/85 block mb-2 tracking-tight">
            Who do you do it for?{" "}
            <span className="text-white/40 font-normal text-sm">(optional — we'll fill it in if you skip)</span>
          </label>
          <Input
            type="text"
            placeholder="Homeowners, businesses"
            value={whoYouServe}
            onChange={(e) => setWhoYouServe(e.target.value)}
            className="h-11 text-base bg-white/5 border-white/15 text-white placeholder:text-white/25 placeholder:italic focus:border-primary rounded-xl"
            disabled={loading}
          />
        </div>

        {/* Location */}
        <div>
          <label className="text-base font-semibold text-primary block mb-2 tracking-tight">
            Where do you serve people? <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/70" />
            <Input
              type="text"
              placeholder="City, state, or area"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 h-14 text-base bg-white/10 border-primary/40 text-white placeholder:text-white/25 placeholder:italic focus:border-primary focus:bg-white/15 rounded-xl"
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

function LoadingPhase({ primary, location }: { primary: string; location: string }) {
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
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs sm:text-sm font-semibold tracking-wider uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          SEO Reimagined · Osmosis™
        </div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <Sparkles className="h-6 w-6 text-primary animate-pulse self-center" />
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight">
            <span className="text-white/70">With us…</span>{" "}
            <span className="text-primary italic">Consider it handled!</span>
          </p>
        </div>
      </div>

      <p className="text-base sm:text-lg text-white/60 max-w-2xl leading-relaxed">
        We're translating "{primary}" in "{location}" into the way real people search —
        then checking how many of them are out there right now.
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
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs sm:text-sm font-semibold tracking-wider uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          SEO Reimagined · Osmosis™
        </div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <Sparkles className="h-6 w-6 text-primary self-center" />
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight">
            <span className="text-white/70">With us…</span>{" "}
            <span className="text-primary italic">Consider it handled!</span>
          </p>
        </div>
        <p className="text-base sm:text-lg text-white/65 max-w-3xl leading-relaxed">
          You told us what you do. Our AI translated it into how your customers actually think
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
