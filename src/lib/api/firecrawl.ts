import type { FirecrawlScrapeResult, ScanInput } from "@/lib/scoring/types";

/**
 * Calls the firecrawl-scrape edge function.
 * For now, returns a mock result so the UI can be developed
 * before Cloud is enabled.
 */
export async function scrapeUrl(input: ScanInput): Promise<FirecrawlScrapeResult> {
  // TODO: Replace with real edge function call once Cloud is enabled:
  // const { data, error } = await supabase.functions.invoke("firecrawl-scrape", {
  //   body: { url: input.url },
  // });

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 2000));

  // Return mock data for UI development
  return {
    markdown: `
# Smith Plumbing & Repair

We are the trusted plumbing experts serving the greater ${input.city || "Austin"} area since 1998.

## Our Services

- Emergency plumbing repair
- Water heater installation
- Kitchen and bathroom remodeling
- Drain cleaning and maintenance
- Sewer line inspection

## Why Choose Us?

With over 25 years of experience, we provide fast, reliable plumbing services. 
Call us today for a free estimate!

### Customer Reviews

"Smith Plumbing fixed our burst pipe in under an hour. Highly recommend!" — Jane D.
"Professional, on-time, and fair pricing. 5 stars!" — Mike R.

Contact us at (512) 555-1234 or email info@smithplumbing.com

123 Main Street, ${input.city || "Austin"}, TX 78701

Follow us on Facebook and check our reviews on Yelp!
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <title>Smith Plumbing & Repair | ${input.city || "Austin"}'s Trusted Plumber</title>
  <meta name="description" content="Smith Plumbing serves the greater ${input.city || "Austin"} area with 24/7 emergency plumbing, water heater installation, and remodeling services. Call (512) 555-1234.">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="canonical" href="${input.url}">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","name":"Smith Plumbing","telephone":"(512) 555-1234"}</script>
</head>
<body>
  <h1>Smith Plumbing & Repair</h1>
  <p>Emergency plumbing repair, water heater installation, kitchen and bathroom remodeling.</p>
  <p>Call us today: <a href="tel:5125551234">(512) 555-1234</a></p>
  <p>Email: info@smithplumbing.com</p>
  <p>123 Main Street, ${input.city || "Austin"}, TX 78701</p>
  <img src="team.jpg" alt="Smith Plumbing team at work in ${input.city || "Austin"}">
  <img src="van.jpg" alt="Our service van">
  <a href="https://facebook.com/smithplumbing">Facebook</a>
  <a href="https://yelp.com/biz/smith-plumbing">Yelp</a>
  <a href="https://www.google.com/maps/place/Smith+Plumbing">Find us on Google Maps</a>
  <iframe src="https://www.google.com/maps/embed?pb=..."></iframe>
  <p>Reviews: "Best plumber in town!" — 5 stars</p>
  <p><a href="https://g.page/smith-plumbing">Leave us a review on Google</a></p>
  <button>Get a Free Quote</button>
</body>
</html>
    `.trim(),
    metadata: {
      title: `Smith Plumbing & Repair | ${input.city || "Austin"}'s Trusted Plumber`,
      description: `Smith Plumbing serves the greater ${input.city || "Austin"} area with 24/7 emergency plumbing, water heater installation, and remodeling services. Call (512) 555-1234.`,
      ogSiteName: "Smith Plumbing & Repair",
    },
  };
}
