import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";


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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "What exactly do you check?", a: "We look at your website the same way Google does — checking over 30 things that affect whether customers can find you, like your business name and address, page titles, site speed, and more." },
    { q: "Is this really complimentary?", a: "Yes. The full checkup and score are completely complimentary, no signup needed. We offer optional paid services if you want us to make the fixes for you." },
    { q: "How is this different from other SEO tools?", a: "Most tools give cookie-cutter advice. We look at your actual business — your real phone number, services, and city — and tell you specifically what's helping and what's hurting your Google visibility." },
    { q: "Can you fix my site for me?", a: "Absolutely. After your checkup, you can book a quick call where we walk through the biggest wins and handle the fixes for you." },
    { q: "How long does the scan take?", a: "About 30 seconds. We check your site in real time and build your personalized report on the spot." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/30">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            SEO<span className="text-primary">RiseUp</span>
          </span>
          <div className="flex items-center gap-8">
            <span className="text-sm font-semibold tracking-[0.2em] text-muted-foreground">PAGE 1</span>
            <a href="#how-it-works" className="text-sm text-foreground font-semibold hover:text-primary transition-colors">
              How it works
            </a>
          </div>
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

        {/* ── Stealthy SEO outline letters ── */}
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
          </span>
        </div>

        {/* ── Ai's Best Optimization + SEO Osmosis™ ── */}
        <div
          className="absolute select-none pointer-events-none"
          style={{
            zIndex: 4,
            left: "46%",
            bottom: "34%",
          }}
        >
          <span
            style={{
              fontSize: "clamp(1.6rem, 3vw, 3.6rem)",
              fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif",
              fontWeight: 900,
              fontStretch: "condensed",
              letterSpacing: "0.02em",
              color: "hsl(120 100% 30%)",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            Ai's Best Optimization Tools {" "}
            <Link to="/osmosis" className="pointer-events-auto text-primary font-bold underline decoration-primary underline-offset-2 hover:decoration-primary transition-colors whitespace-nowrap text-lg sm:text-xl" style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif", fontWeight: 700, fontStretch: "normal" }}>SEO Osmosis™</Link>
          </span>
        </div>

        <p className="absolute top-28 right-6 z-10 text-lg sm:text-xl text-foreground/80 leading-relaxed text-right max-w-md" style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}>
            Find out why you're not on page 1 — and how to fix it.
        </p>



        {/* Headline pinned top-left */}
        <h1 className="absolute top-24 left-6 z-10 text-4xl sm:text-6xl font-bold tracking-tight leading-[1.1]" style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}>
          Rise to the Top.
        </h1>


        <div className="relative z-10 w-full px-6 pt-64 text-center" style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Button
            onClick={() => navigate("/get-started")}
            size="lg"
            className="h-16 px-12 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 italic"
            style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
          >
             Run My Complimentary SEO Checkup
          </Button>
          <p className="text-xs text-muted-foreground/70 mt-5" style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}>
            No signup · Complimentary instant audit · Real data from your site
          </p>
        </div>

        {/* Landmark caption */}
        <LandmarkCaption name={landmarks[0].name} detail={landmarks[0].detail} />
      </section>

      {/* ═══ Our Lane ═══ */}
      <div className="border-y border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-6 py-10 text-center">
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            <span className="text-foreground font-semibold">As of today, this is our lane:</span>{" "}
            fast, honest local SEO snapshots and action plans for service businesses and the agencies that serve them.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground/70 mt-3 max-w-xl mx-auto leading-relaxed">
            We don't try to replace your backlink tools, rank trackers, or SERP analysis platforms.
            If we ever decide to tackle those, you can bet we'll aim to be best‑in‑class there too.
          </p>
        </div>
      </div>

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
            <p className="text-muted-foreground max-w-lg mx-auto">We look at your website the way Google does — and tell you exactly what's helping and what's hurting your rankings.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <StepCard step={1} icon={<Eye className="h-5 w-5 text-primary" />} title="We Read Your Site Like Google Does" description="Our scanner looks at your website's code — the part Google actually reads — and checks everything from your business name and address to your page titles and speed." techTerms={["How Google crawls", "Your page code", "Business data"]} />
            <StepCard step={2} icon={<BarChart3 className="h-5 w-5 text-primary" />} title="We Check 30+ Things That Matter" description="Each check is something Google actually cares about — like whether your phone number is easy to find, your pages load fast, and your business shows up correctly." techTerms={["Business info", "Page speed", "Mobile-friendly"]} />
            <StepCard step={3} icon={<Target className="h-5 w-5 text-primary" />} title="You Get a Clear Plan" description="A personalized report showing what's working, what's not, and exactly what to fix first — plus how your competitors stack up." techTerms={["What to fix first", "Competitor comparison"]} />
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
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">The Hidden Stuff That Decides Your Google Ranking</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Your site might look great to visitors — but Google reads the code behind it. Here's what we check.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SignalCard icon={<Code2 className="h-4 w-4" />} title="Page Titles & Descriptions" description="These are the headlines people see in Google search results. We check if yours are clear, include your city, and make people want to click." />
            <SignalCard icon={<Search className="h-4 w-4" />} title="Business Info for Google" description="Google needs your business name, address, and hours in a specific format to show you in local results and maps. We check if it's set up." />
            <SignalCard icon={<Shield className="h-4 w-4" />} title="Site Security & Setup" description="Is your site secure? Can Google read it properly? Can it show up on phones? We check the technical basics that most site owners never see." />
            <SignalCard icon={<Users className="h-4 w-4" />} title="Local Presence Signals" description="Your name, address, and phone number need to be consistent and easy to find. We also check for Google Maps, reviews, and local content." />
            <SignalCard icon={<BarChart3 className="h-4 w-4" />} title="Content Quality" description="Google favors pages with real, helpful content. We check if your pages have enough substance to be seen as an authority in your area." />
            <SignalCard icon={<Zap className="h-4 w-4" />} title="Speed & Mobile Experience" description="Slow-loading pages make people leave before they call you. We check if your site is fast and works well on phones." />
          </div>
        </div>
        <LandmarkCaption name={landmarks[2].name} detail={landmarks[2].detail} />
      </section>

      {/* ═══ WHY DIFFERENT ═══ */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">Built for Business Owners, Not SEO Nerds</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">No jargon. No fluff. Just clear answers about why customers aren't finding you.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <DiffCard icon={<CheckCircle2 className="h-5 w-5 text-accent" />} title="About Your Business, Not Generic" description="We reference your actual phone number, services, and content — not cookie-cutter 'add a meta description' advice." />
            <DiffCard icon={<CheckCircle2 className="h-5 w-5 text-accent" />} title="See What Competitors Are Doing" description="We check the businesses actually ranking above you and show what they have that you don't." />
            <DiffCard icon={<CheckCircle2 className="h-5 w-5 text-accent" />} title="Plain English, No Buzzwords" description="Every technical thing we find is explained so it makes sense. You'll know what matters and why." />
            <DiffCard icon={<CheckCircle2 className="h-5 w-5 text-accent" />} title="100% Real Data" description="Every finding comes from your actual website. No guesses, no estimates, no made-up numbers." />
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
          <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">30 seconds. No signup. See exactly what's keeping you off page one — and what to do about it.</p>
          <Button
            onClick={() => navigate("/get-started")}
            size="lg"
            className="h-16 px-12 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 italic"
            style={{ fontFamily: "'Bookman Old Style', 'URW Bookman', 'Bookman', serif" }}
          >
            Run My Complimentary SEO Checkup
          </Button>
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
