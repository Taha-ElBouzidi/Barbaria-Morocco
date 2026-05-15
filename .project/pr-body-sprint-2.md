# Sprint 2 , Admin Dashboard + Supabase Backend

22 commits across 18 slices. Moves Barbaria's catalogue from in-repo TS files to a Postgres-backed admin dashboard, with the public site reading from DB via ISR. The redesign port (Sprint 1) stays visually unchanged; this PR is pure backend + admin shell.

## What ships

### Database (Supabase Postgres 17, eu-west-1)
- **18 tables** in `public` schema: products + translations + images + application steps + facets, rituals + subcategories, ateliers, journal cards, inquiries (Sprint 3 wires the form), admin users, audit log
- **8 enum types** for status / role / locale / facet axes
- **33 RLS policies** , anon reads published rows on the catalogue; admins (membership in `admin_users`) read everything and write the catalogue
- **5 updated_at triggers** + **7 audit triggers** + a `log_audit()` SECURITY DEFINER function (REVOKE EXECUTE from anon/authenticated so it can't be called as an RPC)
- **`product-images` Storage bucket** with 8 MB limit, MIME allowlist (jpeg/png/webp/avif), public read + admin-scoped write
- `get_advisors(security)` → **zero lints**

### Migrations + seed
- Drizzle schema in `db/schema.ts` with all 18 tables + relations
- 5 migration SQL files in `db/migrations/` (initial schema, RLS, triggers, storage, log_audit lockdown)
- `db/seed.ts` (npm run seed) , idempotent script that pulls the existing `lib/{products,rituals,editorial}.ts` data into the DB
- **Seeded counts: 17 products, 34 translations, 20 images, 55 product-facet links, 36 facets, 6 ateliers + 12 translations, 6 journal cards + 12 translations, 83 audit_log entries**

### Auth (magic-link only, no passwords)
- `/admin/login` server-action form with Zod email validation
- `/admin/auth/callback` exchanges the OTP code, verifies `admin_users` membership, auto-bootstraps the first admin if `admin_users` is empty AND `BOOTSTRAP_ADMIN_EMAIL` matches
- `/admin/logout` POST + GET handlers
- `proxy.ts` middleware: wraps next-intl with Supabase session refresh; gates `/admin/*` with a redirect-to-login if not signed in or not in `admin_users`
- Cross-platform: redirect URL derived from request host so localhost / Vercel previews / prod all work without env-var changes (per-environment redirect URL allowlist in Supabase Dashboard is the gate)

### Public site
- All public routes now read from Supabase via `lib/data/*` helpers (server-side, RLS-gated, joined queries return locale-resolved flat shapes)
- ISR safety net on every public route (`revalidate=60`)
- `ProductCatalogueProvider` hydrates the inquiry drawer/sidebar with a server-fetched minimal product map per request
- All 40 existing Playwright tests still green

### Admin UI (`/admin/*`)
- **Shell** , sidebar nav (Dashboard / Products / Journal / Ateliers / Rituals / Facets / Inquiries / Activity), top bar with admin name + role + sign-out, route-group `(auth)` for unauthenticated subroutes
- **Dashboard** , 4 stat tiles (published products / drafts / ateliers / journal), quick actions, recent activity feed
- **Products CRUD** , list with search/ritual/status filters, create + edit form with identity / EN+FR translations / facet multi-select / image upload (up/down reorder, no drag-drop in v1) / 0-3 application steps, status toggle (draft/published) + delete with confirm
- **Journal CRUD** , same pattern, simpler form
- **Ateliers CRUD** , same pattern, no status toggle
- **Rituals editor** , read-only list of 3 worlds; per-ritual edit page covers translations + hero + sort_order + sub-categories (add/rename/reorder/delete-with-protection)
- **Facets editor** , single page, 5 axis sections, inline edit, delete blocked if products reference the facet
- **Inquiries inbox** , read-only list + detail. Empty in Sprint 2 (Sprint 3 wires the form to DB writes)
- **Activity log** , paginated audit_log table with entity-type / action / date-range filters; expand-to-diff per row

### Tests
- **50 Playwright tests passing**
  - 40 public route + redirect + functional + axe (unchanged from Sprint 1)
  - 9 admin smoke (login render, error/sent states, invalid email guard, 5 route-guard redirects)
  - 1 admin axe scan on `/admin/login`
- `playwright.config.ts` tuned: single worker locally + 1 retry to swallow Turbopack cold-start flakes (CI keeps parallel)

## Issues found during the sprint and fixed

- **Service role key pasted in chat by user** → advised immediate rotation; documented in CHANGELOG
- **`log_audit()` was auto-exposed as `/rest/v1/rpc/log_audit`** to anon + authenticated roles → REVOKE EXECUTE, triggers still fire
- **Admin login infinite redirect loop** → `requireAdmin()` was running on `/admin/login` itself; switched to conditional `getCurrentAdmin()` + AdminShell render
- **Missing root `<html><body>` tags** in admin layout → added
- **WCAG: login error text 4.29:1** (under AA 4.5) → switched to `text-bb-primary` (13.39:1)

## Setup checklist before this PR is usable in production

1. **Rotate the Supabase service_role key** if it was ever shared in chat (Supabase Dashboard → Settings → API → Reset)
2. **Vercel env vars** for Production + Preview environments:
   ```
   NEXT_PUBLIC_SUPABASE_URL          = https://jnparcnvkghiuryarbac.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY     = sb_publishable_17a3e7YmEzCFbLLbkVkgEA_e4HpqpDq
   SUPABASE_SERVICE_ROLE_KEY         = <rotated key>
   BOOTSTRAP_ADMIN_EMAIL             = ta.elbouzidi@gmail.com
   ```
3. **Supabase Dashboard → Authentication → URL Configuration:**
   - Site URL = production Vercel URL (or `https://barbariamorocco.com` once domain is bound)
   - Redirect URLs: add `https://barbaria-morocco-website-*.vercel.app/admin/auth/callback` (wildcard covers previews + prod) and `http://localhost:3000/admin/auth/callback`
4. After merge, **first admin bootstrap**: visit `<prod>/admin/login`, sign in with `ta.elbouzidi@gmail.com`. Callback auto-creates the `admin_users` row. Subsequent admins added through the dashboard (Sprint 2.5).

## Out of scope (deferred to follow-up PRs)

### Sprint 2.5 polish
- Authenticated admin test fixture + admin-CRUD Playwright coverage + axe scans on authenticated routes
- Multi-user admin (roles: sales / concierge / readonly)
- Settings page (brand info, social URLs, concierge address)
- Bulk CSV product import
- Drag-and-drop image reorder
- Server-side full-text search on product names
- Inline facet creation

### Sprint 3
- Contact form → DB write (replace mailto) + Resend transactional email + Cloudflare Turnstile
- Inquiry pipeline UI (status transitions, internal notes editor)
- Business analytics / Insights dashboard

## Files

- **22 commits**, **+~5,000 lines** added (db/, app/admin/*, lib/data/*, lib/supabase/*, lib/admin/*, components/admin/*, tests/admin-*.spec.ts)
- Deletions intentionally minimal: `lib/{products,rituals,editorial}.ts` remain in repo as seed sources until Sprint 2.5 retires them
- `next.config.ts`, `proxy.ts`, `playwright.config.ts` modified

🤖 Generated with [Claude Code](https://claude.com/claude-code)
