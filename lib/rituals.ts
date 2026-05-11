export type RitualId = "hammam" | "botanical" | "heritage";

export interface World {
  id: RitualId;
  eyebrow: { en: string; fr: string };
  name: { en: string; fr: string };
  tagline: { en: string; fr: string };
  lede: { en: string; fr: string };
  hero: string | null;
}

export const WORLDS: World[] = [
  {
    id: "hammam",
    eyebrow: { en: "Purification", fr: "Purification" },
    name: { en: "The Hammam Ritual", fr: "Le Rituel du Hammam" },
    tagline: { en: "Purification, the cornerstone ritual", fr: "Purification, le rituel fondateur" },
    lede: {
      en: "Black soap, kessa glove and ghassoul clay; the steam, stone and slow heat of the Moroccan hammam, prepared as a corporate ritual.",
      fr: "Savon noir, gant kessa et argile ghassoul; la vapeur, la pierre et la chaleur lente du hammam marocain, préparées en rituel corporate.",
    },
    hero: null, // needs shot — Atlas / hammam steam
  },
  {
    id: "botanical",
    eyebrow: { en: "Vitality", fr: "Vitalité" },
    name: { en: "Botanical Care", fr: "Soins Botaniques" },
    tagline: { en: "Vitality from the High Atlas", fr: "Vitalité du Haut Atlas" },
    lede: {
      en: "Argan, prickly-pear, neroli and damask rose; single-origin botanicals, cold-pressed and bottled in dark amber glass.",
      fr: "Argan, figue de barbarie, néroli, rose de Damas; botaniques d'origine unique, pressés à froid en flacons d'ambre.",
    },
    hero: "/brand_photos/argan-oil-dropper.jpg",
  },
  {
    id: "heritage",
    eyebrow: { en: "Grounding", fr: "Ancrage" },
    name: { en: "Heritage Gifts", fr: "Cadeaux Héritage" },
    tagline: { en: "Grounding in the artisan's hand", fr: "Ancrage par la main de l'artisan" },
    lede: {
      en: "Berber-woven pouches, hand-loomed throws and engraved cedar boxes; the textile, weave and carpentry of the Kingdom.",
      fr: "Pochettes berbères tissées, plaids tissés main et coffrets en cèdre gravé; le textile, le tissage et la menuiserie du Royaume.",
    },
    hero: "/brand_photos/gift-box-open.jpg",
  },
];

export interface SubCat {
  id: string;
  name: { en: string; fr: string };
}

export const SUBCATS: Record<RitualId, SubCat[]> = {
  hammam: [
    { id: "soaps",  name: { en: "Soaps & Cleansers", fr: "Savons & Nettoyants" } },
    { id: "scrubs", name: { en: "Scrubs & Gloves",   fr: "Gommages & Gants" } },
    { id: "clays",  name: { en: "Clays & Masks",     fr: "Argiles & Masques" } },
    { id: "waters", name: { en: "Floral Waters",     fr: "Eaux Florales" } },
    { id: "sets",   name: { en: "Hammam Sets",       fr: "Coffrets Hammam" } },
  ],
  botanical: [
    { id: "face",   name: { en: "Face & Neck",       fr: "Visage & Cou" } },
    { id: "body",   name: { en: "Body Nourishment",  fr: "Soins Corps" } },
    { id: "hair",   name: { en: "Hair & Scalp",      fr: "Cheveux & Cuir Chevelu" } },
    { id: "oils",   name: { en: "Pure Oils",         fr: "Huiles Pures" } },
    { id: "serums", name: { en: "Serums",            fr: "Sérums" } },
  ],
  heritage: [
    { id: "pouches", name: { en: "Pouches & Bags",   fr: "Pochettes & Sacs" } },
    { id: "throws",  name: { en: "Throws & Cushions",fr: "Plaids & Coussins" } },
    { id: "table",   name: { en: "Table & Linen",    fr: "Table & Linge" } },
    { id: "wood",    name: { en: "Wood & Ceramic",   fr: "Bois & Céramique" } },
    { id: "boxes",   name: { en: "Engraved Boxes",   fr: "Coffrets Gravés" } },
  ],
};

export const FACETS = {
  ingredient: [
    "Pure Argan",
    "Prickly Pear",
    "Neroli Blossom",
    "Atlas Cedar",
    "Damask Rose",
    "Saffron",
    "Black Soap",
    "Olive",
    "Oud",
    "Honey",
    "Castor",
    "Black Seed",
  ],
  use: ["Hydrating", "Exfoliating", "Anti-age", "Purifying", "Soothing", "Energising"],
  format: ["30 ml", "50 ml", "100 ml", "200 ml", "Pot 100 g", "Pot 200 g", "Box", "Set"],
  packaging: ["Amber glass", "Porcelain", "Cedar", "Berber weave", "Recycled card"],
  certif: ["BIO certified", "Fair trade", "Cruelty free", "Vegan"],
} as const;
