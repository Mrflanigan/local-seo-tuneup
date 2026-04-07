import { Eye, EyeOff, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { ScoringResult } from "@/lib/scoring/types";

interface Props {
  result: ScoringResult;
}

interface TranslationItem {
  buzzword: string;
  plain: string;
  status: "good" | "bad";
}

function buildTranslations(result: ScoringResult): TranslationItem[] {
  const items: TranslationItem[] = [];
  

  for (const cat of result.categories) {
    for (const f of cat.findings) {
      // Map findings to buzzword + plain pairs
      const buzz = getBuzzword(f.id);
      if (!buzz) continue;
      items.push({
        buzzword: buzz,
        plain: f.personalized || f.generic,
        status: f.passed ? "good" : "bad",
      });
    }
  }

  return items;
}

function getBuzzword(id: string): string | null {
  const map: Record<string, string> = {
    // Local Presence
    "phone": "NAP Consistency (Phone Number)",
    "biz-name": "Business Name Visibility",
    "nap": "NAP Data (Name, Address, Phone)",
    "local-schema": "JSON-LD LocalBusiness Schema Markup",
    "maps": "Google Maps Embed / Geolocation Signal",
    "review-signals": "Review Schema & Social Proof Signals",
    "local-keywords": "Geo-Targeted Keyword Placement",
    // On-Page SEO
    "title": "<title> Tag Optimization",
    "meta-desc": "Meta Description Tag",
    "headings": "<h1> Heading Hierarchy",
    "keyword-usage": "Primary Keyword Density & Placement",
    "url-slug": "SEO-Friendly URL Slug Structure",
    "img-alts": "Image Alt Attribute Accessibility",
    "internal-links": "Internal Link Architecture",
    // Technical SEO
    "https": "SSL/TLS Certificate (HTTPS)",
    "meta-robots": "robots Meta Directives",
    "canonical": "Canonical URL Declaration",
    "viewport": "Responsive Viewport Meta Tag",
    "render-blocking": "Render-Blocking Resource Optimization",
    "speed-proxies": "Page Weight & Third-Party Script Load",
    // Content & UX
    "word-count": "Content Depth & Word Count",
    "content-structure": "Semantic Heading Hierarchy (H2/H3)",
    "cta": "Conversion-Focused CTA Elements",
    "contact-visible": "Contact Info Visibility",
    // Extras
    "extra-schema": "Advanced Structured Data (FAQ, Breadcrumb, Service)",
    "no-spam": "Spam & Malicious Link Detection",
    "trust-indicators": "Trust Signals (Testimonials & Social)",
  };
  return map[id] || null;
}

export default function WhatGoogleSees({ result }: Props) {
  const translations = buildTranslations(result);
  const good = translations.filter((t) => t.status === "good");
  const bad = translations.filter((t) => t.status === "bad");

  return (
    <div className="space-y-8">
      {/* The Analogy */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            What Google Actually Sees
          </h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Your site might look great to visitors — but Google doesn't see the
          design. It reads the <strong className="text-foreground">code behind it</strong>:
          your business name, page titles, descriptions, and the hidden data that tells
          Google what you do and where you do it.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Think of it like a résumé. Your business might be the best in town, but
          if the résumé is messy — missing details, no keywords, hard to read —
          you never get the call.{" "}
          <strong className="text-foreground">
            Google looks at billions of websites. If yours is hard to understand,
            it doesn't punish you — it just quietly sends customers to a
            competitor whose site is easier to read.
          </strong>
        </p>
      </div>

      {/* What's Working */}
      {good.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Here's What You're Doing Right Already
              </h3>
              <p className="text-xs text-muted-foreground">
                Google can find and understand these on your site
              </p>
            </div>
          </div>
          <ul className="space-y-4">
            {good.map((item) => (
              <li key={item.buzzword} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                <Link
                  to={`/methodology#check-${item.findingId}`}
                  className="text-xs font-mono bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded hover:underline hover:bg-green-500/20 transition-colors"
                >
                  {item.buzzword}
                </Link>
                <p className="text-sm text-foreground mt-1.5 leading-relaxed">
                  {item.plain}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* What's Not Working */}
      {bad.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-destructive/10">
              <EyeOff className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Here's What's Quietly Holding You Back
              </h3>
              <p className="text-xs text-muted-foreground">
                These are the things making it harder for Google to recommend you
              </p>
            </div>
          </div>
          <ul className="space-y-4">
            {bad.map((item) => (
              <li key={item.buzzword} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                <Link
                  to={`/methodology#check-${item.findingId}`}
                  className="text-xs font-mono bg-destructive/10 text-destructive px-2 py-0.5 rounded hover:underline hover:bg-destructive/20 transition-colors"
                >
                  {item.buzzword}
                </Link>
                <p className="text-sm text-foreground mt-1.5 leading-relaxed">
                  {item.plain}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* The Bottom Line */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">
            The Bottom Line
          </h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your site isn't broken — it just needs a few tweaks so Google understands it better.
          {bad.length > 0 && (
            <> You have <strong className="text-foreground">{bad.length} thing{bad.length > 1 ? "s" : ""}</strong> we'd
            fix first. Most are quick changes — the kind that help Google go from
            skipping past you to actually sending you customers.</>
          )}
        </p>
      </div>
    </div>
  );
}
