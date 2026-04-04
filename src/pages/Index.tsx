import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import UrlInputForm from "@/components/UrlInputForm";
import ScanningView from "@/components/ScanningView";
import { runCheckup } from "@/lib/api/checkup";
import type { ScoringResult, BusinessType } from "@/lib/scoring/types";
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

import heroDenali from "@/assets/hero-denali.jpg";
import heroBurj from "@/assets/hero-burj.jpg";
import heroFalls from "@/assets/hero-falls.jpg";
import heroEarth from "@/assets/hero-earth.jpg";

const landmarks = [
  { image: heroDenali, name: "Denali (Mt. McKinley)", detail: "Highest peak in North America · 20,310 ft · Alaska, USA" },
  { image: heroBurj, name: "Burj Khalifa", detail: "Tallest building on Earth · 2,717 ft · Dubai, UAE" },
  { image: heroFalls, name: "Angel Falls", detail: "Tallest waterfall on Earth · 3,212 ft · Venezuela" },
  { image: heroEarth, name: "Earth from Space", detail: "The highest view · 254 miles above · International Space Station" },
];

export default function Index() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scanUrl, setScanUrl] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (url: string, city?: string, businessType?: BusinessType) => {
    setLoading(true);
    setScanUrl(url);
    try {
      const result: ScoringResult = await runCheckup({ url, city, businessType });
      navigate("/report", { state: { result, url, city, businessType } });
    } catch (err) {
      toast.error("Something went wrong scanning that site. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ScanningView url={scanUrl} />;

  const faqs = [
    { q: "What does the Local SEO Checkup scan?", a: "We scan your website's HTML the same way Google's crawler does — checking meta tags, schema markup, heading structure, local signals, technical SEO, content depth, and more across 5 categories and 30+ individual signals." },
    { q: "Is this really free?", a: "Yes. The full audit and score are completely free with no signup required. We offer optional paid services if you want us to implement the fixes for you." },
    { q: "How is this different from other SEO tools?", a: "Most SEO tools give generic advice. We personalize every finding to your actual business — referencing your real content, phone number, services, and city. Plus we scan your competitors and show you exactly what they're doing that you're not." },
    { q: "Can you fix my site for me?", a: "Absolutely. After your scan, you can request a personalized gameplan call where we walk through the highest-impact fixes and implement them for you." },
    { q: "How long does the scan take?", a: "About 30 seconds. We crawl your site in real-time, analyze the HTML, score every signal, and build your personalized report on the spot." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/30">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            SEO<span className="text-primary">RiseUp</span>
          </span>
          <a href="#how-it-works" className="text-sm text-foreground font-semibold hover:text-primary transition-colors">
            How it works
          </a>
        </div>
      </nav>

      {/* ═══ HERO — Denali ═══ */}
      <section className="relative min-h-screen flex items-end justify-center overflow-hidden pb-16">
        <img src={heroDenali} alt="Summit of Denali, highest peak in North America" width={1920} height={1080} className="absolute inset-0 w-full h-full object-cover" />

        {/* ── The G — buried into the bottom-left terrain ── */}
        <div
          className="absolute left-0 bottom-0 top-[56%] w-[22%] pointer-events-none select-none overflow-hidden"
          style={{
            zIndex: 1,
            WebkitMaskImage:
              "linear-gradient(to right, hsl(0 0% 0%) 0%, hsl(0 0% 0%) 54%, transparent 100%), linear-gradient(to top, hsl(0 0% 0%) 0%, hsl(0 0% 0%) 62%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, hsl(0 0% 0%) 0%, hsl(0 0% 0%) 54%, transparent 100%), linear-gradient(to top, hsl(0 0% 0%) 0%, hsl(0 0% 0%) 62%, transparent 100%)",
          }}
          aria-hidden="true"
        >
          <span
            className="absolute font-bold leading-none"
            style={{
              fontSize: "clamp(24rem, 40vw, 42rem)",
              color: "hsl(220 18% 5% / 0.2)",
              bottom: "-36%",
              left: "-66%",
              fontFamily: "'Georgia', 'Times New Roman', serif",
              letterSpacing: "-0.06em",
              fontWeight: 800,
              mixBlendMode: "multiply",
              filter: "blur(1px)",
            }}
          >
            G
          </span>
        </div>

        {/* Gradient overlay — sits above the G */}
        <div className="absolute inset-0" style={{ zIndex: 2, background: "linear-gradient(to bottom, hsl(220 20% 7% / 0.58), hsl(220 20% 7% / 0.38), hsl(220 20% 7% / 0.88))" }} />

        {/* ── Stealthy SEO block letters with inline continuation ── */}
        <div
          className="absolute left-0 top-0 bottom-0 flex items-center pointer-events-none select-none"
          style={{ zIndex: 3, marginTop: "-8%" }}
          aria-hidden="true"
        >
          <span
            style={{
              fontSize: "clamp(20rem, 42vw, 54rem)",
              fontFamily: "'Arial Narrow', 'Helvetica Neue', sans-serif",
              fontWeight: 900,
              fontStretch: "condensed",
              letterSpacing: "-0.02em",
              color: "transparent",
              WebkitTextStroke: "4px hsl(120 100% 30%)",
              lineHeight: 0.78,
              marginLeft: "-1%",
              transform: "scaleX(0.6)",
              transformOrigin: "left center",
            }}
          >
            SEO
            <span
              style={{
                fontSize: "0.085em",
                color: "hsl(120 100% 30%)",
                WebkitTextStroke: "0px transparent",
                letterSpacing: "0.02em",
                lineHeight: 1,
                marginLeft: "0.15em",
                verticalAlign: "bottom",
                whiteSpace: "nowrap",
                display: "inline",
              }}
            >
              <span style={{ fontSize: "0.72em" }}>A</span>i's Best Optimization
            </span>
          </span>
        </div>



        {/* Headline pinned top-left */}
        <h1 className="absolute top-24 left-6 z-10 text-4xl sm:text-6xl font-bold tracking-tight leading-[1.1]">
          Rise to the Top.
        </h1>

        <p className="absolute top-28 right-6 z-10 text-lg sm:text-xl text-foreground/80 leading-relaxed text-right max-w-md">
            We look at your site like Google sees it — using <Link to="/osmosis" className="text-primary font-bold underline decoration-primary underline-offset-2 hover:decoration-primary transition-colors whitespace-nowrap">SEO Osmosis™</Link>.
        </p>

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center pt-64">

          <UrlInputForm onSubmit={handleSubmit} loading={loading} />

          <p className="text-xs text-muted-foreground/70 mt-5">
            No signup · Free instant audit · Real data from your site
          </p>
        </div>

        {/* Landmark caption */}
        <LandmarkCaption name={landmarks[0].name} detail={landmarks[0].detail} />
      </section>

      {/* ═══ Social Proof ═══ */}
      <div className="border-y border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 py-12 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-bold text-accent">30+</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Signals Scanned</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-bold text-accent">5</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Category Deep-Dive</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-bold text-accent">100%</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Real Data, No Fluff</p>
          </div>
        </div>
      </div>

      {/* ═══ HOW IT WORKS — Burj Khalifa ═══ */}
      <section id="how-it-works" className="relative py-24 sm:py-32 overflow-hidden">
        <img src={heroBurj} alt="Burj Khalifa from above at night" width={1920} height={1080} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">How the Checkup Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">We read your site's source code and analyze the same signals Google uses to decide who ranks.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <StepCard step={1} icon={<Eye className="h-5 w-5 text-primary" />} title="SEO Osmosis™ Absorbs Your Site" description="Our proprietary scanner reads your HTML just like Googlebot — parsing meta tags, schema markup, heading hierarchy, alt attributes, and structured data." techTerms={["Googlebot crawl", "<meta> tags", "JSON-LD schema"]} />
            <StepCard step={2} icon={<BarChart3 className="h-5 w-5 text-primary" />} title="We Score 30+ Signals" description="Every signal gets checked against local SEO best practices — from NAP consistency and LocalBusiness schema to SSL and viewport meta." techTerms={["NAP consistency", "SSL/TLS", "canonical URL"]} />
            <StepCard step={3} icon={<Target className="h-5 w-5 text-primary" />} title="You Get a Plan" description="A personalized report referencing your actual content, plus competitor comparison showing who's outranking you and why." techTerms={["Competitor gap analysis", "Priority fixes"]} />
          </div>
        </div>
        <LandmarkCaption name={landmarks[1].name} detail={landmarks[1].detail} />
      </section>

      {/* ═══ WHAT WE SCAN — Angel Falls ═══ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <img src={heroFalls} alt="Angel Falls, world's tallest waterfall" width={1920} height={1080} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">What We Scan (That Most Owners Don't Know Exists)</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Your site might look great — but Google doesn't see design. It reads code.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SignalCard icon={<Code2 className="h-4 w-4" />} title="Meta Tags & Title" description="Your <title> tag and meta description are your ad copy in Google results. We check length, keywords, and city targeting." />
            <SignalCard icon={<Search className="h-4 w-4" />} title="JSON-LD Schema Markup" description="Structured data tells Google your business name, address, hours in machine-readable format — the key to rich results." />
            <SignalCard icon={<Shield className="h-4 w-4" />} title="Technical SEO Health" description="HTTPS, canonical tags, robots directives, viewport configuration, render-blocking resources." />
            <SignalCard icon={<Users className="h-4 w-4" />} title="NAP & Local Presence" description="Name, Address, Phone consistency, Google Maps integration, review signals, and geo-targeted content." />
            <SignalCard icon={<BarChart3 className="h-4 w-4" />} title="Content Depth & Structure" description="Word count, heading hierarchy, FAQ sections, internal linking — signals that separate thin pages from authoritative ones." />
            <SignalCard icon={<Zap className="h-4 w-4" />} title="Performance & Crawlability" description="Render-blocking scripts, mixed content, mobile-first readiness — if it slows Google down, it slows your rankings." />
          </div>
        </div>
        <LandmarkCaption name={landmarks[2].name} detail={landmarks[2].detail} />
      </section>

      {/* ═══ WHY DIFFERENT ═══ */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">Not Another Generic SEO Tool</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Built for local business owners tired of vague advice and meaningless scores.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <DiffCard icon={<CheckCircle2 className="h-5 w-5 text-accent" />} title="Personalized to Your Business" description="We reference your actual phone number, services, and content — not generic 'add a meta description' advice." />
            <DiffCard icon={<CheckCircle2 className="h-5 w-5 text-accent" />} title="Real Competitor Intelligence" description="We scan businesses actually outranking you and show exactly what they have that you don't." />
            <DiffCard icon={<CheckCircle2 className="h-5 w-5 text-accent" />} title="Technical + Understandable" description="Every buzzword explained in plain English. You'll know what a canonical tag is AND why it matters." />
            <DiffCard icon={<CheckCircle2 className="h-5 w-5 text-accent" />} title="100% Real Data" description="Every finding from your actual HTML. No estimates, no projections, no made-up numbers." />
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-20 sm:py-24 border-y border-border/40">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-5 py-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                </button>
                {openFaq === i && <div className="px-5 pb-4"><p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BOTTOM CTA — Earth from Space ═══ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <img src={heroEarth} alt="Planet Earth from space" width={1920} height={1080} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-5">Ready to Rise?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">30 seconds. No signup. Your personalized local SEO audit with real data from your actual site.</p>
          <UrlInputForm onSubmit={handleSubmit} loading={loading} hideBusinessType />
        </div>
        <LandmarkCaption name={landmarks[3].name} detail={landmarks[3].detail} />
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm text-muted-foreground/60">© {new Date().getFullYear()} SEO Rise Up. Rise to the top.</p>
        </div>
      </footer>
    </div>
  );
}

/* ── Sub-components ── */

function LandmarkCaption({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="absolute bottom-6 right-6 z-20 text-right">
      <p className="text-[11px] font-medium text-foreground/50 uppercase tracking-widest">{name}</p>
      <p className="text-[10px] text-foreground/30">{detail}</p>
    </div>
  );
}

function StepCard({ step, icon, title, description, techTerms }: { step: number; icon: React.ReactNode; title: string; description: string; techTerms: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">{icon}</div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step {step}</span>
      </div>
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{description}</p>
      <div className="flex flex-wrap gap-1.5">
        {techTerms.map((t) => <span key={t} className="text-[11px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded">{t}</span>)}
      </div>
    </div>
  );
}

function SignalCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">{icon}</div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function DiffCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 flex gap-4">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <h3 className="text-sm font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
