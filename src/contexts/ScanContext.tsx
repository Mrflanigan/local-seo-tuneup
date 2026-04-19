import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { runCheckup } from "@/lib/api/checkup";
import type { ScoringResult, BusinessType, KeywordVolume } from "@/lib/scoring/types";
import { toast } from "sonner";
import { saveLastScan } from "@/lib/utils";

interface ScanState {
  loading: boolean;
  url: string;
  keywords: KeywordVolume[] | null;
  rankPage: number | null;
  city?: string;
  businessName?: string;
}

interface ScanContextValue {
  scan: ScanState;
  startScan: (
    url: string,
    city?: string,
    businessType?: BusinessType,
    searchPhrases?: string[],
    businessName?: string,
    description?: string,
  ) => void;
}

const ScanContext = createContext<ScanContextValue | null>(null);

export function useScan() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error("useScan must be inside ScanProvider");
  return ctx;
}

export function ScanProvider({ children }: { children: ReactNode }) {
  const [scan, setScan] = useState<ScanState>({
    loading: false,
    url: "",
    keywords: null,
    rankPage: null,
  });

  // We need navigate but it must be called inside Router, which ScanProvider is inside of.
  const navigateRef = useRef<ReturnType<typeof useNavigate> | null>(null);

  const startScan = useCallback(
    async (
      url: string,
      city?: string,
      businessType?: BusinessType,
      _searchPhrases?: string[],
      businessName?: string,
      description?: string,
    ) => {
      setScan({ loading: true, url, keywords: null, rankPage: null, city, businessName });

      try {
        const demandPreviewState = (() => {
          try {
            const raw = sessionStorage.getItem("demandPreview.state.v1");
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        })();

        // Increment scan count
        try {
          await supabase.functions.invoke("check-scan-limit", { body: { action: "increment" } });
        } catch { /* non-critical */ }

        // Step 1: Generate phrases if description provided
        let searchPhrases: string[] | undefined = _searchPhrases;
        let keywordVolumes: KeywordVolume[] | null = null;
        if (description) {
          try {
            const { data, error } = await supabase.functions.invoke("generate-phrases", {
              body: { description, city, businessName },
            });
            if (!error && data?.success && data.phrases?.length > 0) {
              searchPhrases = data.phrases;
              keywordVolumes = data.volumes || null;
              if (keywordVolumes) {
                setScan((s) => ({ ...s, keywords: keywordVolumes }));
              }
            }
          } catch (e) {
            console.warn("Phrase generation failed, continuing without:", e);
          }
        }

        // Step 2: Run checkup
        const result: ScoringResult = await runCheckup({ url, city, businessType, searchPhrases });
        const bestRank = result.phraseOptics?.rankings
          ?.filter((r) => r.page !== null)
          ?.sort((a, b) => (a.page ?? 99) - (b.page ?? 99))[0];
        if (bestRank?.page) {
          setScan((s) => ({ ...s, rankPage: bestRank.page }));
        }

        saveLastScan({ result, url, city, businessType, searchPhrases, businessName, description, keywordVolumes, demandPreviewState });

        await new Promise((r) => setTimeout(r, 3000));

        setScan({ loading: false, url: "", keywords: null, rankPage: null });
        navigateRef.current?.("/report", {
          state: { result, url, city, businessType, searchPhrases, businessName, keywordVolumes, demandPreviewState },
        });
      } catch (err) {
        toast.error("Something went wrong scanning that site. Please try again.");
        console.error(err);
        setScan({ loading: false, url: "", keywords: null, rankPage: null });
      }
    },
    [],
  );

  return (
    <ScanContext.Provider value={{ scan, startScan }}>
      <NavigateInjector navigateRef={navigateRef} />
      {children}
    </ScanContext.Provider>
  );
}

/** Tiny helper to capture useNavigate inside the Router tree */
function NavigateInjector({ navigateRef }: { navigateRef: React.MutableRefObject<ReturnType<typeof useNavigate> | null> }) {
  navigateRef.current = useNavigate();
  return null;
}
