import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

// Sharp pulls native bindings; force Node runtime (Edge can't run it).
export const runtime = "nodejs";

// Accept JPEG, PNG, WebP, AVIF (web-native), plus HEIC/HEIF (iOS/iPadOS
// default camera format) and GIF (occasional brand assets). Supabase
// Storage stores them as-is; next/image transcodes the served variants
// to AVIF/WebP at request time per next.config.ts images.formats.
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/gif",
]);
const MAX_SIZE_BYTES = 16 * 1024 * 1024; // 16 MB (HEIC + AVIF often run larger than JPEG)

// iOS Safari sometimes hands us files with `type === ""` or
// `application/octet-stream` when the Photos picker passes a HEIC/HEIF
// through without auto-converting. Map the filename extension to a
// real MIME in those cases so the upload still succeeds.
const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
  gif: "image/gif",
};

function resolveMime(file: File): string {
  const declared = (file.type || "").toLowerCase();
  if (declared && declared !== "application/octet-stream") return declared;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_MIME[ext] ?? declared;
}

// ---------------------------------------------------------------------------
// POST /api/admin/images, upload one image to Supabase Storage
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

  const resolvedMime = resolveMime(file);

  if (!ALLOWED_MIME.has(resolvedMime)) {
    return NextResponse.json(
      {
        ok: false,
        error: `File type ${resolvedMime || file.type || "(unknown)"} is not allowed. Use JPEG, PNG, WebP, AVIF, HEIC, HEIF, or GIF.`,
      },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { ok: false, error: "File exceeds the 16 MB size limit." },
      { status: 400 }
    );
  }

  // Compress + re-encode every upload to WebP at quality 82, resized
  // to max 2400px on the longest edge. Why:
  // - iPhone / iPad originals run 5–10 MB; storing them as-is wastes
  //   Supabase Storage quota and slows admin loads of the image grid.
  // - HEIC has spotty <img> support; transcoding to WebP makes every
  //   stored file directly browser-renderable (admin previews + the
  //   storage public URL fallback both work without next/image).
  // - The public site still goes through next/image for AVIF/WebP
  //   variants at serve time; we just stop holding bloated originals.
  // - GIFs are passed through without re-encoding so animation stays.
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  let outputBuffer: Buffer;
  let outputMime: string;
  let outputExt: string;
  if (resolvedMime === "image/gif") {
    outputBuffer = inputBuffer;
    outputMime = "image/gif";
    outputExt = "gif";
  } else {
    try {
      outputBuffer = await sharp(inputBuffer, { failOn: "none" })
        .rotate() // honour EXIF orientation (iPhone photos)
        .resize({
          width: 2400,
          height: 2400,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();
      outputMime = "image/webp";
      outputExt = "webp";
    } catch (e) {
      console.error("[admin/images] sharp re-encode failed:", e);
      return NextResponse.json(
        { ok: false, error: "Could not process the image. Try a different file." },
        { status: 500 }
      );
    }
  }

  const filename = `${crypto.randomUUID()}.${outputExt}`;
  const folder = productId ? `products/${productId}` : `drafts/${crypto.randomUUID()}`;
  const path = `${folder}/${filename}`;

  const supabase = createServiceRoleClient();

  const { error: storageError } = await supabase.storage
    .from("product-images")
    .upload(path, outputBuffer, { contentType: outputMime, upsert: false });

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
      // Image in storage but no DB row, log and still return success with the path
      console.error("[admin/images POST] DB insert failed:", insertError?.message);
    } else {
      imageId = inserted.id;
    }
  }

  return NextResponse.json({ ok: true, path, id: imageId });
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/images?path=...&id=..., remove from storage + DB
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

