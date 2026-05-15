// Sprint 2 , Gift Boxes (curated and customizable)
//
// Curated boxes carry a fixed item list (the 3 cosmetics packs we already
// had as products are now gift_boxes here). Customizable boxes are the
// wizard entries: no items, the buyer composes them step by step.

import type { CategorySlug } from "./categories";

export interface GiftBox {
  slug: string;
  categorySlug: CategorySlug;
  heroImagePath: string | null;
  status: "draft" | "published";
  defaultQuantityMin: number;
  sortOrder: number;
  isCustomizable: boolean;
  /** Component product slugs for curated boxes. Empty for customizable. */
  items: string[];
  translations: {
    en: { name: string; tagline: string; storyIntro: string };
    fr: { name: string; tagline: string; storyIntro: string };
  };
}

export const GIFT_BOXES: GiftBox[] = [
  // ============================================================
  // COSMÉTIQUES , customizable wizard entry
  // ============================================================
  {
    slug: "compose-cosmetiques",
    categorySlug: "cosmetiques",
    heroImagePath: "/brand_photos/gift-box-open.jpg",
    status: "published",
    defaultQuantityMin: 5,
    sortOrder: 0,
    isCustomizable: true,
    items: [],
    translations: {
      en: {
        name: "Compose your cosmetics box",
        tagline: "Map your own night sky",
        storyIntro:
          "Six stars cross the Sahara each night. Each ritual you choose is a star you place into the box: the cleanse, the steam, the oil, the bloom. We carry it for you.",
      },
      fr: {
        name: "Composez votre coffret cosmétique",
        tagline: "Tracez votre propre ciel nocturne",
        storyIntro:
          "Six étoiles traversent le Sahara chaque nuit. Chaque rituel que vous choisissez est une étoile que vous posez dans le coffret : le nettoyage, la vapeur, l'huile, la fleur. Nous le portons pour vous.",
      },
    },
  },

  // ============================================================
  // COSMÉTIQUES , 3 curated (migrated from former heritage packs)
  // ============================================================
  {
    slug: "pack-nila-oranger",
    categorySlug: "cosmetiques",
    heroImagePath: "/brand_photos/gift-box-open.jpg",
    status: "published",
    defaultQuantityMin: 5,
    sortOrder: 1,
    isCustomizable: false,
    items: ["huile-argan", "gommage-nila", "savon-beldi-nila", "eau-fleur-oranger"],
    translations: {
      en: {
        name: "Nila & Orange Blossom",
        tagline: "Glow · softness · relaxation",
        storyIntro:
          "Four pieces composing the maison's blue-hour signature: pure argan oil, the signature Nila & Orange Blossom scrub, the Nila Beldi soap, and the Fès orange blossom hydrosol.",
      },
      fr: {
        name: "Nila & Fleur d'Oranger",
        tagline: "Éclat · douceur · relaxation",
        storyIntro:
          "Quatre pièces qui composent la signature bleutée de la maison : huile d'argan pure, le gommage signature Nila & Fleur d'Oranger, le savon beldi Nila, et l'hydrolat de fleur d'oranger de Fès.",
      },
    },
  },
  {
    slug: "pack-rose-aker-fassi",
    categorySlug: "cosmetiques",
    heroImagePath: "/brand_photos/gift-box-flat.jpg",
    status: "published",
    defaultQuantityMin: 5,
    sortOrder: 2,
    isCustomizable: false,
    items: [
      "huile-figue-barbarie",
      "gommage-aker-fassi",
      "savon-beldi-aker-fassi",
      "eau-rose-dades",
    ],
    translations: {
      en: {
        name: "Rose & Aker Fassi",
        tagline: "Femininity · luxury · sensuality",
        storyIntro:
          "The maison's feminine signature, four pieces: prickly pear seed oil, the Aker Fassi & Rose scrub, the Aker Fassi & Rose Beldi soap, and the Dades rose water.",
      },
      fr: {
        name: "Rose & Aker Fassi",
        tagline: "Féminité · luxe · sensualité",
        storyIntro:
          "La signature féminine de la maison, quatre pièces : huile de figue de barbarie, gommage Aker Fassi & Rose, savon beldi Aker Fassi & Rose, et eau de rose du Dadès.",
      },
    },
  },
  {
    slug: "pack-rituel-naturel",
    categorySlug: "cosmetiques",
    heroImagePath: "/brand_photos/products-all-three.jpg",
    status: "published",
    defaultQuantityMin: 5,
    sortOrder: 3,
    isCustomizable: false,
    items: ["huile-saad", "masque-ghassoul-argan", "savon-beldi-ghassoul", "eau-fleur-oranger"],
    translations: {
      en: {
        name: "Natural Ritual",
        tagline: "Authenticity · purity · tradition",
        storyIntro:
          "The authenticity box, four pieces: pure S'ad oil, Ghassoul & Argan body mask, Ghassoul & Argan beldi soap, and pure orange blossom hydrosol.",
      },
      fr: {
        name: "Rituel Naturel",
        tagline: "Authenticité · pureté · tradition",
        storyIntro:
          "Le coffret authenticité, quatre pièces : huile de S'ad pure, masque corps Ghassoul & Argan, savon beldi Ghassoul & Argan, et eau de fleur d'oranger pure.",
      },
    },
  },

  // ============================================================
  // ÉPICERIE FINE , customizable wizard entry (no products yet)
  // ============================================================
  {
    slug: "compose-epicerie",
    categorySlug: "epicerie_fine",
    heroImagePath: "/brand_photos/products-all-three.jpg",
    // Published so the Épicerie tab has the wizard CTA visible. The picker
    // grids will be empty until admin populates épicerie products, but the
    // structure renders.
    status: "published",
    defaultQuantityMin: 5,
    sortOrder: 0,
    isCustomizable: true,
    items: [],
    translations: {
      en: {
        name: "Compose your épicerie box",
        tagline: "Load your own caravan",
        storyIntro:
          "From Sijilmassa to Marrakech, the caravans carried argan, saffron and ras el hanout as currency. Each step you take loads your own caravan: an oil, a honey, a spice, a salt.",
      },
      fr: {
        name: "Composez votre coffret épicerie",
        tagline: "Chargez votre propre caravane",
        storyIntro:
          "De Sijilmassa à Marrakech, les caravanes portaient l'argan, le safran et le ras el hanout comme monnaie. Chaque étape charge votre propre caravane : une huile, un miel, une épice, un sel.",
      },
    },
  },

  // ============================================================
  // ÉPICERIE FINE , 2 curated placeholder boxes (drafts; admin populates)
  // ============================================================
  {
    slug: "caravane-or-liquide",
    categorySlug: "epicerie_fine",
    heroImagePath: "/brand_photos/argan-oil-dropper.jpg",
    status: "published",
    defaultQuantityMin: 5,
    sortOrder: 1,
    isCustomizable: false,
    items: [],
    translations: {
      en: {
        name: "Or Liquide des Souss",
        tagline: "Liquid Gold of the Souss",
        storyIntro:
          "Placeholder. Admin will populate with argan culinaire, olive première pression, amlou and saffron de Taliouine.",
      },
      fr: {
        name: "Or Liquide des Souss",
        tagline: "L'or liquide des Souss",
        storyIntro:
          "Placeholder. L'admin va remplir avec argan culinaire, olive première pression, amlou et safran de Taliouine.",
      },
    },
  },
  {
    slug: "caravane-essences-anciennes",
    categorySlug: "epicerie_fine",
    heroImagePath: "/brand_photos/packaging-1.jpg",
    status: "published",
    defaultQuantityMin: 5,
    sortOrder: 2,
    isCustomizable: false,
    items: [],
    translations: {
      en: {
        name: "Essences Anciennes",
        tagline: "The spice halts of the Maghreb",
        storyIntro:
          "Placeholder. Admin will populate with ras el hanout, miel de thym, miel d'oranger and a salt from the Atlas.",
      },
      fr: {
        name: "Essences Anciennes",
        tagline: "Les haltes d'épices du Maghreb",
        storyIntro:
          "Placeholder. L'admin va remplir avec ras el hanout, miel de thym, miel d'oranger et un sel de l'Atlas.",
      },
    },
  },
];

export function getGiftBox(slug: string): GiftBox | undefined {
  return GIFT_BOXES.find((b) => b.slug === slug);
}

export function giftBoxesByCategory(categorySlug: CategorySlug): GiftBox[] {
  return GIFT_BOXES.filter((b) => b.categorySlug === categorySlug).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}
