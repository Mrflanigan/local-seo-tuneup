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
 * Follow redirect chain for a URL variant manually.
 */
async function followRedirects(startUrl: string, maxRedirects = 10): Promise<{ url: string; status: number }[]> {
  const hops: { url: string; status: number }[] = [];
  let currentUrl = startUrl;
  
  for (let i = 0; i < maxRedirects; i++) {
    try {
      const res = await fetch(currentUrl, { method: "GET", redirect: "manual", headers: { "User-Agent": "SEO-Osmosis-Bot/1.0" } });
      hops.push({ url: currentUrl, status: res.status });
      
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) break;
        // Handle relative URLs
        currentUrl = location.startsWith("http") ? location : new URL(location, currentUrl).href;
      } else {
        break;
      }
    } catch {
      hops.push({ url: currentUrl, status: 0 });
      break;
    }
  }
  return hops;
}

/**
 * Test redirect chains for the 4 URL variants and extract canonical.
 */
async function fetchRedirectChain(normalizedUrl: string, html: string) {
  const parsed = new URL(normalizedUrl);
  const hostname = parsed.hostname.replace(/^www\./, "");
  const path = parsed.pathname + parsed.search;
  
  const variants = [
    `http://${hostname}${path}`,
    `https://${hostname}${path}`,
    `http://www.${hostname}${path}`,
    `https://www.${hostname}${path}`,
  ];
  
  // Follow redirects for each variant in parallel
  const results = await Promise.all(
    variants.map(async (variant) => {
      const hops = await followRedirects(variant);
      const lastHop = hops[hops.length - 1];
      return {
        variant,
        hops,
        finalUrl: lastHop?.url || variant,
        finalStatus: lastHop?.status || 0,
      };
    })
  );
  
  // Extract canonical from HTML
  const canonicalMatch = html.match(/<link[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']+)["']/i);
  const canonicalUrl = canonicalMatch ? canonicalMatch[1] : null;
  
  const maxHops = Math.max(...results.map(r => r.hops.length));
  const primaryFinal = results.find(r => r.variant.startsWith("https://") && !r.variant.includes("www."))?.finalUrl || results[0]?.finalUrl || "";
  const canonicalMatchesFinal = canonicalUrl ? primaryFinal.replace(/\/$/, "") === canonicalUrl.replace(/\/$/, "") : false;
  
  console.log(`[checkup] Redirect chain: maxHops=${maxHops}, canonical=${canonicalUrl}, matches=${canonicalMatchesFinal}`);
  
  return {
    chains: results,
    canonicalUrl,
    canonicalMatchesFinal,
    maxHops,
  };
}


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

    // 1. Scrape with Firecrawl + fetch crawl hygiene in parallel
    const [scraped, crawlHygiene] = await Promise.all([
      scrapeWithFirecrawl(normalizedUrl),
      fetchCrawlHygiene(normalizedUrl),
    ]);

    // 2. Score (with crawl hygiene data)
    const input: ScanInput = { url: normalizedUrl, city, state, businessType: businessType || "local", crawlHygiene };
    const result = scoreWebsite(scraped, input);

    // 2b. Fetch redirect chain (uses scraped HTML for canonical extraction)
    let redirectChain = null;
    try {
      redirectChain = await fetchRedirectChain(normalizedUrl, scraped.html || "");
    } catch (err) {
      console.warn("[checkup] Redirect chain fetch failed:", err);
    }

    // Score redirect chain as a finding
    if (redirectChain) {
      const techCat = result.categories.find((c: any) => c.id === "technical-seo");
      if (techCat) {
        const maxHops = redirectChain.maxHops;
        const allResolve200 = redirectChain.chains.every((c: any) => c.finalStatus === 200);
        const rcScore = (maxHops <= 2 && allResolve200 && redirectChain.canonicalMatchesFinal) ? 3
          : (maxHops <= 3 && allResolve200) ? 2
          : (allResolve200) ? 1 : 0;
        techCat.findings.push({
          id: "redirect-chain",
          passed: rcScore >= 2,
          points: rcScore,
          maxPoints: 3,
          generic: rcScore >= 2 ? "Clean redirect chain." : "Redirect chain issues detected.",
          personalized: rcScore >= 2
            ? `Your site resolves cleanly in ${maxHops} hop${maxHops !== 1 ? "s" : ""} with a matching canonical URL — no wasted redirects.`
            : maxHops > 2
              ? `Your site takes ${maxHops} redirects to reach the final page. Each redirect adds load time and dilutes SEO value. Aim for 2 hops or fewer.`
              : !redirectChain.canonicalMatchesFinal
                ? "Your canonical tag doesn't match your final resolved URL. This sends mixed signals to Google about which version to index."
                : "Your redirect chain could be cleaner for better performance.",
        });
        techCat.score += rcScore;
        techCat.maxScore = 28;
      }
    }

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

        // Fetch monthly search volumes from DataForSEO (best-effort)
        try {
          const dfsCreds = Deno.env.get("DATAFORSEO_CREDENTIALS");
          if (dfsCreds) {
            const dfsRes = await fetch(
              "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
              {
                method: "POST",
                headers: { Authorization: `Basic ${dfsCreds}`, "Content-Type": "application/json" },
                body: JSON.stringify([{
                  keywords: phrases.map(p => p.trim()),
                  location_code: 2840,
                  language_code: "en",
                }]),
              }
            );
            if (dfsRes.ok) {
              const dfsData = await dfsRes.json();
              const items = dfsData?.tasks?.[0]?.result ?? [];
              const volMap = new Map<string, number>();
              for (const it of items) {
                if (it?.keyword && typeof it.search_volume === "number") {
                  volMap.set(String(it.keyword).toLowerCase(), it.search_volume);
                }
              }
              for (const r of rankings) {
                const v = volMap.get(r.phrase.toLowerCase());
                if (typeof v === "number") (r as any).searchVolume = v;
              }
              console.log(`[checkup] Volumes fetched for ${volMap.size}/${phrases.length} phrases`);
            } else {
              console.warn(`[checkup] DataForSEO volume fetch failed: ${dfsRes.status}`);
            }
          }
        } catch (volErr) {
          console.warn("[checkup] Volume lookup failed:", volErr);
        }

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

    // 5. Brand Visibility — 3 discovery searches
    let brandVisibility = null;
    if (apiKey) {
      try {
        const targetDomain = new URL(normalizedUrl).hostname;
        const normalizedTarget = targetDomain.replace(/^www\./, "").toLowerCase();
        // domainName available for future use
        const businessName = result.siteContext?.businessName || null;

        // Helper: run a search and find if our domain appears
        async function brandSearch(query: string): Promise<{
          query: string; found: boolean; position: number | null;
          totalResults: number; topResult?: { title: string; url: string };
        }> {
          const resp = await fetch("https://api.firecrawl.dev/v1/search", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ query, limit: 20 }),
          });
          if (!resp.ok) return { query, found: false, position: null, totalResults: 0 };
          const d = await resp.json();
          const results = d.data || [];
          let position: number | null = null;
          for (let i = 0; i < results.length; i++) {
            const rUrl = (results[i].url || "").replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "").toLowerCase();
            if (rUrl.startsWith(normalizedTarget)) { position = i + 1; break; }
          }
          return {
            query,
            found: position !== null,
            position,
            totalResults: results.length,
            topResult: results[0] ? { title: results[0].title || "", url: results[0].url || "" } : undefined,
          };
        }

        // Run searches in parallel — only use user-provided city, never scraped data
        const searchCity = city || null; // STRICT: only from user input
        const [indexed, domainSearch, brandNameSearch] = await Promise.all([
          brandSearch(`site:${normalizedTarget}`),
          brandSearch(normalizedTarget),
          (businessName && searchCity)
            ? brandSearch(`${businessName} ${searchCity}`)
            : Promise.resolve(null),
        ]);

        // Build summary
        let summary = "";
        if (!indexed.found) {
          summary = "Your site may not be indexed by Google — this is the #1 issue to fix.";
        } else if (!domainSearch.found) {
          summary = "Google knows your site exists but doesn't rank you for your own domain name.";
        } else if (brandNameSearch && !brandNameSearch.found) {
          summary = `You rank for your domain but not for "${businessName} ${searchCity}" — brand recognition gap.`;
        } else if (brandNameSearch?.found && (brandNameSearch.position || 99) <= 3) {
          summary = "Google can find you, recognizes your brand, and ranks you for your name — solid foundation.";
        } else {
          summary = "Google can find your site and you're showing up for your domain name.";
        }

        brandVisibility = { indexed, domainSearch, brandNameSearch, summary };
        console.log(`[checkup] Brand visibility: indexed=${indexed.found}, domain=${domainSearch.found}@${domainSearch.position}, brand=${brandNameSearch?.found}@${brandNameSearch?.position}`);
      } catch (bvErr) {
        console.warn("[checkup] Brand visibility search failed:", bvErr);
      }
    }

    // 6. Backlink summary from DataForSEO
    let backlinkSummary = null;
    const dfsCreds = Deno.env.get('DATAFORSEO_CREDENTIALS');
    if (dfsCreds) {
      try {
        const targetDomain = new URL(normalizedUrl).hostname.replace(/^www\./, '');
        const blResp = await fetch('https://api.dataforseo.com/v3/backlinks/summary/live', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${dfsCreds}`,
          },
          body: JSON.stringify([{ target: targetDomain, internal_list_limit: 0, backlinks_status_type: 'live' }]),
        });
        if (blResp.ok) {
          const blData = await blResp.json();
          const blResult = blData?.tasks?.[0]?.result?.[0];
          if (blResult) {
            backlinkSummary = {
              target: targetDomain,
              totalBacklinks: blResult.backlinks || 0,
              referringDomains: blResult.referring_domains || 0,
              domainRank: blResult.rank || 0,
              brokenBacklinks: blResult.broken_backlinks || 0,
              referringIps: blResult.referring_ips || 0,
              followLinks: (blResult.backlinks || 0) - (blResult.backlinks_nofollow || 0),
              nofollowLinks: blResult.backlinks_nofollow || 0,
            };
            console.log(`[checkup] Backlinks: ${backlinkSummary.referringDomains} referring domains, rank=${backlinkSummary.domainRank}`);
          }
        }
      } catch (blErr) {
        console.warn('[checkup] Backlink summary failed:', blErr);
      }
    }

    // Attach extra data to result
    if (pageSpeed) (result as any).pageSpeed = pageSpeed;
    if (phraseOptics) (result as any).phraseOptics = phraseOptics;
    if (crawlHygiene) (result as any).crawlHygiene = crawlHygiene;
    if (redirectChain) (result as any).redirectChain = redirectChain;
    if (brandVisibility) (result as any).brandVisibility = brandVisibility;
    if (backlinkSummary) (result as any).backlinkSummary = backlinkSummary;

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
