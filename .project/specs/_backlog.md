# Sprint Backlog — Sprints 2 & 3

Placeholder for the work decomposed out of Sprint 1 (the Stitch redesign port). Each gets its own full spec when its sprint starts. Notes here exist so context isn't lost.

---

## Sprint 2 — Admin + Database

**Goal:** Move product catalogue from `lib/products.ts` to a real database with an admin UI for Taha (and invited team) to manage products, translations, images, and view inquiries (once Sprint 3 lands).

### Open questions to resolve before specing

1. **DB host:** Supabase (recommended — Postgres + Auth + Storage + dashboard, generous free tier, MCP already exists in tooling), Neon (Postgres only, leaner), Vercel Postgres (tight Vercel integration but pricier at scale), self-hosted (rejected — ops overhead).
2. **ORM:** Prisma (mature, type-safe, migration tool) vs Drizzle (lighter, SQL-native, faster). Lean Drizzle for a small schema, Prisma if we want the studio UI for free.
3. **Admin auth:** Supabase Auth with magic links + role table, or BetterAuth, or NextAuth? Decision driven by DB choice — if Supabase, use its Auth.
4. **Admin scope:** product CRUD only, or also journal editor, ateliers editor, copy/translation editor, settings (brand info, concierge address)?
5. **Image upload:** Supabase Storage vs Cloudinary vs Vercel Blob. Tied to DB host choice.
6. **Internationalization in DB:** column-per-locale (`name_en`, `name_fr`) vs separate `translations` table joined by product_id. Lean toward separate table — easier to add Arabic later.

### Likely schema (subject to spec session)

```
products             ( id pk, slug, world, sub, moq, lead, origin, hero_image_id, published_at, created_at, updated_at )
product_translations ( product_id fk, locale, name, short, lede, application_steps_json )
images               ( id pk, product_id fk nullable, path, alt_text, sort_order )
facets               ( id pk, type, value_en, value_fr )
product_facets       ( product_id fk, facet_id fk )       -- many-to-many
inquiries            ( id pk, status, company, contact_name, email, phone, quantity, occasion, message, locale, created_at )
inquiry_items        ( inquiry_id fk, product_id fk, qty )
admin_users          ( id pk, email, role, last_seen_at )  -- maps to Supabase auth.users
```

### Security must-haves

- Row-level security: only admin_users can write to `products`, `product_translations`, `images`, `facets`. Public read for published products only.
- All admin routes server-side authenticated (middleware check + per-route guard).
- Image uploads: server-side MIME + size validation, virus scan if available, signed URLs for storage access.
- CSRF protection on all admin form submits.
- Rate limit on public reads (Cloudflare or Vercel WAF).
- Audit log: every admin mutation writes to `audit_log` table (who / what / when / before-state / after-state).
- Migrations: never destructive on a column with prod data without an explicit two-step (add new → backfill → switch reads → drop old).

### Data migration

Seed script: parse `lib/products.ts` (still in repo from Sprint 1) → emit SQL inserts for products + translations + images + facets. One-shot, kept in repo as `lib/seed/` for repeatability.

After Sprint 2, `lib/products.ts` is deleted. Frontend reads via Supabase client at build-time with ISR (60s revalidate or on-demand revalidation triggered by admin mutations).

---

## Sprint 3 — Inquiry backend + business analytics

**Goal:** Replace `mailto:` inquiry submission with a real form POST + DB write + transactional email. Build an admin "Insights" view that turns inquiries into business intelligence.

### Open questions

1. **Email provider:** Resend (clean, free tier 100/day, dev-friendly), Postmark (transactional gold-standard), or SendGrid (legacy, complex). Lean Resend.
2. **Spam protection:** Cloudflare Turnstile (free, no captcha for most users) vs hCaptcha vs honeypot-only. Lean Turnstile + honeypot.
3. **Analytics scope:** business metrics only (inquiries, conversion), or also traffic analytics? `@vercel/analytics` already covers traffic. Recommend: pure business view in admin, leave traffic to Vercel.

### Endpoints

- `POST /api/inquiry` — Turnstile verify → validate → DB insert → Resend email to concierge + autoresponder to buyer → 200.
- `GET /admin/inquiries` — list view, filterable by status, locale, date.
- `GET /admin/inquiries/[id]` — detail view, status mutation (new → contacted → quoted → won/lost).
- `GET /admin/insights` — server-rendered dashboard: inquiries-per-week chart, top products by add-to-inquiry events, locale split, source page split (which page added the product), avg items per inquiry, conversion funnel.

### Security must-haves

- Server-side Turnstile validation (never trust client token alone).
- IP-based rate limit on `/api/inquiry` (5/min/IP, 50/day/IP). Stricter on second offense.
- Inquiry body sanitized for HTML before email (defense against email-injection via free-text field).
- Resend webhook for bounces/complaints, writes to inquiry record.
- Admin "Insights" charts query DB read-only via parameterized SQL (never string interpolation).
- All admin GETs are server components — never client-fetched with admin role.

### Tracking events

Frontend emits to a thin events table (or Plausible custom events if we stay light):
- `inquiry_item_added` ( product_id, source_page, locale )
- `inquiry_submitted` ( inquiry_id, item_count, locale )
- `product_viewed` ( product_id, source, locale )

Aggregated server-side for Insights view. **No third-party tracking pixels** — keep first-party only.

---

## Sprint 2.5 cleanup

### Authenticated admin test coverage (deferred from Sprint 2 Slice 17)

Sprint 2 ships login-page + route-guard smoke tests + axe scan on /admin/login.
Authenticated admin coverage is deferred because the Supabase magic-link auth
fixture is brittle (requires service-role user creation, link generation,
code extraction, cookie injection, storageState save/load). Approach for
Sprint 2.5:

1. `tests/fixtures/admin-auth.ts` — exposes a Playwright fixture that:
   a. Uses the service-role client to ensure a test admin user exists in
      auth.users + admin_users (idempotent, fixed UUID).
   b. Calls `supabase.auth.admin.generateLink({ type: 'magiclink', email })`.
   c. Extracts the code from the returned action_link URL.
   d. Calls `supabase.auth.exchangeCodeForSession(code)` via a fresh server client
      to obtain the auth cookies.
   e. Saves the cookies to a Playwright storageState JSON file.
2. Authenticated admin tests reuse the storageState:
   - dashboard renders + stat tile counts > 0
   - create product flow end to end
   - status toggle (draft -> published) + revalidate -> public site shows
   - delete product
   - inquiries inbox empty state
   - activity log shows rows
3. Axe scans on /admin, /admin/products, /admin/products/[id], /admin/journal.

---

## Out of scope for both sprints (revisit later)

- Customer accounts / buyer login (B2B contacts may want history — but adds significant auth + GDPR surface)
- Multi-currency / multi-region pricing (Barbaria is concierge-quote model, no list prices)
- Real-time inventory (no checkout, so no inventory)
- AI-generated product copy / image generation
- Native mobile apps
