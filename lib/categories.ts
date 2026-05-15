// Sprint 2 , Categories (public-facing taxonomy)
//
// Replaces the 3 rituals as the entry point to the catalogue. Each
// category has a story theme key used by the box composer wizard to
// pick the right narrative voice (Sahara stars / caravan route).

export type CategorySlug = "cosmetiques" | "epicerie_fine";
export type StoryThemeKey = "sahara_stars" | "caravan_route";

export interface Category {
  slug: CategorySlug;
  sortOrder: number;
  heroImagePath: string | null;
  storyThemeKey: StoryThemeKey;
  translations: {
    en: { name: string; tagline: string; lede: string };
    fr: { name: string; tagline: string; lede: string };
  };
}

export const CATEGORIES: Category[] = [
  {
    slug: "cosmetiques",
    sortOrder: 0,
    heroImagePath: "/brand_photos/savon-noir-2.jpg",
    storyThemeKey: "sahara_stars",
    translations: {
      en: {
        name: "Cosmetics",
        tagline: "Beneath the Sahara stars",
        lede: "Hand-blended scrubs, beldi soaps, cold-pressed oils, hydrosols and massage oils, composed into gift boxes for hôtels, spas and B2B private label.",
      },
      fr: {
        name: "Cosmétiques",
        tagline: "Sous les étoiles du Sahara",
        lede: "Gommages, savons beldi, huiles pressées à froid, hydrolats et huiles de massage, composés en coffrets cadeaux pour hôtels, spas et marque blanche B2B.",
      },
    },
  },
  {
    slug: "epicerie_fine",
    sortOrder: 1,
    heroImagePath: "/brand_photos/products-all-three.jpg",
    storyThemeKey: "caravan_route",
    translations: {
      en: {
        name: "Fine Épicerie",
        tagline: "Along the caravan route",
        lede: "Argan oil, saffron from Taliouine, honeys, ras el hanout and the spice trade of Morocco. Curated gift boxes for the table, drawn from the caravan routes the Berbers walked for a thousand years.",
      },
      fr: {
        name: "Épicerie Fine",
        tagline: "Sur la route des caravanes",
        lede: "Huile d'argan, safran de Taliouine, miels, ras el hanout et les épices du Maroc. Des coffrets cadeaux pour la table, hérités des routes que les Berbères parcourent depuis mille ans.",
      },
    },
  },
];

export function getCategory(slug: CategorySlug): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
