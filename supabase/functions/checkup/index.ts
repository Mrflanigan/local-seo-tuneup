import { scrapeWithFirecrawl } from "../_shared/firecrawlClient.ts";
import { scoreWebsite } from "../_shared/scoring.ts";
import type { ScanInput } from "../_shared/scoring.ts";
import { buildPhraseOpticsSummary } from "../_shared/phraseOptics.ts";
import type { PhraseRanking } from "../_shared/phraseOptics.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Search a phrase via Firecrawl and find where the target domain ranks.
 */
async function searchPhrase(phrase: string, targetDomain: string, apiKey: string, city?: string): Promise<PhraseRanking> {
  const searchQuery = city ? `${phrase} ${city}` : phrase;

  try {
    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: searchQuery, limit: 30 }),
    });

    if (!response.ok) {
      console.warn(`[checkup] Firecrawl search failed for "${searchQuery}": ${response.status}`);
      return { phrase, position: null, page: null, totalResults: 0, serpResults: [] };
    }

    const data = await response.json();
    const results = data.data || [];
    const totalResults = results.length;

    const normalizedTarget = targetDomain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "").toLowerCase();

    let position: number | null = null;
    for (let i = 0; i < results.length; i++) {
      const resultUrl = (results[i].url || "").replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "").toLowerCase();
      if (resultUrl.startsWith(normalizedTarget)) {
        position = i + 1;
        break;
      }
    }

    const topResult = results[0] ? { title: results[0].title || "", url: results[0].url || "" } : undefined;
    // Capture top 10 SERP results for competition analysis
    const serpResults = results.slice(0, 10).map((r: any) => ({ url: r.url || "", title: r.title || "" }));

    return {
      phrase,
      position,
      page: position ? Math.ceil(position / 10) : null,
      totalResults,
      topResult,
      serpResults,
    };
  } catch (err) {
    console.warn(`[checkup] Phrase search error for "${phrase}":`, err);
    return { phrase, position: null, page: null, totalResults: 0, serpResults: [] };
  }
}

/**
 * Fetch Google PageSpeed Insights with retry logic.
 */
async function fetchPageSpeed(normalizedUrl: string) {
  try {
    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalizedUrl)}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO&strategy=MOBILE`;
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const psiRes = await fetch(psiUrl);
      if (psiRes.ok) {
        const psi = await psiRes.json();
        const cats = psi.lighthouseResult?.categories || {};
        const audits = psi.lighthouseResult?.audits || {};
        const pageSpeed = {
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
        return pageSpeed;
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
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, city, state, businessType, searchPhrases } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "A valid URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try { new URL(normalizedUrl); } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[checkup] Scraping ${normalizedUrl}, city=${city || "none"}, type=${businessType || "local"}, phrases=${(searchPhrases || []).length}`);

    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");

    // 1. Scrape with Firecrawl
    const scraped = await scrapeWithFirecrawl(normalizedUrl);

    // 2. Score
    const input: ScanInput = { url: normalizedUrl, city, state, businessType: businessType || "local" };
    const result = scoreWebsite(scraped, input);

    // 3. Phrase ranking search using shared utilities
    let phraseOptics = null;
    const phrases: string[] = Array.isArray(searchPhrases) ? searchPhrases.filter((p: unknown) => typeof p === "string" && (p as string).trim()) : [];
    if (phrases.length > 0 && apiKey) {
      try {
        const targetDomain = new URL(normalizedUrl).hostname;
        console.log(`[checkup] Searching ${phrases.length} phrases for domain: ${targetDomain}`);

        const rankings = await Promise.all(
          phrases.map((phrase: string) => searchPhrase(phrase.trim(), targetDomain, apiKey, city))
        );

        // Extract on-page signals from scraped data for alignment checks
        const html = scraped.html || "";
        const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
        const h2Matches = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gis)].map(m => m[1].replace(/<[^>]+>/g, "").trim());
        const urlSlug = normalizedUrl.replace(/https?:\/\/[^/]+/, "").replace(/\/$/, "");

        const onPageSignals = {
          title: scraped.metadata?.title || null,
          h1: h1Match ? h1Match[1].replace(/<[^>]+>/g, "").trim() : null,
          h2s: h2Matches,
          urlSlug,
        };

        phraseOptics = buildPhraseOpticsSummary({
          rankings,
          userDomain: targetDomain,
          onPageSignals,
        });

        console.log(`[checkup] Phrase optics score: ${phraseOptics.overallOpticsScore}, results: ${phraseOptics.phraseResults.map(r => `"${r.phrase}"=#${r.currentPosition ?? "N/A"} ${r.pageOnePotential}`).join(", ")}`);
      } catch (phraseErr) {
        console.warn("[checkup] Phrase search failed:", phraseErr);
      }
    }

    // 4. Fetch Google PageSpeed Insights
    const pageSpeed = await fetchPageSpeed(normalizedUrl);

    // Attach extra data to result
    if (pageSpeed) (result as any).pageSpeed = pageSpeed;
    if (phraseOptics) (result as any).phraseOptics = phraseOptics;

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
