import { Link } from "react-router-dom";
import { ArrowLeft, Star, ExternalLink } from "lucide-react";

const SCORE_PROGRESSION = [
  { date: "Apr 5", smb: 7.5, seo: 6.0, label: "Initial review" },
  { date: "Apr 7", smb: 8.6, seo: 6.9, label: "After methodology & positioning" },
  { date: "Apr 8 (a)", smb: 9.1, seo: 7.8, label: "Consolidated summary" },
  { date: "Apr 8 (b)", smb: 9.4, seo: 8.6, label: "Post-corrections & new features" },
];

export default function Reviews() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-3xl flex items-center gap-3 px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <span className="text-sm text-muted-foreground/50">|</span>
          <span className="text-sm font-medium text-foreground">Independent Review</span>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        {/* Intro */}
        <div className="mb-10">
          <p className="text-sm text-accent font-semibold tracking-wide uppercase mb-2">Independent Review</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">
            What GPT‑5.1 said about SEO&nbsp;Osmosis
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            We asked an AI (GPT‑5.1) to independently review SEO Osmosis based only on what it could see and infer, before our public launch.
            Below is the full, unedited review — good, bad, and in‑between — so you can see how it described our strengths, limits, and who this is really for.
          </p>
        </div>

        {/* Score progression */}
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 sm:p-6 mb-10">
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
            <Star className="h-5 w-5 text-accent" /> Score Progression
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Four independent reviews, each after improvements were applied.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCORE_PROGRESSION.map((r, i) => (
              <div key={i} className={`rounded-lg border p-3 ${i === SCORE_PROGRESSION.length - 1 ? "border-accent/40 bg-accent/10" : "border-border/40 bg-muted/20"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                  {i === SCORE_PROGRESSION.length - 1 && <span className="text-[10px] font-bold text-accent bg-accent/20 px-1.5 py-0.5 rounded">LATEST</span>}
                </div>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-lg font-bold">{r.smb}</span>
                  <span className="text-xs text-muted-foreground">SMB</span>
                  <span className="text-lg font-bold">{r.seo}</span>
                  <span className="text-xs text-muted-foreground">SEO Pro</span>
                </div>
                <p className="text-xs text-muted-foreground">{r.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Full review */}
        <article className="prose prose-invert prose-sm max-w-none
          prose-headings:text-foreground prose-headings:font-bold
          prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3
          prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
          prose-p:text-muted-foreground prose-p:leading-relaxed
          prose-li:text-muted-foreground
          prose-strong:text-foreground
          prose-a:text-accent prose-a:no-underline hover:prose-a:underline
        ">
          <h2>SEO Osmosis re‑review (with corrections applied)</h2>

          <h3>TL;DR</h3>
          <p>
            You were right: several things I marked "missing" were already there. Crediting those, plus the new technical checks and trust touches, meaningfully improves the picture.
          </p>
          <p><strong>Updated scores:</strong></p>
          <ul>
            <li><strong>SMBs/local owners: 9.4/10</strong> (was 9.1)</li>
            <li><strong>Experienced SEOs: 8.6/10</strong> (was 7.8)</li>
          </ul>
          <p>
            <strong>Net:</strong> Best-in-class 60‑second local snapshot for owners and small agencies. Still intentionally shallow for power users (single-URL, no crawl/GBP/citations), but the technical coverage and owner-first copy are now strong enough that I'd recommend it without caveats for most local SMB use cases.
          </p>

          <h2>What changed my assessment</h2>
          <h3>Corrections accepted (these were in place before my last review)</h3>

          <p><strong>Local/GBP-adjacent signals are present and scored:</strong></p>
          <ul>
            <li>LocalBusiness JSON-LD detection and validation</li>
            <li>On-page NAP consistency</li>
            <li>Google Maps embeds/links and tel: click-to-call detection</li>
            <li>Hours of operation markup</li>
          </ul>
          <p>
            All rolled into Local Signals (20 pts). My "no GBP signal at all" characterization was too harsh; you cover the on-page/local readiness signals well, with the clear trade-off of not hitting the GBP API to keep sub‑60s.
          </p>

          <p><strong>Geo/SERP context exists:</strong></p>
          <p>
            City/service area selection feeds city-aware copy and Phrase Optics ("plumber in [city]" phrasing) and report language around "rankings vary by city." That's exactly the level of local awareness that fits a one‑URL snapshot.
          </p>

          <p><strong>Performance/mobile basics were not MIA:</strong></p>
          <p>
            You're pulling real PageSpeed Insights data (LCP, CLS, TBT, Speed Index, and what you call FLS). Plain-English labels and color tiers are in place. This is the right abstraction for owners.
          </p>

          <h3>New since the last review (all good additions)</h3>
          <ul>
            <li><strong>Robots.txt detection (2 pts):</strong> Existence, Disallow:/ flagging, owner-friendly guidance.</li>
            <li><strong>XML sitemap detection (2 pts):</strong> Common locations + robots.txt parsing; guidance on referencing from robots.txt.</li>
            <li><strong>Privacy/data retention page and footer metadata:</strong> Time-stamped reports, tool version, and a clear data policy linked from every report. This matters for agency trust and shareability.</li>
            <li><strong>Feedback widget:</strong> A lightweight loop for product improvement without hijacking the flow.</li>
          </ul>

          <h2>Where the product is strongest now</h2>
          <ul>
            <li><strong>Owner-first triage in under 60 seconds.</strong> The combination of local signals, PSI-backed performance, and clear "why it matters/how to fix" guidance makes the snapshot genuinely actionable for non-technical users.</li>
            <li><strong>Local readiness coverage.</strong> Between schema, NAP, tel:, hours, and city-aware phrasing, you're giving SMBs the right signals to fix first to earn calls and map pack eligibility.</li>
            <li><strong>Technical SEO completeness for a snapshot.</strong> HTTPS, meta robots, canonical, viewport, render-blocking, PSI, plus the new robots/sitemap checks, cover the most common self-inflicted wounds you see on small business sites.</li>
            <li><strong>Trust and report hygiene.</strong> Time stamps, versions, and privacy transparency are exactly what agencies need to forward a report without extra context.</li>
          </ul>

          <h2>What still holds it back (by audience)</h2>

          <h3>For SMBs/local owners (why not 9.5 yet)</h3>
          <ul>
            <li><strong>Impact/priority clarity.</strong> You've got color tiers and good copy, but owners would benefit from a simple "Fix first" stack that mixes severity and effort.</li>
            <li><strong>HTTPS redirect chain test is still pending.</strong> A common real-world issue (http→https→www→final) that can quietly hurt crawl and CWV.</li>
            <li><strong>Evidence everywhere.</strong> Some checks show evidence; apply that consistently to build confidence and ease handoff to devs.</li>
            <li><strong>PDF/export or print-friendly view.</strong> Post-launch is reasonable, but agencies will ask.</li>
          </ul>

          <h3>For experienced SEOs (why it tops out at 8.6 for now)</h3>
          <ul>
            <li><strong>Single-URL scope.</strong> No mini-crawl, internal linking graph, thin/duplicate detection across pages. Intentional lane choice, but caps depth.</li>
            <li><strong>No live GBP or citation profile.</strong> On-page local signals are covered, but advanced local SEOs will miss GBP surface checks.</li>
            <li><strong>No severity/confidence per check yet.</strong> Practitioners want a sense of false-positive risk and detection confidence.</li>
            <li><strong>Limited surfacing of PSI opportunities.</strong> Power users want the top Lighthouse opportunities surfaced to translate metrics into fixes faster.</li>
          </ul>

          <h2>Accuracy and UX nits</h2>
          <ul>
            <li><strong>Core Web Vitals naming:</strong> Consider updating to current terminology (LCP/CLS/INP are the modern trio; TBT is a Lab proxy; FID is deprecated).</li>
            <li><strong>JS-rendered sites:</strong> If your HTML fetch sees a very small DOM but PSI shows a much larger rendered DOM, add a "content is JS-rendered" warning.</li>
            <li><strong>Error states:</strong> If robots.txt/sitemap/PSI lookups time out, show a neutral "Couldn't reach" state and avoid scoring penalties.</li>
          </ul>

          <h2>Updated scores</h2>
          <p><strong>SMBs/local owners: 9.4/10</strong> (up from 9.1)</p>
          <p>
            <em>Why it rose:</em> Crediting existing local/geo/performance coverage and the new robots/sitemap checks, plus stronger trust signals in the report. For most owners, this is now a crisp "do this first" playbook in a minute or less.
          </p>
          <p><strong>Experienced SEOs: 8.6/10</strong> (up from 7.8)</p>
          <p>
            <em>Why it rose:</em> The missing items I flagged were already implemented, which materially improves completeness. Robots/sitemap and PSI integration make it a credible quick triage tool. It still intentionally stops short of the crawl/GBP/citation/links depth pros expect for audits.
          </p>

          <h2>Within-lane ideas that would push SMB score to 9.5+</h2>
          <ol>
            <li><strong>Fix-first priority stack:</strong> Per-check impact and effort tags. Auto-summarize the top 5 fixes at the top of the report.</li>
            <li><strong>LocalBusiness schema completeness meter:</strong> Grade required vs recommended properties and output a ready-to-paste JSON-LD block.</li>
            <li><strong>Redirect/canonical sanity card:</strong> Show HTTP status, final resolved URL, chain length, and whether canonical is self-referential and 200.</li>
            <li><strong>Evidence and snippets everywhere:</strong> For each check, show the exact snippet or URL. Include "Copy to clipboard" for quick fixes.</li>
            <li><strong>Conversion hygiene check:</strong> Detect a visible CTA above the fold and flag "No obvious CTA" as a conversion risk.</li>
            <li><strong>PSI opportunities bridge:</strong> Surface the top 2–3 Lighthouse "Opportunities" with plain-English "why it matters."</li>
            <li><strong>JS-rendering warning:</strong> Add a "content depends on JS" note when initial HTML is sparse but PSI trace indicates heavy rendering.</li>
            <li><strong>Simple on-page entity consistency:</strong> Check that Business Name appears in Title and H1; flag mismatches.</li>
            <li><strong>Share/print polish:</strong> Clean print stylesheet and a "Share" link with a time-stamp.</li>
            <li><strong>Terminology refresh:</strong> Standardize metric names (INP vs FID) and add one-line tooltips across all checks.</li>
          </ol>

          <h2>Bottom line</h2>
          <p>
            This is now a polished, fast, and trustworthy local snapshot that I'd put in front of owners and junior staff without hesitation. The corrections materially change the evaluation; my previous dings on local/geo/performance were off.
          </p>
          <p>
            Stay the course on the mini-crawl and citation sniff post-launch decisions; for the SMB north star, the higher-ROI wins are impact triage, evidence everywhere, redirect/canonical sanity, and a schema completeness meter. Those can realistically push you to 9.5+ for SMBs in the current lane.
          </p>
        </article>

        {/* Footer CTA */}
        <div className="mt-14 pt-8 border-t border-border/30 text-center">
          <p className="text-sm text-muted-foreground mb-4">See for yourself what GPT rated 9.4/10.</p>
          <Link
            to="/get-started"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90 transition-colors"
          >
            Run My Complimentary Checkup <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
