# Decisions

Architectural decision log. One entry per non-obvious choice that future-us would need the reasoning for. Newest first.

Format:
```
## YYYY-MM-DD — <title>
**Context:** what forced the decision
**Decision:** what we chose
**Alternatives considered:** what we didn't pick and why
**Consequences:** what this commits us to
```

---

## 2026-05-11 — Sprint decomposition for the Stitch redesign

**Context:** User initially asked to "polish the new design and use our photos." Mid-session the ask expanded to include admin dashboard, SQL database, and analytics. The combined work is three independent subsystems with different risk profiles (frontend port = low risk, admin + DB = security and migration risk, analytics = product question).

**Decision:** Decompose into 3 sequential sprints, each its own PR:
1. **Sprint 1 — Frontend redesign port** (this PR, branch `feat/stitch-redesign`). Products as typed TS data file, inquiry submission via `mailto:`, analytics = existing `@vercel/analytics`. Ships visible brand work fastest.
2. **Sprint 2 — Admin + DB.** Supabase Postgres + Auth, schema for products / translations / images / inquiries / admin_users, seed from `lib/products.ts`, `/admin/*` routes behind Supabase Auth.
3. **Sprint 3 — Inquiry backend + business analytics.** Replace `mailto:` with form POST → DB write → Resend email. Admin "Insights" view (inquiries-per-week, top products, locale split).

**Alternatives considered:**
- *One mega-PR* — rejected: unreviewable, blocks redesign on infra decisions not yet made, weeks before anything ships.
- *Parallel branches* — rejected: Sprint 2 must follow Sprint 1 because the admin edits the catalogue the frontend renders. Sequential is forced.
- *Skip Sprint 1, start at DB* — rejected: user wants visible design refresh and current Stitch handoff is fully specced and ready to port.

**Consequences:**
- Sprint 1 ships a faithful frontend with `mailto:` inquiry submission. No persisted inquiries server-side until Sprint 3.
- `lib/products.ts` becomes the temporary source of truth, replaced in Sprint 2 by DB reads (ISR for the public site so perf stays equivalent).
- Three PRs over ~4–6 weeks instead of one giant PR over ~6 weeks. Easier review, faster feedback cycles.

---

## 2026-05-11 — Drop `/food` from the IA

**Context:** New design has 3 rituals (Hammam, Botanical, Heritage). Current site has cosmetics / textile / food. Food was never launched — `messages/en.json` literally says `"Coming soon"` and the page is a placeholder.

**Decision:** Drop `/food` and `/textile` as standalone routes. Migrate textile products into Heritage Gifts. Retire food entirely. Add 301 redirect from `/food` → `/rituals/heritage` to preserve any inbound SEO.

**Alternatives considered:**
- *Add 4th ritual "Terroir" for edibles* — rejected: design has 3 rituals only, would force token + layout extensions for a product line that has never shipped.
- *Fold food into Heritage as "edible heritage"* — kept as a future option (Sprint 2 or later). Heritage's "Table" sub-cat already exists in the handoff data model and accommodates this cleanly when/if edibles launch.

**Consequences:**
- `/food` returns 301 to `/rituals/heritage`. If Barbaria ever launches edibles, add `food` sub-cat under Heritage rather than a new ritual.
- One less route to test, document, and translate.

---

## 2026-05-11 — Taxonomy mapping (current products → new rituals)

**Context:** 9 current products (6 oils, 3 serums) live under `/cosmetics`. New IA has Hammam (purification soaps/clays), Botanical (vitality oils/serums), Heritage (artisan gifts).

**Decision:**
- All 9 oils + serums → **Botanical** (they are cold-pressed botanicals, not hammam ritual items).
- Existing textile bags/pouches → **Heritage**.
- 7 new products introduced from prototype's `data.jsx` to populate Hammam (Beldi Black Soap, Sugar Scrub, Ghassoul, Kessa, Rose Water) and Heritage (Cedar Box, gift sets) using existing photography in `public/brand_photos/`.

**Alternatives considered:**
- *Force-fit oils into Hammam* — rejected: black-soap + clay + glove is the editorial backbone of "Hammam Ritual"; mixing in argan-oil-dropper photos dilutes the concept.
- *Keep cosmetics as one undifferentiated bucket* — rejected: the handoff is explicit about the 3-ritual narrative and the editorial value is in the differentiation.

**Consequences:**
- Botanical category will be the densest at launch (9 products). Hammam and Heritage start sparser but have full layout + product cards.
- All 9 current product IDs migrate without renaming → existing inbound links via product slugs (`huile-argan` etc.) still resolve when we add `/product/[id]` routes.

---

## 2026-05-11 — Inquiry submission: `mailto:` for Sprint 1, Resend for Sprint 3

**Context:** Handoff specifies a 2-step inquiry form posting to a backend. We don't have a backend yet. Building one inside Sprint 1 blocks the redesign on backend infra choices.

**Decision:** Sprint 1 ships `mailto:` submission. The form serializes fields + inquiry-list to a structured email body and opens the user's mail client with `concierge@barbariamorocco.com` pre-filled. Honeypot field included. Inquiry list still persists in localStorage between visits.

**Alternatives considered:**
- *Vercel serverless function + Resend now* — rejected: introduces env-var management, requires Resend account setup, adds spam/rate-limit surface area. Deferred to Sprint 3 where it's the headline feature.
- *No-op submit (just localStorage)* — rejected: form needs to actually do something visible to the buyer.

**Consequences:**
- Email body > 2000 chars truncates the list to first 20 items. Acceptable for a B2B inquiry context (most inquiries are 1–5 items).
- Sprint 3 will replace the submit handler with a form POST to `/api/inquiry`, preserving the same UX — no visible regression for buyers.

---

## 2026-05-11 — Defer Google Stitch MCP

**Context:** User suggested wiring Google Stitch MCP for live design pulls. The static handoff in `design_handoff_barbaria/` already contains every token, JSX file, and CSS rule needed for a faithful port.

**Decision:** Don't wire Stitch MCP in Sprint 1. Revisit when (a) the design needs updates iterated in Stitch, or (b) we're consuming a new screen not in the current handoff.

**Alternatives considered:**
- *Wire it preemptively* — rejected: setup overhead (gcloud auth, GCP project, MCP install) for a one-shot port that already has its source-of-truth static files.

**Consequences:**
- Future design iterations may need Stitch MCP for parity-checking. Cost when we get there: ~15 min setup.

---

## 2026-05-11 — Photography fallback: gradient placeholder, never Unsplash

**Context:** Handoff prototype uses Unsplash for placeholders. Some sections (Atlas hero, cooperative portraits, ateliers shots) lack a real photo in `public/brand_photos/`.

**Decision:** Where no real photo exists, render a deep-green gradient (`linear-gradient(180deg, #2a4632, #1b3022)`) + 24×24 SVG noise overlay. Each gap logged in the PR description as "needs shot" with desired composition notes. **No external image hosts in production.**

**Alternatives considered:**
- *Use Unsplash placeholders* — rejected: looks generic, dilutes brand, creates an external dependency.
- *Hide sections with no photo* — rejected: home page would have holes; better to ship the layout with a brand-aligned placeholder.

**Consequences:**
- The PR description will include a shoot list for Taha to commission. Until those land, the editorial sections look intentional (textured green) rather than broken.
