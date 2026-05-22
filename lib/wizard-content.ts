// Compose-your-box wizard content.
//
// Sprint 2.9 follow-up: per-step subcategory filters were removed. The
// buyer now sees every piece the house has assigned to the box (or
// every published piece in the category as a fallback) at every step.
// Step copy stays for the storytelling arc, Amazigh narrative wrapping
// the act of composing, but no longer constrains the selectable pool.

import type { StoryThemeKey } from "./data/types";

export type BoxSize = 1 | 2 | 3 | 4 | 5 | 6;

export interface WizardStep {
  eyebrow: { en: string; fr: string };
  /** Short headline above the step. */
  title: { en: string; fr: string };
  /** One-paragraph story fragment, italic display. */
  story: { en: string; fr: string };
}

/**
 * Step library per theme. We keep 6 steps; the active subset depends on
 * the chosen box size:
 *   - 3 items: steps 0, 1, 3
 *   - 5 items: steps 0..4
 *   - 6 items: steps 0..5
 */
const WIZARD_STEPS: Record<StoryThemeKey, WizardStep[]> = {
  sahara_stars: [
    {
      eyebrow: { en: "Star 01,Steam", fr: "Étoile 01,Vapeur" },
      title: {
        en: "The hammam begins with steam.",
        fr: "Le hammam commence par la vapeur.",
      },
      story: {
        en: "A warm haze that opens the doors of the body. Choose the stone, the scrub or the soap that opens the ritual.",
        fr: "Une brume chaude qui ouvre les portes du corps. Choisissez la pierre, le gommage ou le savon qui ouvre le rituel.",
      },
    },
    {
      eyebrow: { en: "Star 02,The Oil", fr: "Étoile 02,L'Huile" },
      title: {
        en: "Beneath the Souss moon, the first drop of gold.",
        fr: "Sous la lune du Souss, la première goutte d'or.",
      },
      story: {
        en: "Cold-pressed botanicals carrying the soul of the terroir. Choose the oil that feeds the skin through the night.",
        fr: "Botaniques pressés à froid, l'âme du terroir. Choisissez l'huile qui nourrit la peau pour la nuit.",
      },
    },
    {
      eyebrow: { en: "Star 03,The Serum", fr: "Étoile 03,Le Sérum" },
      title: {
        en: "When the desert concentrates, it becomes serum.",
        fr: "Quand le désert se concentre, il devient sérum.",
      },
      story: {
        en: "A few drops, an intention. Targeted formulas for the face, the eyes, the hair, the lashes.",
        fr: "Quelques gouttes, une intention. Formules ciblées visage, yeux, cheveux, cils.",
      },
    },
    {
      eyebrow: { en: "Star 04,The Floral", fr: "Étoile 04,L'Eau Florale" },
      title: {
        en: "At dawn, the Dades rose wakes with the first ray.",
        fr: "Au matin, la rose du Dadès s'éveille avec le premier rayon.",
      },
      story: {
        en: "The water that tones and soothes. Rose, orange blossom, lavender, rosemary, neroli.",
        fr: "L'eau qui tonifie et apaise. Rose, fleur d'oranger, lavande, romarin, néroli.",
      },
    },
    {
      eyebrow: { en: "Star 05,The Gesture", fr: "Étoile 05,Le Geste" },
      title: {
        en: "The gesture that seals.",
        fr: "Le geste qui scelle.",
      },
      story: {
        en: "Argan and oud, jasmine and rose, cinnamon and white musk: fragrance carried by the skin.",
        fr: "Argan et oud, jasmin et rose, cannelle et musc blanc : le parfum porté par la peau.",
      },
    },
    {
      eyebrow: { en: "Star 06,The Free Star", fr: "Étoile 06,L'Étoile Libre" },
      title: {
        en: "A final star. Free to you.",
        fr: "Une étoile finale. Libre à vous.",
      },
      story: {
        en: "Add a piece that speaks to your house. Anything from the cosmetics atelier.",
        fr: "Ajoutez une pièce qui parle à votre maison. N'importe quoi de l'atelier cosmétique.",
      },
    },
  ],
  caravan_route: [
    {
      eyebrow: { en: "Halt 01,Sijilmassa", fr: "Halte 01,Sijilmassa" },
      title: {
        en: "Sijilmassa, the city of gold on the Ziz.",
        fr: "Sijilmassa, la ville d'or sur le Ziz.",
      },
      story: {
        en: "First halt of the caravan. Load your first flask of oil, drawn from the Souss arganeraies.",
        fr: "Première halte de la caravane. Chargez votre premier flacon d'huile, tiré des arganeraies du Souss.",
      },
    },
    {
      eyebrow: { en: "Halt 02,Taliouine", fr: "Halte 02,Taliouine" },
      title: {
        en: "Taliouine, the saffron valley.",
        fr: "Taliouine, la vallée du safran.",
      },
      story: {
        en: "Plucked by hand at dawn, dried by lamplight at dusk. The red gold of Morocco joins your caravan.",
        fr: "Cueilli à la pince à l'aube, séché à la lampe au crépuscule. L'or rouge du Maroc rejoint votre caravane.",
      },
    },
    {
      eyebrow: { en: "Halt 03,Marrakech", fr: "Halte 03,Marrakech" },
      title: {
        en: "Marrakech, the crossroads of taste.",
        fr: "Marrakech, le carrefour des saveurs.",
      },
      story: {
        en: "Ras el hanout, cinnamon, cardamom, cumin: pick the spice that signs your composition.",
        fr: "Ras el hanout, cannelle, cardamome, cumin : choisissez l'épice qui signe votre composition.",
      },
    },
    {
      eyebrow: { en: "Halt 04,Fès", fr: "Halte 04,Fès" },
      title: {
        en: "Fès, where the beehives sleep beneath the cedars.",
        fr: "Fès, où les ruches dorment sous les cèdres.",
      },
      story: {
        en: "Orange blossom honey, thyme honey, jujube honey. The slow gold of Morocco's gardens.",
        fr: "Miel de fleur d'oranger, de thym, de jujubier. L'or lent des jardins du Maroc.",
      },
    },
    {
      eyebrow: { en: "Halt 05,The Atlas", fr: "Halte 05,L'Atlas" },
      title: {
        en: "The Atlas, where the salt rests.",
        fr: "L'Atlas, où le sel repose.",
      },
      story: {
        en: "Pink rock salt from the mountain springs. The mineral that finishes the table.",
        fr: "Sel rose des sources de montagne. Le minéral qui termine la table.",
      },
    },
    {
      eyebrow: { en: "Halt 06,The Return", fr: "Halte 06,Le Retour" },
      title: {
        en: "The return to Marrakech.",
        fr: "Le retour à Marrakech.",
      },
      story: {
        en: "One final piece, chosen for the moment your guest opens the box.",
        fr: "Une pièce finale, choisie pour le moment où votre invité ouvre le coffret.",
      },
    },
  ],
};

/**
 * Resolve the active step list for a given size + theme.
 * 3-item box now uses the first three step narratives consecutively (was
 * skipping serums); 5- and 6-item include more depth. The buyer's product
 * pool is identical across all sizes; only the step count and story arc
 * differ.
 */
export function stepsForSize(themeKey: StoryThemeKey, size: BoxSize): WizardStep[] {
  const all = WIZARD_STEPS[themeKey];
  return all.slice(0, size);
}
