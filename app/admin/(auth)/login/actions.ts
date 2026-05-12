"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function signInWithPassword(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect("/admin/login?error=invalid_email");
  }
  const { email, password } = parsed.data;

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    console.error("[admin login] signInWithPassword failed:", error?.message);
    redirect("/admin/login?error=invalid_credentials");
  }

  // Verify admin_users membership (the proxy.ts middleware also does this,
  // but checking here gives a cleaner error for non-admin users who happen
  // to have valid auth.users credentials).
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!adminRow) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  // Bump last_seen_at
  const service = createServiceRoleClient();
  await service.from("admin_users").update({ last_seen_at: new Date().toISOString() }).eq("id", data.user.id);

  redirect("/admin");
}
