export interface Atelier {
  id: string;
  name: string;
  region: string;
  since: number;
  image: string | null;
  description: { en: string; fr: string };
}

export const ATELIERS: Atelier[] = [
  {
    id: "taliouine",
    name: "Taliouine Cooperative",
    region: "Souss-Massa",
    since: 1998,
    image: null,
    description: {
      en: "Argan harvest and cold-press, 60 women, fair-trade certified.",
      fr: "Récolte d'argan et pression à froid, 60 femmes, certifié commerce équitable.",
    },
  },
  {
    id: "kelaat-mgouna",
    name: "Kelaat M'Gouna",
    region: "Dadès Valley",
    since: 2003,
    image: null,
    description: {
      en: "Damask rose distillery, hand-harvested at dawn during the May rose festival.",
      fr: "Distillerie de rose de Damas, récolte à l'aube pendant la fête des roses en mai.",
    },
  },
  {
    id: "tamegroute",
    name: "Tamegroute Ceramics",
    region: "Saharan oasis",
    since: 2010,
    image: null,
    description: {
      en: "Eight families of master ceramists working with green-glazed Saharan clay.",
      fr: "Huit familles de maîtres céramistes travaillant l'argile saharienne au glaçage vert.",
    },
  },
  {
    id: "meknes",
    name: "Meknès Cedar Workshop",
    region: "Middle Atlas",
    since: 2007,
    image: null,
    description: {
      en: "Engraved cedar boxes, the wood seasoned three years before being cut.",
      fr: "Coffrets en cèdre gravé, le bois séché trois ans avant d'être travaillé.",
    },
  },
  {
    id: "middle-atlas-weavers",
    name: "Middle Atlas Weavers",
    region: "Azilal",
    since: 2012,
    image: null,
    description: {
      en: "Boucherouite carpet tradition, undyed Atlas wool, hand-loomed.",
      fr: "Tradition du tapis boucherouite, laine d'Atlas écrue, tissée main.",
    },
  },
  {
    id: "moulouya",
    name: "Moulouya Clay Co-op",
    region: "Eastern Morocco",
    since: 2015,
    image: null,
    description: {
      en: "Ghassoul clay mining and sun-drying, mineral-rich from the Moulouya valley.",
      fr: "Extraction d'argile ghassoul et séchage au soleil, riche en minéraux de la vallée du Moulouya.",
    },
  },
];

export interface JournalCard {
  id: string;
  kicker: { en: string; fr: string };
  headline: { en: string; fr: string };
  date: string; // ISO
  image: string | null;
  feature?: boolean;
}

export const JOURNAL: JournalCard[] = [
  {
    id: "argan-dispatch",
    kicker: { en: "Field Notes", fr: "Notes de Terrain" },
    headline: { en: "A morning with the women of Taliouine", fr: "Un matin avec les femmes de Taliouine" },
    date: "2026-04-20",
    image: "/brand_photos/brand-lifestyle-2.jpg",
    feature: true,
  },
  {
    id: "ghassoul-portrait",
    kicker: { en: "Portrait", fr: "Portrait" },
    headline: { en: "The Moulouya clay-pickers", fr: "Les ramasseurs d'argile du Moulouya" },
    date: "2026-03-05",
    image: null,
  },
  {
    id: "ritual-rose",
    kicker: { en: "Ritual", fr: "Rituel" },
    headline: { en: "The rose harvest, before the day breaks", fr: "La récolte des roses avant l'aube" },
    date: "2026-02-14",
    image: null,
  },
  {
    id: "cedar-dispatch",
    kicker: { en: "Dispatch", fr: "Dépêche" },
    headline: {
      en: "Why cedar takes three years before it can be carved",
      fr: "Pourquoi le cèdre attend trois ans avant d'être sculpté",
    },
    date: "2026-01-22",
    image: null,
  },
  {
    id: "atlas-weavers",
    kicker: { en: "Field Notes", fr: "Notes de Terrain" },
    headline: { en: "A loom in the Azilal foothills", fr: "Un métier à tisser dans les piémonts d'Azilal" },
    date: "2025-12-08",
    image: null,
  },
  {
    id: "saffron-dispatch",
    kicker: { en: "Dispatch", fr: "Dépêche" },
    headline: {
      en: "Saffron season in Taliouine: 200 flowers for one gram",
      fr: "La saison du safran à Taliouine: 200 fleurs pour un gramme",
    },
    date: "2025-11-15",
    image: null,
  },
];

export const formatJournalDate = (iso: string, locale: "en" | "fr"): string => {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
};
