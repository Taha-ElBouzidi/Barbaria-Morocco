# Spec , Stitch Redesign Port (Barbaria, B2B Gifting)

**Date:** 2026-05-11
**Branch:** `feat/stitch-redesign`
**Author:** Lead Autonomous Architect (Claude) + Taha El Bouzidi (CTO)
**Source design:** `D:\dev\Havok\BARBARIA\design_handoff_barbaria\` (Google Stitch handoff, "Modern Maghreb Rituals")
**Target codebase:** `D:\dev\Havok\BARBARIA\LATEST\` (Next.js 16.2.1 App Router + next-intl 4 + Tailwind 4 + React 19)

---

## 1. Goal

Replace the current Barbaria public site (cosmetics / textile / food / order) with a faithful port of the Stitch "Modern Maghreb Rituals" design system. Three ritual worlds (Hammam, Botanical, Heritage), per-product detail pages, B2B inquiry flow (no public prices, no checkout), editorial brand pages (Story, Ateliers, Journal), and a concierge contact page. Pixel-faithful to the handoff: warm sand canvas, deep botanical green, aged gold accent, 0px corners, Cormorant + Playfair + Montserrat type stack, generous editorial whitespace.

---

## 2. Scope

### In scope (this PR, branch `feat/stitch-redesign` → `master`)

- Full design system port: tokens, typography, base components, reveal animations.
- Routes (per `[locale]`):
  - `/` , Home (hero, strip, editorial 2-col, bento rituals, heritage 3-up)
  - `/rituals/hammam`, `/rituals/botanical`, `/rituals/heritage` , Category pages (hero, sub-chips, filter rail, product grid)
  - `/product/[id]` , Product detail (image stack, spec column, proof strip, application ritual, cooperative impact band, related)
  - `/story` , Editorial origin/method/object chapters
  - `/ateliers` , Cooperative partners 6-up grid
  - `/journal` , Editorial index (6 cards, mixed sizes)
  - `/contact` , Two-step concierge inquiry form
- Shared shell: sticky header (transparent over hero → sand after 8px scroll), language toggle, hamburger drawer, inquiry drawer (renames existing `cart-context` → `inquiry-context`), footer.
- Product catalogue: hardcoded TS data file `lib/products.ts` modeled on prototype's `data.jsx` shape. 17 products from prototype, re-photographed with `public/brand_photos/` where mappable, plus current site's 9 oil/serum products migrated into Botanical.
- i18n: EN / FR via existing `next-intl` setup, expanding `messages/{en,fr}.json` to cover new copy.
- Inquiry submission: `mailto:` to `concierge@barbariamorocco.com` on form submit, with body containing form fields + inquiry list serialized. Honeypot field for spam.
- Redirects: `/cosmetics → /rituals/botanical`, `/textile → /rituals/heritage`, `/food → /rituals/heritage`, `/order → /contact`, `/about → /story`. 301 status.
- Build hygiene: fix `turbopack.root` warning, retire `/food` route (was "Coming soon" placeholder, never shipped).
- Tests: Playwright smoke (each route renders 200 in EN + FR), axe-core a11y check on Home + one category + PDP + Contact, EN/FR locale switch preserves route, inquiry list persists across navigation.

### Deferred (separate PRs, not this one)

- CMS wiring (Sanity / Contentful / etc.) , products stay in `lib/products.ts` for now.
- Resend / SendGrid backend for inquiry form , `mailto:` is the v1 transport.
- Real Story / Ateliers / Journal **content** (we ship the *layouts* with placeholder editorial copy from the prototype's `data.jsx` , labeled as draft in PR description).
- Google Stitch MCP integration , static handoff is sufficient for this port.
- Arabic RTL or any locale beyond EN/FR.
- Per-product PDF spec sheet generation.
- `npm audit` remediation (11 vulns: 1 low, 7 mod, 3 high , none runtime-critical for this port).

---

## 3. Critical decision: taxonomy mapping

Current site has cosmetics / textile / food (food was never launched, copy literally says "Coming soon"). The new design has 3 rituals: Hammam (Purification), Botanical (Vitality), Heritage (Grounding). Existing products fold in as:

| Current product | New ritual | Sub-cat |
|---|---|---|
| Pure Argan Oil (`huile-argan`) | Botanical | Pure Oils |
| Prickly Pear Seed Oil (`huile-figue`) | Botanical | Face & Neck |
| S'ad Oil (`huile-saad`) | Botanical | Body Nourishment |
| Pure Castor Oil (`huile-ricin`) | Botanical | Hair & Scalp |
| Pure Rose Oil (`huile-rose`) | Botanical | Face & Neck |
| Pure Black Seed Oil (`huile-nigelle`) | Botanical | Hair & Scalp |
| Royal Anti-Age Serum (`serum-anti-age`) | Botanical | Face & Neck |
| Radiance Serum (`serum-eclat`) | Botanical | Face & Neck |
| Hair Serum (`serum-cheveux`) | Botanical | Hair & Scalp |
| Existing textile bags/pouches | Heritage | Pouches & Bags |

Products from prototype to **introduce** (photography already exists in `public/brand_photos/`):

| New product | Ritual | Sub-cat | Photo source |
|---|---|---|---|
| Beldi Black Soap | Hammam | Soaps & Cleansers | `savon-noir-{2,3,4}.jpg` |
| Ancestral Sugar Scrub | Hammam | Scrubs & Gloves | `sugar-scrub-{ingredients,stacked,hammam}.jpg` |
| Ghassoul Atlas Clay | Hammam | Clays & Masks | placeholder (needs shot) |
| Kessa Hammam Glove | Hammam | Scrubs & Gloves | placeholder (needs shot) |
| Rose Floral Water | Hammam | Floral Waters | placeholder |
| Engraved Cedar Box | Heritage | Engraved Boxes | `gift-box-{open,flat,overhead}.jpg` |
| Hammam / Heritage gift sets | Heritage | Sets | `packaging-{1..5}.jpg`, `gift-boxes-overhead.jpg` |

**Food / edibles**: dropped from IA. The "Food: Coming soon" placeholder retires. If user pivots back to edibles, add a 4th ritual "Terroir" in a follow-up , design tokens extend cleanly.

---

## 4. Architecture

### Directory layout (new + changed)

```
LATEST/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx                      ← updated: fonts, providers
│   │   ├── page.tsx                        ← rewritten: new Home composition
│   │   ├── rituals/
│   │   │   └── [world]/page.tsx            ← new: category page (hammam|botanical|heritage)
│   │   ├── product/
│   │   │   └── [id]/page.tsx               ← new: PDP
│   │   ├── story/page.tsx                  ← new
│   │   ├── ateliers/page.tsx               ← new
│   │   ├── journal/page.tsx                ← new
│   │   ├── contact/page.tsx                ← rewritten: 2-step concierge
│   │   ├── cosmetics/, food/, textile/, order/, about/  ← DELETED (redirects via middleware)
│   │   └── opengraph-image.tsx             ← kept, possibly retouched
│   ├── globals.css                         ← extended: --bb-* tokens, Tailwind @theme
│   └── layout.tsx                          ← kept
├── components/
│   ├── shell/
│   │   ├── Header.tsx                      ← rewritten (replaces Navbar.tsx)
│   │   ├── Footer.tsx                      ← rewritten (replaces existing)
│   │   ├── MenuDrawer.tsx                  ← new
│   │   └── InquiryDrawer.tsx               ← new
│   ├── primitives/
│   │   ├── Reveal.tsx                      ← new (IntersectionObserver, one-shot)
│   │   ├── Eyebrow.tsx, DisplayHeading.tsx ← new typographic atoms
│   │   └── Photo.tsx                       ← new (wraps next/image with handoff sizing)
│   ├── home/                               ← new: Hero, Strip, EditorialBlock, BentoRituals, Heritage3Up
│   ├── category/                           ← new: CategoryHero, SubChips, FilterRail, ProductGrid, ProductCard
│   ├── product/                            ← new: ImageStack, SpecColumn, ProofStrip, ApplicationRitual, CooperativeBand, RelatedRow
│   └── contact/                            ← new: TwoStepForm, InquirySidebar
├── lib/
│   ├── products.ts                         ← new: typed catalogue (mirrors prototype data.jsx)
│   ├── rituals.ts                          ← new: WORLDS + SUBCATS + FACETS
│   ├── inquiry-context.tsx                 ← renamed from cart-context.tsx, semantic only
│   └── tokens.ts                           ← new: re-exports CSS var names for JS consumers
├── messages/
│   ├── en.json                             ← extended (additive; old keys removed only when route is gone)
│   └── fr.json                             ← same
├── proxy.ts                                ← extended: 301 redirects from retired routes
├── next.config.ts                          ← +turbopack.root
└── .project/
    ├── specs/
    │   └── 2026-05-11-stitch-redesign-port-design.md   ← this file
    ├── CHANGELOG.md                         ← updated each commit
    └── DECISIONS.md                         ← logs the taxonomy decision + food drop
