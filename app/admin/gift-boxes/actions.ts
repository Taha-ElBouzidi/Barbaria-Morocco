"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin/auth";
import { computeReorder } from "@/lib/admin/reorder";

/**
 * List-level gift-box actions. Per-item actions live in [id]/actions.ts.
 */

export type ReorderResult = { ok: true; noop?: boolean } | { ok: false; error: string };

export async function reorderGiftBox(
  boxId: string,
  direction: "up" | "down"
): Promise<ReorderResult> {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  // Fetch the moving box first to know its category.
  const { data: box, error: boxErr } = await supabase
    .from("gift_boxes")
    .select("id, category_id")
    .eq("id", boxId)
    .single();
  if (boxErr || !box) {
    return { ok: false, error: `Gift box not found: ${boxErr?.message ?? "unknown"}` };
  }

  // Pull every peer in the same category, ordered the same way the
  // public site reads them: sort_order first, created_at as a stable
  // tiebreaker. Without the tiebreaker, peers with equal sort_order
  // would be effectively unsortable.
  const { data: peers, error: peersErr } = await supabase
    .from("gift_boxes")
    .select("id, sort_order, created_at")
    .eq("category_id", box.category_id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (peersErr || !peers) {
    return { ok: false, error: `Could not load peers: ${peersErr?.message ?? "unknown"}` };
  }

  const updates = computeReorder(peers as Array<{ id: string }>, boxId, direction);
  if (!updates) {
    return { ok: true, noop: true };
  }

  // Write every peer's new sort_order. Supabase has no atomic batched
  // UPDATE primitive, so we fire these in parallel; the trigger logs
  // one audit entry per row. For 2-7 boxes per category that is fine.
  const writes = await Promise.all(
    updates.map((u) =>
      supabase.from("gift_boxes").update({ sort_order: u.sort_order }).eq("id", u.id)
    )
  );
  const writeErr = writes.find((w) => w.error)?.error;
  if (writeErr) {
    return { ok: false, error: `Reorder write failed: ${writeErr.message}` };
  }

  revalidatePath("/admin/gift-boxes");
  revalidatePath("/en/products", "layout");
  revalidatePath("/fr/products", "layout");
  updateTag("products");

  return { ok: true };
}
