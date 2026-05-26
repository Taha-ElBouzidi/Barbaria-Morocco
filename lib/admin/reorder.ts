/**
 * Shared reorder logic for admin lists.
 *
 * Given an ordered list of peers, the id of the item to move, and a
 * direction, returns the post-swap mapping of `{ id, sort_order }`
 * with `sort_order` renumbered from 0. Returns `null` if the move is
 * a no-op (id not in peers, already at the relevant edge).
 *
 * Renumbering 0..n-1 on every swap keeps `sort_order` ties from
 * accumulating: without it an item moved past a peer with the same
 * value would visually stay put.
 *
 * Pure function: no DB access, no IO. Server actions in
 * `app/admin/gift-boxes/actions.ts` and
 * `app/admin/products/actions.ts` call this then issue the writes.
 */
export function computeReorder(
  peers: Array<{ id: string }>,
  itemId: string,
  direction: "up" | "down"
): Array<{ id: string; sort_order: number }> | null {
  const idx = peers.findIndex((p) => p.id === itemId);
  if (idx === -1) return null;
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= peers.length) return null;

  const reordered = [...peers];
  [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];

  return reordered.map((p, i) => ({ id: p.id, sort_order: i }));
}
