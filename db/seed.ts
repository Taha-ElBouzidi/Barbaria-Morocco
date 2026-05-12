import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { WORLDS, SUBCATS, FACETS, type RitualId } from "../lib/rituals";
import { PRODUCTS } from "../lib/products";
import { ATELIERS, JOURNAL } from "../lib/editorial";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set in .env.local");
if (!SERVICE_KEY || SERVICE_KEY === "__set_in_vercel__" || SERVICE_KEY.startsWith("__")) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is not set in .env.local. Get it from Supabase Dashboard → Project Settings → API → service_role secret."
  );
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function seedRituals() {
  console.log("→ Seeding rituals + translations + subcategories...");

  for (const [i, world] of WORLDS.entries()) {
    const { error } = await supabase.from("rituals").upsert(
      { id: world.id, sort_order: i, hero_image_path: world.hero ?? null },
      { onConflict: "id" }
    );
    if (error) throw new Error(`rituals upsert ${world.id}: ${error.message}`);

    for (const locale of ["en", "fr"] as const) {
      const { error: tErr } = await supabase.from("ritual_translations").upsert(
        {
          ritual_id: world.id,
          locale,
          eyebrow: world.eyebrow[locale],
          name: world.name[locale],
          tagline: world.tagline[locale],
          lede: world.lede[locale],
        },
        { onConflict: "ritual_id,locale" }
      );
      if (tErr) throw new Error(`ritual_translations upsert ${world.id} ${locale}: ${tErr.message}`);
    }
  }

  // Subcategories. Map (ritual_id, slug) → uuid id by reading them back after upsert.
  const subIdMap = new Map<string, string>(); // key: `${ritualId}:${slug}` → uuid
  for (const ritualId of ["hammam", "botanical", "heritage"] as RitualId[]) {
    const subs = SUBCATS[ritualId];
    for (const [i, sub] of subs.entries()) {
      const { data, error } = await supabase
        .from("ritual_subcategories")
        .upsert(
          { ritual_id: ritualId, slug: sub.id, sort_order: i },
          { onConflict: "ritual_id,slug" }
        )
        .select("id")
        .single();
      if (error || !data) throw new Error(`ritual_subcategories upsert ${ritualId}/${sub.id}: ${error?.message}`);
      subIdMap.set(`${ritualId}:${sub.id}`, data.id);

      for (const locale of ["en", "fr"] as const) {
        const { error: tErr } = await supabase.from("ritual_subcategory_translations").upsert(
          { subcategory_id: data.id, locale, name: sub.name[locale] },
          { onConflict: "subcategory_id,locale" }
        );
        if (tErr)
          throw new Error(`ritual_subcategory_translations upsert ${ritualId}/${sub.id} ${locale}: ${tErr.message}`);
      }
    }
  }

  return { subIdMap };
}

async function seedFacets() {
  console.log("→ Seeding facets...");
  const facetIdMap = new Map<string, string>();

  for (const [type, values] of Object.entries(FACETS) as Array<[keyof typeof FACETS, readonly string[]]>) {
    // FACETS has 'certif' but the schema enum is 'certification'.
    const normalizedType = type === "certif" ? "certification" : type;
    for (const [i, value] of values.entries()) {
      // FACETS only carries English labels; mirror as value_fr until admin translates.
      const { data, error } = await supabase
        .from("facets")
        .upsert(
          { type: normalizedType, value_en: value, value_fr: value, sort_order: i },
          { onConflict: "type,value_en" }
        )
        .select("id")
        .single();
      if (error || !data) throw new Error(`facets upsert ${type}/${value}: ${error?.message}`);
      facetIdMap.set(`${normalizedType}:${value}`, data.id);
    }
  }
  return facetIdMap;
}