```

### Design tokens

Port `design_handoff_barbaria/src/style.css` `--bb-*` CSS custom properties verbatim into `app/globals.css`. Expose as Tailwind theme via Tailwind 4's `@theme` block so utilities like `bg-bb-bg`, `text-bb-primary` work. Keep canonical color values as `:root` CSS vars (single source of truth) , Tailwind theme references them with `var(--bb-primary)` etc., not duplicated literals.

Type loaded via `next/font/google`: Cormorant Garamond (400 italic, 600 italic, 700), Playfair Display (500, 600), Montserrat (400, 500, 600). JetBrains Mono optional. `display: swap`, preconnect handled by `next/font`.

### Inquiry context (renamed from cart-context)

`lib/inquiry-context.tsx` keeps existing Map-based reducer + localStorage persistence. Storage key migrates from `barbaria-cart` → `bb.inquiry`. Migration on hydrate: read old key, copy to new, delete old. API surface: `add(productId)`, `remove(productId)`, `clear()`, `setQty(id, qty)`, `items: { id, qty }[]`, `count: number`. Consumed by product cards (Add to Inquiry button), drawer, contact form sidebar.

### Routing & redirects

Current `proxy.ts` just wraps `next-intl`'s `createMiddleware`. We replace the default export with a custom function that (1) checks the redirect table below and returns `NextResponse.redirect(..., 301)` for matches, then (2) falls through to `createMiddleware(routing)(request)`. Locale prefix is stripped before lookup and re-applied to the destination.

```ts
const REDIRECTS = {
  "/cosmetics": "/rituals/botanical",
  "/textile":   "/rituals/heritage",
  "/food":      "/rituals/heritage",
  "/order":     "/contact",
  "/about":     "/story",
};
```

Applied **after** locale resolution so EN/FR variants both redirect correctly. 301 status (permanent , SEO carries forward).

### Reveal animation

`Reveal.tsx` is a client component wrapping children in a div whose `style.opacity` and `style.transform` animate from `(0, translateY(16px))` to `(1, translateY(0))` over 600ms `cubic-bezier(.2,.6,.2,1)` when it enters the viewport (IntersectionObserver, `threshold: 0.1`, `rootMargin: '0px 0px -10% 0px'`). One-shot (no re-trigger on scroll back). Supports `delay` prop for stagger (80ms intervals per the handoff). Server-side: render in final state to avoid flash for users with `prefers-reduced-motion: reduce`.

### Photography pipeline

`components/primitives/Photo.tsx` wraps `next/image` with:
- `sizes` defaulting to handoff's grid breakpoints (full-bleed 100vw, half 50vw, third 33vw)
- Automatic `priority` for hero shots (prop)
- Fallback to dark-green gradient + 24×24 noise SVG when `src` is `null` (used for "needs shot" slots)
- `quality={88}` default (premium look without overshooting bandwidth)

Asset directory unchanged: `public/brand_photos/`. Slots that lack a real photo render the fallback gradient with a subtle `data-needs-shot` attribute (dev-mode only outline) so the missing-shot list is auditable.

---

## 5. Components inventory

### Shell (mounted in `app/[locale]/layout.tsx`)
- `Header` , sticky, transparent-over-hero → sand-with-1px-line after 8px scroll. Logo wordmark left, primary nav center (Rituals dropdown reveals 3 worlds + 2nd-level nav for Story/Ateliers/Journal), lang toggle + Inquiry(N) basket + hamburger right.
- `Footer` , three columns: Maison (Story, Ateliers, Journal), Catalogue (3 rituals), Concierge (Contact, WhatsApp, Instagram). Hairline top border, deep-green text on sand. Newsletter signup deferred.
- `MenuDrawer` , right-side drawer, 3 large editorial ritual links + secondary links. Close on overlay click or Esc. Focus trap.
- `InquiryDrawer` , right-side drawer. Lists items with thumb / name / qty stepper / remove. Primary CTA "Request Quote" navigates to `/contact`. Empty state with editorial copy.

### Home
- `Hero` , full-bleed photo (atlas placeholder gradient until real shot lands), 90vh, dark wash, centered serif headline + eyebrow + lede + two CTAs. Stagger fade-up.
- `CredentialStrip` , thin sand band, marquee-ish credentials ("100% Sourced from Morocco · 30+ Berber Cooperatives · Made-to-Order · 4-Week Lead").
- `EditorialBlock` , asymmetric 2-col (portrait + headline). Uses `brand-lifestyle-1.jpg` or `argan-oil-dropper.jpg`.
- `BentoRituals` , 3-photo + 1-text grid. Hammam (2-row large, savon-noir), Botanical (small top-right, argan-oil-dropper), Heritage (medium bottom-left, gift-box-open), text card "Compose your own gift edit".
- `Heritage3Up` , 3 icon cells with copy + gold quote.

### Category page (`rituals/[world]`)
- `CategoryHero` , full-bleed photo (placeholder gradient until shoot), 70vh, eyebrow + display heading.
- `SubChips` , horizontal text-link row (gold underline on active).
- `FilterRail` , 280px left rail, collapsible facet groups (ritual moment / ingredient / application / format / packaging / certification). Selected facets render as removable chips above grid.
- `SortDropdown` , Recommended / A-Z / Latest / MOQ asc.
- `ProductGrid` , 3 / 2 / 1 cols. `ProductCard`: square photo (cover, hover-zoom 1.02), eyebrow, serif name, MOQ pill, one-line spec, link arrow + "Add to inquiry" ghost button.

### Product page (`product/[id]`)
- `ImageStack` , sticky left col, hero + secondary shots vertical, thumbs strip swaps hero.
- `SpecColumn` , eyebrow, display name, italic descriptor, key/value attribute list with 1px sandstone separators. Primary "Add to Inquiry", secondary "Download Spec Sheet (PDF)" (CTA wired to mailto placeholder for v1).
- `ProofStrip` , 3 hairline-bordered cells.
- `ApplicationRitual` , 3 numbered steps with icons.
- `CooperativeBand` , full-bleed deep-green section, manifesto + 3 stat blocks with aged-gold numerals.
- `RelatedRow` , 3-up cards from other rituals.

### Story / Ateliers / Journal
- `StoryChapter` , alternating 1-col photo + 1-col text spreads with chapter number, italic title, pull-quote between.
- `AtelierCard` , square photo, name, region, partner-since year, one-line description. 6-up grid.
- `JournalCard` , kicker, display headline, date, 4:5 photo. Mixed-size grid: 1 feature row + 5 standard. **No article pages this PR** , cards link to `#` with `aria-disabled` until Journal content is written.

