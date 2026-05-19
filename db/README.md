# Database

Drizzle ORM schema and migrations for Supabase Postgres.

## Files

- `schema.ts`, TS schema (source of truth for migrations)
- `migrations/`, generated + hand-written SQL
- `seed.ts`, one-shot seed populating products + ateliers + journal from the TS data files in `lib/`

## Run the seed (one-time per environment)

Requires `.env.local` populated with `SUPABASE_SERVICE_ROLE_KEY` (get from Supabase Dashboard -> Project Settings -> API -> service_role secret).

```bash
npm run seed
```

Idempotent: re-running upserts existing rows and refreshes images / application steps / facet links. Safe to run after editing the TS data files.

## Generate a new migration

```bash
npx drizzle-kit generate --name <descriptive-name>
```

Then apply to the remote via Supabase MCP `apply_migration` (or, locally, via the Drizzle migration runner with `DATABASE_URL` in `.env.local`).
