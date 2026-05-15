# Sprint 1 , Stitch Redesign Port

Full frontend port of the Google Stitch "Modern Maghreb Rituals" design to the existing Next.js 16 codebase. Three rituals, new IA, B2B inquiry flow.

## What's in this PR

### New IA (information architecture)
- `/` , Editorial Home (Hero + credentials strip + 2-col editorial + bento + Heritage 3-up)
- `/rituals/hammam`, `/rituals/botanical`, `/rituals/heritage` , Category pages with filter rail + sortable grid
- `/product/[id]` , Product detail (sticky image stack + spec column + proof strip + Application Ritual + Cooperative band + Related)
- `/story` , Three-chapter editorial narrative (Origin, Method, Object) + pull-quote
- `/ateliers` , Six-up cooperative partners grid
- `/journal` , One feature card + five standard editorial cards (aria-disabled until articles ship in a follow-up)
- `/contact` , Two-step B2B concierge form + sticky inquiry sidebar

### Retired routes (308 permanent redirect)
- `/cosmetics` -> `/rituals/botanical`
- `/textile` -> `/rituals/heritage`
- `/food` -> `/rituals/heritage` (was "Coming soon" placeholder, never shipped)
- `/order` -> `/contact` (legacy cart flow replaced by B2B inquiry concierge)
- `/about` -> `/story`
- Both bare-path (FR default locale) and `/en/...` variants covered (20 redirect rules total)

### Design system
- 23 CSS custom properties (`--bb-*`) ported verbatim from Stitch
- Tailwind 4 `@theme inline` mapping
- Cormorant Garamond + Playfair Display + Montserrat via `next/font/google`
- Reveal animation primitive (IntersectionObserver, FOUC-safe, prefers-reduced-motion honored)
- Photo primitive with deep-green gradient + noise fallback for `needsShot` slots
- 20-glyph Icon set inline SVGs

### Data
- 17 products in typed `lib/products.ts` (9 oils + serums migrated from current site to Botanical; 5 new Hammam products + 3 new Heritage products from prototype data)
- 6 ateliers + 6 journal cards in `lib/editorial.ts`
- Full EN + FR translations across all new namespaces

### Inquiry flow
- localStorage-backed Map context (renamed from `cart-context` -> `inquiry-context`, storage key migrated `barbaria-cart` -> `bb.inquiry` one-shot)
- Right-side InquiryDrawer with empty/populated states + qty stepper + remove
- Two-step Contact form with honeypot anti-spam
- Submit via `mailto:` to `concierge@barbariamorocco.com` with structured body (truncated past 20 items, 1800-char cap)
- No backend in this sprint, Sprint 3 will replace mailto with Resend + DB persistence

### Tests
- **40 Playwright tests, all green**
  - 22 route smoke tests (every new route 200s in EN + FR)
  - 10 redirect tests (308 from every retired route, both bare-path and `/en` variants)
  - 4 functional tests (inquiry persistence across reload, locale toggle, mailto serialization, count badge across navigation)
  - 4 axe-core WCAG 2 AA scans (Home + Category + PDP + Contact, zero serious/critical violations)

## Out of scope (deferred to Sprints 2 + 3)

- **Sprint 2** , admin dashboard + Supabase Postgres for product/inquiry persistence
- **Sprint 3** , replace mailto with Resend backend + business analytics (inquiries-per-week, top products, etc.)

Both sprints scoped in `.project/specs/_backlog.md`.

## Photography "needs shot" backlog

Sections currently rendering the gradient placeholder pending real photography:
- Atlas mountain hero (Home, 90vh full-bleed)
- Hammam ritual hero (Category page)
- Hammam steam / cooperative portrait (Story chapter 02)
- All 6 ateliers (Ateliers page), workshop/lifestyle shots
- 5 of 6 journal cards (Journal page), editorial shots
- 5 of 17 PDPs (`ghassoul-clay`, `kessa-glove`, `huile-nigelle`, the 3 serums, `berber-pouch`, etc.)

The Photo primitive renders a brand-aligned deep-green gradient + noise overlay when `src=null`, so all pages are functional and on-brand until photography lands. The slots are tagged `data-needs-shot` for easy auditing once shots arrive.

## Accessibility findings + fixes

Axe-core WCAG 2 AA scan revealed that aged-gold `#c5a059` on cream `#fcf9f3` is only 2.33:1 contrast, fails the 4.5:1 small-text minimum. Resolved by switching Eyebrow `tone="gold"` -> `tone="green"` on light surfaces (dark green on cream = 13:1, passes with massive headroom); kept gold on dark surfaces (hero overlays, dark cards) where it's ~5.9:1 and passes. Same fix applied to a few non-Eyebrow gold elements (step numerals, pull-quote). Decision documented in `.project/DECISIONS.md`.

## Project governance updates

- `.project/CHANGELOG.md` , real-time log of every task's landing
- `.project/DECISIONS.md` , 8 architectural decisions captured (sprint decomposition, taxonomy mapping, food drop, mailto vs Resend, photo fallback strategy, Stitch MCP deferral, 308 redirect choice, Eyebrow tone audit)
- `.project/specs/2026-05-11-stitch-redesign-port-design.md` , the spec this PR implements
- `.project/plans/2026-05-11-stitch-redesign-port.md` , 14-task implementation plan
- `.project/specs/_backlog.md` , Sprint 2 + 3 scoping

## Build output

Route table:

```
Route (app)
┌ ○ /_not-found
├ ƒ /[locale]
├ ● /[locale]/ateliers
│ ├ /en/ateliers
│ └ /fr/ateliers
├ ● /[locale]/contact
│ ├ /en/contact
│ └ /fr/contact
├ ● /[locale]/journal
│ ├ /en/journal
│ └ /fr/journal
├ ƒ /-/opengraph-image
├ ƒ /[locale]/product/[id]
├ ƒ /[locale]/rituals/[world]
├ ● /[locale]/story
│ ├ /en/story
│ └ /fr/story
└ ○ /sitemap.xml


ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

## Test summary

```
40 passed (30.7s)
```

All 40 Playwright specs green: 22 route smoke, 10 redirect, 4 functional (inquiry persistence, locale toggle, mailto serialization, count badge), 4 axe-core WCAG 2 AA scans.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
