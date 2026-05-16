"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveAtelier, redirectToAtelierEdit } from "@/app/admin/ateliers/[id]/actions";
import { cn } from "@/lib/utils";

interface AtelierEditorProps {
  id?: string;
  initialData?: {
    slug: string;
    name: string;
    region: string;
    since_year: number;
    sort_order: number | null;
    image_path: string | null;
    updated_at: string | null;
    translations: Array<{ locale: string; description: string }>;
  };
}

type LocaleFields = { description: string };

export default function AtelierEditor({ id, initialData }: AtelierEditorProps) {
  const isNew = !id;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const enT = initialData?.translations?.find((t) => t.locale === "en");
  const frT = initialData?.translations?.find((t) => t.locale === "fr");

  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [name, setName] = useState(initialData?.name ?? "");
  const [region, setRegion] = useState(initialData?.region ?? "");
  const [sinceYear, setSinceYear] = useState(initialData?.since_year?.toString() ?? "");
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order?.toString() ?? "0");
  const [imagePath, setImagePath] = useState(initialData?.image_path ?? "");
  const [activeLocale, setActiveLocale] = useState<"en" | "fr">("en");
  const [en, setEn] = useState<LocaleFields>({ description: enT?.description ?? "" });
  const [fr, setFr] = useState<LocaleFields>({ description: frT?.description ?? "" });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  function handleNameChange(value: string) {
    setName(value);
    if (isNew) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
      );
    }
  }

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
        setImagePath(json.path);
      }
    } catch {
      setUploadError("Upload failed, please try again");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit() {
    if (!formRef.current) return;
    setServerError(null);

    const fd = new FormData(formRef.current);
    fd.set("slug", slug);
    fd.set("name", name);
    fd.set("region", region);
    fd.set("sinceYear", sinceYear);
    fd.set("sortOrder", sortOrder);
    fd.set("imagePath", imagePath || "");
    fd.set("en_description", en.description);
    fd.set("fr_description", fr.description);

    startTransition(async () => {
      const result = await saveAtelier(id ?? "new", fd);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }

      if (isNew) {
        await redirectToAtelierEdit(result.id);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-10">
      {!isNew && initialData?.updated_at && (
        <p className="font-sans text-[12px] text-bb-on-surface-variant">
          Last updated {new Date(initialData.updated_at).toLocaleString("en-GB")}
        </p>
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
          <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
            Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <label className="block">
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                Name *
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
                placeholder="e.g. Savonnerie Beldi"
              />
            </label>

            <label className="block">
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                Slug *
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                pattern="[a-z0-9-]+"
                required
                className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface font-mono text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
                placeholder="e.g. savonnerie-beldi"
              />
            </label>

            <label className="block">
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                Region *
              </span>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
                className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
                placeholder="e.g. Marrakech, Morocco"
              />
            </label>

            <label className="block">
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                Since year *
              </span>
              <input
                type="number"
                value={sinceYear}
                onChange={(e) => setSinceYear(e.target.value)}
                min={1900}
                max={2100}
                required
                className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
                placeholder="e.g. 1985"
              />
            </label>

            <label className="block">
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                Sort order
              </span>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
              />
            </label>
          </div>
        </section>

        {/* Section 2: Translations */}
        <section className="space-y-6">
          <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
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
            const setter = locale === "en" ? setEn : setFr;
            const hidden = locale !== activeLocale;
            return (
              <div key={locale} className={cn("space-y-4", hidden && "hidden")}>
                <label className="block">
                  <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                    Description *
                  </span>
                  <textarea
                    value={vals.description}
                    onChange={(e) => setter({ description: e.target.value })}
                    required={locale === "en"}
                    rows={4}
                    className="w-full bg-transparent border border-bb-line p-3 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary resize-y"
                    placeholder="Describe the atelier in a few sentences…"
                  />
                </label>
              </div>
            );
          })}
        </section>

        {/* Section 3: Image */}
        <section className="space-y-6">
          <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
            Image
          </h2>

          {imagePath && (
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  imagePath.startsWith("/")
                    ? imagePath
                    : `${supabaseUrl}/storage/v1/object/public/product-images/${imagePath}`
                }
                alt="Atelier image"
                className="w-32 h-32 object-cover border border-bb-line"
              />
              <div className="space-y-2">
                <p className="font-mono text-[11px] text-bb-on-surface-variant break-all">
                  {imagePath}
                </p>
                <button
                  type="button"
                  onClick={() => setImagePath("")}
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
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleImageUpload(e.target.files)}
              disabled={uploading}
            />
            <span className="inline-block border border-bb-line px-6 py-3 font-sans text-[12px] uppercase tracking-[0.18em] hover:border-bb-primary transition-colors cursor-pointer">
              {uploading ? "Uploading…" : imagePath ? "Replace image" : "Upload image"}
            </span>
          </label>

          <p className="font-sans text-[11px] text-bb-on-surface-variant">
            JPEG, PNG, WebP, AVIF. Max 8 MB.
          </p>
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
