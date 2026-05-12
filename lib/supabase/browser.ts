import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase client for use in client components.
 * Auth cookies are read/written by the browser's native cookie store.
 */
export function createBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
