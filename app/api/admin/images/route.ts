import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

// ---------------------------------------------------------------------------
// POST /api/admin/images — upload one image to Supabase Storage
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid multipart body" }, { status: 400 });
  }

  const file = formData.get("file");
  const productId = (formData.get("productId") as string | null) ?? null;

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { ok: false, error: `File type ${file.type} is not allowed. Use JPEG, PNG, WebP, or AVIF.` },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { ok: false, error: "File exceeds the 8 MB size limit." },
      { status: 400 }
    );
  }

  const ext = extFromMime(file.type);
  const filename = `${crypto.randomUUID()}.${ext}`;
  const folder = productId ? `products/${productId}` : `drafts/${crypto.randomUUID()}`;
  const path = `${folder}/${filename}`;

  const supabase = createServiceRoleClient();
  const bytes = await file.arrayBuffer();

  const { error: storageError } = await supabase.storage
    .from("product-images")
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (storageError) {
    return NextResponse.json(
      { ok: false, error: `Storage upload failed: ${storageError.message}` },
      { status: 500 }
    );
  }

  // Insert a product_images row if we have a product id
  let imageId: string | null = null;
  if (productId) {
    // Determine sort_order = existing max + 1
    const { data: existing } = await supabase
      .from("product_images")
      .select("sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? ((existing[0].sort_order ?? 0) + 1) : 0;

    const { data: inserted, error: insertError } = await supabase
      .from("product_images")
      .insert({ product_id: productId, path, sort_order: nextOrder })
      .select("id")
      .single();

    if (insertError || !inserted) {
      // Image in storage but no DB row — log and still return success with the path
      console.error("[admin/images POST] DB insert failed:", insertError?.message);
    } else {
      imageId = inserted.id;
    }
  }

  return NextResponse.json({ ok: true, path, id: imageId });
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/images?path=...&id=... — remove from storage + DB
// ---------------------------------------------------------------------------

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  const id = searchParams.get("id");

  if (!path) {
    return NextResponse.json({ ok: false, error: "path query param is required" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Remove from storage
  const { error: storageError } = await supabase.storage
    .from("product-images")
    .remove([path]);

  if (storageError) {
    return NextResponse.json(
      { ok: false, error: `Storage delete failed: ${storageError.message}` },
      { status: 500 }
    );
  }

  // Remove from DB if id is provided
  if (id) {
    await supabase.from("product_images").delete().eq("id", id);
  }

  return NextResponse.json({ ok: true });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}
