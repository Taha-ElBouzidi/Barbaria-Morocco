"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { requireSuperadmin } from "@/lib/admin/auth";
import {
  AdminCreateSchema,
  AdminRoleUpdateSchema,
  generateTempPassword,
} from "@/lib/admin/users";

export type CreateAdminResult =
  | { ok: true; id: string; email: string; tempPassword: string }
  | { ok: false; error: string };

/**
 * Creates a Supabase Auth user + admin_users row. Returns the
 * generated temp password ONCE so the calling superadmin can share it
 * out of band; we never log or persist the plaintext.
 */
export async function createAdmin(formData: FormData): Promise<CreateAdminResult> {
  await requireSuperadmin();

  const parsed = AdminCreateSchema.safeParse({
    email: formData.get("email"),
    displayName: formData.get("displayName"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: `${first.path.join(".")}: ${first.message}` };
  }
  const { email, displayName, role } = parsed.data;

  const supabase = createServiceRoleClient();

  // Block duplicate emails up front — admin_users.email is unique and
  // the auth.users insert below would 422 either way, but checking
  // first gives a friendlier error and avoids leaving an orphan auth
  // user behind on a partial failure.
  const { data: existing } = await supabase
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) {
    return { ok: false, error: "An admin with this email already exists." };
  }

  const tempPassword = generateTempPassword();

  // Create the auth user. email_confirm:true so the new admin can log
  // in immediately without an email round-trip (we don't have the
  // Resend pipeline yet — see TODO_LIST.md).
  const { data: created, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: displayName ? { display_name: displayName } : {},
  });
  if (authErr || !created?.user) {
    return { ok: false, error: authErr?.message ?? "Could not create auth user" };
  }
  const userId = created.user.id;

  // Insert the admin_users row keyed on the auth user id. If this fails
  // we delete the orphan auth user so retries are idempotent.
  const { error: insErr } = await supabase.from("admin_users").insert({
    id: userId,
    email,
    role,
    display_name: displayName || null,
  });
  if (insErr) {
    await supabase.auth.admin.deleteUser(userId).catch(() => {});
    return { ok: false, error: `admin_users insert: ${insErr.message}` };
  }

  revalidatePath("/admin/admins");
  return { ok: true, id: userId, email, tempPassword };
}

export async function updateAdminRole(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const me = await requireSuperadmin();
  const parsed = AdminRoleUpdateSchema.safeParse({
    id: formData.get("id"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (parsed.data.id === me.id && parsed.data.role !== "superadmin") {
    // Self-demote guard: refuse to leave the org with zero superadmins,
    // and refuse to silently lock the current actor out of /admin/admins.
    // The acting superadmin can ask another superadmin to demote them.
    return { ok: false, error: "Refusing to demote yourself." };
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("admin_users")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/admins");
  return { ok: true };
}

export async function deleteAdmin(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const me = await requireSuperadmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing id" };
  if (id === me.id) return { ok: false, error: "Refusing to delete yourself." };

  const supabase = createServiceRoleClient();
  // Delete from admin_users first so an FK ON DELETE CASCADE from
  // auth.users doesn't fire mid-flight and leave us guessing about
  // which side won. The CASCADE is fine on its own, but the explicit
  // ordering makes the failure mode legible.
  const { error: aErr } = await supabase.from("admin_users").delete().eq("id", id);
  if (aErr) return { ok: false, error: `admin_users delete: ${aErr.message}` };

  const { error: uErr } = await supabase.auth.admin.deleteUser(id);
  if (uErr) {
    // admin_users row already gone — the user can no longer sign in
    // even if the auth row stuck around. Surface the warning but
    // don't fail the whole action.
    return { ok: true, error: `auth user removal warning: ${uErr.message}` };
  }

  revalidatePath("/admin/admins");
  return { ok: true };
}
