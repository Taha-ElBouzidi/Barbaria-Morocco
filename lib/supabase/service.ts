import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. BYPASSES RLS.
 *
 * Use ONLY inside server code that has already authenticated the caller
 * as an admin (e.g. via `requireAdmin()` from `lib/admin/auth`) OR in
 * trusted server-side scripts (seed, migrations).
 *
 * NEVER import this from a client component or expose its key to the
 * client bundle. The `SUPABASE_SERVICE_ROLE_KEY` env var is server-only.
 */
export function createServiceRoleClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. This client must only be used in server code with the service role key configured."
    );
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
