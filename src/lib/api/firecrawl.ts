import { supabase } from "@/integrations/supabase/client";
import type { FirecrawlScrapeResult, ScanInput } from "@/lib/scoring/types";

/**
 * Calls the firecrawl-scrape edge function to scrape a URL
 * and returns the result in the shape our scoring engine expects.
 */
export async function scrapeUrl(input: ScanInput): Promise<FirecrawlScrapeResult> {
  const { data, error } = await supabase.functions.invoke("firecrawl-scrape", {
    body: { url: input.url },
  });

  if (error) {
    throw new Error(`Scrape failed: ${error.message}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || "Scrape returned an unsuccessful response");
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
