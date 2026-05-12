import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/admin";

  if (!code) {
    return NextResponse.redirect(new URL("/admin/login?error=missing_code", request.url));
  }

  const supabase = await createServerClient();

  // Exchange the code for a session. This sets auth cookies on the response.
  const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError || !data.user) {
    console.error("[admin callback] exchange failed:", exchangeError?.message);
    return NextResponse.redirect(new URL("/admin/login?error=expired", request.url));
  }

  const user = data.user;

  // Check whether the signed-in user is a registered admin.
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (adminRow) {
    // Bump last_seen_at via service role (bypasses RLS for the update).
    const service = createServiceRoleClient();
    await service
      .from("admin_users")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", user.id);
    return NextResponse.redirect(new URL(next, request.url));
  }

  // First-admin bootstrap: only fires when admin_users is completely empty AND
  // the sign-in email matches the BOOTSTRAP_ADMIN_EMAIL env var. After the first
  // admin row exists, this branch is permanently skipped.
  const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.toLowerCase();
  if (bootstrapEmail && user.email?.toLowerCase() === bootstrapEmail) {
    const service = createServiceRoleClient();
    const { count } = await service
      .from("admin_users")
      .select("id", { count: "exact", head: true });
    if ((count ?? 0) === 0) {
      const { error: insertError } = await service.from("admin_users").insert({
        id: user.id,
        email: user.email,
        role: "admin",
        display_name: user.email?.split("@")[0] ?? null,
        last_seen_at: new Date().toISOString(),
      });
      if (!insertError) {
        return NextResponse.redirect(new URL(next, request.url));
      }
      console.error("[admin callback] bootstrap insert failed:", insertError.message);
    }
  }

  // Not an admin and bootstrap did not apply — sign them out and reject.
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login?error=unauthorized", request.url));
}
