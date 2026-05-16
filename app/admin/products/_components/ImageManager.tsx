"use client";

import { useState, useRef } from "react";

interface ProductImage {
  id: string;
  path: string;
  alt_text: string | null;
  sort_order: number | null;
}

interface ImageManagerProps {
  productId: string;
  initialImages: ProductImage[];
}

export default function ImageManager({ productId, initialImages }: ImageManagerProps) {
  const [images, setImages] = useState<ProductImage[]>(
    [...initialImages].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  function getPublicUrl(path: string) {
    // Leading "/" → local /public file (seeded rows). Anything else is
    // a Supabase Storage object path written by the uploader.
    if (path.startsWith("/")) return path;
    return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`;
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("productId", productId);

        const res = await fetch("/api/admin/images", { method: "POST", body: fd });
        const json = await res.json();

        if (!res.ok || !json.ok) {
          setError(json.error ?? "Upload failed");
          break;
        }

        // The storage upload may succeed while the DB insert fails;
        // route returns ok:true with id:null in that case. Surface
        // that as a real error so the operator doesn't end up with
        // a row that subsequent reorder/delete cannot find.
        if (!json.id) {
          setError("Uploaded to storage but the DB row could not be created. Refresh and try again.");
          break;
        }

        // Re-fetch the product's images list by adding the returned image
        setImages((prev) => [
          ...prev,
          {
            id: json.id,
            path: json.path,
            alt_text: null,
            sort_order: prev.length,
          },
        ]);
      }
    } catch {
      setError("Upload failed, please try again");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(imageId: string, path: string) {
    if (!confirm("Remove this image?")) return;
    const res = await fetch(
      `/api/admin/images?path=${encodeURIComponent(path)}&id=${encodeURIComponent(imageId)}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } else {
      setError("Failed to delete image");
    }
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((img, i) => ({ ...img, sort_order: i }));
    });
  }

  function moveDown(index: number) {
    setImages((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((img, i) => ({ ...img, sort_order: i }));
    });
  }

  async function saveOrder() {
    const res = await fetch("/api/admin/images/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: images.map((img) => ({ id: img.id, sort_order: img.sort_order })) }),
    });
    if (!res.ok) setError("Failed to save order");
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="font-sans text-[12px] text-bb-tertiary" role="alert">
          {error}
        </p>
      )}

      {images.length === 0 ? (
        <p className="font-sans text-[13px] text-bb-on-surface-variant">No images yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div key={img.id} className="relative border border-bb-line group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getPublicUrl(img.path)}
                alt={img.alt_text ?? "Product image"}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-1 bg-bb-bg/80 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="px-2 py-1 font-sans text-[10px] border border-bb-line disabled:opacity-30 hover:border-bb-primary"
                    title="Move left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === images.length - 1}
                    className="px-2 py-1 font-sans text-[10px] border border-bb-line disabled:opacity-30 hover:border-bb-primary"
                    title="Move right"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(img.id, img.path)}
                  className="px-2 py-1 font-sans text-[10px] border border-bb-line text-bb-tertiary hover:bg-bb-tertiary hover:text-bb-bg"
                >
                  ×
                </button>
              </div>
              {index === 0 && (
                <span className="absolute top-1 left-1 bg-bb-primary text-bb-bg font-sans text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5">
                  Hero
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 flex-wrap">
        <label className="cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            // See HeroImageUploader for why this is image/* not a list.
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={uploading}
          />
          <span className="inline-block bg-bb-primary text-bb-bg px-6 py-3 font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors cursor-pointer">
            {uploading ? "Uploading…" : "Upload images"}
          </span>
        </label>

        {images.length > 1 && (
          <button
            type="button"
            onClick={saveOrder}
            className="border border-bb-line px-6 py-3 font-sans text-[12px] uppercase tracking-[0.18em] hover:border-bb-primary transition-colors"
          >
            Save order
          </button>
        )}
      </div>

      <p className="font-sans text-[11px] text-bb-on-surface-variant">
        JPEG, PNG, WebP, AVIF, HEIC, HEIF, or GIF. Max 16 MB per image. First image is the hero.
      </p>
    </div>
  );
}
