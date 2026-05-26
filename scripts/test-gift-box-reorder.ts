import { computeReorder } from "../lib/admin/reorder";

function probe(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) {
    console.log(`  got:  ${JSON.stringify(got)}`);
    console.log(`  want: ${JSON.stringify(want)}`);
  }
}

const peers = [
  { id: "a" },
  { id: "b" },
  { id: "c" },
  { id: "d" },
];

probe(
  "move middle (b) up → b swaps with a, renumbered 0..3",
  computeReorder(peers, "b", "up"),
  [
    { id: "b", sort_order: 0 },
    { id: "a", sort_order: 1 },
    { id: "c", sort_order: 2 },
    { id: "d", sort_order: 3 },
  ]
);

probe(
  "move middle (b) down → b swaps with c",
  computeReorder(peers, "b", "down"),
  [
    { id: "a", sort_order: 0 },
    { id: "c", sort_order: 1 },
    { id: "b", sort_order: 2 },
    { id: "d", sort_order: 3 },
  ]
);

probe(
  "move top (a) up → no-op (null)",
  computeReorder(peers, "a", "up"),
  null
);

probe(
  "move bottom (d) down → no-op (null)",
  computeReorder(peers, "d", "down"),
  null
);

probe(
  "move non-existent box → no-op (null)",
  computeReorder(peers, "z", "up"),
  null
);

probe(
  "single-item list, any direction → no-op",
  computeReorder([{ id: "only" }], "only", "up"),
  null
);
