export type LocaleCode = "en" | "fr";

export interface ProductSummary {
  slug: string;
  moq: number;
  formats: string[];
  lead: string;
  origin: string | null;
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

// Sprint 2 , Categories and gift boxes

export type CategorySlug = "cosmetiques" | "epicerie_fine";
export type StoryThemeKey = "sahara_stars" | "caravan_route";

export interface Category {
  id: string;            // uuid
  slug: CategorySlug;
  heroImage: string | null;
  storyThemeKey: StoryThemeKey;
  name: string;
  tagline: string;
  lede: string;
}

export interface GiftBoxSummary {
  id: string;            // uuid
  slug: string;
  categorySlug: CategorySlug;
  heroImage: string | null;
  defaultQuantityMin: number;
  isCustomizable: boolean;
  name: string;
  tagline: string | null;
  storyIntro: string | null;
  itemCount: number;
}

export interface GiftBoxDetail extends GiftBoxSummary {
  items: ProductSummary[];
}
