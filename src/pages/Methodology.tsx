import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Search, Settings, FileText, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    icon: MapPin,
    label: "Local Presence & GBP",
    maxPoints: 30,
    color: "text-blue-400",
    checks: [
      { name: "Phone number visible", pts: 5, what: "We look for a phone number anywhere on your page." },
      { name: "Business name detected", pts: 3, what: "We check the title tag, OG metadata, and H1 for a clear business name." },
      { name: "Full NAP (Name, Address, Phone)", pts: 5, what: "We verify that your name, a street address with ZIP, and phone number are all present." },
      { name: "LocalBusiness schema markup", pts: 5, what: "We parse your JSON-LD for LocalBusiness (or subtypes like Plumber, HVAC, etc.) and check which fields are populated." },
      { name: "Google Maps embed or link", pts: 4, what: "We scan for Google Maps embeds or links to google.com/maps." },
      { name: "Review / rating signals", pts: 4, what: "We check for AggregateRating schema, review microdata, or mentions of reviews/testimonials." },
      { name: "Local keyword usage", pts: 4, what: "We check if your city name appears in the title tag and body content." },
    ],
  },
  {
    icon: Search,
    label: "On-Page SEO",
    maxPoints: 25,
    color: "text-emerald-400",
    checks: [
      { name: "Title tag optimization", pts: 5, what: "We check length (35-65 chars), city inclusion, and service keyword presence." },
      { name: "Meta description", pts: 5, what: "Length (70-160 chars), city keyword, and service keyword presence." },
      { name: "H1 & heading hierarchy", pts: 4, what: "Single H1, presence of H2 subheadings for content structure." },
      { name: "Service keyword placement", pts: 3, what: "We check if your primary service keyword appears in the title, H1, and first paragraph." },
      { name: "URL readability", pts: 2, what: "Human-readable slug with relevant keywords." },
      { name: "Image alt tags", pts: 3, what: "Percentage of images with descriptive alt text." },
      { name: "Internal linking", pts: 3, what: "Links to contact/booking page and overall internal link count." },
    ],
  },
  {
    icon: Settings,
    label: "Technical SEO",
    maxPoints: 25,
    color: "text-purple-400",
    checks: [
      { name: "HTTPS & mixed content", pts: 6, what: "We verify HTTPS and scan for HTTP resources loaded on an HTTPS page." },
      { name: "Meta robots directives", pts: 4, what: "We check for noindex or nofollow that would block Google." },
      { name: "Canonical tag", pts: 4, what: "Presence and self-referential correctness of the canonical link element." },
      { name: "Mobile viewport", pts: 4, what: "Proper width=device-width and initial-scale meta tag." },
      { name: "Render-blocking resources", pts: 4, what: "Count of synchronous CSS and JS files in the <head>." },
      { name: "Page weight & third-party scripts", pts: 3, what: "Large inline scripts and external third-party script count." },
    ],
  },
  {
    icon: FileText,
    label: "Content & UX",
    maxPoints: 10,
    color: "text-amber-400",
    checks: [
      { name: "Word count depth", pts: 3, what: "We count words — Google favors 300+ words of unique, relevant content." },
      { name: "Content structure & FAQ", pts: 3, what: "Subheading count and presence of FAQ sections." },
      { name: "Call-to-action presence", pts: 2, what: "CTA buttons or text like 'Get a Quote' or 'Call Now'." },
      { name: "Contact info visibility", pts: 2, what: "Phone or email visible on the page." },
    ],
  },
  {
    icon: Award,
    label: "Google Readiness Extras",
    maxPoints: 10,
    color: "text-rose-400",
    checks: [
      { name: "Extra structured data", pts: 4, what: "FAQPage, Service, Organization, or Breadcrumb schema beyond LocalBusiness." },
      { name: "No spammy content", pts: 3, what: "We scan for suspicious outbound links and spam-pattern content." },
      { name: "Trust indicators", pts: 3, what: "Testimonials, customer reviews, and links to social profiles." },
    ],
  },
];

