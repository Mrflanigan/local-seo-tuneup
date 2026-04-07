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
      {
        id: "phone", name: "Phone number visible", pts: 5,
        what: "We look for a phone number anywhere on your page.",
        why: "If Google can't find your phone number, it can't show it in local results. Customers who search on mobile often want to tap-to-call — no number means no call.",
        fix: "Add your phone number in plain text (not just an image) to your header or footer so it shows on every page.",
      },
      {
        id: "biz-name", name: "Business name detected", pts: 3,
        what: "We check the title tag, OG metadata, and H1 for a clear business name.",
        why: "Google needs to know who you are before it can recommend you. A clear business name in your title and headings confirms your identity.",
        fix: "Make sure your exact business name appears in your page title and in the main heading (H1) on your homepage.",
      },
      {
        id: "nap", name: "Full NAP (Name, Address, Phone)", pts: 5,
        what: "We verify that your name, a street address with ZIP, and phone number are all present.",
        why: "Consistent NAP data across your site and the web is a core local ranking factor. Missing pieces make Google less confident about your location.",
        fix: "Add your full business name, street address with ZIP code, and phone number to your site footer so it appears on every page.",
      },
      {
        id: "local-schema", name: "LocalBusiness schema markup", pts: 5,
        what: "We parse your JSON-LD for LocalBusiness (or subtypes like Plumber, HVAC, etc.) and check which fields are populated.",
        why: "Schema markup is like a cheat sheet for Google — it tells the search engine exactly what your business does, where it's located, and when it's open, in a format it can read instantly.",
        fix: "Add a JSON-LD script block to your homepage with your business type, name, address, phone, hours, and service area. Use Google's Structured Data Markup Helper to generate it.",
      },
      {
        id: "maps", name: "Google Maps embed or link", pts: 4,
        what: "We scan for Google Maps embeds or links to google.com/maps.",
        why: "A maps embed or link reinforces your physical location to Google and helps customers find you. It's a simple trust signal.",
        fix: "Embed a Google Map on your contact or about page, or add a link to your Google Maps listing.",
      },
      {
        id: "review-signals", name: "Review / rating signals", pts: 4,
        what: "We check for AggregateRating schema, review microdata, or mentions of reviews/testimonials.",
        why: "Reviews are one of the strongest local ranking factors. Even showing testimonials on your site signals trust to both Google and visitors.",
        fix: "Add a testimonials section with real customer quotes. For extra credit, add AggregateRating schema markup so Google can show star ratings in search results.",
      },
      {
        id: "local-keywords", name: "Local keyword usage", pts: 4,
        what: "We check if your city name appears in the title tag and body content.",
        why: "If your city name isn't on your page, Google has to guess where you operate. Customers searching 'plumber in [city]' won't find you if [city] isn't mentioned.",
        fix: "Include your city name in your page title, H1, and naturally throughout your page content — especially in the first paragraph.",
      },
    ],
  },
  {
    icon: Search,
    label: "On-Page SEO",
    maxPoints: 25,
    color: "text-emerald-400",
    checks: [
      {
        id: "title", name: "Title tag optimization", pts: 5,
        what: "We check length (35-65 chars), city inclusion, and service keyword presence.",
        why: "Your title tag is the headline people see in Google search results. If it's vague or too long, fewer people click — and Google takes that as a signal you're not relevant.",
        fix: "Write a clear title under 65 characters that includes what you do and where (e.g., 'Roof Repair in Everett | Company Name').",
      },
      {
        id: "meta-desc", name: "Meta description", pts: 5,
        what: "Length (70-160 chars), city keyword, and service keyword presence.",
        why: "The meta description is the two-line summary under your title in search results. A good one convinces people to click instead of scrolling past.",
        fix: "Write a 120–155 character description that mentions your service and city, and includes a reason to click (e.g., 'Same-day service, licensed & insured').",
      },
      {
        id: "headings", name: "H1 & heading hierarchy", pts: 4,
        what: "Single H1, presence of H2 subheadings for content structure.",
        why: "Headings give Google an outline of your page. Without them, Google has to guess what's important — and it usually guesses wrong.",
        fix: "Use one H1 for your main topic, then H2s for each major section. Don't skip levels (e.g., don't jump from H1 to H4).",
      },
      {
        id: "keyword-usage", name: "Service keyword placement", pts: 3,
        what: "We check if your primary service keyword appears in the title, H1, and first paragraph.",
        why: "Google looks for your main keyword in these three spots first. If it's missing, your page may not rank for the search terms your customers actually use.",
        fix: "Make sure your primary service (e.g., 'roof repair,' 'HVAC installation') appears in your page title, H1 heading, and opening paragraph.",
      },
      {
        id: "url-slug", name: "URL readability", pts: 2,
        what: "Human-readable slug with relevant keywords.",
        why: "Clean URLs like /roof-repair-everett tell Google (and humans) what the page is about before they even click.",
        fix: "Use short, descriptive URLs with hyphens between words. Avoid random numbers or parameter strings.",
      },
      {
        id: "img-alts", name: "Image alt tags", pts: 3,
        what: "Percentage of images with descriptive alt text.",
        why: "Google can't see images — it reads alt text instead. Missing alt text means Google ignores your images entirely, and you miss out on image search traffic.",
        fix: "Add descriptive alt text to every image (e.g., 'technician repairing roof shingles in Everett' instead of 'IMG_4532').",
      },
      {
        id: "internal-links", name: "Internal linking", pts: 3,
        what: "Links to contact/booking page and overall internal link count.",
        why: "Internal links help Google discover all your pages and understand which ones matter most. They also guide visitors toward contacting you.",
        fix: "Link from your homepage to your main service pages, and make sure every page links to your contact or booking page.",
      },
    ],
  },
  {
    icon: Settings,
    label: "Technical SEO",
    maxPoints: 25,
    color: "text-purple-400",
    checks: [
      {
        id: "https", name: "HTTPS & mixed content", pts: 6,
        what: "We verify HTTPS and scan for HTTP resources loaded on an HTTPS page.",
        why: "Google flags non-HTTPS sites as 'Not Secure' in Chrome. Visitors see the warning and leave. Mixed content (HTTP images on an HTTPS page) can trigger the same warning.",
        fix: "Make sure your site uses HTTPS. If it does, check for images, scripts, or fonts still loading over HTTP and update those URLs.",
      },
      {
        id: "meta-robots", name: "Meta robots directives", pts: 4,
        what: "We check for noindex or nofollow that would block Google.",
        why: "A noindex tag tells Google 'don't show this page in search results.' It's sometimes left on accidentally after a site redesign — and it's invisible to visitors.",
        fix: "Check your page source for <meta name='robots' content='noindex'>. If it's there and you want the page indexed, remove it.",
      },
      {
        id: "canonical", name: "Canonical tag", pts: 4,
        what: "Presence and self-referential correctness of the canonical link element.",
        why: "Without a canonical tag, Google might split your ranking power across duplicate versions of the same page (www vs. non-www, trailing slashes, etc.).",
        fix: "Add a <link rel='canonical'> tag pointing to the preferred version of each page's URL.",
      },
      {
        id: "viewport", name: "Mobile viewport", pts: 4,
        what: "Proper width=device-width and initial-scale meta tag.",
        why: "Without a viewport tag, your site looks like a tiny desktop page on phones. Google uses mobile-first indexing, so a bad mobile experience directly hurts rankings.",
        fix: "Add <meta name='viewport' content='width=device-width, initial-scale=1'> to your page's <head> section.",
      },
      {
        id: "render-blocking", name: "Render-blocking resources", pts: 4,
        what: "Count of synchronous CSS and JS files in the <head>.",
        why: "Too many blocking scripts slow down the first paint of your page. Visitors on slow connections see a blank screen and leave before your content loads.",
        fix: "Move non-critical CSS and JS to load asynchronously (add 'defer' or 'async' to script tags). Inline critical CSS.",
      },
      {
        id: "speed-proxies", name: "Page weight & third-party scripts", pts: 3,
        what: "Large inline scripts and external third-party script count.",
        why: "Heavy pages take longer to load, especially on mobile. Third-party scripts (chat widgets, trackers, ad pixels) add up fast.",
        fix: "Audit your third-party scripts — remove any you're not actively using. Compress images and consider lazy-loading below-the-fold content.",
      },
    ],
  },
  {
    icon: FileText,
    label: "Content & UX",
    maxPoints: 10,
    color: "text-amber-400",
    checks: [
      {
        id: "word-count", name: "Word count depth", pts: 3,
        what: "We count words — Google favors 300+ words of unique, relevant content.",
        why: "Thin pages with barely any text give Google nothing to work with. Pages with 300+ words of real content rank significantly better for local searches.",
        fix: "Add a few paragraphs describing your services, process, or service area. Write for your customers, not for Google — but aim for at least 300 words.",
      },
      {
        id: "content-structure", name: "Content structure & FAQ", pts: 3,
        what: "Subheading count and presence of FAQ sections.",
        why: "FAQs answer the exact questions people type into Google. Well-structured content with subheadings also qualifies for featured snippets (the answer box at the top of search results).",
        fix: "Add an FAQ section with 3–5 questions your customers actually ask. Use H2 or H3 tags for each question.",
      },
      {
        id: "cta", name: "Call-to-action presence", pts: 2,
        what: "CTA buttons or text like 'Get a Quote' or 'Call Now'.",
        why: "If someone finds your site and there's no clear next step, they leave. A visible CTA turns a visitor into a phone call or form submission.",
        fix: "Add a clear button or link that says what to do next: 'Get a Quote,' 'Call Now,' or 'Book Online.' Place it above the fold.",
      },
      {
        id: "contact-visible", name: "Contact info visibility", pts: 2,
        what: "Phone or email visible on the page.",
        why: "Visitors who can't find how to reach you will find a competitor who makes it easy. Google also uses visible contact info as a trust signal.",
        fix: "Put your phone number and/or email address in your header or footer so it's visible on every page without scrolling.",
      },
    ],
  },
  {
    icon: Award,
    label: "Google Readiness Extras",
    maxPoints: 10,
    color: "text-rose-400",
    checks: [
      {
        id: "extra-schema", name: "Extra structured data", pts: 4,
        what: "FAQPage, Service, Organization, or Breadcrumb schema beyond LocalBusiness.",
        why: "Extra schema types give Google more ways to feature your site — FAQ rich results, breadcrumb trails in search, and service details in knowledge panels.",
        fix: "Add FAQPage schema to your FAQ section and Service schema listing your key offerings. Google's Rich Results Test tool can validate your markup.",
      },
      {
        id: "no-spam", name: "No spammy content", pts: 3,
        what: "We scan for suspicious outbound links and spam-pattern content.",
        why: "Spammy outbound links or keyword-stuffed content can trigger Google penalties. Even one bad link to a known spam domain can hurt your credibility.",
        fix: "Review your outbound links — remove any pointing to unrelated or suspicious sites. Remove any keyword-stuffed text that reads unnaturally.",
      },
      {
        id: "trust-indicators", name: "Trust indicators", pts: 3,
        what: "Testimonials, customer reviews, and links to social profiles.",
        why: "Trust signals like testimonials, review badges, and social profile links help both Google and visitors feel confident that you're a real, reputable business.",
        fix: "Add a testimonials section, link to your Google reviews, and include icons linking to your active social media profiles.",
      },
    ],
  },
];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

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
              <div className="space-y-5">
                {cat.checks.map((check) => (
                  <div key={check.id} id={`check-${check.id}`} className="scroll-mt-24 border-b border-border/40 pb-4 last:border-0 last:pb-0">
                    <div className="flex gap-3 mb-2">
                      <span className="shrink-0 mt-0.5 text-xs font-bold text-accent bg-accent/10 rounded px-1.5 py-0.5">
                        {check.pts}pt{check.pts > 1 ? "s" : ""}
                      </span>
                      <p className="text-sm font-medium text-foreground">{check.name}</p>
                    </div>
                    <div className="ml-10 space-y-2">
                      <p className="text-xs text-muted-foreground leading-relaxed">{check.what}</p>
                      <div className="rounded-lg bg-muted/30 p-3 space-y-2">
                        <p className="text-xs leading-relaxed">
                          <span className="font-semibold text-foreground">Why this matters: </span>
                          <span className="text-muted-foreground">{check.why}</span>
                        </p>
                        <p className="text-xs leading-relaxed">
                          <span className="font-semibold text-foreground">How to fix: </span>
                          <span className="text-muted-foreground">{check.fix}</span>
                        </p>
                      </div>
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
