import { createServiceRoleClient } from "@/lib/supabase/service";
import { z } from "zod";

export interface AdminListRow {
  id: string;
  email: string;
  role: string;
  displayName: string | null;
  lastSeenAt: string | null;
  createdAt: string;
}

export const AdminCreateSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  displayName: z.string().trim().max(120).optional().or(z.literal("")),
  role: z.enum(["superadmin", "admin"]),
  // Optional. When blank, the action generates a 16-char password
  // (kept for the "no email pipeline yet" case where the maison wants
  // a one-shot password they can read off the screen). When provided
  // it must meet Supabase Auth's minimum (8 chars) and a reasonable
  // ceiling. The new admin can rotate it via Supabase dashboard.
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password too long.")
    .optional()
    .or(z.literal("")),
});

export const AdminRoleUpdateSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["superadmin", "admin"]),
});

/**
 * Returns every admin_users row sorted by created_at. Service-role
 * bypasses RLS; the caller MUST gate with requireSuperadmin() first.
 */
export async function listAdminUsers(): Promise<AdminListRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, email, role, display_name, last_seen_at, created_at")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`listAdminUsers: ${error.message}`);
  return (data ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    role: r.role,
    displayName: r.display_name,
    lastSeenAt: r.last_seen_at,
    createdAt: r.created_at,
  }));
}

/**
 * Generates a 16-char ASCII password from a-z, A-Z, 0-9. Returned to
 * the calling superadmin once at user-creation time; we never persist
 * the plaintext anywhere. The new admin can rotate it via the Supabase
 * dashboard whenever they like.
 */
export function generateTempPassword(): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}
