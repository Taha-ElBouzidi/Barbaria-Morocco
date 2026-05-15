# Spec , Sprint 2: Admin Dashboard + Supabase Postgres

**Date:** 2026-05-12
**Branch:** `feat/sprint-2-admin-db`
**Author:** Lead Autonomous Architect (Claude) + Taha El Bouzidi (CTO)
**Supabase project:** `BARBARIA DASH` (ref `jnparcnvkghiuryarbac`, region `eu-west-1`, Postgres 17.6)
**Spec depends on:** Sprint 1 redesign port (merged to master at `5cbfa0c`)

---

## 1. Goal

Replace the in-repo TS data files (`lib/products.ts`, `lib/editorial.ts`) with a Postgres-backed catalogue managed through an admin UI mounted at `/admin/*` on the same Next.js app. Taha (and future invited team) can create, edit, translate, and publish products, journal cards, and atelier profiles. Inquiries received via the form (still mailto in Sprint 2 , Sprint 3 wires them to DB) appear in a read-only admin inbox once Sprint 3 lands; the schema is built for it now so no migration is needed later.

---

## 2. Scope

### In scope (Sprint 2, this PR)

- Supabase project provisioning (account already created): schema, RLS, Storage bucket `product-images`, Auth magic-link config.
- New deps: `@supabase/supabase-js`, `@supabase/ssr`, `drizzle-orm`, `drizzle-kit`, `postgres` (the client `drizzle` uses), `zod` (form validation), `@types/postgres` if needed.
- DB schema with 13 tables (see Section 4) plus triggers for `updated_at` and audit logging.
- Drizzle migrations stored in `db/migrations/`. Applied to remote via `apply_migration` MCP call (each migration is one Drizzle-generated SQL file).
- TS schema definitions in `db/schema.ts` matching the DB.
- Server-side data access layer at `lib/data/*` replacing direct `PRODUCTS`/`WORLDS`/`ATELIERS`/`JOURNAL` imports.
- One-shot seed script `db/seed.ts` that pulls every product/world/sub-cat/facet/atelier/journal-card out of the current TS data files into the DB.
- Admin routes:
  - `/admin/login` , magic-link form
  - `/admin` , dashboard (counts: published products, draft products, total inquiries, recent activity)
  - `/admin/products` , list (search, filter by ritual + status, sort)
  - `/admin/products/new` + `/admin/products/[id]` , editor (all fields EN + FR, image manager, facets, application steps, draft↔published toggle)
  - `/admin/journal` , list + editor
  - `/admin/ateliers` , list + editor
  - `/admin/rituals` , read-only display of the 3 rituals + per-world sub-cat editor (rename, reorder, add new subs)
  - `/admin/inquiries` , read-only list (Sprint 3 wires the form)
  - `/admin/activity` , audit log table view (filterable by actor, entity, action)
  - `/admin/logout` , sign-out POST handler
- Auth middleware in `proxy.ts` that protects every `/admin/*` route. Anonymous users hitting `/admin/anything` redirect to `/admin/login`.
- Image upload UI uses Supabase Storage signed URLs. Validates MIME (jpg/png/webp/avif), max size 8 MB, optional resize via `sharp` server-side (TBD: defer to a follow-up if `sharp` install is too heavy on Windows).
- Public site reads from DB. Route handlers use cached server-side Supabase client. ISR with on-demand revalidation: admin save → `revalidatePath()` for affected route(s). Page caches valid for 60 s as fallback.
- Tests: Playwright admin smoke (login → product CRUD → publish → see on public site). Public 40 tests still pass.

### Deferred (Sprint 2.5 OR Sprint 3)

- **Sprint 2.5 cleanup:** multi-user admin with roles (sales / concierge / read-only), audit-log UI in admin, settings page (brand info, concierge address, social URLs), bulk CSV product import, image cropping inside the upload UI.
- **Sprint 3:** wire the contact form to `POST /api/inquiry` → DB write + Resend transactional email; spam protection (Cloudflare Turnstile); inquiry pipeline UI (status transitions: new → contacted → quoted → won/lost); insights dashboard (inquiries/week, top products, locale split, source page split).

### Out of scope (neither this sprint nor the immediate follow-ups)

- Customer accounts / buyer-side login (GDPR surface, not requested).
- Multi-currency.
- Inventory tracking (made-to-order).
- AI copy or image generation in the admin.
- Public real-time data (no need; ISR is sufficient for editorial pace).

