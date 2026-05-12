import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * POST-only logout. A previous version exposed a GET handler so a plain
 * <Link href="/admin/logout"> would work, but Next.js auto-prefetches
 * every Link on the page, and the prefetch silently logged users out the
 * moment the TopBar rendered. The TopBar now uses a POST form. The GET
 * handler is intentionally absent so prefetches (which use GET) can never
 * sign the user out.
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
