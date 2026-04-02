import { scrapeWithFirecrawl } from "../_shared/firecrawlClient.ts";
import { scoreWebsite } from "../_shared/scoring.ts";
import type { ScanInput } from "../_shared/scoring.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, city, state } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "A valid URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Validate URL format
    try {
      new URL(normalizedUrl);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[checkup] Scraping ${normalizedUrl}, city=${city || "none"}`);

    // 1. Scrape with Firecrawl
    const scraped = await scrapeWithFirecrawl(normalizedUrl);

    // 2. Score
    const input: ScanInput = { url: normalizedUrl, city, state };
    const result = scoreWebsite(scraped, input);

    console.log(`[checkup] Score: ${result.overallScore} (${result.letterGrade})`);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[checkup] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to run checkup";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