### Contact
- `TwoStepForm` , 01 Your Maison (Company, Name, Email, Phone/WhatsApp) · 02 The Occasion (Quantity, Date, Occasion select, Free-text). Hairline bottom-border inputs. Submit → `mailto:` with serialized fields + inquiry list. Success state replaces form with gold check + "We'll be in touch within 24h."
- `InquirySidebar` , sticky right column, items list + direct lines (Paris, Casablanca, WhatsApp, atelier address).

---

## 6. Data model

### `lib/products.ts`

```ts
export type RitualId = "hammam" | "botanical" | "heritage";

export type Product = {
  id: string;
  world: RitualId;
  sub: string;                 // sub-category id within the ritual
  name: { en: string; fr: string };
  short: { en: string; fr: string };
  lede?: { en: string; fr: string };
  hero?: boolean;
  tags: string[];              // facet values
  moq: number;
  formats: string[];
  lead: string;                // "4 weeks"
  origin?: string;
  ritual?: string;             // "The Atlas", "The Hammam", etc. (narrative label, distinct from world)
  images: string[];            // relative paths under /brand_photos/, ordered: hero first
  application?: Array<{ en: [string, string]; fr: [string, string] }>;
  proof?: string[];
  related?: string[];          // product ids
};

export const PRODUCTS: Product[] = [ /* 17 from prototype + 9 migrated = ~20-22 entries */ ];
```

