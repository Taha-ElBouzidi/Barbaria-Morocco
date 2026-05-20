/**
 * Single source of truth for company-identification values referenced
 * across /legal/* pages. Edit a field here and every page (mentions
 * légales, privacy, terms, cookies) picks up the change in both FR
 * and EN.
 */

type Bilingual = { fr: string; en: string };

/** A value that is the same in both locales (proper names, numbers). */
function value(text: string): Bilingual {
  return { fr: text, en: text };
}

/** A value that differs between FR and EN (city names with accents, etc.). */
function bilingual(fr: string, en: string): Bilingual {
  return { fr, en };
}

export const CLIENT_DATA = {
  // ─── Company identity ────────────────────────────────────────────
  legalName: value("Barbaria Morocco"),
  companyForm: value("SARL"),
  capital: value("100 000 MAD"),
  fullAddress: bilingual(
    "Rue Soumaya, Immeuble 82, 2ème étage N°04, Quartier Palmier, Casablanca, Maroc",
    "Rue Soumaya, Immeuble 82, 2ème étage N°04, Quartier Palmier, Casablanca, Morocco"
  ),
  postalAddress: bilingual(
    "Rue Soumaya, Immeuble 82, 2ème étage N°04, Quartier Palmier, Casablanca, Maroc",
    "Rue Soumaya, Immeuble 82, 2ème étage N°04, Quartier Palmier, Casablanca, Morocco"
  ),
  directorName: value("Inass MOUSSADEK"),

  // ─── Identifiants officiels ──────────────────────────────────────
  rcNumber: value("RC Casablanca n° 719643"),
  iceNumber: value("003829477000010"),
  ifNumber: value("71744183"),
  patenteNumber: value("34772428"),

  // ─── OMPIC ───────────────────────────────────────────────────────
  // 3121576 is the Certificat Négatif number (the OMPIC document
  // that reserves the company name), NOT a trademark deposit. The
  // legal-notice prose phrases it correctly. If the house ever files
  // an actual Dépôt de marque, add a second field for that number
  // and update the IP section.
  ompicCertNegatif: value("3121576"),

  // ─── Pre-filled by engineering (do not change unless infra moves) ─
  supabaseRegion: value("eu-west-1 (Francfort / Frankfurt)"),
} as const satisfies Record<string, Bilingual>;
