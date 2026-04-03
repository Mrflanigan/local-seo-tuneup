import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UrlInputForm from "@/components/UrlInputForm";
import ScanningView from "@/components/ScanningView";
import { runCheckup } from "@/lib/api/checkup";
import type { ScoringResult } from "@/lib/scoring/types";
import { toast } from "sonner";
import {
  Search,
  Shield,
  BarChart3,
  Zap,
  Code2,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Target,
  Eye,
} from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scanUrl, setScanUrl] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (url: string, city?: string) => {
    setLoading(true);
    setScanUrl(url);
    try {
      const result: ScoringResult = await runCheckup({ url, city });
      navigate("/report", { state: { result, url, city } });
    } catch (err) {
      toast.error("Something went wrong scanning that site. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ScanningView url={scanUrl} />;
  }

  const faqs = [
    {
      q: "What does the Local SEO Checkup scan?",
      a: "We scan your website's HTML the same way Google's crawler does — checking meta tags, schema markup, heading structure, local signals, technical SEO, content depth, and more across 5 categories and 30+ individual signals.",
    },
    {
      q: "Is this really free?",
      a: "Yes. The full audit and score are completely free with no signup required. We offer optional paid services if you want us to implement the fixes for you.",
    },
    {
      q: "How is this different from other SEO tools?",
      a: "Most SEO tools give generic advice. We personalize every finding to your actual business — referencing your real content, phone number, services, and city. Plus we scan your competitors and show you exactly what they're doing that you're not.",
    },
    {
      q: "Can you fix my site for me?",
      a: "Absolutely. After your scan, you can request a personalized gameplan call where we walk through the highest-impact fixes and implement them for you — no guesswork required.",
    },
    {
      q: "How long does the scan take?",
      a: "About 30 seconds. We crawl your site in real-time, analyze the HTML, score every signal, and build your personalized report on the spot.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-foreground tracking-tight">
            Local<span className="text-primary">Score</span>
          </span>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How it works
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative mx-auto max-w-3xl px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-6">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium text-primary">
              30+ signals analyzed in 30 seconds
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-5 leading-tight">
            Your Website Looks Great.
            <br />
            <span className="text-primary">But Can Google Read It?</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            We scan your site the way Google's crawler does — checking meta tags,
            schema markup, heading hierarchy, and 30+ technical signals that
            determine whether you show up in local search or get buried.
          </p>

          <UrlInputForm onSubmit={handleSubmit} loading={loading} />

          <p className="text-xs text-muted-foreground mt-4">
            No signup required. Free instant audit. Real data from your site.
          </p>
        </div>
      </div>

      {/* Social Proof Strip */}
      <div className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-10 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">30+</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Signals Scanned</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">5</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Category Deep-Dive</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">100%</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Real Data, No Fluff</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              How the Checkup Works
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We don't guess — we read your site's source code and analyze the
              same signals Google uses to decide who ranks.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <StepCard
              step={1}
              icon={<Eye className="h-5 w-5 text-primary" />}
              title="We Crawl Your Site"
              description="Our scanner reads your HTML just like Googlebot — parsing meta tags, schema markup, heading hierarchy, alt attributes, canonical declarations, and structured data."
              techTerms={["Googlebot crawl", "<meta> tags", "JSON-LD schema", "DOM parsing"]}
            />
            <StepCard
              step={2}
              icon={<BarChart3 className="h-5 w-5 text-primary" />}
              title="We Score 30+ Signals"
              description="Every signal gets checked against local SEO best practices — from your NAP consistency and LocalBusiness schema to your SSL certificate and viewport meta tag."
              techTerms={["NAP consistency", "SSL/TLS", "viewport meta", "canonical URL"]}
            />
            <StepCard
              step={3}
              icon={<Target className="h-5 w-5 text-primary" />}
              title="You Get a Plan"
              description="Not generic advice — a personalized report referencing your actual content, phone number, and services. Plus competitor comparison showing who's outranking you and why."
              techTerms={["Competitor gap analysis", "Personalized findings", "Priority fixes"]}
            />
          </div>
        </div>
      </section>

      {/* What We Check */}
      <section className="py-16 sm:py-20 bg-muted/20 border-y border-border">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              What We Scan (That Most Business Owners Don't Know Exists)
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Your site might look great — but Google doesn't see design. It
              reads code. Here's what we check under the hood.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SignalCard
              icon={<Code2 className="h-4 w-4" />}
              title="Meta Tags & Title Optimization"
              description="Your <title> tag and meta description are your ad copy in Google results. We check length, keywords, and city targeting."
            />
            <SignalCard
              icon={<Search className="h-4 w-4" />}
              title="JSON-LD Schema Markup"
              description="Structured data tells Google your business name, address, hours, and services in machine-readable format — the key to rich results."
            />
            <SignalCard
              icon={<Shield className="h-4 w-4" />}
              title="Technical SEO Health"
              description="HTTPS, canonical tags, robots directives, viewport configuration, render-blocking resources — the invisible infrastructure of ranking."
            />
            <SignalCard
              icon={<Users className="h-4 w-4" />}
              title="NAP & Local Presence"
              description="Name, Address, Phone consistency, Google Maps integration, review signals, and geo-targeted content that proves you serve your area."
            />
            <SignalCard
              icon={<BarChart3 className="h-4 w-4" />}
              title="Content Depth & Structure"
              description="Word count, heading hierarchy (H1/H2/H3), FAQ sections, internal linking — the content signals that separate thin pages from authoritative ones."
            />
            <SignalCard
              icon={<Zap className="h-4 w-4" />}
              title="Performance & Crawlability"
              description="Render-blocking scripts, third-party load, mixed content, mobile-first readiness — if it slows Google down, it slows your rankings down."
            />
          </div>
        </div>
      </section>

      {/* Why Different */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Not Another Generic SEO Tool
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We built this for local business owners who are tired of vague
              advice and meaningless scores.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <DiffCard
              icon={<CheckCircle2 className="h-5 w-5 text-accent" />}
              title="Personalized to Your Business"
              description="We reference your actual phone number, services, and content — not 'add a meta description' generic advice."
            />
            <DiffCard
              icon={<CheckCircle2 className="h-5 w-5 text-accent" />}
              title="Real Competitor Intelligence"
              description="We scan the businesses actually outranking you in Google and show you exactly what they have that you don't."
            />
            <DiffCard
              icon={<CheckCircle2 className="h-5 w-5 text-accent" />}
              title="Technical + Understandable"
              description="Every buzzword is explained in plain English. You'll know what a canonical tag is AND why it matters for your business."
            />
            <DiffCard
              icon={<CheckCircle2 className="h-5 w-5 text-accent" />}
              title="100% Real Data"
              description="Every finding comes from your actual HTML source code. No estimates, no projections, no made-up numbers. If it's not in your code, we don't claim it is."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-muted/20 border-y border-border">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                >
                  <span className="text-sm font-medium text-foreground">
                    {faq.q}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to See What Google Thinks?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Takes 30 seconds. No signup. No fluff. Just your personalized
            local SEO audit with real data from your actual site.
          </p>
          <UrlInputForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} LocalScore. Built to help local
            businesses get found on Google.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ── Sub-components ── */

function StepCard({
  step,
  icon,
  title,
  description,
  techTerms,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  techTerms: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 relative">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
          {icon}
        </div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Step {step}
        </span>
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
        {description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {techTerms.map((t) => (
          <span
            key={t}
            className="text-[11px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function SignalCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function DiffCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex gap-4">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
