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

interface SubcatOption {
  id: string;
  slug: string;
  translations: Array<{ locale: string; name: string }>;
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
    ritual_id: string;
    subcategory_id: string | null;
    moq: number;
    formats: string[];
    lead: string;
    origin: string | null;
    ritual_label: string | null;
    hero: boolean;
    status: string;
    updated_at: string | null;
    translations: Array<{ locale: string; name: string; short: string; lede: string | null }>;
    facets: Array<{ facet_id: string }>;
    steps: Array<{ step_number: number; locale: string; title: string; body: string }>;
    images: Array<{ id: string; path: string; alt_text: string | null; sort_order: number | null }>;
  };
  facets: Facet[];
  rituals: string[];
  subcatsByRitual: Record<string, SubcatOption[]>;
}

type LocaleFields = { name: string; short: string; lede: string };

export default function ProductEditor({
  id,
  initialData,
  facets,
  rituals,
  subcatsByRitual,
}: ProductEditorProps) {
  const isNew = !id;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // ---- identity fields ----
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [ritualId, setRitualId] = useState<string>(initialData?.ritual_id ?? rituals[0] ?? "hammam");
  const [subcategoryId, setSubcategoryId] = useState<string>(initialData?.subcategory_id ?? "");
  const [moq, setMoq] = useState(initialData?.moq?.toString() ?? "100");
  const [formats, setFormats] = useState<string>(initialData?.formats?.join(", ") ?? "");
  const [lead, setLead] = useState(initialData?.lead ?? "");
  const [origin, setOrigin] = useState(initialData?.origin ?? "");
  const [ritualLabel, setRitualLabel] = useState(initialData?.ritual_label ?? "");
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

  // ---- subcategory options ----
  const subcatOptions = subcatsByRitual[ritualId] ?? [];

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
    fd.set("ritualId", ritualId);
    fd.set("subcategoryId", subcategoryId);
    fd.set("moq", moq);
    fd.set("lead", lead);
    fd.set("origin", origin);
    fd.set("ritualLabel", ritualLabel);
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

    // Steps
    steps.forEach((step) => {
      fd.set(`step_${step.stepNumber}_en_title`, step.en.title);
      fd.set(`step_${step.stepNumber}_en_body`, step.en.body);
      fd.set(`step_${step.stepNumber}_fr_title`, step.fr.title);
      fd.set(`step_${step.stepNumber}_fr_body`, step.fr.body);
    });

    startTransition(async () => {
      const result = await saveProduct(id ?? "new", fd);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }

      if (publish && !isNew) {
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
          <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary border-b border-bb-line pb-2">
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
                className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface font-mono text-[13px] focus:outline-none focus:border-bb-primary"
                placeholder="e.g. cedar-box"
              />
            </label>

            <label className="block">
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                Ritual *
              </span>
              <select
                value={ritualId}
                onChange={(e) => {
                  setRitualId(e.target.value);
                  setSubcategoryId("");
                }}
                className="w-full bg-bb-bg border-0 border-b border-bb-line py-2 text-bb-on-surface focus:outline-none focus:border-bb-primary"
              >
                {rituals.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                Subcategory
              </span>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full bg-bb-bg border-0 border-b border-bb-line py-2 text-bb-on-surface focus:outline-none focus:border-bb-primary"
              >
                <option value="">— none —</option>
                {subcatOptions.map((sc) => {
                  const enName = sc.translations?.find((t) => t.locale === "en")?.name ?? sc.slug;
                  return (
                    <option key={sc.id} value={sc.id}>
                      {enName}
                    </option>
                  );
                })}
              </select>
            </label>

            <label className="block">
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                MOQ *
              </span>
              <input
                type="number"
                value={moq}
                onChange={(e) => setMoq(e.target.value)}
                min={1}
                required
                className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus:outline-none focus:border-bb-primary"
              />
            </label>

            <label className="block">
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                Lead time *
              </span>
              <input
                type="text"
                value={lead}
                onChange={(e) => setLead(e.target.value)}
                required
                placeholder="e.g. 4–6 weeks"
                className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus:outline-none focus:border-bb-primary"
              />
            </label>

            <label className="block">
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                Origin
              </span>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Marrakech, Morocco"
                className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus:outline-none focus:border-bb-primary"
              />
            </label>

            <label className="block">
              <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
                Ritual label
              </span>
              <input
                type="text"
                value={ritualLabel}
                onChange={(e) => setRitualLabel(e.target.value)}
                placeholder="e.g. The Atlas"
                className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus:outline-none focus:border-bb-primary"
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
                className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus:outline-none focus:border-bb-primary"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hero}
              onChange={(e) => setHero(e.target.checked)}
              className="w-4 h-4 accent-bb-primary"
            />
            <span className="font-sans text-[13px] text-bb-on-surface">Hero product (featured in ritual landing)</span>
          </label>
        </section>

        {/* Section 2: Translations */}
        <section className="space-y-6">
          <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary border-b border-bb-line pb-2">
            Translations
          </h2>
          <TranslationTabs en={en} fr={fr} onChange={handleEnChange} />
        </section>

        {/* Section 3: Facets */}
        <section className="space-y-6">
          <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary border-b border-bb-line pb-2">
            Tags / Facets
          </h2>
          <FacetSelect facets={facets} selected={selectedFacets} onChange={setSelectedFacets} />
        </section>

        {/* Section 4: Images */}
        <section className="space-y-6">
          <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary border-b border-bb-line pb-2">
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

        {/* Section 5: Application Steps */}
        <section className="space-y-6">
          <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary border-b border-bb-line pb-2">
            Application Steps
          </h2>

          {steps.map((step, index) => (
            <div key={step.stepNumber} className="border border-bb-line p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-sans text-[12px] uppercase tracking-[0.14em] text-bb-on-surface-variant">
                  Step {step.stepNumber}
                </p>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="font-sans text-[11px] text-bb-tertiary hover:underline"
                >
                  Remove
                </button>
              </div>

              {(["en", "fr"] as const).map((locale) => (
                <div key={locale} className="space-y-2">
                  <p className="font-sans text-[10px] uppercase tracking-[0.14em] text-bb-on-surface-variant">
                    {locale === "en" ? "English" : "Français"}
                  </p>
                  <input
                    type="text"
                    placeholder="Title"
                    value={step[locale].title}
                    onChange={(e) => updateStep(index, locale, "title", e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-bb-line py-1.5 text-bb-on-surface focus:outline-none focus:border-bb-primary"
                  />
                  <textarea
                    placeholder="Body"
                    value={step[locale].body}
                    onChange={(e) => updateStep(index, locale, "body", e.target.value)}
                    rows={2}
                    className="w-full bg-transparent border border-bb-line p-2 text-bb-on-surface focus:outline-none focus:border-bb-primary resize-y"
                  />
                </div>
              ))}
            </div>
          ))}

          {steps.length < 3 && (
            <button
              type="button"
              onClick={addStep}
              className="font-sans text-[12px] uppercase tracking-[0.18em] border border-bb-line px-4 py-2 hover:border-bb-primary transition-colors"
            >
              + Add step
            </button>
          )}
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