export default function Methodology() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          How We Score Your Site
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-8 max-w-xl">
          Our scoring is fully transparent. Every point is earned by a specific, verifiable check
          against your page's HTML, metadata, and structure. Here's exactly what we look for and
          how each check is weighted.
        </p>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 mb-8">
          <h2 className="text-base font-semibold text-foreground mb-3">Scoring Overview</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• <strong className="text-foreground">Total: 100 points</strong> across 5 categories</li>
            <li>• <strong className="text-foreground">Local businesses:</strong> scored directly out of 100</li>
            <li>• <strong className="text-foreground">Online businesses:</strong> local-only checks become bonus points above 100</li>
            <li>• <strong className="text-foreground">Letter grades:</strong> A (90+), B (80+), C (65+), D (50+), F (below 50)</li>
          </ul>
        </div>

        <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 sm:p-5 mb-8">
          <h2 className="text-base font-semibold text-foreground mb-2">Data Sources & Limitations</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong className="text-foreground">Page data:</strong> We crawl your page using Firecrawl, which renders JavaScript. However, gated content, multi-step navigation, and some SPAs may not be fully captured.</li>
            <li>• <strong className="text-foreground">PageSpeed scores:</strong> Lab data from Google Lighthouse (simulated mobile). These are <em>not</em> real-user field data (CrUX). Lab scores can differ from what real visitors experience.</li>
            <li>• <strong className="text-foreground">Search volumes:</strong> Approximate monthly estimates. Treat as directional, not exact — volumes vary by region, season, and source methodology.</li>
            <li>• <strong className="text-foreground">Phrase Optics:</strong> Page-one potential is estimated from current ranking position, competition signals, and your site's optimization level. It does <em>not</em> factor in backlink profiles or domain authority, which are significant ranking factors.</li>
            <li>• <strong className="text-foreground">What we don't check:</strong> Backlink profiles, Google Business Profile completeness, real-user Core Web Vitals (CrUX), XML sitemaps, redirect chains, or hreflang tags. These require additional data sources we plan to integrate.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 mb-8">
          <h2 className="text-base font-semibold text-foreground mb-2">Our Lane (as of today)</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            SEO Osmosis specializes in one thing: a 60‑second, no‑sign‑up snapshot for local service businesses and the agencies that sell to them.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We are not a full‑stack SEO suite. We don't replace your backlink tools, rank trackers, or deep SERP analysis platforms.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If we decide to move into those areas in the future, we'll approach them the same way we approached this product: clearly scoped, opinionated, and aiming to be best‑in‑class in that lane.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 mb-8">
          <h2 className="text-base font-semibold text-foreground mb-3">How to use this snapshot</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">Best for</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-accent">✓</span> Pre‑sales audits for prospects</li>
                <li className="flex gap-2"><span className="text-accent">✓</span> Quick health checks before or after major site changes</li>
                <li className="flex gap-2"><span className="text-accent">✓</span> Explaining priorities to non‑technical owners</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Not for</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-muted-foreground/50">✗</span> Deep technical forensics across your entire site</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">✗</span> Backlink and authority analysis</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">✗</span> Ongoing rank tracking or full SEO reporting</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.label} className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-4">
                <cat.icon className={`h-5 w-5 ${cat.color}`} />
                <h2 className="text-lg font-semibold text-foreground">{cat.label}</h2>
                <span className="ml-auto text-sm font-bold text-muted-foreground">
                  {cat.maxPoints} pts
                </span>
              </div>
              <div className="space-y-3">
                {cat.checks.map((check) => (
                  <div key={check.name} className="flex gap-3">
                    <span className="shrink-0 mt-0.5 text-xs font-bold text-accent bg-accent/10 rounded px-1.5 py-0.5">
                      {check.pts}pt{check.pts > 1 ? "s" : ""}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{check.name}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{check.what}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Questions about our methodology? We're always improving.{" "}
            <button onClick={() => navigate("/get-started")} className="text-primary hover:underline">
              Run a complimentary scan
            </button>{" "}
            to see your score.
          </p>
        </div>
      </div>
    </div>
  );
}
