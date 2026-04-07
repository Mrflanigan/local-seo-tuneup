import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  FileText,
  Shield,
  LayoutDashboard,
  Sparkles,
  Waves,
  CheckCircle2,
  Zap,
} from "lucide-react";

const categories = [
  {
    icon: <MapPin className="h-5 w-5" />,
    id: "local-presence",
    label: "Local Presence",
    maxScore: 25,
    signals: [
      "NAP (Name, Address, Phone) detected in page content",
      "LocalBusiness JSON-LD schema markup",
      "Google Maps or map embed integration",
      "City/region mentioned in title, headings, and body",
      "Review signals and testimonials on-page",
    ],
    description:
      "Google needs to know where you are and what you do — in machine-readable code, not just visible text. We check for structured local data that tells search engines exactly which market you serve.",
  },
  {
    icon: <FileText className="h-5 w-5" />,
    id: "on-page-seo",
    label: "On-Page SEO",
    maxScore: 25,
    signals: [
      "Title tag length, keyword placement, and city targeting",
      "Meta description presence and optimization",
      "H1 tag — single, keyword-rich, unique",
      "Heading hierarchy (H1 → H2 → H3 structure)",
      "Image alt attributes with descriptive text",
      "Internal linking structure",
    ],
    description:
      "These are the signals Google reads first. Your title tag is your ad copy in search results. Your heading structure tells crawlers what matters most. We verify every on-page element follows current best practices.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    id: "technical-seo",
    label: "Technical SEO",
    maxScore: 20,
    signals: [
      "HTTPS / SSL certificate active",
      "Canonical URL properly set",
      "Robots meta directives (index, follow)",
      "Viewport meta tag for mobile-first indexing",
      "No mixed content warnings",
      "Render-blocking resource detection",
    ],
    description:
      "If Google can't crawl your site efficiently, nothing else matters. We check the technical foundation — security, crawlability, mobile readiness, and the directives that tell search engines how to treat your pages.",
  },
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    id: "content-ux",
    label: "Content & UX",
    maxScore: 20,
    signals: [
      "Word count and content depth",
      "FAQ sections with structured data",
      "Call-to-action presence and clarity",
      "Phone number clickable (tel: link)",
      "Content readability and formatting",
    ],
    description:
      "Thin content loses rankings. We measure whether your pages have enough substance to demonstrate expertise, and whether your user experience converts visitors into calls and leads.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    id: "extras",
    label: "Extras & Enhancements",
    maxScore: 10,
    signals: [
      "Open Graph tags for social sharing",
      "Twitter Card meta tags",
      "Favicon present",
      "Sitemap reference or link",
      "Analytics or tracking script detected",
    ],
    description:
      "The finishing touches that separate good sites from great ones. These signals don't make or break rankings alone, but they compound — and their absence signals a site that isn't being actively maintained.",
  },
];

export default function Osmosis() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/30">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">
            SEO<span className="text-primary">RiseUp</span>
          </Link>
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to scan
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 sm:pb-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 mb-8">
            <Waves className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">
              Proprietary Scanning Technology
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
            What is <span className="text-primary">SEO Osmosis™</span>?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            SEO Osmosis™ is our scan that checks how Google sees your site.
            We look at over 30 things that affect your rankings — from your
            business name and address to your page speed and content — and
            tell you exactly what's working and what needs to change.
          </p>
        </div>
      </section>

      {/* How it works summary */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 shrink-0">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-1">
                  The Process — 30 Seconds, Zero Guesswork
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                   You enter your website address. SEO Osmosis™ reads your site
                   the same way Google does — looking at the code behind your pages,
                   not just the design. We check every important detail against
                   what works for local businesses and build a personalized report
                   about your actual business.
                 </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <ProcessStep
                step="01"
                title="Read Your Site"
                detail="We pull up your website and read the code — the same stuff Google looks at when deciding who to show first."
              />
              <ProcessStep
                step="02"
                title="Check 30+ Things"
                detail="We score over 30 things across 5 categories, each one something Google actually cares about."
              />
              <ProcessStep
                step="03"
                title="Build Your Report"
                detail="Every finding mentions your real business name, phone number, services, and city — not generic advice."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Scoring categories */}
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            The 5 Scoring Categories
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
            Each category is weighted based on its impact on local search
            rankings. Total: 100 points.
          </p>

          <div className="space-y-5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary">
                      {cat.icon}
                    </div>
                    <h3 className="text-base font-semibold">{cat.label}</h3>
                  </div>
                  <span className="text-sm font-mono text-primary font-semibold">
                    {cat.maxScore} pts
                  </span>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {cat.description}
                </p>

                <div className="space-y-1.5">
                  {cat.signals.map((signal) => (
                    <div
                      key={signal}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{signal}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grading scale */}
      <section className="pb-20 sm:pb-28 border-t border-border/40 pt-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-10">
            Grading Scale
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {[
              { grade: "A", range: "90–100", color: "text-green-400" },
              { grade: "B", range: "75–89", color: "text-emerald-400" },
              { grade: "C", range: "60–74", color: "text-yellow-400" },
              { grade: "D", range: "40–59", color: "text-orange-400" },
              { grade: "F", range: "0–39", color: "text-red-400" },
            ].map((g) => (
              <div
                key={g.grade}
                className="rounded-xl border border-border bg-card/60 p-4"
              >
                <p className={`text-3xl font-bold ${g.color}`}>{g.grade}</p>
                <p className="text-xs text-muted-foreground mt-1">{g.range}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            See It in Action
          </h2>
          <p className="text-muted-foreground mb-8">
            Run a complimentary SEO Osmosis™ scan on your website right now — no signup
            required.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Scan Your Site — Complimentary
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm text-muted-foreground/60">
            © {new Date().getFullYear()} SEO Rise Up. Rise to the top.
          </p>
        </div>
      </footer>
    </div>
  );
}

function ProcessStep({
  step,
  title,
  detail,
}: {
  step: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
      <span className="text-xs font-mono text-primary font-semibold">
        {step}
      </span>
      <h4 className="text-sm font-semibold mt-1 mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
    </div>
  );
}
