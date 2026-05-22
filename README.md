# Barbaria Morocco

Public site and admin dashboard for **Barbaria Morocco** — a Casablanca luxury house specialising in cosmetics and épicerie fine, sourced from artisanal partners across Morocco.

The site serves a bilingual storefront (French default, English at `/en`), a B2B inquiry flow, and an admin dashboard at `/admin` for the house team to manage the catalogue, gift boxes, journal, ateliers, occasions, and incoming inquiries.

Production: **https://barbariamorocco.com**

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Database + Auth + Storage**: Supabase (Postgres 17, eu-west-1)
- **i18n**: next-intl 4 (FR default, EN prefix)
- **Styling**: Tailwind CSS v4 with custom `bb-*` design tokens
- **Forms**: native HTML + Server Actions, Zod validation
- **Images**: Next/Image + Sharp pipeline + Supabase Storage
- **Transactional email**: Resend (wired via `mail.barbariamorocco.com`)
- **Analytics**: Vercel Analytics + Speed Insights
- **Hosting**: Vercel (production + preview)
- **CDN + WAF**: Cloudflare in front of Vercel
- **Tests**: Playwright (e2e + axe a11y)

## Local development

Requirements: Node 22+, npm.

```bash
git clone https://github.com/<barbaria-org>/barbaria-morocco-website.git
cd barbaria-morocco-website
npm install
cp .env.example .env.local
# Fill the env values (see "Environment variables" below)
npm run dev
```

The dev server runs at http://localhost:3000.

## Environment variables

All values live in Vercel for Production + Preview environments. `.env.example` documents them; `.env.local` is your dev copy (gitignored).

| Variable | Purpose | Where set |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | Canonical origin. Drives sitemaps, canonical URLs, OG meta, JSON-LD, robots.txt. | Vercel env (per environment) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. | Vercel env |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable key (RLS-respecting). | Vercel env |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key, bypasses RLS. **Never expose to the client.** | Vercel env, server-side only |
| `DATABASE_URL` | Direct Postgres connection. Used for Drizzle migrations and seed scripts only. | Local dev only |
| `BOOTSTRAP_ADMIN_EMAIL` | When `admin_users` is empty and a magic-link arrives with this email, the callback auto-creates the first admin row. Unset after bootstrap. | Vercel env (transient) |
| `RESEND_API_KEY` | Server-side key for the inquiry email pipeline. | Vercel env, server-side only |

## Deployment

The repo deploys to Vercel automatically:

- **Push to `master`** → production at `https://barbariamorocco.com`
- **Push to `staging`** → staging at the Vercel preview URL
- **Other branches / PRs** → preview deployments

DNS is managed at Cloudflare. The `A` and `CNAME` records point at Vercel; the proxy (orange cloud) is enabled for WAF + Bot Fight + DDoS protection.

## Database and migrations

Schema lives in `db/migrations/*.sql`. Migrations are sequentially numbered and applied via the Supabase MCP or the Supabase CLI:

```bash
supabase db push                                  # Preferred (uses Supabase CLI)
# or via MCP: mcp__supabase__apply_migration
```

Never edit applied migrations. Add a new sequentially-numbered file and apply it.

## Admin dashboard

The admin lives at `/admin`. Sign in with magic link from a registered admin email.

- **First admin**: bootstrapped at deploy time via `BOOTSTRAP_ADMIN_EMAIL`.
- **Subsequent admins**: added from the `/admin/users` page by a superadmin.
- **Full dashboard guide**: see [`.project/ADMIN_GUIDE.md`](.project/ADMIN_GUIDE.md).
- **Glossary of terms used in the UI**: see [`.project/ADMIN_GLOSSARY.md`](.project/ADMIN_GLOSSARY.md).

## Testing

```bash
npm test                # Run all Playwright tests
npm run test:ui         # Open the Playwright UI runner
```

CI (`.github/workflows/ci.yml`) runs `tsc --noEmit` and `npm audit --audit-level=critical` on every push and PR.

## Branch flow

```
feature/*  ───►  staging  ───►  master  ───►  production
                  (preview)      (live)
```

- Feature branches branch off `staging`.
- PRs merge into `staging` for QA on the preview deployment.
- When stable, fast-forward `master` from `staging`.

## Project documentation

Operational and historical docs live in `.project/`:

- [`ADMIN_GUIDE.md`](.project/ADMIN_GUIDE.md) — how to use the admin dashboard
- [`ADMIN_GLOSSARY.md`](.project/ADMIN_GLOSSARY.md) — terms used across the UI
- [`HANDOFF_CHECKLIST.md`](.project/HANDOFF_CHECKLIST.md) — items to verify after ownership transfer
- [`CNDP_FILING_GUIDE.md`](.project/CNDP_FILING_GUIDE.md) — Moroccan data-protection filing walkthrough
- [`CHANGELOG.md`](.project/CHANGELOG.md) — chronological record of decisions and shipped work
- [`DECISIONS.md`](.project/DECISIONS.md) — architectural decisions and rationale
- [`cahier-des-charges.md`](.project/cahier-des-charges.md) — full functional and technical specification

## Contact

- **Owner**: Barbaria Morocco SARL, Casablanca
- **Account email**: `admin@barbariamorocco.com`
- **Security disclosures**: `security@barbariamorocco.com` (see [`public/.well-known/security.txt`](public/.well-known/security.txt))
- **Privacy / data-rights requests**: `privacy@barbariamorocco.com`

## Licence

Proprietary. All rights reserved by Barbaria Morocco SARL.
