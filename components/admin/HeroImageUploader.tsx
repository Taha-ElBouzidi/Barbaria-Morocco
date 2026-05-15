"use client";

import { useRef, useState, useTransition } from "react";
import Icon from "@/components/primitives/Icon";

interface Props {
  /** Current stored path (e.g. "drafts/abc/xyz.jpg" or "/brand_photos/..."). */
  value: string;
  /** Called with the new path after a successful upload. */
  onChange: (path: string) => void;
  /** Hidden input name so the value still posts with the form. */
  name: string;
  /** Aspect ratio of the preview container. Defaults to 4/5. */
  aspect?: "1/1" | "4/5" | "16/9";
  /** Optional alt text for the preview. */
  alt?: string;
}

/**
 * Hero image upload widget. Uploads via POST /api/admin/images, drops the
 * resulting path into a hidden form input so server actions don't need
 * to know about the upload. Shows the current image as a preview;
 * accepts re-upload to replace.
 */
export default function HeroImageUploader({ value, onChange, name, aspect = "4/5", alt = "" }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const previewUrl = value
    ? value.startsWith("/")
      ? value
      : `${SUPABASE_URL}/storage/v1/object/public/product-images/${value}`
    : null;

  const handleFile = (file: File) => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/admin/images", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setError(json.error ?? "Upload failed");
          return;
        }
        onChange(json.path);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    });
  };

  void aspect;
  void alt;

  // Compact: 56x56 thumb + upload button beside it. No big preview that
  // hogs vertical space; the admin just needs confirmation that the
  // upload succeeded and the option to replace.
  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 shrink-0 bg-bb-bg-low border border-bb-line overflow-hidden relative">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-bb-on-surface-variant">
              <Icon name="leaf" size={18} />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={pending}
          className="inline-flex items-center gap-2 px-3 py-2 min-h-[40px] border border-bb-line text-bb-on-surface text-[12px] uppercase tracking-[0.18em] hover:border-bb-primary disabled:opacity-50 transition-colors"
        >
          {pending ? "Uploading…" : previewUrl ? "Replace" : "Upload image"}
        </button>
        {previewUrl && !pending && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[11px] uppercase tracking-[0.18em] text-bb-tertiary hover:opacity-70 px-3 py-2 min-h-[40px]"
          >
            Remove
          </button>
        )}
        {previewUrl && !pending && (
          <span className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep flex items-center gap-1">
            <Icon name="check" size={14} /> Saved
          </span>
        )}
      </div>
      {error && <p className="text-[12px] text-bb-tertiary">{error}</p>}
      <p className="text-[11px] text-bb-on-surface-variant">
        JPG, PNG, WebP or AVIF. Maximum 8 MB.
      </p>
    </div>
  );
}
