import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-free anon Supabase client. Use ONLY for public, RLS-safe reads
 * that are not tied to the current request's session.
 *
 * The other server client (`lib/supabase/server.ts`) reads cookies to
 * resolve the user, which makes it incompatible with `unstable_cache`,
 * Next's data-cache wrapper runs outside the request context and throws
 * on any dynamic API. This client is what we hand to cached readers
 * (catalogue map, facets, site settings).
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}
