import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/service";

export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "sales" | "concierge" | "readonly";
  displayName: string | null;
}

// Must match the constant in proxy.ts.
const USER_ID_HEADER = "x-bb-user-id";

/**
 * Reads the current authenticated admin from the user-id header that
 * middleware (proxy.ts) set after validating the session. Looks up
 * admin_users via service-role (bypasses RLS).
 *
 * Returns `null` if no signed-in user OR the user is not in admin_users.
 *
 * NOTE: this never calls supabase.auth.getUser(), that would race with
 * middleware's call and consume the rolling refresh token, causing random
 * logouts on navigation. The user.id is trusted because it was set by our
 * own middleware AFTER getUser validated server-side. Clients cannot inject
 * the header, middleware strips it from inbound requests before setting.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const headerStore = await headers();
  const userId = headerStore.get(USER_ID_HEADER);
  if (!userId) return null;

  const service = createServiceRoleClient();
  const { data, error } = await service
    .from("admin_users")
    .select("id, email, role, display_name")
    .eq("id", userId)
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
