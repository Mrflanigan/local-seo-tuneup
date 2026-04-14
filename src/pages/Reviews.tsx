import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Reviews() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Independent Reviews — What Experts Say About Our SEO Checkup" description="Read independent AI-powered reviews of our local SEO audit tool, scoring methodology, and report quality." path="/reviews" />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Button variant="ghost" size="sm" onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} className="mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>

        {/* Page title & prelude */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          chat.GPT‑5.1 Independent Review (Latest)
        </h1>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-8">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              We asked chat.GPT‑5.1 to independently review SEO Osmosis based only on what it could see and infer,
              before and after key improvements. Formatting aside,{" "}
              <strong className="text-foreground">every word below is exactly as written by chat.GPT‑5.1.</strong>
            </p>
          </div>
        </div>

        {/* Review 4 header */}
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
          Review 4 — April 8, 2026 (Latest)
        </h2>
        <p className="text-lg font-semibold text-accent mb-6">
          SMB: 9.4/10 · Experienced SEO: 8.6/10
        </p>

        {/* TL;DR */}
        <Section title="TL;DR">
          <p>
            You were right: several things I marked "missing" were already there. Crediting those,
            plus the new technical checks and trust touches, meaningfully improves the picture.
          </p>
          <p>
            <strong className="text-foreground">Updated scores:</strong> SMBs/local owners:{" "}
            <span className="font-semibold text-accent">9.4/10</span> (was 9.1) · Experienced SEOs:{" "}
            <span className="font-semibold text-accent">8.6/10</span> (was 7.8)
          </p>
          <p>
            <strong className="text-foreground">Net:</strong> Best-in-class 60-second local snapshot
            for owners and small agencies. Still intentionally shallow for power users (single-URL,
            no crawl/GBP/citations), but the technical coverage and owner-first copy are now strong
            enough that I'd recommend it without caveats for most local SMB use cases.
          </p>
        </Section>

        {/* Corrections accepted */}
        <Section title="Corrections accepted (these were in place before my last review)">
          <p><strong className="text-foreground">Local/GBP-adjacent signals are present and scored:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>LocalBusiness JSON-LD detection and validation</li>
            <li>On-page NAP consistency</li>
            <li>Google Maps embeds/links and tel: click-to-call detection</li>
            <li>Hours of operation markup</li>
          </ul>
          <p>
            All rolled into Local Signals (20 pts). My "no GBP signal at all" characterization was too harsh;
            you cover the on-page/local readiness signals well, with the clear trade-off of not hitting the GBP API
            to keep sub‑60s.
          </p>

          <p><strong className="text-foreground">Geo/SERP context exists:</strong></p>
          <p>
            City/service area selection feeds city-aware copy and Phrase Optics ("plumber in [city]" phrasing)
            and report language around "rankings vary by city." That's exactly the level of local awareness that
            fits a one‑URL snapshot.
          </p>

          <p><strong className="text-foreground">Performance/mobile basics were not MIA:</strong></p>
          <p>
            You're pulling real PageSpeed Insights data (LCP, CLS, TBT, Speed Index, and what you call FLS).
            Plain-English labels and color tiers are in place. This is the right abstraction for owners.
          </p>
        </Section>

        {/* New since the last review */}
        <Section title="New since the last review (all good additions)">
          <p>
            <strong className="text-foreground">Robots.txt detection (2 pts):</strong> Existence,
            Disallow:/ flagging, owner-friendly guidance.
          </p>
          <p>
            <strong className="text-foreground">XML sitemap detection (2 pts):</strong> Common locations
            + robots.txt parsing; guidance on referencing from robots.txt.
          </p>
          <p>
            <strong className="text-foreground">Privacy/data retention page and footer metadata:</strong>{" "}
            Time-stamped reports, tool version, and a clear data policy linked from every report.
            This matters for agency trust and shareability.
          </p>
          <p>
            <strong className="text-foreground">Feedback widget:</strong> A lightweight loop for product
            improvement without hijacking the flow.
          </p>
        </Section>

        {/* Where the product is strongest now */}
        <Section title="Where the product is strongest now">
          <p>
            <strong className="text-foreground">Owner-first triage in under 60 seconds.</strong>{" "}
            The combination of local signals, PSI-backed performance, and clear "why it matters/how to fix"
            guidance makes the snapshot genuinely actionable for non-technical users.
          </p>
          <p>
            <strong className="text-foreground">Local readiness coverage.</strong>{" "}
            Between schema, NAP, tel:, hours, and city-aware phrasing, you're giving SMBs the right signals
            to fix first to earn calls and map pack eligibility.
          </p>
          <p>
            <strong className="text-foreground">Technical SEO completeness for a snapshot.</strong>{" "}
            HTTPS, meta robots, canonical, viewport, render-blocking, PSI, plus the new robots/sitemap checks,
            cover the most common self-inflicted wounds you see on small business sites.
          </p>
          <p>
            <strong className="text-foreground">Trust and report hygiene.</strong>{" "}
            Time stamps, versions, and privacy transparency are exactly what agencies need to forward a report
            without extra context.
          </p>
        </Section>

        {/* What still holds it back */}
        <Section title="What still holds it back (by audience)">
          <h3 className="text-base font-bold text-foreground mt-4 mb-2">
            For SMBs/local owners (why not 9.5 yet)
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">Impact/priority clarity.</strong>{" "}
              You've got color tiers and good copy, but owners would benefit from a simple "Fix first" stack
              that mixes severity and effort.
            </li>
            <li>
              <strong className="text-foreground">HTTPS redirect chain test is still pending.</strong>{" "}
              A common real-world issue (http→https→www→final) that can quietly hurt crawl and CWV.
            </li>
            <li>
              <strong className="text-foreground">Evidence everywhere.</strong>{" "}
              Some checks show evidence; apply that consistently to build confidence and ease handoff to devs.
            </li>
            <li>
              <strong className="text-foreground">PDF/export or print-friendly view.</strong>{" "}
              Post-launch is reasonable, but agencies will ask.
            </li>
          </ul>

          <h3 className="text-base font-bold text-foreground mt-6 mb-2">
            For experienced SEOs (why it tops out at 8.6 for now)
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">Single-URL scope.</strong>{" "}
              No mini-crawl, internal linking graph, thin/duplicate detection across pages.
              Intentional lane choice, but caps depth.
            </li>
            <li>
              <strong className="text-foreground">No live GBP or citation profile.</strong>{" "}
              On-page local signals are covered, but advanced local SEOs will miss GBP surface checks.
            </li>
            <li>
              <strong className="text-foreground">No severity/confidence per check yet.</strong>{" "}
              Practitioners want a sense of false-positive risk and detection confidence.
            </li>
            <li>
              <strong className="text-foreground">Limited surfacing of PSI opportunities.</strong>{" "}
              Power users want the top Lighthouse opportunities surfaced to translate metrics into fixes faster.
            </li>
          </ul>
        </Section>

        {/* Within-lane ideas */}
        <Section title="Within-lane ideas that would push SMB score to 9.5+">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">Fix-first priority stack:</strong>{" "}
              Per-check impact and effort tags. Auto-summarize the top 5 fixes at the top of the report.
            </li>
            <li>
              <strong className="text-foreground">LocalBusiness schema completeness meter:</strong>{" "}
              Grade required vs recommended properties and output a ready-to-paste JSON-LD block.
            </li>
            <li>
              <strong className="text-foreground">Redirect/canonical sanity card:</strong>{" "}
              Show HTTP status, final resolved URL, chain length, and whether canonical is self-referential and 200.
            </li>
            <li>
              <strong className="text-foreground">Evidence and snippets everywhere:</strong>{" "}
              For each check, show the exact snippet or URL. Include "Copy to clipboard" for quick fixes.
            </li>
            <li>
              <strong className="text-foreground">Conversion hygiene check:</strong>{" "}
              Detect a visible CTA above the fold and flag "No obvious CTA" as a conversion risk.
            </li>
            <li>
              <strong className="text-foreground">PSI opportunities bridge:</strong>{" "}
              Surface the top 2–3 Lighthouse "Opportunities" with plain-English "why it matters."
            </li>
            <li>
              <strong className="text-foreground">JS-rendering warning:</strong>{" "}
              Add a "content depends on JS" note when initial HTML is sparse but PSI trace indicates heavy rendering.
            </li>
            <li>
              <strong className="text-foreground">Simple on-page entity consistency:</strong>{" "}
              Check that Business Name appears in Title and H1; flag mismatches.
            </li>
            <li>
              <strong className="text-foreground">Share/print polish:</strong>{" "}
              Clean print stylesheet and a "Share" link with a time-stamp.
            </li>
            <li>
              <strong className="text-foreground">Terminology refresh:</strong>{" "}
              Standardize metric names (INP vs FID) and add one-line tooltips across all checks.
            </li>
          </ul>
        </Section>

        {/* Bottom line */}
        <Section title="Bottom line">
          <p>
            This is now a polished, fast, and trustworthy local snapshot that I'd put in front of owners and
            junior staff without hesitation. The corrections materially change the evaluation; my previous dings
            on local/geo/performance were off.
          </p>
          <p>
            Stay the course on the mini-crawl and citation sniff post-launch decisions; for the SMB north star,
            the higher-ROI wins are impact triage, evidence everywhere, redirect/canonical sanity, and a schema
            completeness meter. Those can realistically push you to 9.5+ for SMBs in the current lane.
          </p>
        </Section>
      </div>
    </div>
  );
}

/* ── tiny helper to keep section markup DRY ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 mb-6">
      <h2 className="text-base font-bold text-foreground mb-3">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </div>
  );
}
