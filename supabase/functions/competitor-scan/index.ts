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
    const { service, city, userUrl } = await req.json();

    if (!service || typeof service !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Service/industry is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build search query
    const query = city ? `${service} in ${city}` : service;
    console.log(`[competitor-scan] Searching: "${query}"`);

    // Use Firecrawl search to find top competitors
    const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit: 15,
        scrapeOptions: { formats: ["markdown", "html", "links"] },
      }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error("[competitor-scan] Search error:", searchData);
      throw new Error(searchData.error || "Search failed");
    }

    const results = searchData.data || [];
    console.log(`[competitor-scan] Found ${results.length} search results`);

    // Normalize user URL for comparison
    const userHost = userUrl ? new URL(userUrl.startsWith("http") ? userUrl : `https://${userUrl}`).hostname.replace(/^www\./, "") : null;

    // Filter out the user's own site, directories (yelp, yellowpages, etc), and take top 3
    const directoryDomains = ["yelp.com", "yellowpages.com", "bbb.org", "facebook.com", "instagram.com", "twitter.com", "linkedin.com", "nextdoor.com", "angieslist.com", "homeadvisor.com", "thumbtack.com", "google.com", "mapquest.com", "manta.com"];
    
    const competitorResults = results.filter((r: any) => {
      if (!r.url) return false;
      try {
        const host = new URL(r.url).hostname.replace(/^www\./, "");
        if (userHost && host === userHost) return false;
        if (directoryDomains.some(d => host.includes(d))) return false;
        return true;
      } catch { return false; }
    }).slice(0, 3);

    console.log(`[competitor-scan] Scoring ${competitorResults.length} competitors`);

    // Score each competitor
    const competitors = [];
    for (const result of competitorResults) {
      try {
        const scraped = {
          markdown: result.markdown || "",
          html: result.html || result.rawHtml || "",
          metadata: result.metadata || {},
          links: result.links || [],
        };

        // If search didn't return full HTML, do a separate scrape
        if (!scraped.html || scraped.html.length < 200) {
          console.log(`[competitor-scan] Scraping ${result.url} for full content`);
          const fullScrape = await scrapeWithFirecrawl(result.url);
          scraped.html = fullScrape.html;
          scraped.markdown = fullScrape.markdown;
          scraped.metadata = fullScrape.metadata || {};
          scraped.links = fullScrape.links || [];
        }

        const input: ScanInput = { url: result.url, city, state: undefined };
        const scored = scoreWebsite(scraped, input);

        competitors.push({
          url: result.url,
          title: result.title || scored.siteContext.businessName || new URL(result.url).hostname,
          businessName: scored.siteContext.businessName,
          overallScore: scored.overallScore,
          letterGrade: scored.letterGrade,
          categories: scored.categories.map(c => ({
            id: c.id,
            label: c.label,
            score: c.score,
            maxScore: c.maxScore,
          })),
          strengths: scored.categories
            .flatMap(c => c.findings)
            .filter(f => f.passed)
            .map(f => f.id),
        });

        console.log(`[competitor-scan] ${result.url}: ${scored.overallScore} (${scored.letterGrade})`);
      } catch (err) {
        console.error(`[competitor-scan] Failed to score ${result.url}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: { competitors, query } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[competitor-scan] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to scan competitors";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
