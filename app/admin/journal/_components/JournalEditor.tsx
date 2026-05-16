"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveJournalCard, redirectToJournalEdit } from "@/app/admin/journal/[id]/actions";
import { cn } from "@/lib/utils";

interface JournalEditorProps {
  id?: string;
  initialData?: {
    slug: string;
    date: string;
    image_path: string | null;
    feature: boolean;
    status: string;
    updated_at: string | null;
    translations: Array<{ locale: string; kicker: string; headline: string }>;
  };
}

type LocaleFields = { kicker: string; headline: string };

export default function JournalEditor({ id, initialData }: JournalEditorProps) {
  const isNew = !id;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const enT = initialData?.translations?.find((t) => t.locale === "en");
  const frT = initialData?.translations?.find((t) => t.locale === "fr");

  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [date, setDate] = useState(initialData?.date ?? "");
  const [feature, setFeature] = useState(initialData?.feature ?? false);
  const [imagePath, setImagePath] = useState(initialData?.image_path ?? "");
  const [activeLocale, setActiveLocale] = useState<"en" | "fr">("en");
  const [en, setEn] = useState<LocaleFields>({
    kicker: enT?.kicker ?? "",
    headline: enT?.headline ?? "",
  });
  const [fr, setFr] = useState<LocaleFields>({
    kicker: frT?.kicker ?? "",
    headline: frT?.headline ?? "",
  });

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  function handleLocaleChange(locale: "en" | "fr", field: keyof LocaleFields, value: string) {
    if (locale === "en") {
      const next = { ...en, [field]: value };
      setEn(next);
      if (field === "headline" && isNew) {
        setSlug(
          value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
        );
      }
    } else {
      setFr((prev) => ({ ...prev, [field]: value }));
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
      // Use a generic context path, image route stores it at drafts/{uuid}/{filename}
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

  async function handleSubmit(publish: boolean) {
    if (!formRef.current) return;
    setServerError(null);

    const fd = new FormData(formRef.current);
    fd.set("slug", slug);
    fd.set("date", date);
    fd.set("imagePath", imagePath || "");
    fd.set("feature", feature ? "true" : "false");
    fd.set("en_kicker", en.kicker);
    fd.set("en_headline", en.headline);
    fd.set("fr_kicker", fr.kicker);
    fd.set("fr_headline", fr.headline);

    startTransition(async () => {
      const result = await saveJournalCard(id ?? "new", fd);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }

      if (publish && !isNew) {
        const { setJournalStatus } = await import("@/app/admin/journal/[id]/actions");
        await setJournalStatus(result.id, "published");
      }

      if (isNew) {
        await redirectToJournalEdit(result.id);
      } else {
        router.refresh();
      }
    });
  }

  const statusBadgeClass =
    initialData?.status === "published"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-amber-100 text-amber-800 border-amber-200";

  return (
    <div className="space-y-10">
      {!isNew && initialData && (
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1 border font-sans text-[11px] uppercase tracking-[0.14em] ${statusBadgeClass}`}
          >
            {initialData.status}
          </span>
          {initialData.updated_at && (
            <span className="font-sans text-[12px] text-bb-on-surface-variant">
              Last updated {new Date(initialData.updated_at).toLocaleString("en-GB")}
            </span>
          )}
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
          <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
            Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                placeholder="e.g. cedar-box"
              />
            </label>

            <label className="block">
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                Date *
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={feature}
              onChange={(e) => setFeature(e.target.checked)}
              className="w-4 h-4 accent-bb-primary"
            />
            <span className="font-sans text-[13px] text-bb-on-surface">
              Featured card (pinned at top of journal page)
            </span>
          </label>
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
            const hidden = locale !== activeLocale;
            return (
              <div key={locale} className={cn("space-y-4", hidden && "hidden")}>
                <label className="block">
                  <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                    Kicker *
                  </span>
                  <input
                    type="text"
                    value={vals.kicker}
                    onChange={(e) => handleLocaleChange(locale, "kicker", e.target.value)}
                    required={locale === "en"}
                    className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
                    placeholder="e.g. Hammam Stories"
                  />
                </label>
                <label className="block">
                  <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                    Headline *
                  </span>
                  <input
                    type="text"
                    value={vals.headline}
                    onChange={(e) => handleLocaleChange(locale, "headline", e.target.value)}
                    required={locale === "en"}
                    className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
                    placeholder="e.g. The Art of the Moroccan Hammam"
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
                alt="Journal card image"
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
            onClick={() => handleSubmit(false)}
            disabled={isPending}
            className="bg-bb-primary text-bb-bg px-8 py-4 font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save as draft"}
          </button>

          {!isNew && (
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isPending}
              className="bg-bb-secondary text-bb-bg px-8 py-4 font-sans text-[12px] uppercase tracking-[0.18em] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save and publish"}
            </button>
          )}

          {isNew && (
            <p className="font-sans text-[12px] text-bb-on-surface-variant">
              After saving, you can publish from the edit page.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
