import { useState, useEffect } from "react";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import peakBg from "@/assets/getstarted-peak.jpg";

interface RateLimitStatus {
  allowed: boolean;
  scanCount: number;
  remaining: number;
  needsContext: boolean;
  reason?: string;
  message?: string;
}

async function checkScanLimit(): Promise<RateLimitStatus> {
  try {
    const { data, error } = await supabase.functions.invoke("check-scan-limit", {
      body: { action: "check" },
    });
    if (error) throw error;
    return data as RateLimitStatus;
  } catch {
    return { allowed: true, scanCount: 0, remaining: 3, needsContext: false };
  }
}

export default function GetStarted() {
  const navigate = useNavigate();
  const [description, setDescription] = useState(() => {
    try { return localStorage.getItem("seo-description") || ""; } catch { return ""; }
  });
  const [loading, setLoading] = useState(false);
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus | null>(null);
  const [limitBlocked, setLimitBlocked] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");

  useEffect(() => {
    checkScanLimit().then((status) => {
      setRateLimitStatus(status);
      if (!status.allowed) {
        setLimitBlocked(true);
        setLimitMessage(
          status.message ||
            "You've used your complimentary scans from this connection today. If you're an agency or need more, reach out and we'll set you up properly instead of hacking around it."
        );
      }
    });
  }, []);

  // Persist description
  useEffect(() => {
    try { localStorage.setItem("seo-description", description); } catch {}
  }, [description]);

  const handleFindDemand = async () => {
    const trimmed = description.trim();
    if (!trimmed || trimmed.length < 10) return;

    // Re-check rate limit
    const freshStatus = await checkScanLimit();
    if (!freshStatus.allowed) {
      setLimitBlocked(true);
      setLimitMessage(
        freshStatus.message ||
          "You've used your complimentary scans from this connection today."
      );
      return;
    }

    setLoading(true);

    try {
      // Increment scan count
      try {
        await supabase.functions.invoke("check-scan-limit", { body: { action: "increment" } });
      } catch { /* non-critical */ }

      // Call generate-phrases with just the description
      const { data, error } = await supabase.functions.invoke("generate-phrases", {
        body: { description: trimmed },
      });

      if (error) throw error;

      const phrases = data?.phrases || [];
      const volumes = data?.volumes || null;

      // Store demand results and navigate to demand preview
      const demandResult = {
        description: trimmed,
        phrases,
        volumes,
        ts: Date.now(),
      };

      try {
        localStorage.setItem("demandResult", JSON.stringify(demandResult));
      } catch {}

      navigate("/demand-preview", { state: demandResult });
    } catch (err) {
      console.error("Demand lookup failed:", err);
      // Even if volume lookup fails, navigate with seed phrases
      navigate("/demand-preview", {
        state: { description: trimmed, phrases: [], volumes: null, ts: Date.now() },
      });
    } finally {
      setLoading(false);
    }
  };

  // Check for previous scan results
  const hasLastScan = (() => {
    try {
      const raw = localStorage.getItem("lastScan");
      if (!raw) return false;
      return !!JSON.parse(raw)?.result;
    } catch { return false; }
  })();

  const goToLastReport = () => {
    try {
      const raw = localStorage.getItem("lastScan");
      if (!raw) return;
      const { result, url, city, businessType, searchPhrases, businessName, keywordVolumes } = JSON.parse(raw);
      navigate("/report", { state: { result, url, city, businessType, searchPhrases, businessName, keywordVolumes } });
    } catch {}
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
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex min-h-screen w-full flex-col px-8 sm:px-16 py-6">
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
            STEP 1 OF 2
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-2xl">
            {/* Intro paragraph */}
            <div className="mb-10 space-y-4">
              <p
                className="text-xl sm:text-2xl font-semibold text-white leading-relaxed"
                style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
              >
                We're going to start by forgetting you have a website. It doesn't matter yet.
              </p>
              <p className="text-base text-white/70 leading-relaxed">
                Our first priority is to understand your business: what you actually do best and who you do it for.
                Then we deploy one of the world's best search‑word companies to see how many people are searching
                for what you do, and what words they're using to find you.
              </p>
              <p className="text-sm text-white/50 leading-relaxed">
                Once we understand your business and how people search for you, it's just a question of:
                <span className="italic text-white/70"> "Does your site clearly connect you to those searches, or not?"</span>
              </p>
            </div>

            {limitBlocked && (
              <div className="rounded-xl border border-accent/30 bg-accent/10 p-5 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">Today's complimentary scans used</p>
                    <p className="text-sm text-white/70">{limitMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {!limitBlocked && (
              <div className="space-y-4">
              <div className="space-y-2">
                  <label
                    className="text-base font-bold text-white drop-shadow-md"
                    style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif", textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}
                  >
                    In your own words, what do you actually do best, and who do you do it for?
                  </label>
                  <Textarea
                    placeholder='Example: "We remodel bathrooms and kitchens for homeowners in north Seattle."'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px] text-base text-white placeholder:text-white/50 resize-none bg-black/40 border-white/30 backdrop-blur-sm focus:border-primary"
                    disabled={loading}
                    spellCheck={true}
                    autoCorrect="on"
                    autoCapitalize="sentences"
                  />
                  <p className="text-xs text-white/70 drop-shadow" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                    Don't overthink it — just describe what you do like you'd tell a neighbor.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleFindDemand}
                  disabled={loading || description.trim().length < 10}
                  className="h-14 px-10 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 italic disabled:opacity-50 shadow-lg"
                  size="lg"
                  style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Finding the demand…
                    </>
                  ) : (
                    "Find the demand"
                  )}
                </Button>

                <div className="flex items-center gap-4 mt-4">
                  <p
                    className="text-sm text-white/70 drop-shadow"
                    style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
                  >
                    Complimentary: up to 3 scans a day per location. No login.
                  </p>
                  {hasLastScan && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={goToLastReport}
                      className="shrink-0 border-white/20 text-white/70 hover:text-white hover:border-white/40 bg-white/5"
                    >
                      View last results →
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pb-4 text-right">
          <p className="text-[11px] tracking-widest text-white/50 uppercase">
            Burj Khalifa · Dubai · 2,717 ft · Tallest structure ever built
          </p>
        </div>
      </div>
    </div>
  );
}
