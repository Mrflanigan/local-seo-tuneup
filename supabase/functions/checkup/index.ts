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

/**
 * Fetch robots.txt and detect XML sitemap presence.
 */
async function fetchCrawlHygiene(normalizedUrl: string) {
  const origin = new URL(normalizedUrl).origin;
  const result = {
    robotsTxt: { exists: false, blocksAll: false, sitemapDirectives: [] as string[], content: undefined as string | undefined },
    sitemap: { found: false, url: null as string | null, source: null as "robots" | "common-location" | null },
  };

  // 1. Fetch robots.txt
  try {
    const robotsRes = await fetch(`${origin}/robots.txt`, { redirect: "follow" });
    if (robotsRes.ok) {
      const text = await robotsRes.text();
      // Verify it's actually a robots.txt (not a soft-404 HTML page)
      if (!text.trim().startsWith("<!") && !text.trim().startsWith("<html")) {
        result.robotsTxt.exists = true;
        result.robotsTxt.content = text.slice(0, 2000); // keep first 2KB for reference
        // Check for Disallow: / under User-agent: *
        const lines = text.split("\n").map(l => l.trim().toLowerCase());
        let inWildcardAgent = false;
        for (const line of lines) {
          if (line.startsWith("user-agent:")) {
            inWildcardAgent = line.includes("*");
          }
          if (inWildcardAgent && line === "disallow: /") {
            result.robotsTxt.blocksAll = true;
          }
          // Extract Sitemap directives (case-insensitive)
          if (line.startsWith("sitemap:")) {
            const sitemapUrl = text.split("\n").find(l => l.trim().toLowerCase().startsWith("sitemap:"));
            if (sitemapUrl) {
              const url = sitemapUrl.split(/sitemap:\s*/i)[1]?.trim();
              if (url) result.robotsTxt.sitemapDirectives.push(url);
            }
          }
        }
        // Deduplicate
        result.robotsTxt.sitemapDirectives = [...new Set(result.robotsTxt.sitemapDirectives)];
      }
    }
    console.log(`[checkup] robots.txt: exists=${result.robotsTxt.exists}, blocksAll=${result.robotsTxt.blocksAll}, sitemaps=${result.robotsTxt.sitemapDirectives.length}`);
  } catch (err) {
    console.warn("[checkup] robots.txt fetch failed:", err);
  }

  // 2. Check sitemap — first from robots.txt directives, then common locations
  const sitemapCandidates = [
    ...result.robotsTxt.sitemapDirectives,
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/sitemap/`,
  ];

  for (const candidate of sitemapCandidates) {
    try {
      const sitemapRes = await fetch(candidate, { method: "HEAD", redirect: "follow" });
      if (sitemapRes.ok) {
        const ct = sitemapRes.headers.get("content-type") || "";
        // Accept XML or text responses (not HTML error pages)
        if (ct.includes("xml") || ct.includes("text/plain") || !ct.includes("html")) {
          result.sitemap.found = true;
          result.sitemap.url = candidate;
          result.sitemap.source = result.robotsTxt.sitemapDirectives.includes(candidate) ? "robots" : "common-location";
          break;
        }
      }
    } catch { /* skip */ }
  }

  console.log(`[checkup] Sitemap: found=${result.sitemap.found}, url=${result.sitemap.url}, source=${result.sitemap.source}`);
  return result;
}


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

    // 4. Fetch Google PageSpeed Insights + crawl hygiene in parallel
    const [pageSpeed, crawlHygiene] = await Promise.all([
      fetchPageSpeed(normalizedUrl),
      fetchCrawlHygiene(normalizedUrl),
    ]);

    // Attach extra data to result
    if (pageSpeed) (result as any).pageSpeed = pageSpeed;
    if (phraseOptics) (result as any).phraseOptics = phraseOptics;
    if (crawlHygiene) (result as any).crawlHygiene = crawlHygiene;

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
