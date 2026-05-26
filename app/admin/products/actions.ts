"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin/auth";
import { computeReorder } from "@/lib/admin/reorder";

/**
 * List-level product actions. Per-item actions live in [id]/actions.ts.
 */

export type ReorderResult = { ok: true; noop?: boolean } | { ok: false; error: string };

export async function reorderProduct(
  productId: string,
  direction: "up" | "down"
): Promise<ReorderResult> {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  // Resolve the moving product's category first.
  const { data: product, error: productErr } = await supabase
    .from("products")
    .select("id, category_id")
    .eq("id", productId)
    .single();
  if (productErr || !product) {
    return { ok: false, error: `Product not found: ${productErr?.message ?? "unknown"}` };
  }
  if (!product.category_id) {
    return { ok: false, error: "Product has no category; assign one before reordering." };
  }

  // Peer set: every product in the same category, ordered the same
  // way the list view reads them (sort_order, created_at tiebreaker).
  const { data: peers, error: peersErr } = await supabase
    .from("products")
    .select("id, sort_order, created_at")
    .eq("category_id", product.category_id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (peersErr || !peers) {
    return { ok: false, error: `Could not load peers: ${peersErr?.message ?? "unknown"}` };
  }

  const updates = computeReorder(peers as Array<{ id: string }>, productId, direction);
  if (!updates) {
    return { ok: true, noop: true };
  }

  // Apply renumbered sort_order to every peer. Parallel writes;
  // audit_log fires once per row. For the current scale (~30 products
  // per category) that is fine.
  const writes = await Promise.all(
    updates.map((u) =>
      supabase.from("products").update({ sort_order: u.sort_order }).eq("id", u.id)
    )
  );
  const writeErr = writes.find((w) => w.error)?.error;
  if (writeErr) {
    return { ok: false, error: `Reorder write failed: ${writeErr.message}` };
  }

  revalidatePath("/admin/products");
  revalidatePath("/en/products", "layout");
  revalidatePath("/fr/products", "layout");
  updateTag("products");

  return { ok: true };
}
