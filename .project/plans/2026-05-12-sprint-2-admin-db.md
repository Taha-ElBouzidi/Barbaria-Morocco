# Sprint 2 Implementation Plan , Admin + Supabase

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Barbaria catalogue from in-repo TS data files to a Supabase Postgres backend with a `/admin/*` dashboard. Public site reads from DB via ISR with on-demand revalidation.

**Architecture:** Drizzle ORM for schema + queries. `@supabase/ssr` for auth cookies on the server. `@supabase/supabase-js` service-role client for admin route handlers. Public site is async RSC reading from DB. Admin is server components with Server Action / Route Handler mutations.

**Tech Stack:** Next.js 16 (existing), React 19 (existing), Postgres 17 (Supabase), Drizzle ORM, `@supabase/ssr`, `@supabase/supabase-js`, Zod, postgres.js (Drizzle driver).

**Spec:** `.project/specs/2026-05-12-sprint-2-admin-db-design.md`
**Branch:** `feat/sprint-2-admin-db`
**Supabase project:** `jnparcnvkghiuryarbac` (already provisioned; empty public schema; MCP authenticated)

---

## Pre-flight context (every implementer reads this)

- Read `AGENTS.md` and `CLAUDE.md` at repo root first.
- Next.js 16 has breaking changes from training data; consult `node_modules/next/dist/docs/` for any specifics.
- Sprint 1 baseline (master at `5cbfa0c`) ships the redesign. Don't regress public routes.
- 40 Playwright tests must still pass at the end of every slice.
- Supabase MCP is available , use `mcp__claude_ai_Supabase__*` tools for read/list/apply-migration/execute-sql.
- Never commit secrets. Service role key goes in Vercel + a local `.env.local` (gitignored).
- Every slice ends: build green, single commit, CHANGELOG entry, no `--no-verify`.

---

## Slice 1 , Dependencies + env scaffolding

**Files:** `package.json`, `package-lock.json`, `.env.example`, `.env.local` (gitignored), `drizzle.config.ts`, `.gitignore`.

- [ ] Install deps:
  ```bash
  npm install @supabase/supabase-js @supabase/ssr drizzle-orm postgres zod
  npm install -D drizzle-kit @types/pg
  ```
- [ ] Create `.env.example`:
  ```env
  # Supabase
  NEXT_PUBLIC_SUPABASE_URL=https://jnparcnvkghiuryarbac.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_17a3e7YmEzCFbLLbkVkgEA_e4HpqpDq
  SUPABASE_SERVICE_ROLE_KEY=__set_in_vercel__

  # Direct Postgres connection (for Drizzle migrations + seed)
  DATABASE_URL=postgresql://postgres.jnparcnvkghiuryarbac:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
  ```
- [ ] Create `.env.local` (NOT tracked) with the actual values for local dev. Service role key fetched from Supabase dashboard manually.
- [ ] Append to `.gitignore`: `.env.local`, `.env.*.local`.
- [ ] Create `drizzle.config.ts`:
  ```ts
  import { defineConfig } from 'drizzle-kit';
  export default defineConfig({
    schema: './db/schema.ts',
    out: './db/migrations',
    dialect: 'postgresql',
    dbCredentials: { url: process.env.DATABASE_URL! },
  });
  ```
- [ ] Build: `npm run build`. Exit 0.
- [ ] CHANGELOG: `Slice 1: install Drizzle + Supabase deps, env scaffolding.`
- [ ] Commit: `chore(deps): drizzle, supabase, zod for sprint 2`

---

## Slice 2 , Drizzle schema

**Files:** `db/schema.ts` (new).

- [ ] Implement all 13 tables from spec section 4 as Drizzle pgTable definitions.
- [ ] Tables: `rituals`, `ritualTranslations`, `ritualSubcategories`, `ritualSubcategoryTranslations`, `products`, `productTranslations`, `productImages`, `productApplicationSteps`, `facets`, `productFacets`, `ateliers`, `atelierTranslations`, `journalCards`, `journalCardTranslations`, `inquiries`, `inquiryItems`, `adminUsers`, `auditLog`.
- [ ] Use `pgEnum` for status / role / locale / facet-type / audit-action where appropriate.
- [ ] Define relations via `relations()` for joins later.
- [ ] Generate first migration:
  ```bash
  npx drizzle-kit generate --name initial
  ```
  Produces `db/migrations/0001_initial.sql`.
