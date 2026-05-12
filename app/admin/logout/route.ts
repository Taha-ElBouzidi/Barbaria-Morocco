import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}

// Allow GET so a plain `<a href="/admin/logout">` works (idempotent sign-out).
export async function GET(request: NextRequest) {
  return POST(request);
}
