"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveRitual } from "@/app/admin/rituals/[id]/actions";
import { cn } from "@/lib/utils";

interface RitualEditorProps {
  id: string;
  initialData: {
    sort_order: number | null;
    hero_image_path: string | null;
    updated_at: string | null;
    translations: Array<{
      locale: string;
      eyebrow: string;
      name: string;
      tagline: string;
      lede: string;
    }>;
  };
}

type LocaleFields = { eyebrow: string; name: string; tagline: string; lede: string };

export default function RitualEditor({ id, initialData }: RitualEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const enT = initialData.translations.find((t) => t.locale === "en");
  const frT = initialData.translations.find((t) => t.locale === "fr");

  const [sortOrder, setSortOrder] = useState(initialData.sort_order?.toString() ?? "0");
  const [heroImagePath, setHeroImagePath] = useState(initialData.hero_image_path ?? "");
  const [activeLocale, setActiveLocale] = useState<"en" | "fr">("en");
  const [en, setEn] = useState<LocaleFields>({
    eyebrow: enT?.eyebrow ?? "",
    name: enT?.name ?? "",
    tagline: enT?.tagline ?? "",
    lede: enT?.lede ?? "",
  });
  const [fr, setFr] = useState<LocaleFields>({
    eyebrow: frT?.eyebrow ?? "",
    name: frT?.name ?? "",
    tagline: frT?.tagline ?? "",
    lede: frT?.lede ?? "",
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);
    try {
      const file = files[0];
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/images", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setUploadError(json.error ?? "Upload failed");
      } else {
        setHeroImagePath(json.path);
      }
    } catch {
      setUploadError("Upload failed — please try again");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit() {
    if (!formRef.current) return;
    setServerError(null);
    setSaved(false);

    const fd = new FormData(formRef.current);
    fd.set("sortOrder", sortOrder);
    fd.set("heroImagePath", heroImagePath || "");
    fd.set("en_eyebrow", en.eyebrow);
    fd.set("en_name", en.name);
    fd.set("en_tagline", en.tagline);
    fd.set("en_lede", en.lede);
    fd.set("fr_eyebrow", fr.eyebrow);
    fd.set("fr_name", fr.name);
    fd.set("fr_tagline", fr.tagline);
    fd.set("fr_lede", fr.lede);

    startTransition(async () => {
      const result = await saveRitual(id, fd);
      if (!result.ok) {
        setServerError(result.error ?? "Save failed");
      } else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-10">
      {initialData.updated_at && (
        <p className="font-sans text-[12px] text-bb-on-surface-variant">
          Last updated {new Date(initialData.updated_at).toLocaleString("en-GB")}
        </p>
      )}

      {saved && (
        <div className="border border-green-200 bg-green-50 px-4 py-3">
          <p className="font-sans text-[13px] text-green-800">Ritual saved successfully.</p>
        </div>
      )}

      {serverError && (
        <div className="border border-bb-tertiary bg-bb-tertiary/5 px-4 py-3">
          <p className="font-sans text-[13px] text-bb-tertiary" role="alert">
            {serverError}
          </p>
        </div>
      )}

      <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="space-y-10">
        {/* Section 1: Identity */}
        <section className="space-y-6">
          <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary border-b border-bb-line pb-2">
            Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                ID (read-only)
              </span>
              <p className="font-mono text-[13px] text-bb-on-surface-variant">{id}</p>
            </div>

            <label className="block">
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                Sort order
              </span>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus:outline-none focus:border-bb-primary"
              />
            </label>
          </div>
        </section>

        {/* Section 2: Hero image */}
        <section className="space-y-6">
          <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary border-b border-bb-line pb-2">
            Hero image
          </h2>

          {heroImagePath && (
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${supabaseUrl}/storage/v1/object/public/product-images/${heroImagePath}`}
                alt="Ritual hero"
                className="w-32 h-32 object-cover border border-bb-line"
              />
              <div className="space-y-2">
                <p className="font-mono text-[11px] text-bb-on-surface-variant break-all">
                  {heroImagePath}
                </p>
                <button
                  type="button"
                  onClick={() => setHeroImagePath("")}
                  className="font-sans text-[11px] text-bb-tertiary hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {uploadError && (
            <p className="font-sans text-[12px] text-bb-tertiary" role="alert">
              {uploadError}
            </p>
          )}

          <label className="cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={(e) => handleImageUpload(e.target.files)}
              disabled={uploading}
            />
            <span className="inline-block border border-bb-line px-6 py-3 font-sans text-[12px] uppercase tracking-[0.18em] hover:border-bb-primary transition-colors cursor-pointer">
              {uploading ? "Uploading…" : heroImagePath ? "Replace image" : "Upload image"}
            </span>
          </label>
        </section>

        {/* Section 3: Translations */}
        <section className="space-y-6">
          <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary border-b border-bb-line pb-2">
            Translations
          </h2>

          <div className="flex border-b border-bb-line gap-0">
            {(["en", "fr"] as const).map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => setActiveLocale(locale)}
                className={cn(
                  "px-6 py-3 font-sans text-[12px] uppercase tracking-[0.18em] border-b-2 -mb-px transition-colors",
                  activeLocale === locale
                    ? "border-bb-primary text-bb-primary"
                    : "border-transparent text-bb-on-surface-variant hover:text-bb-on-surface"
                )}
              >
                {locale === "en" ? "English" : "Français"}
              </button>
            ))}
          </div>

          {(["en", "fr"] as const).map((locale) => {
            const vals = locale === "en" ? en : fr;
            const setter = locale === "en"
              ? (field: keyof LocaleFields, value: string) =>
                  setEn((prev) => ({ ...prev, [field]: value }))
              : (field: keyof LocaleFields, value: string) =>
                  setFr((prev) => ({ ...prev, [field]: value }));
            const hidden = locale !== activeLocale;

            return (
              <div key={locale} className={cn("space-y-4", hidden && "hidden")}>
                {(["eyebrow", "name", "tagline"] as const).map((field) => (
                  <label key={field} className="block">
                    <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2 capitalize">
                      {field} *
                    </span>
                    <input
                      type="text"
                      value={vals[field]}
                      onChange={(e) => setter(field, e.target.value)}
                      required={locale === "en"}
                      className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus:outline-none focus:border-bb-primary"
                    />
                  </label>
                ))}

                <label className="block">
                  <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                    Lede *
                  </span>
                  <textarea
                    value={vals.lede}
                    onChange={(e) => setter("lede", e.target.value)}
                    required={locale === "en"}
                    rows={4}
                    className="w-full bg-transparent border border-bb-line p-3 text-bb-on-surface focus:outline-none focus:border-bb-primary resize-y"
                  />
                </label>
              </div>
            );
          })}
        </section>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-bb-line">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-bb-primary text-bb-bg px-8 py-4 font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
