"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveProduct, redirectToEdit } from "@/app/admin/products/[id]/actions";
import TranslationTabs from "./TranslationTabs";
import FacetSelect from "./FacetSelect";
import ImageManager from "./ImageManager";

interface Facet {
  id: string;
  type: string;
  value_en: string;
  value_fr: string;
}

interface ApplicationStep {
  stepNumber: number;
  en: { title: string; body: string };
  fr: { title: string; body: string };
}

interface ProductEditorProps {
  id?: string; // undefined = new product
  initialData?: {
    slug: string;
    category_id: string | null;
    moq: number;
    formats: string[];
    lead: string;
    origin: string | null;
    hero: boolean;
    status: string;
    updated_at: string | null;
    translations: Array<{ locale: string; name: string; short: string; lede: string | null }>;
    facets: Array<{ facet_id: string }>;
    steps: Array<{ step_number: number; locale: string; title: string; body: string }>;
    images: Array<{ id: string; path: string; alt_text: string | null; sort_order: number | null }>;
  };
  facets: Facet[];
  categories: Array<{ id: string; slug: string; nameEn: string }>;
}

type LocaleFields = { name: string; short: string; lede: string };

export default function ProductEditor({
  id,
  initialData,
  facets,
  categories,
}: ProductEditorProps) {
  const isNew = !id;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // ---- identity fields ----
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [categoryId, setCategoryId] = useState<string>(
    initialData?.category_id ?? categories[0]?.id ?? ""
  );
  const [moq, setMoq] = useState(initialData?.moq?.toString() ?? "100");
  const [formats, setFormats] = useState<string>(initialData?.formats?.join(", ") ?? "");
  const [lead, setLead] = useState(initialData?.lead ?? "");
  const [origin, setOrigin] = useState(initialData?.origin ?? "");
  const [hero, setHero] = useState(initialData?.hero ?? false);

  // ---- translations ----
  const enT = initialData?.translations?.find((t) => t.locale === "en");
  const frT = initialData?.translations?.find((t) => t.locale === "fr");
  const [en, setEn] = useState<LocaleFields>({
    name: enT?.name ?? "",
    short: enT?.short ?? "",
    lede: enT?.lede ?? "",
  });
  const [fr, setFr] = useState<LocaleFields>({
    name: frT?.name ?? "",
    short: frT?.short ?? "",
    lede: frT?.lede ?? "",
  });

  // ---- facets ----
  const [selectedFacets, setSelectedFacets] = useState<string[]>(
    initialData?.facets?.map((f) => f.facet_id) ?? []
  );

  // ---- application steps ----
  const [steps, setSteps] = useState<ApplicationStep[]>(() => {
    if (!initialData?.steps) return [{ stepNumber: 1, en: { title: "", body: "" }, fr: { title: "", body: "" } }];
    const stepNums = [...new Set(initialData.steps.map((s) => s.step_number))].sort();
    return stepNums.map((num) => {
      const enStep = initialData.steps.find((s) => s.step_number === num && s.locale === "en");
      const frStep = initialData.steps.find((s) => s.step_number === num && s.locale === "fr");
      return {
        stepNumber: num,
        en: { title: enStep?.title ?? "", body: enStep?.body ?? "" },
        fr: { title: frStep?.title ?? "", body: frStep?.body ?? "" },
      };
    });
  });

  // ---- slug auto-generate from EN name ----
  function handleEnChange(locale: "en" | "fr", field: keyof LocaleFields, value: string) {
    if (locale === "en") {
      const next = { ...en, [field]: value };
      setEn(next);
      if (field === "name" && isNew) {
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

  function addStep() {
    if (steps.length >= 3) return;
    const nextNum = (steps[steps.length - 1]?.stepNumber ?? 0) + 1;
    setSteps((prev) => [
      ...prev,
      { stepNumber: nextNum, en: { title: "", body: "" }, fr: { title: "", body: "" } },
    ]);
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 })));
  }

  function updateStep(
    index: number,
    locale: "en" | "fr",
    field: "title" | "body",
    value: string
  ) {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, [locale]: { ...s[locale], [field]: value } } : s
      )
    );
  }

  async function handleSubmit(publish: boolean) {
    if (!formRef.current) return;
    setServerError(null);

    const fd = new FormData(formRef.current);

    // Override hidden inputs with current state
    fd.set("slug", slug);
    fd.set("categoryId", categoryId);
    fd.set("moq", moq);
    fd.set("lead", lead);
    fd.set("origin", origin);
    fd.set("hero", hero ? "true" : "false");
    fd.set("en_name", en.name);
    fd.set("en_short", en.short);
    fd.set("en_lede", en.lede);
    fd.set("fr_name", fr.name);
    fd.set("fr_short", fr.short);
    fd.set("fr_lede", fr.lede);

    // Formats as individual entries
    fd.delete("formats");
    formats
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean)
      .forEach((f) => fd.append("formats", f));

    // Facets
    fd.delete("facetIds");
    selectedFacets.forEach((fid) => fd.append("facetIds", fid));

    // Application steps: the editor UI was removed (PR #35) but DB rows
    // are preserved. We no longer send step_* keys; the server action
    // treats their absence as "leave the steps table alone for this
    // product." Bringing back the editor UI is sufficient to re-enable
    // writes.

    startTransition(async () => {
      const result = await saveProduct(id ?? "new", fd);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }

      if (publish) {
        const { setStatus } = await import("@/app/admin/products/[id]/actions");
        await setStatus(result.id, "published");
      }

      if (isNew) {
        await redirectToEdit(result.id);
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
      {/* Status banner for edit mode */}
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

          {/* Slug auto-generated from the EN name. Hidden so it can't
              be accidentally edited (would break public URLs). */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <label className="block">
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                Category *
              </span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-bb-bg border-0 border-b border-bb-line py-2 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nameEn}</option>
                ))}
              </select>
            </label>

            {/* MOQ and Lead time are kept as hidden form fields so the
                DB schema stays satisfied. They no longer surface on the
                product editor: MOQ applies at the box level now and lead
                time is unused on the public site. */}
            <input type="hidden" name="moq" value={moq} />
            <input type="hidden" name="lead" value={lead} />

            <label className="block">
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                Origin
              </span>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Marrakech, Morocco"
                className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
              />
            </label>

            <label className="block">
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                Formats (comma-separated)
              </span>
              <input
                type="text"
                value={formats}
                onChange={(e) => setFormats(e.target.value)}
                placeholder="e.g. 500 ml, 1 L"
                className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
              />
            </label>
          </div>

          {/* Hero flag dropped from UI (products no longer surface in the
              public catalogue individually). State kept so the column
              stays satisfied; defaults to false on new products. */}
          <input type="hidden" name="hero" value={hero ? "true" : "false"} />
        </section>

        {/* Section 2: Translations */}
        <section className="space-y-6">
          <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
            Translations
          </h2>
          <TranslationTabs en={en} fr={fr} onChange={handleEnChange} />
        </section>

        {/* Section 3: Facets */}
        <section className="space-y-6">
          <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
            Tags / Facets
          </h2>
          <FacetSelect facets={facets} selected={selectedFacets} onChange={setSelectedFacets} />
        </section>

        {/* Section 4: Images */}
        <section className="space-y-6">
          <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
            Images
          </h2>
          {isNew ? (
            <div className="border border-dashed border-bb-line px-6 py-8 text-center">
              <p className="font-sans text-[13px] text-bb-on-surface-variant">
                Save the product first to add images.
              </p>
            </div>
          ) : (
            <ImageManager
              productId={id!}
              initialImages={initialData?.images ?? []}
            />
          )}
        </section>

        {/* Application Steps removed from the editor UI per user request:
            the field was complex to fill and not surfaced on the public
            site after the box-first IA shift. Existing rows in
            product_application_steps stay in the DB; we just no longer
            edit them here. Re-introduce later if the house decides to
            publish how-to-use content. */}

        {/* Actions. Sticky at the bottom so the buyer always sees the
            primary action no matter how deep into the form. */}
        <div className="sticky bottom-0 -mx-4 md:-mx-8 px-4 md:px-8 py-4 bg-bb-bg border-t border-bb-line flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isPending}
            className="inline-flex items-center justify-center bg-bb-primary text-bb-bg px-6 py-3 min-h-[44px] font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving…" : isNew ? "Save as draft" : "Save changes"}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isPending}
            className="inline-flex items-center justify-center bg-bb-secondary-deep text-white px-6 py-3 min-h-[44px] font-sans text-[12px] uppercase tracking-[0.18em] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save and publish"}
          </button>

          {isNew && (
            <p className="font-sans text-[11px] text-bb-on-surface-variant max-w-[400px]">
              Tip: save as draft first, then add images on the edit page before publishing.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
