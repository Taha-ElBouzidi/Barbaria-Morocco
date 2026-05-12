"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";

const emailSchema = z.string().email();

export async function signInWithMagicLink(formData: FormData) {
  const rawEmail = formData.get("email");
  const parsed = emailSchema.safeParse(rawEmail);
  if (!parsed.success) {
    redirect("/admin/login?error=invalid_email");
  }
  const email = parsed.data;

  // Derive the redirect URL from the current request's host so this works on
  // localhost, Vercel preview (*.vercel.app), and prod without env-var juggling.
  // The resulting URL must be allowlisted in the Supabase Dashboard Auth settings.
  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3000";
  const protocol =
    hdrs.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const redirectTo = `${protocol}://${host}/admin/auth/callback`;

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    console.error("[admin login] signInWithOtp failed:", error.message);
    redirect("/admin/login?error=send_failed");
  }

  redirect(`/admin/login?sent=1&email=${encodeURIComponent(email)}`);
}
