import { computeReorder } from "../lib/admin/reorder";

function probe(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) {
    console.log(`  got:  ${JSON.stringify(got)}`);
    console.log(`  want: ${JSON.stringify(want)}`);
  }
}

// Realistic shape: a cosmetics category with 5 products.
const cosmetics = [
  { id: "huile-argan" },
  { id: "savon-beldi-nila" },
  { id: "gommage-aker-fassi" },
  { id: "serum-eclat" },
  { id: "hydrolat-rose" },
];

probe(
  "products: move serum-eclat up swaps with gommage-aker-fassi",
  computeReorder(cosmetics, "serum-eclat", "up"),
  [
    { id: "huile-argan", sort_order: 0 },
    { id: "savon-beldi-nila", sort_order: 1 },
    { id: "serum-eclat", sort_order: 2 },
    { id: "gommage-aker-fassi", sort_order: 3 },
    { id: "hydrolat-rose", sort_order: 4 },
  ]
);

probe(
  "products: move first up is no-op",
  computeReorder(cosmetics, "huile-argan", "up"),
  null
);

probe(
  "products: move last down is no-op",
  computeReorder(cosmetics, "hydrolat-rose", "down"),
  null
);

probe(
  "products: move second-to-last down swaps with last",
  computeReorder(cosmetics, "serum-eclat", "down"),
  [
    { id: "huile-argan", sort_order: 0 },
    { id: "savon-beldi-nila", sort_order: 1 },
    { id: "gommage-aker-fassi", sort_order: 2 },
    { id: "hydrolat-rose", sort_order: 3 },
    { id: "serum-eclat", sort_order: 4 },
  ]
);
