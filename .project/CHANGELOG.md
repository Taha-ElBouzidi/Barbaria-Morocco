# Changelog

Real-time log of non-trivial actions on this codebase. Every commit, decision, scaffold, or scoping move gets one entry. Newest first.

Format: `YYYY-MM-DD HH:MM TZ — <one-line summary>`

---

## 2026-05-12

- 11:56 CET. Slice 4: db/migrations/0001_rls.sql written. 18 ENABLE RLS statements + 33 policies (anon read on public catalogue with status='published' filter on products + journal_cards; admin read/write on catalogue; admin read on audit_log + inquiry_items; admin read + update on inquiries; admin all on admin_users). Pending MCP apply by controller.
- 13:15 CET. Slice 3: migration 0000_initial applied to Supabase via MCP `apply_migration`. 18 public tables created, 8 enums, 13 intra-schema FKs, 8 cross-schema FKs to auth.users, 10 indexes. `list_tables` confirms all 18 present with 0 rows; `get_advisors` flags expected RLS-disabled critical (resolved in Slice 4).
- 13:00 CET. Slice 2: Drizzle schema for 18 tables (3 rituals + 5 products-related + 5 ateliers/journal + 5 inquiry/admin/audit + 8 enums + relations). Migration 0000_initial.sql generated (drizzle-kit starts at 0000). Hand-edited to add 5 ALTER TABLE blocks (8 individual FK constraints) to auth.users for admin_users.id, products.created_by/updated_by, journal_cards.created_by/updated_by, inquiries.assigned_to, audit_log.actor_id. Build green.
- 12:05 CET. Slice 1: installed @supabase/supabase-js + @supabase/ssr + drizzle-orm + postgres + zod + drizzle-kit + tsx. Scaffolded .env.example, .env.local (gitignored), drizzle.config.ts.
- 11:00 CET. Sprint 2 kickoff: spec at `.project/specs/2026-05-12-sprint-2-admin-db-design.md`. Supabase project `jnparcnvkghiuryarbac` (BARBARIA DASH, eu-west-1) provisioned, MCP authenticated, public schema empty and ready for migrations. Phase A scope: products/journal/ateliers CRUD admin + read-only inquiry inbox + audit log.

---

## 2026-05-11

- 20:00 CET. Polish 2: hero photo swapped to user-supplied source (hero-atlas.jpg, 194 KB). MenuDrawer Corporate section trimmed: removed Bespoke Customisation and Logistics & Lead Times rows plus their i18n keys; kept B2B Concierge.
- 19:30 CET — Post-launch polish: header active state, em-dash audit, rich MenuDrawer (icons + Discover/Corporate sections + CTA), CredentialStrip marquee, hero photo replaces gradient.
- 18:42 CET — Task 14: Sprint 1 complete. All 40 tests green. Opening PR to master.
- 06:45 CET — Task 13: Playwright + axe-core test suites — smoke (routes + redirects), functional (inquiry flow + locale + mailto), a11y (4 pages). Smoke (22 tests) and functional (4 tests) all green. A11y (4 tests) BLOCKED on real source bug: `text-bb-secondary` (#c5a059) fails WCAG 2 AA color-contrast (2.33:1 vs 4.5:1 required) on the `#fcf9f3` background across Eyebrow components site-wide. Test fixes applied: (1) `.first()` on Next button to avoid Next.js dev toolbar conflict, (2) exact labels for Quantity/Event date/Occasion to avoid sidebar aria-label matches, (3) selectOption uses exact string "Year-end".
- 05:30 CET — Task 12: 301-redirected /cosmetics, /food, /textile, /order, /about → new IA; deleted retired routes, components, legacy exports; renamed contact_b2b → contact namespace.
- 04:15 CET — Task 11: Contact 2-step concierge form + sticky inquiry sidebar + mailto submit.
- 00:30 CET — Task 10: editorial pages — Story (3 chapters) + Ateliers (6 cooperatives) + Journal (1 feature + 5 standards).
- 23:55 CET — Task 9: PDP at /product/[id] — sticky image stack, spec column, proof strip, ritual steps, cooperative band, related row.
- 23:15 CET — Task 8: Category page /rituals/[world] with sub-chips + filter rail + sortable grid.
- 22:45 CET — Task 7: Home — Hero + CredentialStrip + EditorialBlock + BentoRituals + Heritage3Up. ShellChrome main top-padding removed; hero pages render edge-to-edge.
- 22:10 CET — Task 6: data layer — 17 products, 3 rituals, full i18n catalogue.
- 21:30 CET — Task 5: Footer + MenuDrawer + InquiryDrawer wired into ShellChrome.
- 21:00 CET — Task 4: Header (sticky transparent→sand) + ShellChrome wrapper.
- 20:30 CET — Task 3: rename cart-context → inquiry-context, storage key migrated to bb.inquiry.
- 20:05 CET — Task 2: primitives — Reveal, Eyebrow, DisplayHeading, Photo, Icon.
- 19:30 CET — Task 1: design tokens + next/font wiring landed.
- 18:15 CET — Sprint 1 implementation plan written: `.project/plans/2026-05-11-stitch-redesign-port.md`. 14 tasks, bite-sized TDD-flavored steps, locked file structure, risk register. Ready for subagent dispatch.
- 17:30 CET — Scope expanded mid-session: user added admin dashboard + SQL DB + analytics ask. Refused to fold into Sprint 1; decomposed into 3 sequential sprints (redesign port → DB+admin → inquiry backend+analytics). Backlog created at `.project/specs/_backlog.md`.
- 17:00 CET — Spec written for Sprint 1 (Stitch redesign port) at `.project/specs/2026-05-11-stitch-redesign-port-design.md`. Locks taxonomy mapping: 3 rituals (Hammam/Botanical/Heritage), `/food` retires (was "Coming soon" placeholder, never shipped), oils + serums migrate into Botanical, existing textile into Heritage.
- 16:45 CET — `.project/` governance scaffolded: `CHANGELOG.md` (this file), `DECISIONS.md`, `specs/_backlog.md`.
- 16:30 CET — Build verified green on cloned `master`: Next 16.2.1 + Turbopack, 5.8s compile, all routes type-clean. One warning: lockfile root inferred wrong (fixed in same commit by setting `turbopack.root` in `next.config.ts`).
- 16:15 CET — Branch `feat/stitch-redesign` cut off `master`.
- 16:00 CET — Repo cloned from `github.com/Taha-ElBouzidi/barbaria-morocco-website` to `D:\dev\Havok\BARBARIA\LATEST\`. `npm install` clean (651 packages, 11 vulns — deferred to follow-up audit).
