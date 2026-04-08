import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Play, ExternalLink, ChevronDown, ChevronUp, Lock } from "lucide-react";

type BusinessType = "local" | "online";

interface OutputBlock {
  label: string;
  data: any;
  loading: boolean;
  error: string | null;
}

const ADMIN_PASSWORD = "10/10";

const GPT_REVIEWS = [
  {
    date: "2026-04-05",
    score: "7.5/10",
    scoreExperienced: "6/10",
    title: "Initial Review — Pre-Improvements",
    content: `Short verdict and rating
- Overall: 7.5/10 for small businesses and agencies needing a fast, no-friction first-pass audit; 6/10 for experienced SEOs who need depth, provenance, and ongoing tracking.
- I would recommend it as a rapid triage and pre-sales tool, not as a sole source of truth for strategy.

What stands out (strengths)
- Frictionless and fast: No signup, one scan that stitches together multiple steps most free tools split apart.
- Customer-language keyword ideation: Generating natural-language search phrases from a business description is genuinely useful for non-SEOs who default to generic head terms.
- Real(ish) volume in context: Showing monthly volumes next to those phrases makes the ideas feel grounded and helps prioritize.
- Competitor discovery in one pass: Automatically finding and scanning competitors is valuable for newcomers who don't know their search competitors.
- Clear scoring and recommendations: A single 100-point framework across Technical SEO, On-Page, Content, Local, and Performance makes the output digestible for decision-makers.
- PageSpeed integration: Nice to have in the same report; saves hopping to Lighthouse/PSI.

Where it falls short (weaknesses and risks)
- Data transparency and geo-targeting:
  - "Real monthly search volume" needs a cited source, region, and recency. Without it, volumes may be misleading (especially for low-volume or seasonal terms).
  - No obvious way to set target country/city/language means local intent and volumes can be off.
- Phrase Optics (page-1 potential) may overpromise:
  - Ranking potential is hard to estimate without accounting for backlinks/authority, SERP features, intent type, brand bias, and user location. If those aren't incorporated, the "you can rank on page 1" signal risks false confidence.
- Crawl depth and rendering:
  - Firecrawl can miss JS-rendered content, gated content, or complex navigation; without evidence of full rendering and queue control, audits may be incomplete.
- Technical SEO scope feels light:
  - Little indication it robustly checks indexability, canonicalization, hreflang, structured data validation, robots.txt, XML sitemaps, status codes/redirect chains, pagination, internal linking, duplication, parameterized URLs, or image optimization beyond PageSpeed.
- Performance measurement nuance:
  - PageSpeed lab scores are not the same as field Core Web Vitals (CrUX). If only lab data is shown, conclusions about real-user experience may be off.
- Local SEO signals likely underdeveloped:
  - You'd want Google Business Profile audit, NAP consistency/citations, reviews velocity/sentiment, local pack SERP snapshots, and proximity factors. If those aren't included, the Local score is shallow.
- No backlink/authority context:
  - Without even a lightweight domain/page strength estimate, competitive difficulty and opportunity sizing are shaky.
- One-and-done scan:
  - No tracking, baselining, alerts, or trendlines. You can't measure improvement or regressions across time.
- Methodology opacity:
  - Scoring and weighting aren't explained. Stakeholders need to see why a site got a 62 vs a 78, and what moves the needle most.
- Privacy and export:
  - If scans aren't saved, sharing is harder; if they are saved, users need clarity on data retention and deletion. Export (PDF/CSV) matters for clients.

How to make it stronger
- Add targeting controls and provenance
- Improve Phrase Optics explainability
- Deepen technical checks
- Performance nuance (CrUX field data)
- Local SEO module (GBP, citations, reviews)
- Data integrations and continuity
- Content mapping and actions
- Methodology transparency

Who it's best for
- Small businesses, founders, and generalist marketers who need a quick, understandable snapshot and a prioritized to-do list.
- Agencies for pre-sales audits and first-call conversations to surface obvious wins and scope.

Bottom line
- This tool is genuinely convenient and differentiates itself by bundling phrase generation, volumes, crawl, PageSpeed, competitor scanning, and recommendations into a single free, no-signup pass. That's valuable for discovery and fast prioritization.
- However, treat its scores and "page-1 potential" as directional, not definitive. Pair it with GSC, a backlink snapshot (Ahrefs/SEMrush/Majestic), and a fuller technical audit before committing budget based on its findings.
- If the team tightens data provenance, adds geo controls, and expands technical/local depth and explainability, this could become a go-to entry point for serious audits—not just a neat demo.`,
  },
  {
    date: "2026-04-07",
    score: "8.6/10",
    scoreExperienced: "6.9/10",
    title: "Re-Review — After Implementing Feedback",
    content: `Updated score
- For small businesses and agencies using it as a fast, no-friction audit and pre-sales aid: 8.6/10 (up from 7.5)
- For experienced SEOs who need depth, provenance, and tracking: 6.9/10 (up from 6.0)

What materially improved
- Methodology transparency: The /methodology page with category weights, individual checks, and points is exactly what I wanted. Clear, auditable, and sets the right expectations.
- Data provenance and disclaimers: Calling out "lab data" for performance, approximate/directional volumes, and that Phrase Optics excludes backlinks/authority reduces overpromise risk in a big way.
- "What we don't check" honesty: Listing backlinks, GBP, CrUX, XML sitemaps, redirect chains, hreflang, etc. boosts credibility. This is the right tone for an honest snapshot tool.
- Local and on-page clarity: The local presence checklist (NAP, LocalBusiness schema, Maps link/embed, review signals, local keyword usage) is simple, concrete, and aligned to SMB needs.
- Positioning: You're leaning into the "60-second, no signup, honest snapshot." That differentiation vs. heavyweight suites is now convincingly expressed in the product and documentation.

What's still weak or missing
- Geo-targeting and SERP context: Volumes are still non-geo or unclear by market. No SERP context (map pack presence, ad density, aggregator dominance).
- Crawl depth and sitewide issues: Still a single-URL pass. Misses site-structure problems, duplicate title/meta patterns, indexation anomalies, 404s, orphan pages.
- Technical SEO scope remains light: No robots.txt, XML sitemaps, redirect chains, status codes, hreflang, canonical/redirect mismatches, pagination, or duplicate signals across pages.
- Scoring design for non-local businesses: Making local checks "bonus points above 100" creates score inflation.
- Local weighting vs what you can truly audit: Local Presence is 30% but can't evaluate GBP directly or citations yet.
- Shareability and retention: Still no PDF/CSV export. No auto-tracking for deltas.
- Privacy and data controls: No crisp privacy/data-retention statement.
- Monetization path: Defined tiers are good; lack of checkout adds friction.

New observations
- The methodology page is a strength in itself. Consider linking each in-report check to its specific methodology anchor.
- "Google Readiness Extras" mixes quality and compliance signals — document what earns those points more explicitly.
- Review/rating signals: be careful not to reward TOS-violating embedded Google reviews widgets.

Would I change my recommendation?
- For SMBs and agencies: Yes. This now moves from "good triage tool" to "best-in-class fast snapshot + action plan for local service businesses." I'd actively use it for pre-sales, quick health checks, and client education.
- For experienced SEOs: Somewhat. Transparency upgrades make it more trustworthy as a quick QA pulse, but the lack of sitewide depth, SERP/geo context, backlinks, and automated tracking keep it as a complementary intake tool.

Priority roadmap (high impact, low lift first)
- 1–2 sprints: Location selector, robots.txt/sitemap detection, redirect-chain checks, mini-crawl (5-10 pages), PDF export, normalize scores, privacy policy.
- 3–6 sprints: Deeper structured data validation, lab CWV display, auto-tracking with deltas, monetization checkout.
- When you add external APIs: SERP provider for geo context, backlink/authority snapshot.

Bottom line
- You addressed the biggest trust gaps: methodology opacity, provenance, and overpromise. The product now fits its positioning very well and earns the higher score for SMBs and agency pre-sales workflows.
  - To break past ~9/10 for SMBs and ~7.5 for SEOs, you'll need minimal geo/SERP context, a bit more technical depth, mini-crawl coverage, and shareable outputs.`,
  },
  {
    date: "2026-04-08",
    score: "9.1/10",
    scoreExperienced: "7.8/10",
    title: "Third Review — Consolidated Summary",
    content: `Updated scores
- SMBs/local service owners & agency pre-sales: 9.1/10 (up from 7.5 → 8.6 → 9.1)
- Experienced SEOs: 7.8/10 (up from 6.0 → 6.9 → 7.8)

Why the score jumped
- Methodology / Scoring Transparency page with category weights, checks, and points.
- "Our Lane" positioning and "Best for / Not for" guidance on reports.
- Every check now has "Why this matters" and "How to fix" in plain language.
- Evidence-backed spam checks: heuristics + snippets + "red flag, not verdict" language.
- Speed and zero friction (60 seconds, no signup) kept as non-negotiable.

Standing vs other instant audit tools (per GPT comparison)
- SEO Osmosis scores highest overall (8.4/10 pre-launch, then 9.1/10 on updated review), ahead of:
  SEOptimer, Seobility, Woorank, SEO Site Checkup, Ubersuggest.

Our strengths vs the field
- Clarity and honesty (Our Lane + Best for / Not for).
- Transparency (why/fix for each check, methodology deep links).
- Local relevance (Local category, spam detection closer to real SMB concerns).
- Competitive context (top-3 competitor scan + gap view).
- Frictionless first scan (60s, no signup, modern UI).

What GPT says is still missing / holding us back (impact-ordered, within our lane)

1. No GBP signal yet for a local-first product.
   Need at least a GBP pulse: detect LocalBusiness schema + GBP/Maps link; if absent, coach the owner to create/link it.

2. No geo/SERP context.
   Need at least a basic city selector and copy that frames findings as general fixes, with explicit "rankings vary by city."

3. Crawl and indexability blind spots.
   Need canonical/redirect sanity for 4 entry URLs, robots.txt presence, XML sitemap presence + linkage, homepage meta robots/canonical/title/H1 checks.

4. No mini-crawl → miss template/sitewide issues.
   Need a tiny crawl (home + ~4 key internal pages) to catch duplicate titles/H1s, NAP consistency, internal links, LocalBusiness schema coverage.

5. Performance/mobile basics missing.
   Need a quick CrUX/PSI pulse (LCP/CLS/INP) with simple labels like "Likely fine / Might be costing you calls."

6. Heuristic quality & false positives.
   Tune spam detection: ignore brand/core service phrases, focus on density spikes in contiguous blocks, add "Looks legit? Dismiss" control and not re-flag on rerun.

7. No citation sniff at all.
   Light brand+phone footprint check on a few majors (Yelp, Facebook, BBB, Angi) with "found/not found/mismatch" only.

8. Trust hygiene.
   Ship a privacy/data-retention page and show "we store X for Y days" in the report footer with timestamp + tool version.

9. Agency workflow gaps.
   Need PDF export with evidence snippets and shareable links so agencies can drop reports into decks.

Constraints / guardrails (do NOT break these)
- p95 runtime must stay under ~60 seconds, even after mini-crawl and CrUX.
- Keep no-signup first scan.
- Maintain Our Lane and Best for / Not for positioning — no drifting into "full SEO suite."
- All copy must stay plain-language, owner-friendly.

North star
- Become undeniably 9.5+/10 for SMB/local service owners and small agencies as a fast, honest, local-first snapshot + action plan, not as an all-in-one enterprise SEO platform.`,
  },
];

