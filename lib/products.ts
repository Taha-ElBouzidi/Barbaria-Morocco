import type { RitualId } from "./rituals";

export interface Product {
  id: string;
  world: RitualId;
  sub: string;
  name: { en: string; fr: string };
  short: { en: string; fr: string };
  lede?: { en: string; fr: string };
  hero?: boolean;
  tags: string[];
  moq: number;
  formats: string[];
  lead: string;
  origin?: string;
  ritual?: string;
  images: string[];
  application?: Array<{ en: [string, string]; fr: [string, string] }>;
  proof?: string[];
  related?: string[];
}

// ── BOTANICAL CARE — 9 products migrated from current site ─────────────────

export const PRODUCTS: Product[] = [
  {
    id: "huile-argan",
    world: "botanical",
    sub: "oils",
    name: { en: "Pure Argan Oil", fr: "Huile d'Argan Pure" },
    short: { en: "Liquid gold from Morocco.", fr: "L'or liquide du Maroc." },
    lede: {
      en: "Morocco's finest oil, cold-pressed by first mechanical press with no solvents. Golden, light, non-greasy. Rich in vitamin E and omega 6-9.",
      fr: "La plus grande huile marocaine, extraite à froid par première pression mécanique, sans solvant. Dorée, légère, non grasse. Riche en vitamine E et oméga 6-9.",
    },
    hero: true,
    tags: ["Pure Argan", "Hydrating", "Amber glass", "BIO certified"],
    moq: 50,
    formats: ["30 ml", "50 ml", "100 ml"],
    lead: "4 weeks",
    origin: "Taliouine Region",
    images: ["/brand_photos/argan-oil-dropper.jpg", "/brand_photos/brand-lifestyle-1.jpg"],
  },
  {
    id: "huile-figue",
    world: "botanical",
    sub: "face",
    name: { en: "Prickly Pear Seed Oil", fr: "Huile de Figue de Barbarie" },
    short: {
      en: "Ultra rare: 1 ton of fruit per liter.",
      fr: "Ultra rare: 1 tonne de fruits par litre.",
    },
    lede: {
      en: "The world's richest plant-based source of vitamin E. 1 ton of prickly pears for 1 liter of oil, cold mechanical extraction. Deep cellular regeneration and intense anti-wrinkle action.",
      fr: "L'huile la plus riche en vitamine E du monde végétal. 1 tonne de figues pour 1 litre d'huile, extraction mécanique à froid. Régénération cellulaire profonde, anti-rides intense.",
    },
    tags: ["Prickly Pear", "Anti-age", "Amber glass", "BIO certified"],
    moq: 40,
    formats: ["30 ml", "50 ml"],
    lead: "5 weeks",
    origin: "Souss-Massa",
    images: ["/brand_photos/brand-lifestyle-2.jpg"],
  },
  {
    id: "huile-saad",
    world: "botanical",
    sub: "body",
    name: { en: "S'ad Oil (Chufa)", fr: "Huile de S'ad (Souchet)" },
    short: { en: "Ancestral feminine tradition.", fr: "Tradition féminine ancestrale." },
    lede: {
      en: "Chufa seed oil with a unique earthy-sweet natural fragrance. Used by Moroccan women as a body perfume and hair treatment for centuries. Gentle on sensitive skin.",
      fr: "Huile de souchet odorant au parfum naturel terreux et doux unique. Utilisée par les femmes marocaines comme parfum corps et soin capillaire depuis des siècles. Douce pour peaux sensibles.",
    },
    tags: ["Soothing", "Amber glass"],
    moq: 40,
    formats: ["30 ml", "50 ml"],
    lead: "5 weeks",
    images: ["/brand_photos/brand-lifestyle-3.jpg"],
  },
  {
    id: "huile-ricin",
    world: "botanical",
    sub: "hair",
    name: { en: "Pure Castor Oil", fr: "Huile de Ricin Pure" },
    short: { en: "Multi-use, cold-pressed.", fr: "Multi-usage, pressé à froid." },
    lede: {
      en: "Cold-pressed, thick and nourishing. Stimulates hair growth, strengthens eyebrows and lashes, deeply moisturizes dry areas. 100% pure with no additives or preservatives.",
      fr: "Pressée à froid, épaisse et nourrissante. Stimule la pousse des cheveux, renforce sourcils et cils, hydrate intensément les zones sèches. 100% pure sans additif ni conservateur.",
    },
    tags: ["Castor", "Hydrating", "Amber glass"],
    moq: 40,
    formats: ["50 ml", "100 ml"],
    lead: "3 weeks",
    images: ["/brand_photos/brand-lifestyle-4.jpg"],
  },
  {
    id: "huile-rose",
    world: "botanical",
    sub: "face",
    name: { en: "Pure Rose Oil", fr: "Huile de Rose Pure" },
    short: { en: "Luxury, Dades Valley.", fr: "Luxe, Vallée du Dadès." },
    lede: {
      en: "Rosa Damascena essential oil from the Dades Valley. A few drops are enough. One of the most precious oils in the world: powerful anti-wrinkle, regenerating, with an exceptional floral fragrance.",
      fr: "Huile essentielle de Rosa Damascena de la vallée du Dadès. Quelques gouttes suffisent. L'une des plus chères au monde, anti-rides puissante, régénérante, au parfum floral exceptionnel.",
    },
    tags: ["Damask Rose", "Anti-age", "Amber glass", "BIO certified"],
    moq: 30,
    formats: ["30 ml"],
    lead: "5 weeks",
    origin: "Dades Valley",
    images: ["/brand_photos/brand-lifestyle-5.jpg"],
  },
  {
    id: "huile-nigelle",
    world: "botanical",
    sub: "hair",
    name: { en: "Pure Black Seed Oil", fr: "Huile de Nigelle Pure" },
    short: { en: "The blessed seed (Habba Sawda).", fr: "La graine bénie (Habba Sawda)." },
    lede: {
      en: "Cold-pressed, a powerful natural anti-inflammatory. Very high demand in the Arab world for its virtues. Anti-hair loss, purifies the scalp, treats problematic skin.",
      fr: "Pressée à froid, anti-inflammatoire naturelle puissante. Très forte demande dans le monde arabe pour ses vertus. Anti-chute, purifie le cuir chevelu, soin peau problématique.",
    },
    tags: ["Black Seed", "Purifying", "Amber glass"],
    moq: 50,
    formats: ["30 ml", "50 ml", "100 ml"],
    lead: "3 weeks",
    images: [],
  },
  {
    id: "serum-anti-age",
    world: "botanical",
    sub: "serums",
    name: { en: "Royal Anti-Age Serum", fr: "Sérum Royal Anti-Âge" },
    short: {
      en: "Morocco's most powerful trio.",
      fr: "Le trio le plus puissant du Maroc.",
    },
    lede: {
      en: "Prickly Pear regenerates cells, Argan deeply nourishes, Rose illuminates and plumps. Intense anti-wrinkle, visible results in 4 weeks. The best-seller of the range.",
      fr: "Figue de Barbarie régénère les cellules, Argan nourrit en profondeur, Rose illumine et repulpe. Anti-rides intense, résultat visible en 4 semaines. Le best-seller de la gamme.",
    },
    tags: ["Pure Argan", "Prickly Pear", "Damask Rose", "Anti-age", "Amber glass"],
    moq: 30,
    formats: ["30 ml"],
    lead: "5 weeks",
    images: [],
  },
  {
    id: "serum-eclat",
    world: "botanical",
    sub: "serums",
    name: { en: "Radiance & Even Skin Serum", fr: "Sérum Éclat & Teint Unifié" },
    short: {
      en: "Natural golden effect on skin.",
      fr: "Effet doré naturel sur la peau.",
    },
    lede: {
      en: "Argan + Prickly Pear + S'ad oil. S'ad brings a natural golden note to the skin. Illuminates the complexion, evens skin tone, reduces dark spots.",
      fr: "Argan + Figue de Barbarie + S'ad. L'huile de S'ad apporte une note dorée naturelle à la peau. Illumine le teint, unifie la carnation, réduit les taches.",
    },
    tags: ["Pure Argan", "Prickly Pear", "Hydrating", "Amber glass"],
    moq: 30,
    formats: ["30 ml"],
    lead: "5 weeks",
    images: [],
  },
  {
    id: "serum-cheveux",
    world: "botanical",
    sub: "hair",
    name: { en: "Strengthening Hair Serum", fr: "Sérum Capillaire Fortifiant" },
    short: {
      en: "Anti-hair loss, complete formula.",
      fr: "Anti-chute, formule complète.",
    },
    lede: {
      en: "Castor (growth & thickness) + Black Seed (anti-loss, scalp) + Argan (shine). The most complete natural hair formula. Stimulates growth, nourishes the scalp.",
      fr: "Ricin (pousse et épaisseur) + Nigelle (anti-chute, cuir chevelu) + Argan (brillance). La formule capillaire naturelle la plus complète. Stimule la pousse, nourrit le cuir chevelu.",
    },
    tags: ["Castor", "Black Seed", "Pure Argan", "Hydrating", "Amber glass"],
    moq: 30,
    formats: ["30 ml", "50 ml"],
    lead: "4 weeks",
    images: [],
  },

  // ── HAMMAM RITUAL — 5 products introduced from prototype ───────────────────

  {
    id: "beldi-soap",
    world: "hammam",
    sub: "soaps",
    name: { en: "Beldi Black Soap", fr: "Savon Noir Beldi" },
    short: {
      en: "The essence of the traditional hammam.",
      fr: "L'essence du hammam traditionnel.",
    },
    lede: {
      en: "Cold-pressed olive paste, ladled into porcelain pots. The foundation of the hammam ritual: softens the skin before kessa exfoliation.",
      fr: "Pâte d'olive pressée à froid, déposée à la louche dans des pots en porcelaine. Le fondement du rituel hammam: assouplit la peau avant l'exfoliation au kessa.",
    },
    hero: true,
    tags: ["Black Soap", "Olive", "Purifying", "Porcelain"],
    moq: 80,
    formats: ["Pot 100 g", "Pot 200 g"],
    lead: "2 weeks",
    origin: "Meknès",
    ritual: "The Hammam",
    images: [
      "/brand_photos/savon-noir-2.jpg",
      "/brand_photos/savon-noir-3.jpg",
      "/brand_photos/savon-noir-4.jpg",
    ],
    proof: ["100% Beldi tradition", "Cold-pressed olive paste", "Porcelain pot, no plastic"],
  },
  {
    id: "ghassoul-clay",
    world: "hammam",
    sub: "clays",
    name: { en: "Ghassoul Atlas Clay", fr: "Argile Ghassoul d'Atlas" },
    short: {
      en: "Mineral-rich clay from the Moulouya valley.",
      fr: "Argile minérale de la vallée du Moulouya.",
    },
    lede: {
      en: "Volcanic clay washed by the Moulouya river. Draws impurities from the skin and hair without surfactants.",
      fr: "Argile volcanique lavée par le fleuve Moulouya. Capte les impuretés de la peau et des cheveux sans tensioactifs.",
    },
    tags: ["Ghassoul", "Purifying", "Recycled card"],
    moq: 120,
    formats: ["Pot 200 g"],
    lead: "2 weeks",
    origin: "Moulouya valley",
    ritual: "The Hammam",
    images: [],
  },
  {
    id: "kessa-glove",
    world: "hammam",
    sub: "scrubs",
    name: { en: "Kessa Hammam Glove", fr: "Gant Kessa du Hammam" },
    short: {
      en: "Traditional viscose exfoliating glove.",
      fr: "Gant exfoliant traditionnel en viscose.",
    },
    lede: {
      en: "The signature glove of the hammam. Strips away dead skin in long, slow strokes. Sold in pairs.",
      fr: "Le gant signature du hammam. Élimine les peaux mortes en gestes longs et lents. Vendu par paire.",
    },
    tags: ["Exfoliating", "Berber weave"],
    moq: 200,
    formats: ["Set"],
    lead: "2 weeks",
    ritual: "The Hammam",
    images: [],
  },
  {
    id: "sugar-scrub",
    world: "hammam",
    sub: "scrubs",
    name: { en: "Ancestral Sugar Scrub", fr: "Gommage Ancestral au Sucre" },
    short: {
      en: "Brown-sugar body scrub with prickly-pear oil.",
      fr: "Gommage corps au sucre brun et huile de figue de barbarie.",
    },
    lede: {
      en: "Granulated brown sugar suspended in prickly-pear oil. Exfoliates and nourishes simultaneously, for use after the kessa.",
      fr: "Sucre brun granulé en suspension dans l'huile de figue de barbarie. Exfolie et nourrit simultanément, à utiliser après le kessa.",
    },
    tags: ["Prickly Pear", "Exfoliating", "Porcelain"],
    moq: 60,
    formats: ["Pot 200 g"],
    lead: "3 weeks",
    ritual: "The Hammam",
    images: [
      "/brand_photos/sugar-scrub-hammam.jpg",
      "/brand_photos/sugar-scrub-stacked.jpg",
      "/brand_photos/sugar-scrub-ingredients.jpg",
    ],
  },
  {
    id: "rose-water",
    world: "hammam",
    sub: "waters",
    name: { en: "Rose Floral Water", fr: "Eau Florale de Rose" },
    short: {
      en: "Single-distilled rose water from Kelaat M'Gouna.",
      fr: "Eau de rose simple distillation, Kelaat M'Gouna.",
    },
    lede: {
      en: "Hand-harvested Damask roses, distilled once at dawn. Tones the skin after cleansing.",
      fr: "Roses de Damas récoltées à la main, distillées à l'aube. Tonifie la peau après nettoyage.",
    },
    tags: ["Damask Rose", "Soothing", "Amber glass", "BIO certified"],
    moq: 80,
    formats: ["100 ml", "200 ml"],
    lead: "3 weeks",
    origin: "Kelaat M'Gouna",
    ritual: "The Hammam",
    images: [],
  },

  // ── HERITAGE GIFTS — 3 products introduced from prototype ──────────────────

  {
    id: "berber-pouch",
    world: "heritage",
    sub: "pouches",
    name: { en: "Berber Weave Pouch", fr: "Pochette en Tissage Berbère" },
    short: {
      en: "Hand-woven from the boucherouite carpet tradition.",
      fr: "Tissée main, dans la tradition du boucherouite.",
    },
    lede: {
      en: "Loomed by the Middle Atlas weavers from undyed wool and rag-weft. Each pouch is unique.",
      fr: "Tissée par les artisanes du Moyen Atlas à partir de laine écrue et chiffons. Chaque pochette est unique.",
    },
    hero: true,
    tags: ["Berber weave"],
    moq: 30,
    formats: ["Set"],
    lead: "5 weeks",
    origin: "Middle Atlas",
    ritual: "The Argan",
    images: [],
  },
  {
    id: "cedar-box",
    world: "heritage",
    sub: "boxes",
    name: { en: "Engraved Cedar Box", fr: "Coffret Cèdre Gravé" },
    short: {
      en: "Architectural cedar gifting box, foil-stamped.",
      fr: "Coffret en cèdre, gravure architecturale.",
    },
    lede: {
      en: "Carved from three-year-aged Atlas cedar. The lid is foil-stamped with a custom Barbaria seal.",
      fr: "Taillé dans le cèdre de l'Atlas séché trois ans. Le couvercle porte le sceau Barbaria gaufré or.",
    },
    tags: ["Cedar"],
    moq: 50,
    formats: ["Box"],
    lead: "5 weeks",
    origin: "Meknès Cedar Workshop",
    ritual: "The Oud",
    images: [
      "/brand_photos/gift-box-open.jpg",
      "/brand_photos/gift-box-flat.jpg",
      "/brand_photos/gift-boxes-overhead.jpg",
    ],
  },
  {
    id: "hammam-gift-set",
    world: "hammam",
    sub: "sets",
    name: { en: "Hammam Gift Set", fr: "Coffret Hammam" },
    short: {
      en: "A curated trio for the corporate hammam ritual.",
      fr: "Un trio sélectionné pour le rituel hammam corporate.",
    },
    lede: {
      en: "Beldi Black Soap, Kessa Glove and Ghassoul Clay, presented in a cedar box with a hand-pressed olive-paper card.",
      fr: "Savon Noir Beldi, Gant Kessa et Argile Ghassoul, présentés dans un coffret en cèdre avec carte en papier d'olivier.",
    },
    tags: ["Black Soap", "Cedar", "Recycled card"],
    moq: 25,
    formats: ["Box", "Set"],
    lead: "5 weeks",
    origin: "Composed at the atelier",
    ritual: "The Hammam",
    images: [
      "/brand_photos/packaging-1.jpg",
      "/brand_photos/packaging-2.jpg",
      "/brand_photos/packaging-3.jpg",
      "/brand_photos/packaging-4.jpg",
      "/brand_photos/packaging-5.jpg",
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

export const getProduct = (id: string): Product | undefined =>
  PRODUCTS.find((p) => p.id === id);

export const getHeroImage = (p: Product): string | null => p.images[0] ?? null;

export const productsByWorld = (world: RitualId): Product[] =>
  PRODUCTS.filter((p) => p.world === world);

export const productsBySub = (world: RitualId, sub: string): Product[] =>
  PRODUCTS.filter((p) => p.world === world && p.sub === sub);

export const heroProductsByWorld = (world: RitualId): Product[] =>
  PRODUCTS.filter((p) => p.world === world && p.hero);