### `lib/rituals.ts`

Exports `WORLDS`, `SUBCATS`, `FACETS` matching the prototype's `data.jsx`. Used by category page rail and chips.

---

## 7. Migration risks & mitigations

| Risk | Mitigation |
|---|---|
| SEO loss when retiring `/cosmetics` etc. | 301 redirects in `proxy.ts`, preserve canonical URLs in `/rituals/{world}` head, update sitemap.ts |
| Existing customers bookmarked `/order` | 301 → `/contact`; concierge form pre-fills "How may we help?" with reference text "Coming from /order" |
| Inquiry context localStorage key change | One-shot migration on first hydrate: read `barbaria-cart`, copy entries to `bb.inquiry`, delete old key |
| Photo coverage gaps (Atlas hero, cooperative portraits, ateliers shots) | Placeholder = deep-green gradient + grain noise, NOT Unsplash. Each gap logged in `.project/DECISIONS.md` as "needs shot" with desired composition |
| Font CLS during Cormorant/Playfair load | `next/font/google` with `display: swap` and preload of subset; size-adjust if needed |
| `messages/{en,fr}.json` divergence between old + new keys | Single PR replaces files atomically. Old keys (cosmetics products, food, order) removed in same commit as new routes; no half-state |
| Tailwind 4 + CSS vars interaction | Tailwind 4's `@theme` directive references `--bb-*` vars directly; spike this in the tokens slice (step 2) , if `@theme` mapping fails, fall back to writing utilities by hand in `@layer utilities` |
| Inquiry mailto link length limits | If body > 2000 chars, truncate item list to first 20 + "and N more"; preserve full list in form's hidden textarea for paste fallback |

