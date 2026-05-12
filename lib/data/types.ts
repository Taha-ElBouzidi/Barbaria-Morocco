export type LocaleCode = "en" | "fr";

export interface ProductSummary {
  slug: string;
  ritualId: "hammam" | "botanical" | "heritage";
  subcategorySlug: string | null;
  moq: number;
  formats: string[];
  lead: string;
  origin: string | null;
  ritualLabel: string | null;
  hero: boolean;
  name: string;       // resolved per locale
  short: string;      // resolved per locale
  lede: string | null;
  heroImage: string | null;  // images[0].path or null
  tags: string[];     // facet values for the resolved locale (value_en or value_fr)
}

export interface ProductDetail extends ProductSummary {
  images: { path: string; altText: string | null }[];
  applicationSteps: { stepNumber: number; title: string; body: string }[];
}

export interface RitualWorld {
  id: "hammam" | "botanical" | "heritage";
  heroImage: string | null;
  eyebrow: string;
  name: string;
  tagline: string;
  lede: string;
}

export interface SubCategory {
  id: string;        // uuid
  slug: string;      // human readable, e.g., "oils"
  name: string;
}

export interface AtelierEntry {
  slug: string;
  name: string;
  region: string;
  sinceYear: number;
  image: string | null;
  description: string;
}

export interface JournalEntry {
  slug: string;
  date: string;          // ISO date
  image: string | null;
  feature: boolean;
  kicker: string;
  headline: string;
}

export interface FacetEntry {
  id: string;
  type: "ingredient" | "use" | "format" | "packaging" | "certification";
  value: string;
}
