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

async function countSuperadmins(): Promise<number> {
  const supabase = createServiceRoleClient();
  const { count } = await supabase
    .from("admin_users")
    .select("id", { count: "exact", head: true })
    .eq("role", "superadmin");
  return count ?? 0;
}

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
  // user behind on a partial failure. Use ilike so legacy mixed-case
  // rows are still caught (Zod normalizes the input but the column
  // is plain text, not citext).
  const { data: existing } = await supabase
    .from("admin_users")
    .select("id")
    .ilike("email", email)
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
  // we delete the orphan auth user so retries are idempotent. If the
  // rollback ALSO fails we surface the orphan id so an operator can
  // clean up via SQL — silently swallowing the rollback error would
  // leave the project in a half-state with no audit trail.
  const { error: insErr } = await supabase.from("admin_users").insert({
    id: userId,
    email,
    role,
    display_name: displayName || null,
  });
  if (insErr) {
    const { error: rollbackErr } = await supabase.auth.admin.deleteUser(userId);
    if (rollbackErr) {
      console.error(
        "[createAdmin] orphan auth user, manual cleanup required:",
        { userId, email, insErr: insErr.message, rollbackErr: rollbackErr.message }
      );
      return {
        ok: false,
        error: `admin_users insert failed and auth-user rollback failed; orphan auth user ${userId} (${email}) must be removed from the Supabase dashboard.`,
      };
    }
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
    // Self-demote guard: blocks the acting superadmin from locking
    // themselves out. Concurrent demote-of-other-superadmin is handled
    // by the org-level lockout check below.
    return { ok: false, error: "Refusing to demote yourself." };
  }

  const supabase = createServiceRoleClient();

  // Org-level lockout guard. If we're demoting someone whose CURRENT
  // role is superadmin and there's only one superadmin left, refuse.
  // Two concurrent demote-other-superadmin requests can race past this
  // check; for Barbaria's traffic the window is acceptable, but a
  // future hardening could use a BEFORE-UPDATE trigger on admin_users.
  if (parsed.data.role !== "superadmin") {
    const { data: target } = await supabase
      .from("admin_users")
      .select("role")
      .eq("id", parsed.data.id)
      .single();
    if (target?.role === "superadmin" && (await countSuperadmins()) <= 1) {
      return { ok: false, error: "Cannot demote the last superadmin." };
    }
  }

  const { error } = await supabase
    .from("admin_users")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/admins");
  return { ok: true };
}

export type DeleteAdminResult =
  | { ok: true; warning?: string }
  | { ok: false; error: string };

export async function deleteAdmin(formData: FormData): Promise<DeleteAdminResult> {
  const me = await requireSuperadmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing id" };
  if (id === me.id) return { ok: false, error: "Refusing to delete yourself." };

  const supabase = createServiceRoleClient();

  // Org-level lockout guard: if the target is a superadmin and they
  // are the only one left, refuse. Stops "two superadmins delete each
  // other simultaneously → zero left" up to a small race window.
  // We also grab the email so the post-delete warning (if any) stays
  // attributed after the row is gone from the list.
  const { data: target } = await supabase
    .from("admin_users")
    .select("role, email")
    .eq("id", id)
    .single();
  if (target?.role === "superadmin" && (await countSuperadmins()) <= 1) {
    return { ok: false, error: "Cannot remove the last superadmin." };
  }
  const targetEmail = target?.email ?? "(unknown email)";

  // Delete from admin_users first so the row disappears before the
  // FK ON DELETE CASCADE from auth.users fires; this makes the failure
  // mode legible if the auth-side delete misbehaves.
  const { error: aErr } = await supabase.from("admin_users").delete().eq("id", id);
  if (aErr) return { ok: false, error: `admin_users delete: ${aErr.message}` };

  const { error: uErr } = await supabase.auth.admin.deleteUser(id);
  if (uErr) {
    // admin_users row already gone — the user can no longer sign in
    // even if the auth row stuck around. Surface as a warning that
    // names the target so it stays meaningful after the row vanishes
    // from the list.
    revalidatePath("/admin/admins");
    return {
      ok: true,
      warning: `${targetEmail}: admin access revoked but the underlying auth user could not be removed (${uErr.message}). Clean up via the Supabase dashboard.`,
    };
  }

  revalidatePath("/admin/admins");
  return { ok: true };
}
