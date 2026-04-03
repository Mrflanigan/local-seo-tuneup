import { TrendingUp, Clock, Search, Users } from "lucide-react";
import type { ScoringResult } from "@/lib/scoring/types";

interface Props {
  result: ScoringResult;
  city?: string;
}

interface ImpactItem {
  icon: React.ReactNode;
  metric: string;
  projection: string;
}

function buildImpactItems(result: ScoringResult, city?: string): ImpactItem[] {
  const ctx = result.siteContext;
  const name = ctx.businessName || "Your business";
  const location = city || ctx.locations[0] || "your area";
  const service = ctx.services[0] || "your services";
  const failedCount = result.categories.reduce(
    (n, c) => n + c.findings.filter((f) => !f.passed).length,
    0
  );

  const items: ImpactItem[] = [];

  items.push({
    icon: <Search className="h-5 w-5 text-primary" />,
    metric: "Search Visibility",
    projection: `With a fully optimized site, "${name}" would likely appear in the top 5 results for "${service} in ${location}" — instead of being buried on page 2 or 3 where fewer than 1% of searchers ever click.`,
  });

  items.push({
    icon: <Users className="h-5 w-5 text-primary" />,
    metric: "Monthly Leads",
    projection: `Businesses with strong local SEO typically see 3–5× more website inquiries. Over the past 12 months, that gap could mean dozens of ${location} customers who searched for exactly what you offer — and called a competitor instead.`,
  });

  items.push({
    icon: <TrendingUp className="h-5 w-5 text-primary" />,
    metric: "Google Trust Score",
    projection: `You currently have ${failedCount} technical signal${failedCount !== 1 ? "s" : ""} that Google can't read clearly. Each one fixed compounds over time — Google re-crawls and gradually promotes sites that "speak its language." A year of clean signals would have built serious ranking momentum by now.`,
  });

  items.push({
    icon: <Clock className="h-5 w-5 text-primary" />,
    metric: "The Compounding Effect",
    projection: `SEO isn't a light switch — it's a snowball. Every month with proper meta tags, schema markup, and geo-targeted content builds on the last. Starting 12 months ago would mean ${name} is the established, trusted result today — not the one Google is still trying to figure out.`,
  });

  return items;
}

function buildFixImpacts(result: ScoringResult, city?: string): { buzzword: string; impact: string }[] {
  const ctx = result.siteContext;
  const location = city || ctx.locations[0] || "your area";
  const service = ctx.services[0] || "your services";
  const name = ctx.businessName || "your site";

  const impactMap: Record<string, string> = {
    "title-tag": `Fixing your <title> tag to include "${service}" and "${location}" tells Google exactly what ${name} does and where — the single highest-impact on-page change you can make.`,
    "meta-description": `A compelling meta description acts as your ad copy in search results. Right now Google is auto-generating one for you — and it's probably not selling ${name} the way you would.`,
    "h1-tag": `Your H1 is the headline Google reads first. Including your service and city here reinforces what your page is about and who it's for.`,
    "structured-data": `Adding JSON-LD schema markup could unlock rich results — star ratings, business hours, service areas — making your listing visually stand out against competitors in ${location}.`,
    "og-tags": `Open Graph tags control how ${name} looks when shared on social media. Without them, Facebook and LinkedIn grab random text and images — not a great first impression.`,
    "canonical-tag": `Without a canonical tag, Google might see duplicate versions of your pages and split your ranking power between them — weakening all of them.`,
    "image-alt": `Alt text on images lets Google "see" your photos. For a local business, describing images with service and location terms adds extra ranking signals at zero cost.`,
    "city-in-title": `Adding "${location}" to your title tag is like putting your city on your storefront sign — it directly signals to Google which local searches you should appear in.`,
    "city-in-content": `Naturally mentioning ${location} in your page content helps Google confirm you actually serve that area, not just claim to.`,
    "city-in-meta": `Including ${location} in your meta description means searchers see their city name right in the search results — dramatically increasing click-through rate.`,
    "content-length": `Thin content tells Google there's not much expertise here. Adding detailed service descriptions, FAQs, or neighborhood guides gives Google (and customers) more reasons to trust ${name}.`,
    "internal-links": `Strong internal linking helps Google discover all your pages and understand which services matter most. Right now some of your content may be invisible to crawlers.`,
    "cta-presence": `Clear calls-to-action don't just convert visitors — they signal to Google that this is a real business page, not just informational content.`,
    "heading-structure": `A clear H2/H3 hierarchy helps Google parse your content into topics. Think of it as a table of contents that lets Google index each section separately.`,
    "https": `HTTPS isn't optional anymore — Google actively warns visitors away from non-secure sites and demotes them in rankings.`,
    "viewport-meta": `Over 60% of local searches happen on mobile. Without a responsive viewport tag, Google classifies your site as not mobile-friendly and ranks it lower in mobile results.`,
    "robots-txt": `Your robots.txt file tells Google which pages to crawl. A missing or misconfigured one could mean Google is ignoring your most important pages.`,
    "nap-phone": `Having your phone number consistently visible helps Google verify your business is real and match it with your Google Business Profile listing.`,
    "nap-address": `A visible address helps Google connect your website to your physical location — critical for "near me" searches in ${location}.`,
    "mobile-friendly": `Google uses mobile-first indexing, meaning it judges your site primarily by its mobile version. If it's not great on phones, your rankings suffer everywhere.`,
  };

  const failed = result.categories
    .flatMap((c) => c.findings)
    .filter((f) => !f.passed);

  return failed
    .filter((f) => impactMap[f.id])
    .map((f) => ({
      buzzword: f.id,
      impact: impactMap[f.id],
    }));
}

export default function YearAgoProjection({ result, city }: Props) {
  const impactItems = buildImpactItems(result, city);
  const fixImpacts = buildFixImpacts(result, city);
  const name = result.siteContext.businessName || "your business";

  return (
    <div className="space-y-8">
      {/* Year Ago Projection */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          If {name} had an optimized site 12 months ago…
        </h3>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          SEO compounds like interest. Here's what a year of clean technical
          signals would have meant for your business:
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {impactItems.map((item) => (
            <div
              key={item.metric}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2.5 mb-2">
                {item.icon}
                <span className="text-sm font-semibold text-foreground">
                  {item.metric}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.projection}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Per-fix Impact */}
      {fixImpacts.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            How Each Fix Helps {name} Specifically
          </h3>
          <p className="text-xs text-muted-foreground mb-5">
            These aren't generic tips — they're based on what we found on your
            site
          </p>
          <ul className="space-y-4">
            {fixImpacts.map((item) => (
              <li
                key={item.buzzword}
                className="border-b border-border/50 pb-4 last:border-0 last:pb-0"
              >
                <code className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {item.buzzword.replace(/-/g, " ")}
                </code>
                <p className="text-sm text-foreground mt-1.5 leading-relaxed">
                  {item.impact}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
