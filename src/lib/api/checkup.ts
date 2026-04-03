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
 * Saves a scan snapshot (before/after) for progression tracking.
 */
export async function saveSnapshot(params: {
  url: string;
  city?: string;
  label: "before" | "after";
  overallScore: number;
  letterGrade: string;
  report: ScoringResult;
  notes?: string;
}): Promise<string> {
  const { data, error } = await supabase.functions.invoke("save-snapshot", {
    body: {
      url: params.url,
      city: params.city,
      label: params.label,
      overallScore: params.overallScore,
      letterGrade: params.letterGrade,
      report: params.report,
      notes: params.notes,
    },
  });

  if (error) throw new Error(`Failed to save snapshot: ${error.message}`);
  if (!data?.success) throw new Error(data?.error || "Failed to save snapshot");
  return data.id;
}

/**
 * Fetches all scan snapshots for a given URL.
 */
export interface SnapshotRecord {
  id: string;
  url: string;
  label: string;
  city: string | null;
  overall_score: number;
  letter_grade: string;
  report_json: ScoringResult;
  notes: string | null;
  created_at: string;
}

export async function getSnapshots(url?: string): Promise<SnapshotRecord[]> {
  const { data, error } = await supabase.functions.invoke("get-snapshots", {
    body: { url },
  });

  if (error) throw new Error(`Failed to fetch snapshots: ${error.message}`);
  if (!data?.success) throw new Error(data?.error || "Failed to fetch snapshots");
  return data.data as SnapshotRecord[];
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

  if (error) throw new Error(`Competitor scan failed: ${error.message}`);
  if (!data?.success) throw new Error(data?.error || "Competitor scan returned an unsuccessful response");
  return data.data;
}