export default function Admin() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [activeTab, setActiveTab] = useState<"scanner" | "reviews">("scanner");

  // Scanner state
  const [url, setUrl] = useState("");
  const [city, setCity] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("local");
  const [phrases, setPhrases] = useState("");
  const [outputs, setOutputs] = useState<Record<string, OutputBlock>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4 text-center">
          <Lock className="h-10 w-10 text-muted-foreground mx-auto" />
          <h1 className="text-lg font-bold text-foreground">Admin Access</h1>
          <Input
            type="password"
            value={passwordInput}
            onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
            placeholder="Password"
            className={`h-11 text-center ${passwordError ? "border-destructive" : ""}`}
            autoFocus
          />
          {passwordError && <p className="text-xs text-destructive">Wrong password</p>}
          <Button type="submit" className="w-full">Enter</Button>
        </form>
      </div>
    );
  }

  const updateOutput = (key: string, partial: Partial<OutputBlock>) => {
    setOutputs((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...partial } as OutputBlock,
    }));
  };

  const getPhraseList = () =>
    phrases.split("\n").map((p) => p.trim()).filter(Boolean);

  const runFullCheckup = async () => {
    const key = "full";
    updateOutput(key, { label: "Full Checkup Raw Output", data: null, loading: true, error: null });
    try {
      const { data, error } = await supabase.functions.invoke("checkup", {
        body: { url, city: city || undefined, businessType, searchPhrases: getPhraseList() },
      });
      if (error) throw error;
      updateOutput(key, { data, loading: false });
    } catch (err: any) {
      updateOutput(key, { loading: false, error: err.message || "Failed" });
    }
  };

  const runOsmosisOnly = async () => {
    const key = "osmosis";
    updateOutput(key, { label: "Osmosis Raw Output (Site Audit subset)", data: null, loading: true, error: null });
    try {
      const { data, error } = await supabase.functions.invoke("checkup", {
        body: { url, city: city || undefined, businessType, searchPhrases: [] },
      });
      if (error) throw error;
      const auditData = data?.data
        ? {
            overallScore: data.data.overallScore,
            letterGrade: data.data.letterGrade,
            categories: data.data.categories,
            siteContext: data.data.siteContext,
            businessType: data.data.businessType,
          }
        : data;
      updateOutput(key, { data: auditData, loading: false });
    } catch (err: any) {
      updateOutput(key, { loading: false, error: err.message || "Failed" });
    }
  };

  const runPsiOnly = async () => {
    const key = "psi";
    updateOutput(key, { label: "PSI Raw Output", data: null, loading: true, error: null });
    try {
      const { data, error } = await supabase.functions.invoke("checkup", {
        body: { url, city: city || undefined, businessType, searchPhrases: [] },
      });
      if (error) throw error;
      const psiData = data?.data?.pageSpeed || { note: "No PSI data returned" };
      updateOutput(key, { data: psiData, loading: false });
    } catch (err: any) {
      updateOutput(key, { loading: false, error: err.message || "Failed" });
    }
  };

  const runPhraseOptics = async () => {
    const key = "phrase";
    updateOutput(key, { label: "Phrase Optics / Competitors Raw Output", data: null, loading: true, error: null });
    try {
      const phraseList = getPhraseList();
      const { data, error } = await supabase.functions.invoke("checkup", {
        body: { url, city: city || undefined, businessType, searchPhrases: phraseList },
      });
      if (error) throw error;
      const phraseData = {
        phraseOptics: data?.data?.phraseOptics || null,
        note: phraseList.length === 0 ? "No phrases provided" : undefined,
      };
      updateOutput(key, { data: phraseData, loading: false });
    } catch (err: any) {
      updateOutput(key, { loading: false, error: err.message || "Failed" });
    }
  };

  const openReport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("checkup", {
        body: { url, city: city || undefined, businessType, searchPhrases: getPhraseList() },
      });
      if (error) throw error;
      if (data?.data) {
        navigate("/report", { state: { result: data.data, url, city: city || undefined, businessType } });
      }
    } catch {
      // silently fail
    }
  };

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Warning banner */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300 font-medium">
            Admin Panel — Internal use only.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("scanner")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "scanner"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Scanner
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "reviews"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            GPT Reviews
          </button>
        </div>

        {activeTab === "scanner" && (
          <>
            {/* ── Inputs ── */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-4 text-foreground">Inputs</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">URL (required)</label>
                  <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">City (optional)</label>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Everett WA" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Business Type</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="local">Local</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Search Phrases (one per line)</label>
                  <Textarea
                    value={phrases}
                    onChange={(e) => setPhrases(e.target.value)}
                    placeholder={"plumber Everett WA\nemergency plumber near me"}
                    rows={3}
                  />
                </div>
              </div>
            </section>

            {/* ── Actions ── */}
            <section className="mb-8">
              <h2 className="text-lg font-bold mb-4 text-foreground">Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={runFullCheckup} disabled={!url} className="h-12 justify-start gap-2">
                  <Play className="h-4 w-4" /> Run Full Checkup
                </Button>
                <Button onClick={runOsmosisOnly} disabled={!url} variant="outline" className="h-12 justify-start gap-2">
                  <Play className="h-4 w-4" /> Run Osmosis Only
                </Button>
                <Button onClick={runPsiOnly} disabled={!url} variant="outline" className="h-12 justify-start gap-2">
                  <Play className="h-4 w-4" /> Run PSI Only
                </Button>
                <Button onClick={runPhraseOptics} disabled={!url} variant="outline" className="h-12 justify-start gap-2">
                  <Play className="h-4 w-4" /> Run Phrase Optics
                </Button>
              </div>
            </section>

            {/* ── Open Report ── */}
            <section className="mb-8">
              <Button onClick={openReport} disabled={!url} variant="secondary" className="gap-2">
                <ExternalLink className="h-4 w-4" /> Open normal report for this URL
              </Button>
            </section>

            {/* ── Raw Outputs ── */}
            <section>
              <h2 className="text-lg font-bold mb-4 text-foreground">Raw Outputs</h2>
              {Object.entries(outputs).length === 0 && (
                <p className="text-sm text-muted-foreground">Run a scan above to see raw JSON here.</p>
              )}
              {Object.entries(outputs).map(([key, block]) => (
                <div key={key} className="mb-4 rounded-lg border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => toggleCollapse(key)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="text-sm font-semibold text-foreground">{block.label}</span>
                    <div className="flex items-center gap-2">
                      {block.loading && (
                        <span className="text-xs text-muted-foreground animate-pulse">Running…</span>
                      )}
                      {collapsed[key] ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  {!collapsed[key] && (
                    <div className="px-4 pb-4">
                      {block.error && (
                        <p className="text-sm text-destructive mb-2">Error: {block.error}</p>
                      )}
                      {block.data && (
                        <pre className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3 overflow-auto max-h-96 whitespace-pre-wrap break-words">
                          {JSON.stringify(block.data, null, 2)}
                        </pre>
                      )}
                      {!block.data && !block.loading && !block.error && (
                        <p className="text-xs text-muted-foreground">No data yet.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </section>
          </>
        )}

        {activeTab === "reviews" && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-bold text-foreground">GPT Product Reviews</h2>
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                {GPT_REVIEWS.length} reviews
              </span>
            </div>

            {/* Score progression */}
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 mb-6">
              <p className="text-sm font-semibold text-foreground mb-2">Score Progression (SMB Rating)</p>
              <div className="flex items-center gap-4">
                {GPT_REVIEWS.map((review, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{review.score}</p>
                      <p className="text-[10px] text-muted-foreground">{review.date}</p>
                    </div>
                    {i < GPT_REVIEWS.length - 1 && (
                      <span className="text-accent text-xl">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Full reviews */}
            {GPT_REVIEWS.map((review, i) => (
              <div key={i} className="mb-6 rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{review.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {review.date} · SMB: {review.score} · Experienced SEO: {review.scoreExperienced}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-primary">{review.score}</span>
                  </div>
                </div>
                <pre className="px-5 py-4 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans">
                  {review.content}
                </pre>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
