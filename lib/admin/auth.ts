import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "sales" | "concierge" | "readonly";
  displayName: string | null;
}

/**
 * Reads the current authenticated user and verifies they are in
 * public.admin_users. Returns the admin row.
 *
 * Returns `null` if not signed in OR signed in but not in admin_users.
 * Use this in code paths that need to know admin state without redirecting.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("admin_users")
    .select("id, email, role, display_name")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    role: data.role as AdminUser["role"],
    displayName: data.display_name,
  };
}

/**
 * Requires the caller to be an authenticated admin. Redirects to
 * /admin/login if not. Returns the admin row otherwise.
 *
 * Use this at the top of Server Components and Route Handlers that
 * gate admin-only access.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}
