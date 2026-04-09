import type { ImpactLevel, EffortLevel } from "./types";

/**
 * Static impact + effort metadata for every check ID.
 * Impact  = how much this affects leads/visibility for local SMBs.
 * Effort  = who typically needs to do the work: Owner, Content writer, or Developer.
 */
export const CHECK_METADATA: Record<string, { impact: ImpactLevel; effort: EffortLevel }> = {
  // Local Presence & GBP
  "phone":            { impact: "High",   effort: "Owner" },
  "biz-name":         { impact: "Medium", effort: "Owner" },
  "nap":              { impact: "High",   effort: "Owner" },
  "local-schema":     { impact: "High",   effort: "Developer" },
  "maps":             { impact: "Medium", effort: "Developer" },
  "review-signals":   { impact: "High",   effort: "Owner" },
  "local-keywords":   { impact: "High",   effort: "Content" },

  // On-Page SEO
  "title":            { impact: "High",   effort: "Content" },
  "meta-desc":        { impact: "High",   effort: "Content" },
  "headings":         { impact: "Medium", effort: "Content" },
  "keyword-usage":    { impact: "Medium", effort: "Content" },
  "url-slug":         { impact: "Low",    effort: "Developer" },
  "img-alts":         { impact: "Medium", effort: "Content" },
  "internal-links":   { impact: "Medium", effort: "Content" },
  "entity-consistency":{ impact: "High",   effort: "Content" },

  // Technical SEO
  "https":            { impact: "High",   effort: "Developer" },
  "meta-robots":      { impact: "High",   effort: "Developer" },
  "canonical":        { impact: "Medium", effort: "Developer" },
  "viewport":         { impact: "High",   effort: "Developer" },
  "render-blocking":  { impact: "Low",    effort: "Developer" },
  "speed-proxies":    { impact: "Low",    effort: "Developer" },
  "robots-txt":       { impact: "Medium", effort: "Developer" },
  "xml-sitemap":      { impact: "Medium", effort: "Developer" },
  "redirect-chain":   { impact: "High",   effort: "Developer" },

  // Content & UX
  "word-count":       { impact: "Medium", effort: "Content" },
  "content-structure":{ impact: "Medium", effort: "Content" },
  "cta":              { impact: "High",   effort: "Content" },
  "contact-visible":  { impact: "High",   effort: "Owner" },

  // Extras
  "extra-schema":     { impact: "Low",    effort: "Developer" },
  "no-spam":          { impact: "High",   effort: "Developer" },
  "trust-indicators": { impact: "Medium", effort: "Owner" },
};