---

## 8. Test strategy

Tests live in `tests/` (new directory) using `@playwright/test`. Added as devDependency in same PR.

### Smoke (must pass)
- Every route returns 200 in EN and FR:
  - `/`, `/rituals/hammam`, `/rituals/botanical`, `/rituals/heritage`, `/product/beldi-soap` (representative), `/story`, `/ateliers`, `/journal`, `/contact`
  - Each route also at `/fr/...`
- Every retired route 301s to its replacement:
  - `/cosmetics` → `/rituals/botanical`, `/textile` → `/rituals/heritage`, `/food` → `/rituals/heritage`, `/order` → `/contact`, `/about` → `/story`

### Functional
- Add product to inquiry → drawer shows item → navigate to `/contact` → sidebar shows item → submit → mailto opens with item in body
- Locale toggle on any page preserves the route (EN `/rituals/hammam` ↔ FR `/rituals/hammam`)
- Inquiry persists across full page reload (localStorage)

### A11y
- axe-core scan on `/`, `/rituals/hammam`, `/product/beldi-soap`, `/contact` , zero serious/critical violations
- Keyboard nav: header focus order is logo → primary nav → lang toggle → inquiry → hamburger. Drawer traps focus when open, Esc closes.

### Visual (manual, documented in PR)
- Side-by-side screenshot of each page vs the corresponding section in `Barbaria.html` prototype (open in Chrome).
- Both light-mode only (no dark variant in handoff).

