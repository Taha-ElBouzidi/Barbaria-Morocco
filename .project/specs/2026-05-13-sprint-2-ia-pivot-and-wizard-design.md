# Sprint 2 — IA Pivot, Compose-Your-Box, Polish & Mobile

**Author:** Taha El Bouzidi (lead) + Claude as engineer
**Date:** 2026-05-13
**Status:** Driving
**Branches:** `feat/sprint-2-{0,1,2,3,4,5}-*`, merged to master per slice

## Why

Client feedback (May 13): site is "75% done." Three substantive changes:

1. Replace the 3-ritual catalogue with **two product categories** that each surface gift boxes (not individual products): **Cosmétiques** and **Épicerie Fine**.
2. Add a **"Compose your box" wizard** inside each category: a multi-step Amazigh-themed journey where the buyer picks items per slot, gathers a narrative as they go, and submits as a B2B inquiry with admin-configurable minimum quantity.
3. Full polish + mobile + a11y pass on public site AND admin.

The 36 cosmetic products from the catalogue stay as detail pages (educational, navigable from the wizard) but are no longer the entry point. Épicerie Fine ships with admin-fillable placeholders; real data arrives later.

## Decisions (locked)

- **Categories**: `cosmetiques`, `epicerie_fine`. Slugs final.
- **CTA copy**: `Send us a request` / `Envoyez-nous une demande`. Replaces `B2B Concierge`.
- **Storytelling themes**:
  - Cosmétiques → *Sous les étoiles du Sahara* — constellation metaphor, each wizard step is a "star"
  - Épicerie Fine → *Sur la route des caravanes* — trans-Saharan trade route, each step is a halt (Sijilmassa, Taliouine, Marrakech, Fès, etc.)
- **Default minimum quantity**: 5 units per box. Per-box override editable by admin.
- **Branches & deploy**: per-slice feature branches → squash merge to master → Vercel auto-deploy. Master must always stay deployable.
- **Animation stack**: Tailwind + CSS transitions + Next.js View Transitions API. No new dependencies.
- **Existing rituals**: retained as **internal product tagging** in the schema. Public IA does not surface them. `/rituals/[world]` returns 301 → `/products/cosmetiques`.
- **/ateliers, /journal, /story, /contact**: kept as-is.

## Sprint structure

| Slice | Scope | Status |
|---|---|---|
| **2.0** IA Pivot | Schema (`categories`, `gift_boxes`, translations, items), seed migration, public `/products/[category]` routes, header nav rebuild, CTA rename, `/rituals/*` 301s, admin gift-box CRUD, ritual UI retired | starting |
| **2.1** Wizard | Compose-your-box multi-step wizard (state, slide transitions, story fragments, item picker, review, inquiry submission with min-qty). Admin Box Editor for steps + stories + product pools. | pending |
| **2.2** Zoom Transition | Product card → detail zoom via View Transitions API, reverse on close. Scoped to box composer + category listing. | pending |
| **2.3** Polish Audit (public) | Multi-agent sweep: visual, mobile, a11y, dead links, empty/loading/error states, animation consistency. Findings → fix list. | pending |
| **2.4** Mobile Admin | Responsive admin redesign for dashboard, product editor, gift box editor, inquiry list/detail, activity. | pending |
| **2.5** Final Polish | Fresh-eye multi-agent re-audit, regression sweep, micro-tightening. | pending |

## Schema (Sprint 2.0)

