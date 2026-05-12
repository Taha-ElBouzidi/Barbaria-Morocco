"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin/auth";
import { ProductSaveSchema } from "@/lib/admin/products";

// ---------------------------------------------------------------------------
// saveProduct — upsert all relations atomically
// ---------------------------------------------------------------------------

export async function saveProduct(
  id: string | "new",
  formData: FormData
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdmin();

  const raw = {
    slug: formData.get("slug"),
    ritualId: formData.get("ritualId"),
    subcategoryId: formData.get("subcategoryId") || null,
    moq: formData.get("moq"),
    formats: formData.getAll("formats"),
    lead: formData.get("lead"),
    origin: formData.get("origin") || null,
    ritualLabel: formData.get("ritualLabel") || null,
    hero: formData.get("hero") === "true",
    translations: {
      en: {
        name: formData.get("en_name"),
        short: formData.get("en_short"),
        lede: formData.get("en_lede") || null,
      },
      fr: {
        name: formData.get("fr_name"),
        short: formData.get("fr_short"),
        lede: formData.get("fr_lede") || null,
      },
    },
    facetIds: formData.getAll("facetIds"),
    applicationSteps: parseApplicationSteps(formData),
  };

  const parsed = ProductSaveSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { ok: false, error: `${firstIssue.path.join(".")}: ${firstIssue.message}` };
  }

  const data = parsed.data;
  const supabase = createServiceRoleClient();
  const isNew = id === "new";

  // Upsert the product row
  const productPayload = {
    slug: data.slug,
    ritual_id: data.ritualId,
    subcategory_id: data.subcategoryId,
    moq: data.moq,
    formats: data.formats,
    lead: data.lead,
    origin: data.origin,
    ritual_label: data.ritualLabel,
    hero: data.hero,
  };

  let productId: string;

  if (isNew) {
    const { data: inserted, error } = await supabase
      .from("products")
      .insert({ ...productPayload, status: "draft" })
      .select("id")
      .single();
    if (error || !inserted) {
      return { ok: false, error: `Failed to create product: ${error?.message ?? "unknown"}` };
    }
    productId = inserted.id;
  } else {
    const { error } = await supabase
      .from("products")
      .update(productPayload)
      .eq("id", id);
    if (error) {
      return { ok: false, error: `Failed to update product: ${error.message}` };
    }
    productId = id;
  }

  // Upsert translations (upsert by product_id + locale)
  const translationRows = [
    { product_id: productId, locale: "en", ...flattenTranslation(data.translations.en) },
    { product_id: productId, locale: "fr", ...flattenTranslation(data.translations.fr) },
  ];

  const { error: translationError } = await supabase
    .from("product_translations")
    .upsert(translationRows, { onConflict: "product_id,locale" });

  if (translationError) {
    return { ok: false, error: `Failed to save translations: ${translationError.message}` };
  }

  // Replace facets (delete all then insert)
  await supabase.from("product_facets").delete().eq("product_id", productId);
  if (data.facetIds.length > 0) {
    const { error: facetsError } = await supabase.from("product_facets").insert(
      data.facetIds.map((facetId) => ({ product_id: productId, facet_id: facetId }))
    );
    if (facetsError) {
      return { ok: false, error: `Failed to save facets: ${facetsError.message}` };
    }
  }

  // Replace application steps (delete all then insert)
  await supabase.from("product_application_steps").delete().eq("product_id", productId);
  if (data.applicationSteps.length > 0) {
    const stepRows = data.applicationSteps.flatMap((step) => [
      {
        product_id: productId,
        step_number: step.stepNumber,
        locale: "en",
        title: step.en.title,
        body: step.en.body,
      },
      {
        product_id: productId,
        step_number: step.stepNumber,
        locale: "fr",
        title: step.fr.title,
        body: step.fr.body,
      },
    ]);

    const { error: stepsError } = await supabase
      .from("product_application_steps")
      .insert(stepRows);
    if (stepsError) {
      return { ok: false, error: `Failed to save application steps: ${stepsError.message}` };
    }
  }

  // Revalidate public pages
  revalidatePath(`/en/product/${data.slug}`);
  revalidatePath(`/fr/product/${data.slug}`);
  revalidatePath(`/en/rituals/${data.ritualId}`);
  revalidatePath(`/fr/rituals/${data.ritualId}`);

  return { ok: true, id: productId };
}

// ---------------------------------------------------------------------------
// setStatus — publish / unpublish
// ---------------------------------------------------------------------------

export async function setStatus(
  id: string,
  status: "draft" | "published"
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  const updatePayload: Record<string, unknown> = { status };
  if (status === "published") {
    updatePayload.published_at = new Date().toISOString();
  }

  const { data: product, error } = await supabase
    .from("products")
    .update(updatePayload)
    .eq("id", id)
    .select("slug, ritual_id")
    .single();

  if (error || !product) {
    return { ok: false, error: error?.message ?? "Product not found" };
  }

  revalidatePath(`/en/product/${product.slug}`);
  revalidatePath(`/fr/product/${product.slug}`);
  revalidatePath(`/en/rituals/${product.ritual_id}`);
  revalidatePath(`/fr/rituals/${product.ritual_id}`);

  return { ok: true };
}

// ---------------------------------------------------------------------------
// deleteProduct — cascades via FK
// ---------------------------------------------------------------------------

export async function deleteProduct(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = createServiceRoleClient();

  // Grab slug + ritual before delete for revalidation
  const { data: product } = await supabase
    .from("products")
    .select("slug, ritual_id")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  if (product) {
    revalidatePath(`/en/product/${product.slug}`);
    revalidatePath(`/fr/product/${product.slug}`);
    revalidatePath(`/en/rituals/${product.ritual_id}`);
    revalidatePath(`/fr/rituals/${product.ritual_id}`);
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// redirectAfterSave — used by client after successful save
// ---------------------------------------------------------------------------

export async function redirectToEdit(id: string) {
  redirect(`/admin/products/${id}?saved=1`);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function flattenTranslation(t: { name: string; short: string; lede: string | null }) {
  return { name: t.name, short: t.short, lede: t.lede };
}

function parseApplicationSteps(formData: FormData) {
  const steps: Array<{
    stepNumber: number;
    en: { title: string; body: string };
    fr: { title: string; body: string };
  }> = [];

  for (let i = 1; i <= 3; i++) {
    const enTitle = formData.get(`step_${i}_en_title`) as string | null;
    const enBody = formData.get(`step_${i}_en_body`) as string | null;
    const frTitle = formData.get(`step_${i}_fr_title`) as string | null;
    const frBody = formData.get(`step_${i}_fr_body`) as string | null;

    // Only include step if at least EN title + body are filled
    if (enTitle?.trim() && enBody?.trim()) {
      steps.push({
        stepNumber: i,
        en: { title: enTitle.trim(), body: enBody.trim() },
        fr: { title: frTitle?.trim() ?? "", body: frBody?.trim() ?? "" },
      });
    }
  }

  return steps;
}
