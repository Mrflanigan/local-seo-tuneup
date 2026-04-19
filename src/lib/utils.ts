import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalize a user-entered URL: trim whitespace & prepend https:// if missing.
 * Returns null if the input is empty/whitespace-only.
 */
export function cleanUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith("http")) return "https://" + trimmed;
  return trimmed;
}

/** Key used for persisting the last scan result in localStorage */
const LAST_SCAN_KEY = "lastScan";

export interface LastScanData {
  result: unknown;
  url: string;
  city?: string;
  businessType?: string;
  searchPhrases?: string[];
  businessName?: string;
  description?: string;
  keywordVolumes?: unknown;
  demandPreviewState?: unknown;
  ts?: number;
}

/** Save a scan result to localStorage (best-effort). */
export function saveLastScan(data: LastScanData): void {
  try {
    localStorage.setItem(LAST_SCAN_KEY, JSON.stringify({ ...data, ts: Date.now() }));
  } catch { /* storage full */ }
}

/** Read the last scan result from localStorage, or null if missing/corrupt. */
export function loadLastScan(): LastScanData | null {
  try {
    const raw = localStorage.getItem(LAST_SCAN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.result && parsed?.url) return parsed as LastScanData;
  } catch { /* corrupt */ }
  return null;
}
