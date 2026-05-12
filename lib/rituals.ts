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
      en: "Beldi black soap, scrubs and ghassoul clay. The steam, stone and slow heat of the Moroccan hammam.",
      fr: "Savon beldi, gommages et argile ghassoul. La vapeur, la pierre et la chaleur lente du hammam marocain.",
    },
    hero: "/brand_photos/sugar-scrub-hammam.jpg",
  },
  {
    id: "botanical",
    eyebrow: { en: "Vitality", fr: "Vitalité" },
    name: { en: "Botanical Care", fr: "Soins Botaniques" },
    tagline: { en: "Single-origin oils, serums and hydrosols", fr: "Huiles, sérums et hydrolats d'origine unique" },
    lede: {
      en: "Argan, prickly pear, neroli, damask rose, S'ad, nigella. Cold-pressed botanicals, concentrated serums, steam-distilled hydrosols and fragrance massage oils.",
      fr: "Argan, figue de barbarie, néroli, rose de Damas, S'ad, nigelle. Botaniques pressés à froid, sérums concentrés, hydrolats distillés à la vapeur et huiles de massage parfumées.",
    },
    hero: "/brand_photos/argan-oil-dropper.jpg",
  },
  {
    id: "heritage",
    eyebrow: { en: "Curation", fr: "Curation" },
    name: { en: "Heritage Packs", fr: "Packs Héritage" },
    tagline: { en: "Curated B2B packs from the maison", fr: "Packs B2B curatés de la maison" },
    lede: {
      en: "Three themed packs that compose the ritual from cleanse to nourish, built from the maison's six gammes.",
      fr: "Trois packs thématiques qui composent le rituel du nettoyage au soin, construits à partir des six gammes de la maison.",
    },
    hero: "/brand_photos/gift-box-open.jpg",
  },
];

export interface SubCat {
  id: string;
  name: { en: string; fr: string };
}

// Subcategories aligned with the client's 6 gammes from the B2B catalogue.
// Mapped onto the existing 3-ritual schema (Sprint 1.5 design decision).
// Hammam: Rituel Hammam scrubs + masks + Savons Noirs Beldi
// Botanical: Huiles Pures + Sérums + Hydrolats + Huiles de Massage
// Heritage: 3 curated B2B Packs
export const SUBCATS: Record<RitualId, SubCat[]> = {
  hammam: [
    { id: "scrubs", name: { en: "Scrubs",        fr: "Gommages" } },
    { id: "masks",  name: { en: "Masks",         fr: "Masques" } },
    { id: "soaps",  name: { en: "Beldi Soaps",   fr: "Savons Beldi" } },
  ],
  botanical: [
    { id: "oils",      name: { en: "Pure Oils",      fr: "Huiles Pures" } },
    { id: "serums",    name: { en: "Concentrated Serums", fr: "Sérums Concentrés" } },
    { id: "hydrolats", name: { en: "Hydrosols",      fr: "Hydrolats" } },
    { id: "massage",   name: { en: "Massage Oils",   fr: "Huiles de Massage" } },
  ],
  heritage: [
    { id: "packs", name: { en: "Curated Packs", fr: "Packs Curatés" } },
  ],
};

export const FACETS = {
  ingredient: [
    "Pure Argan",
    "Prickly Pear",
    "S'ad (Chufa)",
    "Castor",
    "Damask Rose",
    "Black Seed",
    "Ghassoul",
    "Nila (Indigo)",
    "Aker Fassi",
    "Sidr",
    "Henna",
    "Atlas Lavender",
    "Neroli",
    "Rosemary",
    "Orange Blossom",
    "Oud",
    "White Musk",
    "Jasmine",
    "Cinnamon",
    "Beldi Olive",
    "Honey",
  ],
  use: [
    "Hydrating",
    "Exfoliating",
    "Anti-age",
    "Purifying",
    "Soothing",
    "Energising",
    "Fortifying",
    "Massage",
  ],
  format: ["30 ml", "50 ml", "100 ml", "200 ml", "Pot 100 g", "Pot 200 g", "Pot 250 g", "Bar 100 g"],
  packaging: ["Amber glass", "Glass jar", "Ceramic jar", "Cedar box", "Recycled card"],
  certif: ["100% Natural", "Zero additive", "Cold-pressed", "Cooperative-made", "Made in Morocco"],
} as const;