async function seedProducts(subIdMap: Map<string, string>, facetIdMap: Map<string, string>) {
  console.log(`→ Seeding ${PRODUCTS.length} products + translations + images + application steps + facet links...`);

  for (const p of PRODUCTS) {
    const subcategory_id = subIdMap.get(`${p.world}:${p.sub}`) ?? null;
    if (!subcategory_id) {
      console.warn(`  ⚠ subcategory not found for ${p.id} (${p.world}/${p.sub}) — leaving null`);
    }

    const { data: prodRow, error: pErr } = await supabase
      .from("products")
      .upsert(
        {
          slug: p.id,
          ritual_id: p.world,
          subcategory_id,
          moq: p.moq,
          formats: p.formats,
          lead: p.lead,
          origin: p.origin ?? null,
          ritual_label: p.ritual ?? null,
          hero: p.hero ?? false,
          status: "published",
          published_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();
    if (pErr || !prodRow) throw new Error(`products upsert ${p.id}: ${pErr?.message}`);
    const productId = prodRow.id;

    for (const locale of ["en", "fr"] as const) {
      const { error: tErr } = await supabase.from("product_translations").upsert(
        {
          product_id: productId,
          locale,
          name: p.name[locale],
          short: p.short[locale],
          lede: p.lede?.[locale] ?? null,
        },
        { onConflict: "product_id,locale" }
      );
      if (tErr) throw new Error(`product_translations ${p.id} ${locale}: ${tErr.message}`);
    }

    // Images: delete-then-insert so re-runs reflect upstream edits.
    if (p.images.length > 0) {
      await supabase.from("product_images").delete().eq("product_id", productId);
      const imageRows = p.images.map((path, i) => ({
        product_id: productId,
        path,
        alt_text: null,
        sort_order: i,
      }));
      const { error: iErr } = await supabase.from("product_images").insert(imageRows);
      if (iErr) throw new Error(`product_images ${p.id}: ${iErr.message}`);
    }

    // Application steps: delete-then-insert.
    // application[i].en and .fr are [title, body] tuples.
    if (p.application && p.application.length > 0) {
      await supabase.from("product_application_steps").delete().eq("product_id", productId);
      const stepRows = p.application.flatMap((step, i) =>
        (["en", "fr"] as const).map((locale) => ({
          product_id: productId,
          step_number: i + 1,
          locale,
          title: step[locale][0],
          body: step[locale][1],
        }))
      );
      const { error: sErr } = await supabase.from("product_application_steps").insert(stepRows);
      if (sErr) throw new Error(`product_application_steps ${p.id}: ${sErr.message}`);
    }

    // Facet links: replace the full set on each run.
    await supabase.from("product_facets").delete().eq("product_id", productId);
    const facetLinks: { product_id: string; facet_id: string }[] = [];
    for (const tag of p.tags) {
      let matchedFacet: string | undefined;
      for (const axis of ["ingredient", "use", "format", "packaging", "certification"] as const) {
        const fid = facetIdMap.get(`${axis}:${tag}`);
        if (fid) {
          matchedFacet = fid;
          break;
        }
      }
      if (!matchedFacet) {
        console.warn(`  ⚠ product ${p.id} tag "${tag}" matches no facet — skipping`);
        continue;
      }
      facetLinks.push({ product_id: productId, facet_id: matchedFacet });
    }
    if (facetLinks.length > 0) {
      const { error: fErr } = await supabase.from("product_facets").insert(facetLinks);
      if (fErr) throw new Error(`product_facets ${p.id}: ${fErr.message}`);
    }

    console.log(`  ✓ ${p.id}`);
  }
}

async function seedAteliers() {
  console.log("→ Seeding 6 ateliers + translations...");
  for (const [i, a] of ATELIERS.entries()) {
    const { data, error } = await supabase
      .from("ateliers")
      .upsert(
        {
          slug: a.id,
          name: a.name,
          region: a.region,
          since_year: a.since,
          image_path: a.image ?? null,
          sort_order: i,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();
    if (error || !data) throw new Error(`ateliers upsert ${a.id}: ${error?.message}`);

    for (const locale of ["en", "fr"] as const) {
      const { error: tErr } = await supabase.from("atelier_translations").upsert(
        { atelier_id: data.id, locale, description: a.description[locale] },
        { onConflict: "atelier_id,locale" }
      );
      if (tErr) throw new Error(`atelier_translations ${a.id} ${locale}: ${tErr.message}`);
    }
  }
}

async function seedJournal() {
  console.log("→ Seeding 6 journal cards + translations...");
  for (const c of JOURNAL) {
    const { data, error } = await supabase
      .from("journal_cards")
      .upsert(
        {
          slug: c.id,
          date: c.date,
          image_path: c.image ?? null,
          feature: c.feature ?? false,
          status: "published",
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();
    if (error || !data) throw new Error(`journal_cards upsert ${c.id}: ${error?.message}`);

    for (const locale of ["en", "fr"] as const) {
      const { error: tErr } = await supabase.from("journal_card_translations").upsert(
        {
          card_id: data.id,
          locale,
          kicker: c.kicker[locale],
          headline: c.headline[locale],
        },
        { onConflict: "card_id,locale" }
      );
      if (tErr) throw new Error(`journal_card_translations ${c.id} ${locale}: ${tErr.message}`);
    }
  }
}

/**
 * Drops products and ritual_subcategories whose slugs no longer appear in the
 * source data. Cascades to translations / images / facets / application steps.
 * Run first so the rest of the seed can upsert against a clean baseline.
 */
async function purgeOrphans() {
  console.log("→ Purging orphan products and subcategories...");
  const validProductSlugs = PRODUCTS.map((p) => p.id);
  const { data: prodRows } = await supabase.from("products").select("slug");
  const orphanProductSlugs = (prodRows ?? [])
    .map((r) => r.slug as string)
    .filter((slug) => !validProductSlugs.includes(slug));
  if (orphanProductSlugs.length > 0) {
    console.log(`  ✂ deleting ${orphanProductSlugs.length} orphan products: ${orphanProductSlugs.join(", ")}`);
    const { error } = await supabase.from("products").delete().in("slug", orphanProductSlugs);
    if (error) throw new Error(`orphan products delete: ${error.message}`);
  }

  // Surviving products may still reference subcats we are about to drop
  // (the catalogue refactor changes which subcat each product belongs to,
  // and seedProducts has not run yet to update the FK). Null the references
  // first so the subcat delete does not trip the foreign key constraint.
  // seedProducts re-attaches each product to its new subcategory_id below.
  const validSubKeys = new Set<string>();
  for (const ritualId of ["hammam", "botanical", "heritage"] as RitualId[]) {
    for (const s of SUBCATS[ritualId]) validSubKeys.add(`${ritualId}:${s.id}`);
  }
  const { data: subRows } = await supabase
    .from("ritual_subcategories")
    .select("id, ritual_id, slug");
  const orphanSubIds = (subRows ?? [])
    .filter((r) => !validSubKeys.has(`${r.ritual_id}:${r.slug}`))
    .map((r) => r.id as string);
  if (orphanSubIds.length > 0) {
    const { error: nullErr } = await supabase
      .from("products")
      .update({ subcategory_id: null })
      .in("subcategory_id", orphanSubIds);
    if (nullErr) throw new Error(`null product subcategory refs: ${nullErr.message}`);
    console.log(`  ✂ deleting ${orphanSubIds.length} orphan subcategories`);
    const { error } = await supabase.from("ritual_subcategories").delete().in("id", orphanSubIds);
    if (error) throw new Error(`orphan subcategories delete: ${error.message}`);
  }
}

async function main() {
  console.log("Seeding Supabase from lib/{rituals,products,editorial}.ts");
  console.log(`Project: ${SUPABASE_URL}\n`);

  await purgeOrphans();
  const { subIdMap } = await seedRituals();
  const facetIdMap = await seedFacets();
  await seedProducts(subIdMap, facetIdMap);
  await seedAteliers();
  await seedJournal();

  console.log("\n✓ Seed complete.");
  console.log("\nVerify counts in Supabase Studio or via MCP:");
  console.log(`  SELECT count(*) FROM products;              -- expect ${PRODUCTS.length}`);
  console.log("  SELECT count(*) FROM ateliers;              -- expect 6");
  console.log("  SELECT count(*) FROM journal_cards;         -- expect 6");
  console.log("  SELECT count(*) FROM facets;                -- expect ~50");
  console.log(`  SELECT count(*) FROM product_translations;  -- expect ${PRODUCTS.length * 2}`);
}

main().catch((err) => {
  console.error("\n✗ Seed failed:", err);
  process.exit(1);
});
