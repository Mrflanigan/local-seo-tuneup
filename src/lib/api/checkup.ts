import { supabase } from "@/integrations/supabase/client";
import type { ScoringResult, ScanInput } from "@/lib/scoring/types";

/**
 * Calls the checkup edge function which scrapes the URL via Firecrawl
 * and runs the scoring engine server-side.
 */
export async function runCheckup(input: ScanInput): Promise<ScoringResult> {
  const { data, error } = await supabase.functions.invoke("checkup", {
    body: { url: input.url, city: input.city, state: input.state },
  });

  if (error) {
    throw new Error(`Checkup failed: ${error.message}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || "Checkup returned an unsuccessful response");
  }

  return data.data as ScoringResult;
}

/**
 * Saves the lead (email + report) to the database for follow-up.
 */
export async function saveLead(params: {
  email: string;
  url: string;
  city?: string;
  report: ScoringResult;
  wantsGameplan: boolean;
}): Promise<void> {
  const { data, error } = await supabase.functions.invoke("save-lead", {
    body: {
      email: params.email,
      url: params.url,
      city: params.city,
      report: params.report,
      wantsGameplan: params.wantsGameplan,
    },
  });

  if (error) {
    throw new Error(`Failed to save lead: ${error.message}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || "Failed to save lead");
  }
}

/**
 * Competitor scan result shape
 */
export interface CompetitorResult {
  url: string;
  title: string;
  businessName: string | null;
  overallScore: number;
  letterGrade: string;
  categories: { id: string; label: string; score: number; maxScore: number }[];
  strengths: string[];
}

/**
 * Scans top competitors for the same service + city.
 */
export async function scanCompetitors(params: {
  service: string;
  city?: string;
  userUrl: string;
}): Promise<{ competitors: CompetitorResult[]; query: string }> {
  const { data, error } = await supabase.functions.invoke("competitor-scan", {
    body: {
      service: params.service,
      city: params.city,
      userUrl: params.userUrl,
    },
  });

  if (error) {
    throw new Error(`Competitor scan failed: ${error.message}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || "Competitor scan returned an unsuccessful response");
  }

  return data.data;
}