- [ ] Inspect the generated SQL. Verify enum types, FK directions, indexes match spec.
- [ ] Build: exit 0.
- [ ] CHANGELOG: `Slice 2: Drizzle schema for 18 tables, migration 0001 generated.`
- [ ] Commit: `feat(db): drizzle schema + initial migration`

---

## Slice 3 , Apply migration 0001 to Supabase

**Action:** Apply via Supabase MCP `apply_migration` tool.

- [ ] Read the generated `db/migrations/0001_initial.sql`.
- [ ] Call `mcp__claude_ai_Supabase__apply_migration` with `project_id="jnparcnvkghiuryarbac"`, `name="0001_initial"`, `query=<file contents>`.
- [ ] Verify with `mcp__claude_ai_Supabase__list_tables` → expect all public tables present.
- [ ] Verify with `mcp__claude_ai_Supabase__get_advisors` → no critical warnings yet (RLS comes in slice 4).
- [ ] CHANGELOG: `Slice 3: migration 0001 applied to Supabase remote.`
- [ ] Commit: `chore(db): apply migration 0001 to supabase` (commit the migration file; no source change)

---

## Slice 4 , RLS policies + service role bypass

**Files:** `db/migrations/0002_rls.sql` (hand-written).

- [ ] Write `0002_rls.sql` with:
  - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` for every public table.
  - Anon read policy for: `products` (status='published'), `product_translations`, `product_images`, `product_application_steps`, `product_facets`, `facets`, `rituals`, `ritual_translations`, `ritual_subcategories`, `ritual_subcategory_translations`, `ateliers`, `atelier_translations`, `journal_cards` (status='published'), `journal_card_translations`.
  - Authenticated admin policy (all CRUD) for every table, gated by `auth.uid() IN (SELECT id FROM admin_users)`.
  - `audit_log` and `admin_users` and `inquiries`/`inquiry_items`: no anon access at all; admin read; only `service_role` can INSERT.
- [ ] Apply via `apply_migration`.
- [ ] Verify with `get_advisors(type='security')` → expect zero CRITICAL warnings.
- [ ] CHANGELOG: `Slice 4: RLS policies for all 18 tables, service-role bypass for triggers.`
- [ ] Commit: `feat(db): rls policies`

---

## Slice 5 , Triggers (updated_at + audit log)

**Files:** `db/migrations/0003_triggers.sql`.

- [ ] Enable `moddatetime` extension:
  ```sql
  CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;
  ```
- [ ] For each table with `updated_at`: create a `BEFORE UPDATE` trigger that calls `extensions.moddatetime('updated_at')`.
- [ ] Write a `log_audit()` plpgsql function that captures `actor_id` from `auth.uid()`, builds before/after JSON from `OLD`/`NEW`, and inserts into `audit_log`.
- [ ] Create `AFTER INSERT OR UPDATE OR DELETE` triggers on: `products`, `journal_cards`, `ateliers`, `rituals`, `ritual_subcategories`, `facets`, `inquiries`. Each trigger calls `log_audit()` with the right `entity_type` constant.
- [ ] Apply migration. Verify by manually inserting + updating a row via `execute_sql` and checking `audit_log` has entries.
- [ ] CHANGELOG: `Slice 5: updated_at + audit_log triggers.`
- [ ] Commit: `feat(db): triggers for updated_at and audit log`

---

## Slice 6 , Storage bucket setup

**Action:** create bucket `product-images`, set public-read policy.

- [ ] Use `execute_sql` to insert into `storage.buckets`:
  ```sql
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('product-images', 'product-images', true, 8388608, ARRAY['image/jpeg','image/png','image/webp','image/avif']);
  ```
- [ ] Set RLS policies on `storage.objects` for this bucket:
  - Public read: `bucket_id = 'product-images'`
  - Authenticated admin write: `bucket_id = 'product-images' AND auth.uid() IN (SELECT id FROM admin_users)`
- [ ] Verify with `get_advisors(type='security')`.
- [ ] CHANGELOG: `Slice 6: product-images storage bucket created with public-read + admin-write policies.`
- [ ] Commit: `feat(storage): product-images bucket setup`
  (No file change; commit a `db/migrations/0004_storage.sql` capturing the SQL for posterity even though it's applied via execute_sql.)

---

## Slice 7 , Supabase clients + auth helpers

**Files:** `lib/supabase/server.ts`, `lib/supabase/browser.ts`, `lib/supabase/service.ts`, `lib/admin/auth.ts`.

- [ ] `lib/supabase/server.ts` , `createServerClient` using `@supabase/ssr` and Next 16's `cookies()` from `next/headers`.
- [ ] `lib/supabase/browser.ts` , `createBrowserClient` for client components.
- [ ] `lib/supabase/service.ts` , `createServiceRoleClient` using `SUPABASE_SERVICE_ROLE_KEY` (server-only, used inside admin route handlers).
- [ ] `lib/admin/auth.ts`:
  - `requireAdmin()` , reads session via server client, looks up `admin_users` row by id. Returns admin or throws (which the layout catches and redirects to /admin/login).
  - `getCurrentAdmin()` , same but returns null instead of throwing.
- [ ] Build green. Tests still 40/40.
- [ ] CHANGELOG: `Slice 7: Supabase client factories + requireAdmin helper.`
- [ ] Commit: `feat(auth): supabase ssr clients + admin guard helpers`

---

## Slice 8 , Admin middleware in proxy.ts

**Files:** `proxy.ts` (modify).

- [ ] Wrap existing next-intl middleware: check if request path matches `/admin/*` (not `/admin/login` or `/admin/auth/callback`).
- [ ] If so, read Supabase session; if absent or user not in `admin_users`, redirect to `/admin/login`.
- [ ] Otherwise proceed to next-intl middleware.
- [ ] Test: hit `/admin` without session → 307 to `/admin/login`. Hit `/admin/login` directly → 200.
- [ ] Build green. Existing 40 tests still pass.
- [ ] CHANGELOG: `Slice 8: proxy.ts admin route guard.`
- [ ] Commit: `feat(auth): admin route guard in proxy.ts`

---

## Slice 9 , Login + magic-link callback + logout

**Files:** `app/admin/login/page.tsx`, `app/admin/login/actions.ts`, `app/admin/auth/callback/route.ts`, `app/admin/logout/route.ts`.

- [ ] `/admin/login` page (RSC): centered card with email input. Form posts to a server action.
- [ ] Server action: validates email, calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: <SITE_URL>/admin/auth/callback } })`. Returns success/error UI.
- [ ] `/admin/auth/callback` route handler: exchanges the code for a session, verifies email is in `admin_users`. If yes, redirect to `/admin`. If no, sign out and redirect to `/admin/login?error=unauthorized`.
- [ ] `/admin/logout` route handler: calls `signOut()`, clears cookies, redirects to `/`.
- [ ] Insert Taha's `admin_users` row manually via `execute_sql`:
  ```sql
  -- Step A: create the auth user (or use Supabase dashboard "Invite user" with Taha's email).
  -- Step B: insert into admin_users with the returned id.
  INSERT INTO public.admin_users (id, email, role, display_name)
  VALUES ('<auth-user-uuid>', 'ta.elbouzidi@gmail.com', 'admin', 'Taha');
  ```
- [ ] End-to-end test (manual): submit email, click magic link from inbox, land on `/admin`, logout works.
- [ ] CHANGELOG: `Slice 9: magic-link auth flow live; Taha bootstrap admin user.`
- [ ] Commit: `feat(admin): magic-link login + callback + logout`

---

## Slice 10 , Seed script

**Files:** `db/seed.ts`, `package.json` (add `seed` script).

- [ ] Write `db/seed.ts`:
  - Connect via service role client.
  - Read `WORLDS`, `SUBCATS`, `FACETS` from `lib/rituals.ts`. Upsert each into the rituals + sub-cat + facet tables (with translations).
  - Read `PRODUCTS` from `lib/products.ts`. For each product: upsert product row, upsert two `product_translations` rows (en + fr), upsert `product_images` rows (path = existing `/brand_photos/...`), upsert `product_application_steps` if present, link `product_facets` via tags.
  - Read `ATELIERS` and `JOURNAL` from `lib/editorial.ts`. Upsert similarly.
  - All inserts are `on conflict ... do update`. Idempotent.
- [ ] Add npm script: `"seed": "tsx db/seed.ts"`.
- [ ] Install `tsx` as devDep.
- [ ] Run `npm run seed`. Verify with `execute_sql`:
  ```sql
  SELECT count(*) FROM products;  -- expect 17
  SELECT count(*) FROM ateliers;  -- expect 6
  SELECT count(*) FROM journal_cards;  -- expect 6
  SELECT count(*) FROM product_translations;  -- expect 34 (17 × 2 locales)
  ```
- [ ] CHANGELOG: `Slice 10: seed script ran successfully. 17 products + 6 ateliers + 6 journal cards in DB.`
- [ ] Commit: `feat(db): one-shot seed from lib/products + lib/editorial`

---

## Slice 11 , Public site data layer

**Files:** `lib/data/products.ts`, `lib/data/rituals.ts`, `lib/data/ateliers.ts`, `lib/data/journal.ts`, `lib/data/inquiries.ts`.

- [ ] `lib/data/products.ts`:
  - `getProductBySlug(slug, locale)` , joined query returning product + translation + images + steps + facets
  - `getProductsByRitual(ritualId, locale)` , list of products, with their hero image + first-tag eyebrow
  - `getHeroProductsByRitual(ritualId, locale)`
  - `getAllProductSlugs()` , for `generateStaticParams`
  - `getMinimalProductMap(locale)` , returns Map<id, {name, image}> for inquiry drawer lookups
- [ ] `lib/data/rituals.ts`: `getAllWorlds(locale)`, `getWorld(id, locale)`, `getSubcatsForWorld(id, locale)`.
- [ ] `lib/data/ateliers.ts`: `getAllAteliers(locale)`.
- [ ] `lib/data/journal.ts`: `getAllJournalCards(locale)` (published only on public site).
- [ ] All functions use the server Supabase client (`createServerClient`).
- [ ] Build green. (No public routes converted yet , that's slice 12.)
- [ ] CHANGELOG: `Slice 11: lib/data/* helpers for DB-backed public reads.`
- [ ] Commit: `feat(data): server-side data helpers reading from supabase`

---

## Slice 12 , Convert public routes to async + DB reads

**Files:** `app/[locale]/page.tsx`, `app/[locale]/rituals/[world]/page.tsx`, `app/[locale]/product/[id]/page.tsx`, `app/[locale]/ateliers/page.tsx`, `app/[locale]/journal/page.tsx`, `app/sitemap.ts`, `components/shell/InquiryDrawer.tsx`, `components/contact/InquirySidebar.tsx`.

- [ ] Convert each route's data source from `import { PRODUCTS, ... }` to `await getProductBySlug(...)`.
- [ ] Update `generateStaticParams` to call `getAllProductSlugs()` (now async DB-backed).
- [ ] Add `export const revalidate = 60;` to each public route as ISR safety net.
- [ ] `app/sitemap.ts`: query DB for product slugs.
- [ ] InquiryDrawer + InquirySidebar: receive `productMap` via a Provider mounted in `app/[locale]/layout.tsx`. The layout calls `getMinimalProductMap(locale)` and passes to a new `ProductCatalogueProvider` client component, which Drawer/Sidebar read from.
- [ ] Run `npm test`. **All 40 Playwright tests must still pass.** If a test fails because of data drift, audit the data layer query for missing fields. If it fails because of a real bug, fix the bug.
- [ ] Build green.
- [ ] CHANGELOG: `Slice 12: public routes read from Supabase. 40 tests still green.`
- [ ] Commit: `feat(public): swap lib/products imports for lib/data DB reads`

---

## Slice 13 , Admin shell + dashboard

**Files:** `app/admin/layout.tsx`, `app/admin/page.tsx`, `components/admin/AdminShell.tsx`, `components/admin/Sidebar.tsx`, `components/admin/StatTile.tsx`, `components/admin/ActivityFeed.tsx`.

- [ ] `app/admin/layout.tsx`: server component. Calls `requireAdmin()` (redirects if not signed in). Renders `<AdminShell>` with children.
- [ ] `AdminShell`: left sidebar + top bar + main content. Different visual register from public site: denser, more controls visible, but uses the same `--bb-*` tokens.
- [ ] `Sidebar`: nav links to Dashboard, Products, Journal, Ateliers, Rituals, Inquiries, Activity. Active state via `aria-current`.
- [ ] `/admin` page: 4 stat tiles + recent activity feed. Tiles read `count(*)` from each table via the data layer. ActivityFeed reads last 10 audit_log entries.
- [ ] Build green.
- [ ] CHANGELOG: `Slice 13: admin shell + dashboard.`
- [ ] Commit: `feat(admin): shell + dashboard`

---

## Slice 14 , Admin products CRUD

**Files:** `app/admin/products/page.tsx`, `app/admin/products/new/page.tsx`, `app/admin/products/[id]/page.tsx`, `app/admin/products/[id]/actions.ts`, `components/admin/ProductList.tsx`, `components/admin/ProductEditor.tsx`, `components/admin/TranslationTabs.tsx`, `components/admin/ImageManager.tsx`, `components/admin/FacetMultiSelect.tsx`, `components/admin/ApplicationStepEditor.tsx`, `app/api/admin/products/route.ts`, `app/api/admin/products/[id]/route.ts`, `app/api/admin/images/route.ts`, `app/api/admin/images/[id]/route.ts`.

- [ ] List page with search + filter + status badges.
- [ ] Create page with Zod-validated server action (or POST handler) that inserts product + translations + facets + steps.
- [ ] Edit page same shape; load existing data, render the big multi-section form.
- [ ] Image manager: drag-reorder, drag-upload (POSTs multipart to `/api/admin/images` which uploads to Supabase Storage).
- [ ] Status toggle (draft / published). On publish, call `revalidatePath('/[locale]/product/[slug]')` for affected routes (both EN + FR).
- [ ] Delete: soft-delete (status='draft') or hard-delete with cascade. Choose soft for safety.
- [ ] Audit log entries verified manually.
- [ ] Build green. Public 40 tests still pass.
- [ ] CHANGELOG: `Slice 14: admin products CRUD with image upload, translations, facets, application steps, publish workflow.`
- [ ] Commit: `feat(admin): products CRUD`

---

## Slice 15 , Admin journal + ateliers + rituals + facets

**Files:** Similar to slice 14 but simpler (fewer fields per entity).

- [ ] Journal: list + edit (EN + FR kicker/headline, date, feature toggle, status, image).
- [ ] Ateliers: list + edit (single-locale name, region, since_year, image, EN + FR description).
- [ ] Rituals: read-only list (3 rows) + per-ritual sub-cat editor (rename, reorder, add new sub-cats).
- [ ] Facets: list + add/rename/reorder (no delete if facets are referenced by products , show count).
- [ ] Each save triggers `revalidatePath()` for the appropriate public routes.
- [ ] Build green.
- [ ] CHANGELOG: `Slice 15: admin CRUD for journal, ateliers, rituals + sub-cats, facets.`
- [ ] Commit: `feat(admin): journal/ateliers/rituals/facets CRUD`

---

## Slice 16 , Admin inquiries (read-only) + activity log

**Files:** `app/admin/inquiries/page.tsx`, `app/admin/inquiries/[id]/page.tsx`, `app/admin/activity/page.tsx`, `components/admin/ActivityLogTable.tsx`.

- [ ] `/admin/inquiries`: list view. Empty state for Sprint 2 (table will be empty). Sprint 3 wires the form to write here.
- [ ] `/admin/inquiries/[id]`: detail view (read-only). Sprint 3 adds the status changer.
- [ ] `/admin/activity`: paginated table of `audit_log` entries. Filterable by actor, entity type, action, date range.
- [ ] Build green.
- [ ] CHANGELOG: `Slice 16: admin inquiries (read-only) + activity log view.`
- [ ] Commit: `feat(admin): inquiries placeholder + activity log`

---

## Slice 17 , Admin tests (Playwright + axe)

**Files:** `tests/admin-smoke.spec.ts`, `tests/admin-a11y.spec.ts`, `tests/fixtures/admin-auth.ts`.

- [ ] Fixture: programmatically sign in a test admin (use service role client to insert a test user into auth.users + admin_users, then generate a session JWT and inject as cookie).
- [ ] Smoke tests:
  - `/admin/login` renders form
  - Authenticated admin reaches `/admin` and sees dashboard
  - Create product flow end to end (fill form, save as draft, edit, publish)
  - Verify product appears on public site after publish + revalidation
- [ ] A11y test: axe scan on `/admin` and `/admin/products/[id]`. Zero serious/critical.
- [ ] All tests pass: 40 public + N admin.
- [ ] CHANGELOG: `Slice 17: admin Playwright + axe tests.`
- [ ] Commit: `test(admin): smoke + a11y suites`

---

## Slice 18 , Final QA, PR, merge

- [ ] `npm run build` clean.
- [ ] `npm test` all green (40 public + admin).
- [ ] `get_advisors(security)` zero warnings.
- [ ] `get_advisors(performance)` review and address any HIGH-priority ones.
- [ ] Write PR body summarizing slices.
- [ ] Open PR `feat/sprint-2-admin-db → master` via `gh pr create`.
- [ ] Merge via `gh pr merge --merge`.
- [ ] Verify Vercel auto-deploys with the new code reading from DB.
- [ ] Manually log in to `/admin`, edit a product, see it live on prod after revalidation.
- [ ] CHANGELOG: `Sprint 2 complete. PR #N merged to master.`

---

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Anthropic rate limit interrupts mid-sprint | Bundle related work into larger inline executions; reserve subagents for complex slices; pause + resume across sessions if needed. |
| Drizzle schema doesn't generate the SQL we expect | Inspect every generated migration before applying; fall back to hand-written SQL if generation drifts. |
| RLS too strict , breaks public reads | Test public 40 tests after slice 4 RLS apply. If a test fails on "permission denied", relax the policy or fix the query. |
| RLS too loose , security advisor flags issues | `get_advisors(security)` after every DDL change; address immediately. |
| Service role key leak | Convention + ESLint rule: never import `lib/supabase/service` in any file under `app/[locale]/` (public) or `components/` (except `components/admin/`). |
| Public site read perf regresses (DB instead of in-process data) | ISR with 60s revalidate; on-demand revalidate on admin save; Supabase queries are fast on eu-west-1 colocated with Vercel; pool via Supabase connection pooler (port 6543). |
| Magic-link emails go to spam | Configure custom SMTP in Supabase (defer to Sprint 2.5 if not blocker). Use Supabase's hosted SMTP for v1; Taha verifies inbox delivery on slice 9. |
| Image migration hassle | Hybrid path: existing `/brand_photos/*.jpg` paths stay as relative URLs in `product_images.path`. New uploads go to Supabase Storage at `products/{id}/{file}`. Public site resolves both by checking the prefix. |
| Test fixture authentication is complex | Use Supabase Admin API's `generateLink` or insert a JWT directly. Reference Supabase docs. |

---

## Self-review

Spec coverage: every section of `2026-05-12-sprint-2-admin-db-design.md` mapped to one or more slices. Auth (sec 6) → slices 7/8/9. Schema (sec 4) → slices 2/3. RLS (sec 5) → slice 4. Storage (sec 7) → slice 6. Migration (sec 8) → slice 10. Public integration (sec 9) → slices 11/12. Admin UI (sec 10) → slices 13/14/15/16. Security (sec 12) → slices 4/7/8 + ongoing review. Tests (sec 13) → slice 17. DoD (sec 15) checked at slice 18.

No placeholders detected. Every step has concrete code references or MCP tool names.

---

## Execution

Subagent-driven execution per `superpowers:subagent-driven-development`. Slice-per-dispatch (sonnet for most, opus for slice 4 RLS + slice 8 middleware + slice 14 admin products since they have judgment surface).

Two-stage review (spec + code quality) per slice as in Sprint 1. Continuous execution; only stop at slice 18 PR open or unresolvable test failure.