```sql
-- new
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,            -- 'cosmetiques' | 'epicerie_fine'
  sort_order integer DEFAULT 0,
  hero_image_path text,
  story_theme_key text NOT NULL,        -- 'sahara_stars' | 'caravan_route'
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE category_translations (
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  locale locale_enum NOT NULL,
  name text NOT NULL,
  tagline text,
  lede text,
  PRIMARY KEY (category_id, locale)
);

CREATE TABLE gift_boxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE RESTRICT,
  slug text UNIQUE NOT NULL,
  hero_image_path text,
  status product_status_enum DEFAULT 'draft',
  default_quantity_min integer DEFAULT 5,
  sort_order integer DEFAULT 0,
  is_customizable boolean DEFAULT false, -- true = wizard entry, false = curated
  published_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE gift_box_translations (
  gift_box_id uuid REFERENCES gift_boxes(id) ON DELETE CASCADE,
  locale locale_enum NOT NULL,
  name text NOT NULL,
  tagline text,
  story_intro text,                       -- shown at start of wizard or detail
  PRIMARY KEY (gift_box_id, locale)
);

CREATE TABLE gift_box_items (             -- curated boxes only
  gift_box_id uuid REFERENCES gift_boxes(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  PRIMARY KEY (gift_box_id, product_id)
);

-- altered
ALTER TABLE products ADD COLUMN category_id uuid REFERENCES categories(id);
-- Backfill: existing 36 cosmetics products → cosmetiques category
-- Heritage packs (3 rows) are removed from products and re-modelled as gift_boxes
```

Audit triggers extended to cover `categories` and `gift_boxes`.

## File touch list (Sprint 2.0)

- **NEW**: `db/migrations/0006_categories_and_gift_boxes.sql`
- **MODIFY**: `db/schema.ts`
- **MODIFY**: `db/seed.ts`
- **NEW**: `lib/categories.ts` (source data + types)
- **NEW**: `lib/gift-boxes.ts` (3 cosmetics gift boxes + 4 épicerie placeholders)
- **MODIFY**: `lib/products.ts` (add `category` field per product, keep `world`/`ritual` as internal tag)
- **NEW**: `app/[locale]/products/[category]/page.tsx`
- **NEW**: `app/[locale]/products/[category]/[box]/page.tsx` (gift box detail)
- **REPLACE**: `app/[locale]/rituals/[world]/page.tsx` with 301 to `/products/cosmetiques` (keep file as a redirect handler)
- **MODIFY**: `components/shell/Header.tsx` (new nav structure)
- **MODIFY**: `components/shell/Footer.tsx` (new column structure)
- **MODIFY**: `messages/{en,fr}.json` (nav strings, CTA rename, category copy, gift box copy)
- **MODIFY**: `components/home/BentoRituals.tsx` → repurpose as `BentoCategories.tsx` (2 tiles instead of 3+1)
- **NEW**: `app/admin/categories/page.tsx` (admin list + edit)
- **NEW**: `app/admin/gift-boxes/page.tsx` (admin list)
- **NEW**: `app/admin/gift-boxes/[id]/page.tsx` (admin edit)
- **MODIFY**: `components/admin/Sidebar.tsx` (add gift box link, retire ritual link if redundant)

## Verification (Sprint 2.0)

- `npx tsc --noEmit` clean
- `npm run build` green
- `npm run seed` produces: 2 categories, 7-ish gift boxes (3 cosmetics, 4 epicerie placeholders), 36 cosmetic products tagged with category_id, 3 rituals retained
- Manual: navigate to `/`, `/products/cosmetiques`, `/products/epicerie-fine`, click into a box, click "Send us a request" CTA, lands on contact
- Manual: visit `/rituals/hammam` → 301 to `/products/cosmetiques`

## Risk register

1. **Master deploys live.** Any commit that breaks the build breaks the site. Discipline: feature branches per slice, build verify on every change, merge only after smoke test.
2. **Schema migration is FK-heavy.** Adding `category_id` to `products` with nullable + backfill is safe. Removing heritage packs from products (or repurposing them) is destructive; mitigated by keeping them as products with category='cosmetiques' until gift_boxes are populated, then dropping after.
3. **Header nav links change.** Cache and prefetched routes from existing sessions may briefly 404. Mitigated by 301s and a soft transition (keep old links also live for one deploy cycle).
4. **Wizard scope is big.** Sprint 2.1 may split further once the picker UX is built; explicit re-plan checkpoint after 2.0 ships.