### Verification gates (before merge)
1. `npm run build` clean, zero TS errors, zero new ESLint warnings.
2. All Playwright smoke + functional + a11y green.
3. Lighthouse on Home: Performance ≥ 90 mobile, LCP < 2.5s, CLS < 0.1.
4. `git status` clean. No skipped hooks (`--no-verify` banned).

---

## 9. Implementation order (slices for incremental commits)

Each slice is one commit. Each ends with `npm run build` clean and a one-line `.project/CHANGELOG.md` entry.

1. **Spec + branch + scaffolding** , this file + `.project/CHANGELOG.md` + `.project/DECISIONS.md` + `next.config.ts` turbopack root fix.
2. **Tokens + fonts** , `globals.css` with `--bb-*` vars + Tailwind `@theme` + `next/font/google` wiring in `app/[locale]/layout.tsx`. Verify by rendering existing home in new colors (intentionally ugly intermediate).
3. **Primitives** , `Reveal`, `Eyebrow`, `DisplayHeading`, `Photo`, `Icon` (inline SVG set from handoff).
4. **Shell** , new `Header`, `Footer`, `MenuDrawer`, `InquiryDrawer`. Rename `cart-context` → `inquiry-context` with localStorage migration.
5. **Home** , `Hero`, `CredentialStrip`, `EditorialBlock`, `BentoRituals`, `Heritage3Up`.
6. **Data layer** , `lib/products.ts` + `lib/rituals.ts` populated. `messages/{en,fr}.json` updated.
7. **Category page** , one route `/rituals/[world]` serving all 3 worlds. `CategoryHero`, `SubChips`, `FilterRail`, `ProductGrid`, `ProductCard`. Filtering + sort works (client-side, no backend).
8. **PDP** , `/product/[id]` with all 6 sub-sections.
9. **Editorial pages** , Story, Ateliers, Journal layouts with placeholder/prototype content.
10. **Contact + inquiry submit** , `TwoStepForm`, `InquirySidebar`, mailto wiring.
11. **Redirects + retire old routes** , middleware update, delete `/cosmetics, /food, /textile, /order, /about` page directories. Update `app/sitemap.ts`.
12. **Tests** , Playwright config + smoke + functional + a11y.
13. **Build + Lighthouse + screenshot QA**.
14. **Open PR to master**.

Commits 1 through 13 are reviewable by Taha at any point. Per global rules: "drive autonomously" mode , no per-commit pauses, stop only at sprint end, destructive ambiguity, or unresolvable test failure. Sprint end = step 14 (PR opened).

---

## 10. Definition of done

- [ ] All 14 slices committed on `feat/stitch-redesign`
- [ ] `npm run build` clean
- [ ] All Playwright tests green
- [ ] Lighthouse Home: Perf ≥ 90, LCP < 2.5s, CLS < 0.1, A11y 100
- [ ] axe-core zero serious/critical on 4 representative pages
- [ ] All retired routes redirect 301 to their replacements
- [ ] `public/brand_photos/` referenced; no Unsplash, no external image hosts
- [ ] `.project/CHANGELOG.md` has one entry per slice
- [ ] `.project/DECISIONS.md` logs: taxonomy mapping, food drop, mailto vs Resend deferral, Stitch MCP deferral, photo-gap placeholder strategy
- [ ] PR description lists "needs shot" assets for Taha to commission
- [ ] PR opened against `master`, ready for review

---

## 11. Out of scope (explicit list , DO NOT do in this PR)

- CMS integration (Sanity, Contentful, etc.)
- Resend / SendGrid email backend (mailto only)
- Real Journal article pages (cards link nowhere)
- Real Story/Ateliers content beyond placeholders from prototype
- Per-product PDF spec sheets
- Arabic locale or any locale beyond EN/FR
- Search functionality
- Analytics swap (keep current `@vercel/analytics`)
- npm audit fixes
- Google Stitch MCP setup
- Newsletter signup
- Customer accounts / login
- Real payment / checkout (deliberate , B2B inquiry only)
- Mobile app considerations beyond responsive web

If any of these become required mid-implementation, stop and re-plan.
