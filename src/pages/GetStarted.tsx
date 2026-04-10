import { useState, useEffect } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UrlInputForm from "@/components/UrlInputForm";
import ScanningView from "@/components/ScanningView";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { BusinessType } from "@/lib/scoring/types";
import { useScan } from "@/contexts/ScanContext";
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
  const { scan, startScan } = useScan();

  // Rate limiting state
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

  const handleSubmit = async (url: string, city?: string, businessType?: BusinessType, searchPhrases?: string[], businessName?: string, description?: string) => {
    const freshStatus = await checkScanLimit();
    if (!freshStatus.allowed) {
      setLimitBlocked(true);
      setLimitMessage(
        freshStatus.message ||
          "You've used your complimentary scans from this connection today. If you're an agency or need more, reach out and we'll set you up properly instead of hacking around it."
      );
      return;
    }
    startScan(url, city, businessType, searchPhrases, businessName, description);
  };

  if (scan.loading) {
    return <ScanningView url={scan.url} keywords={scan.keywords} rankPage={scan.rankPage} city={scan.city} businessName={scan.businessName} />;
  }

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
            PAGE 2
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full">
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white"
              style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
            >
              Enter your website to run your complimentary Google checkup.
            </h1>
            <p className="text-lg text-white/70 mb-10">
              Tell us what you do — we'll find the search terms that matter and show you where you stand.
            </p>

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
              <>
                <UrlInputForm onSubmit={handleSubmit} loading={scan.loading} />
                <p
                  className="text-sm text-white/40 mt-6"
                  style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
                >
                  Complimentary: up to 3 scans a day per location. No login.
                </p>
              </>
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
