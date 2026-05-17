/**
 * Single source of truth for client-provided legal data referenced
 * across /legal/* pages. When the house returns the intake sheet
 * (.project/CLIENT_INTAKE.md), update each field below once and
 * every page (mentions légales, privacy, terms, cookies) picks up
 * the new value.
 *
 * Each field is bilingual. The `<L>` component in components/legal/
 * LegalValue.tsx auto-detects whether the value is still a
 * placeholder (renders with dashed gold underline) or a real value
 * (renders plain).
 *
 * To swap a placeholder for the real value:
 *
 *   legalName: placeholder("dénomination sociale", "legal name"),
 *
 * becomes:
 *
 *   legalName: value("Barbaria SARL"),
 *
 * That's it. All four pages update simultaneously, FR and EN.
 */

export type Bilingual = { fr: string; en: string };

/** Mark a field as still awaiting the client's input. Renders dashed. */
function placeholder(fr: string, en: string): Bilingual {
  return {
    fr: `[À COMPLÉTER : ${fr}]`,
    en: `[CLIENT-FILL: ${en}]`,
  };
}

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
  legalName: placeholder("dénomination sociale", "legal name"),
  companyForm: placeholder(
    "forme juridique, ex. SARL / SARL AU / SA",
    "company form, e.g. SARL / SARL AU / SA"
  ),
  capital: placeholder("capital social en MAD", "share capital in MAD"),
  fullAddress: placeholder(
    "adresse complète du siège, Marrakech, Maroc",
    "full address, Marrakech, Morocco"
  ),
  postalAddress: placeholder(
    "adresse postale, Marrakech, Maroc",
    "postal address, Marrakech, Morocco"
  ),
  directorName: placeholder(
    "nom complet du gérant / représentant légal",
    "full name of the legal representative"
  ),

  // ─── Identifiants officiels ──────────────────────────────────────
  rcNumber: placeholder("RC Marrakech n° XXXXX", "RC Marrakech No. XXXXX"),
  iceNumber: placeholder("ICE, 15 chiffres", "ICE, 15 digits"),
  ifNumber: placeholder("Identifiant Fiscal", "Tax Identifier (IF)"),
  patenteNumber: placeholder(
    "Patente / Taxe Professionnelle",
    "Patente / Professional Tax"
  ),

  // ─── Marque ──────────────────────────────────────────────────────
  ompicMark: placeholder(
    "marque déposée OMPIC n° XXXX, ou en cours de dépôt",
    "registered with OMPIC under No. XXXX, or pending"
  ),

  // ─── Activité réglementée (optional, only if applicable) ─────────
  dmpNumber: placeholder(
    "n° de notification cosmétique DMP, si fabricant/importateur",
    "DMP cosmetic notification number, if manufacturer/importer"
  ),
  onssaNumber: placeholder(
    "n° d'agrément ONSSA, si manipulation produits alimentaires",
    "ONSSA registration number, if food handler"
  ),

  // ─── Crédits (optional but customary) ────────────────────────────
  designCredits: placeholder(
    "conception et développement",
    "design and development"
  ),
  photoCredits: placeholder("photographies", "photography"),

  // ─── CNDP (Moroccan data-protection authority) ───────────────────
  cndpReceipt: placeholder(
    "n° de récépissé CNDP, format D-XXX/YYYY",
    "CNDP receipt number, format D-XXX/YYYY"
  ),
  cndpTransferAuth: placeholder(
    "autorisation transfert hors Maroc demandée / obtenue, référence",
    "cross-border transfer authorisation requested / obtained, reference"
  ),

  // ─── Pre-filled by engineering (do not change unless infra moves) ─
  supabaseRegion: value("eu-west-1 (Francfort / Frankfurt)"),
} as const satisfies Record<string, Bilingual>;

export type ClientDataKey = keyof typeof CLIENT_DATA;
