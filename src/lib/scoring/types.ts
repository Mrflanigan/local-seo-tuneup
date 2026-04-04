export interface SiteContext {
  businessName: string | null;
  services: string[];
  locations: string[];
  phone: string | null;
  email: string | null;
  pageTitle: string | null;
  metaDescription: string | null;
  h1Text: string | null;
}

export interface Finding {
  id: string;
  passed: boolean;
  generic: string;
  personalized: string;
  points: number;
  maxPoints: number;
}

export type CategoryId =
  | "local-presence"
  | "on-page-seo"
  | "technical-seo"
  | "content-ux"
  | "extras";

export interface CategoryResult {
  id: CategoryId;
  label: string;
  icon: string;
  score: number;
  maxScore: number;
  findings: Finding[];
}

export type LetterGrade = "A" | "B" | "C" | "D" | "F";

export type BusinessType = "local" | "online";

export interface ScoringResult {
  overallScore: number;
  rawScore: number;
  applicableMax: number;
  businessType: BusinessType;
  letterGrade: LetterGrade;
  categories: CategoryResult[];
  siteContext: SiteContext;
  personalizedSummary: string;
}

export interface FirecrawlScrapeResult {
  markdown: string;
  html: string;
  metadata?: {
    title?: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogSiteName?: string;
    [key: string]: unknown;
  };
  links?: string[];
}

export interface ScanInput {
  url: string;
  city?: string;
  state?: string;
}