---

## 3. Architecture

### High level

```
                ┌──────────────────────────────────────┐
                │  Vercel (Next.js 16)                 │
                │                                      │
   browser ◀──▶ │  app/[locale]/*  (public, ISR)       │
                │  app/admin/*     (server, gated)     │
                │  app/api/admin/* (mutations)         │
                └────────────┬─────────────────────────┘
                             │
                             │  @supabase/ssr  (server)
                             │  @supabase/supabase-js (admin)
                             ▼
                ┌──────────────────────────────────────┐
                │  Supabase (eu-west-1)                │
                │  ┌─────────────────────────────────┐ │
                │  │ Postgres 17                     │ │
                │  │   public.*  (13 tables)         │ │
                │  │   auth.users                    │ │
                │  │   storage.objects               │ │
                │  └─────────────────────────────────┘ │
                │  Storage: product-images bucket      │
                │  Auth:    magic-link                 │
                └──────────────────────────────────────┘
```

### Public site read path

Server components import `lib/data/*` helpers (e.g. `getProductBySlug(slug, locale)`). Helpers use the server Supabase client (`@supabase/ssr`'s `createClient` with cookies) for SSR-cached reads. Each Next.js route segment opts into static generation with revalidation:

```ts
export const revalidate = 60; // 60s ISR safety net
```

On admin save, an authenticated `POST /api/admin/products/[id]` handler runs the mutation, then calls `revalidatePath('/[locale]/product/[slug]')` + `revalidatePath('/[locale]/rituals/[world]')` for affected routes. Public site updates within seconds.

### Admin write path

Admin pages are server components. Forms POST to `app/api/admin/*` route handlers. Each handler:

1. Reads the user's Supabase session from cookies.
2. Verifies user is in `public.admin_users` (server-side check, never trust JWT alone for role).
3. Validates the submission with a Zod schema.
4. Runs the mutation via Drizzle (using a server-side client with service role for elevated writes , see security section).
5. Triggers audit log insert (DB trigger handles it automatically; handler doesn't need to write).
6. Calls `revalidatePath()` for affected routes.
7. Returns JSON `{ ok: true }` or redirects.

### Why Drizzle (not Prisma)

- TS-native: schema lives in `.ts` files, no separate DSL.
- Zero runtime dependency overhead vs Prisma's heavier client.
- SQL transparent: when something breaks, the generated query is readable.
- Migration generation via `drizzle-kit`: `pnpm drizzle-kit generate` produces the SQL we apply via Supabase MCP.

### Why `@supabase/ssr` over the older `auth-helpers-nextjs`

Supabase deprecated `auth-helpers-nextjs` in 2024. `@supabase/ssr` is the maintained path and ships native cookies handling for Next 15+ (works fine on Next 16). It exposes `createServerClient` for RSC + route handlers, and `createBrowserClient` for client components.

---

## 4. Schema

13 tables in the `public` schema. UUIDs as primary keys (the `uuid-ossp` extension is enabled). All `created_at` / `updated_at` are `timestamptz` with defaults. `updated_at` maintained by the `moddatetime` extension trigger.

### 4.1 `rituals`
Semi-static: only ever 3 rows (hammam, botanical, heritage), but admin-editable.

```
id              text         pk         (e.g. 'hammam')
sort_order      integer      not null   default 0
hero_image_path text         nullable              -- Supabase Storage path
created_at      timestamptz  default now()
updated_at      timestamptz  default now()
```

### 4.2 `ritual_translations`
```
ritual_id   text  fk → rituals.id on delete cascade
locale      text  check (locale in ('en','fr'))
eyebrow     text  not null
name        text  not null
tagline     text  not null
lede        text  not null
pk (ritual_id, locale)
```

### 4.3 `ritual_subcategories`
```
id          uuid         pk default uuid_generate_v4()
ritual_id   text         fk → rituals.id on delete cascade
slug        text         not null
sort_order  integer      default 0
unique (ritual_id, slug)
```

### 4.4 `ritual_subcategory_translations`
```
subcategory_id uuid  fk → ritual_subcategories.id on delete cascade
locale         text  check (locale in ('en','fr'))
name           text  not null
pk (subcategory_id, locale)
```

### 4.5 `products`
```
id              uuid          pk default uuid_generate_v4()
slug            text          unique not null      -- URL slug, e.g. 'huile-argan'
ritual_id       text          fk → rituals.id
subcategory_id  uuid          fk → ritual_subcategories.id nullable
moq             integer       not null
formats         text[]        default '{}'         -- e.g. ['30 ml','50 ml']
lead            text          not null             -- '4 weeks'
origin          text          nullable
ritual_label    text          nullable             -- narrative tag, e.g. 'The Atlas'
hero            boolean       default false
status          text          check (status in ('draft','published')) default 'draft'
published_at    timestamptz   nullable
created_at      timestamptz   default now()
updated_at      timestamptz   default now()
created_by      uuid          fk → auth.users(id) nullable
updated_by      uuid          fk → auth.users(id) nullable
index on (status, ritual_id, hero)
index on (slug)
```

### 4.6 `product_translations`
```
product_id  uuid  fk → products.id on delete cascade
locale      text  check (locale in ('en','fr'))
name        text  not null
short       text  not null
lede        text  nullable
pk (product_id, locale)
```

### 4.7 `product_images`
```
id          uuid         pk default uuid_generate_v4()
product_id  uuid         fk → products.id on delete cascade
path        text         not null             -- Storage path under 'product-images' bucket
alt_text    text         nullable
sort_order  integer      default 0
created_at  timestamptz  default now()
index on (product_id, sort_order)
```

### 4.8 `product_application_steps`
```
product_id   uuid     fk → products.id on delete cascade
step_number  integer  check (step_number between 1 and 5)
locale       text     check (locale in ('en','fr'))
title        text     not null
body         text     not null
pk (product_id, step_number, locale)
```

### 4.9 `facets`
```
id          uuid         pk default uuid_generate_v4()
type        text         check (type in ('ingredient','use','format','packaging','certification'))
value_en    text         not null
value_fr    text         not null
sort_order  integer      default 0
unique (type, value_en)
```

### 4.10 `product_facets`
```
product_id  uuid  fk → products.id on delete cascade
facet_id    uuid  fk → facets.id on delete cascade
pk (product_id, facet_id)
```

### 4.11 `ateliers`
```
id          uuid         pk default uuid_generate_v4()
slug        text         unique not null
name        text         not null          -- proper noun, single-locale
region      text         not null
since_year  integer      not null
image_path  text         nullable
sort_order  integer      default 0
created_at  timestamptz  default now()
updated_at  timestamptz  default now()
```

### 4.12 `atelier_translations`
```
atelier_id  uuid  fk → ateliers.id on delete cascade
locale      text  check (locale in ('en','fr'))
description text  not null
pk (atelier_id, locale)
```

### 4.13 `journal_cards`
```
id          uuid         pk default uuid_generate_v4()
slug        text         unique not null
date        date         not null
image_path  text         nullable
feature     boolean      default false
status      text         check (status in ('draft','published')) default 'draft'
created_at  timestamptz  default now()
updated_at  timestamptz  default now()
created_by  uuid         fk → auth.users(id) nullable
updated_by  uuid         fk → auth.users(id) nullable
index on (status, date desc)
```

### 4.14 `journal_card_translations`
```
card_id   uuid  fk → journal_cards.id on delete cascade
locale    text  check (locale in ('en','fr'))
kicker    text  not null
headline  text  not null
pk (card_id, locale)
```

### 4.15 `inquiries`
Empty in Sprint 2 (form still uses `mailto:`). Schema present so Sprint 3 doesn't need a migration.

```
id            uuid         pk default uuid_generate_v4()
company       text         not null
contact_name  text         not null
email         text         not null
phone         text         nullable
quantity      text         nullable
event_date    date         nullable
occasion      text         nullable
message       text         nullable
locale        text         check (locale in ('en','fr'))
status        text         check (status in ('new','contacted','quoted','won','lost')) default 'new'
source_url    text         nullable             -- which page submitted
ip_hash       text         nullable             -- for rate-limit dedupe, never raw IP
user_agent    text         nullable
created_at    timestamptz  default now()
updated_at    timestamptz  default now()
assigned_to   uuid         fk → auth.users(id) nullable
notes         text         nullable             -- internal admin notes
index on (status, created_at desc)
index on (email)
```

### 4.16 `inquiry_items`
```
inquiry_id  uuid     fk → inquiries.id on delete cascade
product_id  uuid     fk → products.id on delete restrict
qty         integer  check (qty >= 1) default 1
pk (inquiry_id, product_id)
```

### 4.17 `admin_users`
```
id            uuid          pk references auth.users(id) on delete cascade
email         text          unique not null
role          text          check (role in ('admin','sales','concierge','readonly')) default 'admin'
display_name  text          nullable
last_seen_at  timestamptz   nullable
created_at    timestamptz   default now()
```

Sprint 2 ships with a single `admin` role. Sprint 2.5 enforces role-based permissions inside the route handlers.

### 4.18 `audit_log`
```
id           uuid         pk default uuid_generate_v4()
actor_id     uuid         fk → auth.users(id) nullable
entity_type  text         check (entity_type in ('product','journal_card','atelier','ritual','ritual_subcategory','facet','inquiry'))
entity_id    text         not null      -- text (not uuid) so we can store ritual_id which is text
action       text         check (action in ('create','update','delete','publish','unpublish','status_change'))
before_state jsonb        nullable
after_state  jsonb        nullable
created_at   timestamptz  default now()
index on (entity_type, entity_id, created_at desc)
index on (actor_id, created_at desc)
```

Triggers on each mutated entity table push rows into `audit_log`. Handlers don't write here directly.

---

## 5. RLS policies

Row-Level Security on every public-schema table. Two principles:
1. **Anon role:** read-only, only on published rows where applicable.
2. **Authenticated role:** read + write only if `auth.uid()` matches a row in `admin_users`.

Policy template per table (specifics in migration files):

```sql
alter table public.products enable row level security;

-- Anon: read published only
create policy "Anon reads published products"
  on public.products for select
  to anon
  using (status = 'published');

-- Authenticated admins: full access
create policy "Admins manage products"
  on public.products for all
  to authenticated
  using (auth.uid() in (select id from public.admin_users))
  with check (auth.uid() in (select id from public.admin_users));
```

Special cases:
- `admin_users`: read-write only by authenticated admins (no anon read).
- `audit_log`: read by admins, write only by DB triggers (revoke insert from all roles, grant only to `service_role`).
- `inquiries`: write by service role (the `/api/inquiry` handler in Sprint 3 will use the service role; admins read; anon: no access).
- `inquiry_items`: same as inquiries.
- `storage.objects` in the `product-images` bucket: public read for `published` product images (sprint 2 simplification: bucket policy public-read for all paths; refine later). Admin write via authenticated session.

The service role bypasses RLS by design , used inside route handlers that have already verified the user against `admin_users`.

---

## 6. Auth flow

### Magic link

1. User hits `/admin/login`.
2. Submits email.
3. Server action calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${SITE_URL}/admin/auth/callback` } })`.
4. Supabase emails a link.
5. User clicks link → Supabase exchanges code for session → redirects to `/admin/auth/callback`.
6. Callback verifies session, checks email against `admin_users.email`. If absent: sign out, redirect to `/admin/login?error=unauthorized`. If present: redirect to `/admin`.

### Bootstrap (first admin)

First admin = Taha. Seed script inserts Taha's auth.users row (if not present , via Supabase Auth Admin API) and creates the `admin_users` row. Manual: in the Supabase dashboard he sends himself the first magic link OR I trigger it from the seed.

### Session check (every admin request)

Middleware in `proxy.ts` runs on `/admin/*` paths. Uses `@supabase/ssr` to read the session cookie. If no session OR session's user.id not in `admin_users`: redirect to `/admin/login`.

### Sign-out

`POST /admin/logout` calls `supabase.auth.signOut()`, clears cookies, redirects to `/`.

---

## 7. Storage

One bucket: `product-images`.

- Path structure: `products/{product_id}/{filename}`, `ateliers/{atelier_id}/hero.jpg`, `journal/{card_id}/hero.jpg`, `rituals/{ritual_id}/hero.jpg`.
- MIME allowlist: `image/jpeg`, `image/png`, `image/webp`, `image/avif`.
- Max size: 8 MB per file.
- Public read: yes (the public site renders these via `next/image`).
- Bucket policy: public read, authenticated write (any signed-in user can upload , RLS at the table level + admin_users check inside route handlers gates writes practically).
- Server-side validation: route handler reads the multipart upload, checks size + MIME against the buffer (not just the Content-Type header), then uploads via `supabase.storage.from('product-images').upload(path, buffer)`.

Image resizing/optimization: skip in Sprint 2 (Next/image handles resize-on-fetch). If file sizes get out of hand, add `sharp` resize in a follow-up.

---

## 8. Data migration (lib/products.ts + lib/editorial.ts → DB)

One-shot seed script: `db/seed.ts`.

Logic:
1. Connect via Drizzle to Supabase using the service role key.
2. For each row in `WORLDS` (lib/rituals.ts): upsert into `rituals` + `ritual_translations`.
3. For each row in `SUBCATS`: upsert into `ritual_subcategories` + `ritual_subcategory_translations`.
4. For each row in `FACETS` (5 axes × N values): upsert into `facets`.
5. For each row in `PRODUCTS` (lib/products.ts):
   - Upsert into `products` (status = 'published', published_at = now()).
   - Upsert two rows into `product_translations` (en + fr).
   - For each image path: insert into `product_images` (no upload , the file is already in `public/brand_photos/`, and `path` stores the relative `/brand_photos/...` URL; Storage migration happens later, products keep public paths for v1 since they live in `public/`). **Hybrid approach:** existing photos stay in `public/brand_photos/`. New admin-uploaded photos go to Supabase Storage. The `path` column accepts either:
     - A path starting with `/brand_photos/` → resolved as-is by the public site (Next.js serves from `public/`).
     - A Supabase Storage path → resolved via Storage public URL.
   - For each application step: insert into `product_application_steps`.
   - For each tag (facet): match the existing facet row, insert into `product_facets`.
6. For each row in `ATELIERS` (lib/editorial.ts): upsert into `ateliers` + `atelier_translations`.
7. For each row in `JOURNAL`: upsert into `journal_cards` + `journal_card_translations`.

Idempotent: every insert is `on conflict do update`. Running the seed twice is safe.

After seed succeeds:
- `lib/products.ts` and `lib/editorial.ts` keep their PRODUCTS / WORLDS / etc. exports in the codebase for now (the seed re-reads them on a re-run if needed). 
- BUT the public site stops importing from them , instead it imports from `lib/data/*` which queries Supabase.
- Files marked with a header comment: `// SEED-ONLY: this file is the source of truth for db/seed.ts. Public site reads from DB.`

In a follow-up PR (Sprint 2.5), we delete these TS data files entirely once we're confident the DB is the only source.

---

## 9. Public site integration

### `lib/data/products.ts`
```ts
// Server-side data helpers, used by RSC pages.
import { createServerClient } from '@/lib/supabase/server';

export async function getProductBySlug(slug: string, locale: 'en' | 'fr') {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      translations:product_translations!inner ( locale, name, short, lede ),
      images:product_images ( path, alt_text, sort_order ),
      steps:product_application_steps ( step_number, locale, title, body ),
      facets:product_facets ( facet:facets ( type, value_en, value_fr ) )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('translations.locale', locale)
    .order('sort_order', { foreignTable: 'product_images' })
    .single();
  return data;
}

export async function getProductsByRitual(ritualId: string, locale: 'en' | 'fr') { /* ... */ }
export async function getHeroProducts(locale: 'en' | 'fr') { /* ... */ }
export async function getAllProductSlugs() { /* for generateStaticParams */ }
```

Same shape for `lib/data/{rituals,journal,ateliers,inquiries}.ts`.

### Replacing imports

Files that currently import from `@/lib/products` or `@/lib/editorial`:
- `app/[locale]/page.tsx` (Home: BentoRituals needs ritual photos, possibly hero products)
- `app/[locale]/rituals/[world]/page.tsx` (Category page)
- `app/[locale]/product/[id]/page.tsx` (PDP)
- `app/[locale]/ateliers/page.tsx`
- `app/[locale]/journal/page.tsx`
- `app/sitemap.ts` (enumerates product slugs)
- `components/contact/InquirySidebar.tsx` (looks up product by id from useInquiry cart)
- `components/shell/InquiryDrawer.tsx` (same)

Strategy: convert each from sync-data imports to async `getProductBySlug` etc. The RSC pages become `async function Page(...)`. Inquiry drawer/sidebar are client components , they can't query the DB directly. Pass the catalogue as a prop from a server parent OR cache the product list in a global store fetched once on first inquiry add.

**Hybrid for inquiry drawer:** since the drawer's product names are needed instantly when the drawer opens, fetch a minimal `products_min` (id, slug, name[locale], hero image path) once at the layout level and pass through Context to the drawer. Stale data is acceptable for the drawer; a refresh corrects it.

---

## 10. Admin UI design

Editorial-aligned, but functional-first. Uses the existing token palette + Tailwind utility classes. Different visual register from the public site: more density, less whitespace, more controls visible at once. Think "Stripe Dashboard" or "Linear" rather than the public editorial flow.

### `/admin/login`
Single-column centered card. Logo + "Sign in to Barbaria Dashboard". Email input. Submit. Success message: "Check your inbox." Error states.

### `/admin` (dashboard home)
- Top: small avatar + user name + sign-out button
- 4 stat tiles: Published products, Draft products, Ateliers, Journal entries
- Recent activity feed (last 10 audit_log entries, formatted: "Taha published Beldi Black Soap · 12 minutes ago")
- Quick actions: "Add product", "Add journal entry", "Add atelier"

### `/admin/products`
- Search bar (full-text on name)
- Filter chips: ritual (3), status (draft/published), has-image (yes/no)
- Sort dropdown
- Grid OR table view toggle
- Each row: thumb (hero image or gradient), name (EN), slug, ritual, MOQ, status badge, edit button

### `/admin/products/[id]` (editor)
Multi-section form, all on one page (no wizard , admin is faster):
1. **Identity**: slug (auto-generated from EN name, editable), ritual + sub-cat dropdowns, hero toggle
2. **Translations**: EN + FR side by side (name, short, lede) , tabbed within the section
3. **Specs**: MOQ, formats (chip input), lead time, origin
4. **Tags / Facets**: multi-select per axis (ingredient, use, format, packaging, certification)
5. **Images**: drag-to-reorder + drag-to-upload (Supabase Storage). Each image: alt text per locale.
6. **Application steps**: 0-3 steps. Each step: title + body per locale.
7. **Status**: draft / published radio. "Save" button (saves as current status). "Save and publish" button.

Form uses React Server Actions where possible (lighter than full route handler), Zod validation, optimistic UI for image reorder/delete.

### `/admin/journal` and `/admin/ateliers`
Similar shape, simpler forms (fewer fields).

### `/admin/inquiries` (read-only Sprint 2)
Empty state with message "Inquiries arrive via the contact form. Sprint 3 wires the form to this inbox." When Sprint 3 lands: list + detail view + status changer.

### `/admin/activity`
Filterable audit_log view. Table: when, who, what, action. Click row → modal showing before/after diff.

### Shared admin shell
- Left sidebar nav: Dashboard, Products, Journal, Ateliers, Rituals, Inquiries, Activity, Settings (Sprint 2.5)
- Top bar: page title, breadcrumb, user menu
- Mobile: collapsible sidebar

---

## 11. Files

### New
```
db/
├── schema.ts                          Drizzle TS schema
├── migrations/
│   ├── 0001_initial.sql               Generated by drizzle-kit
│   ├── 0002_rls_policies.sql          Hand-written RLS
│   ├── 0003_triggers.sql              updated_at + audit_log triggers
│   └── 0004_storage_bucket.sql        Storage bucket setup
├── seed.ts                            One-shot seed from TS data files
└── client.ts                          Drizzle client factory

lib/
├── supabase/
│   ├── server.ts                      createServerClient (cookies)
│   ├── browser.ts                     createBrowserClient
│   └── service.ts                     createServiceRoleClient (admin route handlers)
├── data/
│   ├── products.ts                    Public read helpers
│   ├── rituals.ts                     "
│   ├── ateliers.ts                    "
│   ├── journal.ts                     "
│   └── inquiries.ts                   Stub for Sprint 3 (Sprint 2: admin read only)
└── admin/
    ├── auth.ts                        Auth helpers (requireAdmin, getCurrentAdmin)
    └── audit.ts                       Manual audit-log helpers (in case triggers miss something)

app/admin/
├── layout.tsx                         Shared admin shell
├── page.tsx                           Dashboard
├── login/page.tsx
├── login/actions.ts                   signInWithOtp server action
├── logout/route.ts                    Sign-out POST handler
├── auth/callback/route.ts             Magic-link callback
├── products/
│   ├── page.tsx                       List
│   ├── new/page.tsx                   Create form
│   └── [id]/
│       ├── page.tsx                   Edit form
│       └── actions.ts                 Save / publish / delete server actions
├── journal/
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [id]/page.tsx
├── ateliers/ (same pattern)
├── rituals/ (read + sub-cat editor)
├── inquiries/
│   ├── page.tsx
│   └── [id]/page.tsx                  Sprint 3 wires this
└── activity/page.tsx                  Audit log view

components/admin/
├── AdminShell.tsx                     Sidebar + topbar
├── Sidebar.tsx
├── StatTile.tsx
├── ProductList.tsx
├── ProductEditor.tsx                  The big form
├── TranslationTabs.tsx                EN/FR tab UI
├── ImageManager.tsx                   Drag-reorder + upload
├── FacetMultiSelect.tsx
├── ApplicationStepEditor.tsx
└── ActivityFeed.tsx

api/admin/
├── products/route.ts                  POST create
├── products/[id]/route.ts             PUT update, DELETE
├── images/route.ts                    POST upload (multipart)
├── images/[id]/route.ts               DELETE + reorder
└── revalidate/route.ts                Internal endpoint (called by other handlers)

.env.example                           Update with Supabase keys
```

### Modified
```
proxy.ts                               Add admin auth middleware
app/[locale]/page.tsx                  Read from lib/data, not lib/products
app/[locale]/rituals/[world]/page.tsx  Same
app/[locale]/product/[id]/page.tsx     Same
app/[locale]/ateliers/page.tsx         Same
app/[locale]/journal/page.tsx          Same
app/sitemap.ts                         Async, queries DB for product slugs
components/contact/InquirySidebar.tsx  Receive products via props/context
components/shell/InquiryDrawer.tsx     Same
package.json                           Add @supabase/supabase-js, @supabase/ssr, drizzle-orm, drizzle-kit, postgres, zod
next.config.ts                         Add Supabase project domain to image remotePatterns
```

### Deleted (deferred to Sprint 2.5 , keep TS files for safety until DB is proven)
- `lib/products.ts` , deleted in Sprint 2.5
- `lib/editorial.ts` , same

---

## 12. Security

| Vector | Mitigation |
|---|---|
| Anonymous user reads draft data | RLS: anon role policy `using (status = 'published')` |
| Anonymous user writes anything | RLS: no INSERT/UPDATE/DELETE policy for anon role |
| Authenticated non-admin writes | Route handlers verify `auth.uid() in admin_users`; RLS also gates |
| CSRF on admin POSTs | Next.js Server Actions get CSRF protection by default; route handlers use `Origin` header check + same-site cookie |
| Image MIME spoofing | Server-side buffer inspection (read magic bytes), not just `Content-Type` |
| Image storage exhaustion | 8 MB max per file; warn admin if total bucket size > 1 GB |
| SQL injection | Drizzle is parameterized by default; no string interpolation in queries |
| Session hijacking | HttpOnly + Secure + SameSite=Lax cookies via `@supabase/ssr` |
| Service role key leak | Server-only env var; never imported in client components; verified by ESLint rule (or convention) |
| Audit log tampering | DB triggers fire on every mutation; admins can read but no UPDATE/DELETE on `audit_log` (revoke from authenticated role) |
| Magic-link redirect open | `emailRedirectTo` allowlist in Supabase project settings (`https://barbariamorocco.com`, `https://*.vercel.app`, `http://localhost:3000`) |
| Rate limit on magic-link sends | Supabase Auth rate-limits by default; OK for v1 |
| Storage public bucket leaks unpublished images | Sprint 2 simplification: bucket is public-read for all paths. Mitigation: when product status is set to `draft`, image rows stay attached, but the image won't render on the public site because the product itself is filtered. Anyone with the direct Storage URL CAN still see it. Acceptable risk for v1; refine in Sprint 2.5 by switching to signed URLs. |

---

## 13. Test strategy

### Public site regression
All 40 existing Playwright tests must still pass. They will pass IF the data-layer swap preserves the exact same product / atelier / journal shape. Test plan: run the full suite after the data swap and before opening the PR.

### Admin smoke (new)
New file `tests/admin-smoke.spec.ts`:
- `/admin/login` renders form, submits email, shows "check your inbox"
- Mock-authenticated admin lands on `/admin`, sees dashboard
- Navigate to `/admin/products`, list renders, click "New product"
- Fill product form, save as draft, redirect to list, see new draft
- Edit the same product, set status = published, save
- Navigate to `/en/product/{new-slug}` on the public site, see the new product live (after revalidation)

These tests need an authenticated test fixture. Use Playwright's `storageState` to persist a logged-in session across tests. The fixture authenticates once via a test-only API route or by injecting a session cookie directly.

### Admin a11y
`tests/admin-a11y.spec.ts` , axe scan on the admin dashboard and on the product editor.

---

## 14. Implementation order (slices)

15 slices, each one commit. Same discipline as Sprint 1: each ends with `npm run build` green + a CHANGELOG entry.

1. **Spec + plan committed** (this PR's first commit).
2. **Dependencies**: install Drizzle, Supabase clients, Zod, postgres. Add `.env.example`. Configure `drizzle.config.ts`.
3. **Drizzle schema** in `db/schema.ts`. Generate first migration.
4. **Apply migration 0001 to remote** via `apply_migration` MCP. Verify with `list_tables`.
5. **RLS policies** as migration 0002. Apply. Verify with `get_advisors`.
6. **Triggers** (updated_at + audit log) as migration 0003. Apply.
7. **Storage bucket** (migration 0004 or direct API call): create `product-images` bucket, set public-read policy.
8. **Auth setup**: `lib/supabase/{server,browser,service}.ts` clients. `requireAdmin` helper. `proxy.ts` admin middleware.
9. **Login + callback**: `/admin/login`, `/admin/auth/callback`, `/admin/logout`. Test magic-link flow end to end with Taha's email.
10. **Seed**: `db/seed.ts`. Run it once. Verify products/ateliers/journal in DB via `list_tables`/`execute_sql`.
11. **Public site data layer**: `lib/data/*` helpers. Convert RSC pages to async + DB reads. Sitemap + inquiry drawer/sidebar product lookups.
12. **Test public regression**: full 40-test Playwright run. Fix any drift.
13. **Admin shell + dashboard**: `app/admin/layout.tsx`, sidebar, topbar, stat tiles, recent activity. Static (no edit yet).
14. **Admin products**: list + create + edit + delete. Image upload. Translations. Status. Revalidation triggers on save.
15. **Admin journal + ateliers + rituals**: similar to products but simpler.
16. **Admin inquiries (read stub) + activity log view**.
17. **Admin tests + a11y**.
18. **Final QA, PR, merge**.

(That's 18 slices , I miscounted as 15. Likely some compression / batching as I execute. Plan target ~15-17 days of work; could be 2 weeks at this pace.)

---

## 15. Definition of done

- [ ] All 18 slices committed
- [ ] `npm run build` clean
- [ ] All 40 public Playwright tests green
- [ ] All admin Playwright tests green
- [ ] Lighthouse public Home: Perf ≥ 90, A11y 100
- [ ] axe-core zero serious/critical on `/admin` and `/admin/products/[id]`
- [ ] DB schema applied to Supabase, RLS verified with `get_advisors` (zero security violations)
- [ ] All product/journal/atelier rows seeded
- [ ] Taha can log in to `/admin` and edit a product end-to-end
- [ ] Edits to a published product appear on the public site within 5 seconds (via revalidatePath)
- [ ] `.env.example` documents all required vars; `SUPABASE_SERVICE_ROLE_KEY` set in Vercel
- [ ] `.project/CHANGELOG.md` updated per slice
- [ ] `.project/DECISIONS.md` logs: Drizzle vs Prisma choice, public-read storage bucket trade-off, hybrid path strategy (public/brand_photos + Storage), draft-content visibility caveat
- [ ] PR opened against `master`, merged

---

## 16. Out of scope (explicit list, do NOT do in this sprint)

- Multi-user admin (single admin = Taha for v1)
- Role-based permissions UI (everything assumes role = admin)
- Settings page (brand info, social URLs, concierge address)
- Bulk CSV product import
- Image cropping / optimization UI
- Inquiry form wiring to DB (Sprint 3)
- Resend email (Sprint 3)
- Insights / analytics dashboard (Sprint 3)
- Search admin pages by full-text (basic LIKE-search only)
- Inline draft preview ("see this draft on the public site without publishing")
- Workflow / approval ("Sales requests publish, Admin approves") , Sprint 2.5
