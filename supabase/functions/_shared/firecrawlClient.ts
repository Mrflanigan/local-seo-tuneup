// supabase/functions/_shared/firecrawlClient.ts
// Wrapper for calling the Firecrawl API from edge functions

export interface ScrapeResult {
  markdown: string;
  html: string;
  metadata?: Record<string, unknown>;
  links?: string[];
}

export async function scrapeWithFirecrawl(url: string): Promise<ScrapeResult> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is not configured");
  }

  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
    formattedUrl = `https://${formattedUrl}`;
  }

  console.log("Scraping URL:", formattedUrl);

  const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: formattedUrl,
      formats: ["markdown", "html", "links"],
      onlyMainContent: false,
      waitFor: 5000,
      timeout: 60000,
    }),
  });

  const rawText = await response.text();
  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch {
    console.error(`Firecrawl returned non-JSON (status ${response.status}):`, rawText.slice(0, 500));
    throw new Error(`Firecrawl returned non-JSON response (status ${response.status}): ${rawText.slice(0, 200)}`);
  }

  if (!response.ok) {
    console.error("Firecrawl API error:", data);
    throw new Error(data.error || `Firecrawl request failed with status ${response.status}`);
  }

  // Firecrawl v1 nests content inside data.data
  const scraped = data.data ?? data;

  return {
    markdown: scraped.markdown || "",
    html: scraped.html || scraped.rawHtml || "",
    metadata: scraped.metadata,
    links: scraped.links,
  };
}
