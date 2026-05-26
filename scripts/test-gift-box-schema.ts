import { GiftBoxSaveSchema } from "../lib/admin/gift-boxes";

function probe(label: string, input: unknown) {
  const r = GiftBoxSaveSchema.safeParse(input);
  if (r.success) {
    console.log(`PASS  ${label}`);
  } else {
    console.log(`FAIL  ${label}  →  ${r.error.issues[0].path.join(".")}: ${r.error.issues[0].message}`);
  }
}

probe("non-customizable + empty customSizeOptions (should PASS — checkboxes are hidden)", {
  slug: "test-slug",
  categoryId: "00000000-0000-0000-0000-000000000000",
  isCustomizable: false,
  customSizeOptions: [],
  translations: { en: { name: "X" }, fr: { name: "X" } },
  itemProductIds: [],
});

probe("customizable + empty customSizeOptions (should FAIL — wizard needs ≥1 size)", {
  slug: "test-slug-2",
  categoryId: "00000000-0000-0000-0000-000000000000",
  isCustomizable: true,
  customSizeOptions: [],
  translations: { en: { name: "X" }, fr: { name: "X" } },
  itemProductIds: [],
});

probe("customizable + [3,5] (should PASS)", {
  slug: "test-slug-3",
  categoryId: "00000000-0000-0000-0000-000000000000",
  isCustomizable: true,
  customSizeOptions: [3, 5],
  translations: { en: { name: "X" }, fr: { name: "X" } },
  itemProductIds: [],
});
