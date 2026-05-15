# Sprint 1.5 , Brand Voice Refresh + Real Catalogue Alignment

**Author:** Taha El Bouzidi
**Date:** 2026-05-12
**Status:** Approved, executing
**Branch:** `feat/brand-refresh-sprint-1-5`

## Why this sprint

Client (Barbaria Morocco founder) shared three artifacts: the 15-page **B2B catalogue PDF** (real product line, 36 SKUs across 6 gammes, 100% cosmetics, zero food), the **brand presentation deck** (positioning: "A Ritual, Not a Product"), and an **AI-generated design mockup** she said captured "the vision in her head". She likes the mockup's Amazigh storytelling, the proverb, the Histoire copy, the cream/brown/gold palette. She does not like dark surfaces.

The mockup also invents a /gourmet food category she does not sell and drops EN i18n, /ateliers, /journal. Those are rejected.

The Sprint 1 site we already shipped uses the right palette (`--bb-bg #fcf9f3`, `--bb-primary #1b3022`, `--bb-secondary #c5a059`) and the right IA (3 rituals + ateliers + journal + story + contact, EN+FR). Sprint 1.5 layers the client's brand voice on top and replaces the 17 invented seed products with her 36 real ones.

## Scope (in)

1. **Re-seed `lib/products.ts`** with the 36 products from the catalogue PDF, mapped to the existing 3-ritual schema:
   - Hammam (12): Gamme 03 Rituel Hammam (6) + Gamme 05 Savons Noirs Beldi (6)
   - Botanical (24): Gamme 01 Huiles Pures (6) + Gamme 02 Sérums (6) + Gamme 04 Hydrolats (6) + Gamme 06 Huiles de Massage (6)
   - Heritage (3 packs): curated bundles from the mockup, each referencing real products
2. **Reconcile subcategories** (`lib/rituals.ts`) to match the 6 gammes vocabulary.
3. **Story page rewrite** (`app/[locale]/story/page.tsx` + `messages/{en,fr}.json` story namespace): 4 Histoire chapters from the mockup (Antiquité, Médiéval, Tradition, Aujourd'hui) plus a 5th Tifinagh chapter with the 6 Amazigh symbols. Letter names fact-checked (ⵣ Yaz, ⵎ Yam, ⴽ Yak, ⵏ Yan, ⵔ Yar, ⵢ Ya).
4. **Hero tagline** update on home: eyebrow becomes "L'Art du Terroir & les Rituels Ancestraux du Maroc" (FR-first, EN equivalent on /en).
5. **Amazigh proverb component** placed at bottom of Story and Contact: *« Nul n'est étranger sur la terre de ses ancêtres. » , Proverbe Amazigh*.
6. **Tifinagh ⵣ ambient mark** as a small SVG primitive used on hero dividers, footer, section breaks. Does NOT replace the existing wordmark logo.
7. **Re-seed database** with the new catalogue via `npm run seed`.
8. **Palette audit**: confirm no near-black surfaces in CSS. Drift gets corrected if present.

## Scope (out, explicit)

- Building /gourmet (food). She sells zero food. Building it would be discarded.
- Dropping English. Her listed export markets are France, UAE, KSA, USA, Canada.
- Removing /ateliers or /journal. Her catalogue closes with "Fait par des femmes artisanes marocaines"; cooperatives are her credibility surface.
- Replacing the existing wordmark/logo with the mockup's geometric SVG.
- Authenticated admin Playwright fixture (Sprint 2.5).
- Sprint 3 (contact form → DB write, transactional email, insights dashboard) remains pinned.

## Data model implications

No schema changes. The existing `products`, `product_translations`, `product_facets`, `product_application_steps`, `rituals`, `ritual_subcategories`, `ritual_subcategory_translations` tables absorb the 36 new products plus 3 packs. Subcategory slugs change inside `lib/rituals.ts` (e.g., `oils` → `huiles-pures`, `cleanse` → `gommages`, etc.); the seed handles the deletion of obsolete subcategories and creation of the new ones.

## File touch list

- **Replace:** `lib/products.ts` (catalogue with 36 + 3 pack entries)
- **Replace:** `lib/rituals.ts` (subcategories realigned to 6 gammes vocabulary)
- **Modify:** `messages/en.json`, `messages/fr.json` (story namespace, hero eyebrow, common.amazigh_proverb, story.amazigh_*, story.ch4_*)
- **Modify:** `app/[locale]/story/page.tsx` (4 chapters + Amazigh chapter)
- **Modify:** `app/[locale]/contact/page.tsx` (proverb at bottom)
- **Modify:** `app/[locale]/page.tsx` (hero eyebrow swap)
- **New:** `components/primitives/TifinaghMark.tsx` (decorative SVG)
- **New:** `components/primitives/AmazighProverb.tsx` (proverb block, reused on Story + Contact)
- **Run:** `npm run seed` (re-populates Supabase)

## Verification

- `npm run build` exits 0.
- `npm run seed` exits 0, 39 products in DB (36 + 3 packs), 3 rituals, new subcategories present, old removed.
- `npm test` (Playwright) passes.
- Manual smoke: home, /fr, /rituals/hammam, /rituals/botanical, /rituals/heritage, /story, /contact, /journal, /ateliers, /product/huile-argan.

## Risk register

1. **Subcategory rename is destructive.** Existing seeded products with old subcats (e.g., `oils`, `face`) will lose their subcat assignment when the new ones are seeded. Mitigation: seed deletes products first (cascade), then re-creates everything from `lib/products.ts`. Idempotent.
2. **Amazigh letter-name fact-check.** The mockup's labels (Aza/Yaz/Kaf/Mim/Nun/Ra) mix Tifinagh letter names with Arabic letter names. Corrected to the actual Tifinagh names (Yaz for ⵣ, Yam for ⵎ, etc.) before publish.
3. **EN translations of new products.** The catalogue is FR. EN translations are produced now in this sprint, validated for brand-voice consistency against existing 6-product overlap (Pure Argan Oil, etc.).
4. **Heritage ritual was originally textile/ceramic/cedar.** Repurposing to Packs means the 3 textile mocks disappear. Acceptable per scope decision; client does not sell textiles.

## Reference

- Catalogue PDF: `D:\Users\papib\Downloads\Barbaria_Morocco_Catalogue_B2B.pdf`
- Mockup JSX: `D:\Users\papib\Downloads\barbaria_morocco (1).jsx`
- Original Sprint 1 design handoff: `D:\Users\papib\Downloads\_barbaria_unzipped\design_handoff_barbaria\README.md`
