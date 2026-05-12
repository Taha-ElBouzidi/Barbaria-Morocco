import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for use in RSC, Server Actions, and Route Handlers.
 * Reads + writes auth cookies via Next 16's `cookies()` API.
 *
 * Uses the anon key. Operations are RLS-gated. For service-role operations
 * (bypassing RLS), use `lib/supabase/service.ts` instead — but only inside
 * code paths that have already verified the caller is an admin.
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component (no mutable cookie store).
            // Safe to ignore here; middleware will refresh the session on
            // the next request.
          }
        },
      },
    }
  );
}
