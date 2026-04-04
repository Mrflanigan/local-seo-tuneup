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
    const { url, city, state, businessType } = await req.json();

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

    console.log(`[checkup] Scraping ${normalizedUrl}, city=${city || "none"}, type=${businessType || "local"}`);

    // 1. Scrape with Firecrawl
    const scraped = await scrapeWithFirecrawl(normalizedUrl);

    // 2. Score
    const input: ScanInput = { url: normalizedUrl, city, state, businessType: businessType || "local" };
    const result = scoreWebsite(scraped, input);

    // 3. Fetch Google PageSpeed Insights (non-blocking — don't fail the scan if this errors)
    let pageSpeed = null;
    try {
      const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalizedUrl)}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO&strategy=MOBILE`;
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const psiRes = await fetch(psiUrl);
        if (psiRes.ok) {
          const psi = await psiRes.json();
          const cats = psi.lighthouseResult?.categories || {};
          const audits = psi.lighthouseResult?.audits || {};
          pageSpeed = {
            performance: Math.round((cats.performance?.score || 0) * 100),
            accessibility: Math.round((cats.accessibility?.score || 0) * 100),
            bestPractices: Math.round((cats["best-practices"]?.score || 0) * 100),
            seo: Math.round((cats.seo?.score || 0) * 100),
            coreWebVitals: {
              lcp: audits["largest-contentful-paint"]?.numericValue,
              fid: audits["max-potential-fid"]?.numericValue,
              cls: audits["cumulative-layout-shift"]?.numericValue,
              fcp: audits["first-contentful-paint"]?.numericValue,
              si: audits["speed-index"]?.numericValue,
              tbt: audits["total-blocking-time"]?.numericValue,
              tti: audits["interactive"]?.numericValue,
            },
            fetchedAt: new Date().toISOString(),
          };
          console.log(`[checkup] PageSpeed: perf=${pageSpeed.performance}, seo=${pageSpeed.seo}`);
          break;
        } else if (psiRes.status === 429 && attempt < maxAttempts) {
          console.warn(`[checkup] PageSpeed 429, retrying in ${attempt * 3}s (attempt ${attempt}/${maxAttempts})`);
          await new Promise(r => setTimeout(r, attempt * 3000));
        } else {
          console.warn(`[checkup] PageSpeed API returned ${psiRes.status} on attempt ${attempt}`);
          break;
        }
      }
    } catch (psiErr) {
      console.warn("[checkup] PageSpeed fetch failed:", psiErr);
    }

    // Attach pageSpeed data to result
    if (pageSpeed) {
      (result as any).pageSpeed = pageSpeed;
    }

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
