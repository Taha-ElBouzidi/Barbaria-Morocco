"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { saveGiftBox, setGiftBoxStatus, deleteGiftBox } from "../[id]/actions";
import type { GiftBoxAdminDetail, ProductOption } from "@/lib/admin/gift-boxes";
import HeroImageUploader from "@/components/admin/HeroImageUploader";

const HELP_CLS = "font-sans text-[11px] text-bb-on-surface-variant mt-1 leading-snug";

interface Props {
  initial?: GiftBoxAdminDetail;
  categoryOptions: Array<{ id: string; slug: string; nameEn: string }>;
  /** Map of category id → its product options (for the items picker). */
  productOptionsByCategory: Record<string, ProductOption[]>;
  /** EN value → facet type (ingredient | use | format | packaging |
   *  certification). Used to group filter chips by axis. */
  facetTypeByValue: Record<string, string>;
  /** Per-category id → the gift_box id that currently owns the
   *  "Compose your own" wizard slot (or null). Used to disable the
   *  customizable checkbox when another box already holds the slot. */
  customizableOwnerByCategory: Record<string, string | null>;
}

const FACET_AXES: Array<{ key: string; label: string }> = [
  { key: "ingredient", label: "Ingredients" },
  { key: "use", label: "Use / Application" },
  { key: "format", label: "Format" },
  { key: "packaging", label: "Packaging" },
  { key: "certification", label: "Certifications" },
  { key: "other", label: "Other" },
];

export default function GiftBoxEditor({
  initial,
  categoryOptions,
  productOptionsByCategory,
  facetTypeByValue,
  customizableOwnerByCategory,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [statusPending, startStatusTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categoryOptions[0]?.id ?? "");
  const [heroImagePath, setHeroImagePath] = useState(initial?.heroImagePath ?? "");
  const [defaultQuantityMin, setDefaultQuantityMin] = useState(initial?.defaultQuantityMin ?? 5);
  const [leadTimeWeeksMin, setLeadTimeWeeksMin] = useState(initial?.leadTimeWeeksMin ?? 4);
  const [leadTimeWeeksMax, setLeadTimeWeeksMax] = useState(initial?.leadTimeWeeksMax ?? 6);
  const [customSizeOptions, setCustomSizeOptions] = useState<number[]>(
    initial?.customSizeOptions ?? [3, 5, 6]
  );
  const toggleCustomSize = (n: number) => {
    setCustomSizeOptions((prev) =>
      prev.includes(n)
        ? prev.filter((v) => v !== n)
        : [...prev, n].sort((a, b) => a - b)
    );
  };
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [isCustomizable, setIsCustomizable] = useState(initial?.isCustomizable ?? false);
  const [nameEn, setNameEn] = useState(initial?.translations.en.name ?? "");
  const [taglineEn, setTaglineEn] = useState(initial?.translations.en.tagline ?? "");
  const [storyIntroEn, setStoryIntroEn] = useState(initial?.translations.en.storyIntro ?? "");
  const [nameFr, setNameFr] = useState(initial?.translations.fr.name ?? "");
  const [taglineFr, setTaglineFr] = useState(initial?.translations.fr.tagline ?? "");
  const [storyIntroFr, setStoryIntroFr] = useState(initial?.translations.fr.storyIntro ?? "");
  const [itemIds, setItemIds] = useState<string[]>(initial?.itemProductIds ?? []);
  const [translationLocale, setTranslationLocale] = useState<"en" | "fr">("en");

  const productOptions = productOptionsByCategory[categoryId] ?? [];

  // ---- items picker filter state ----
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // Group all unique facet values present in this category's products by
  // axis, so the filter panel renders the right chips in the right
  // section. "Other" catches anything the map doesn't know about (e.g.
  // a freshly added facet type the editor wasn't yet built for).
  const tagsByAxis = useMemo(() => {
    const seen = new Set<string>();
    const byAxis: Record<string, string[]> = {};
    for (const p of productOptions) {
      for (const tag of p.tags) {
        if (seen.has(tag)) continue;
        seen.add(tag);
        const axis = facetTypeByValue[tag] ?? "other";
        (byAxis[axis] ?? (byAxis[axis] = [])).push(tag);
      }
    }
    for (const axis of Object.keys(byAxis)) byAxis[axis].sort((a, b) => a.localeCompare(b));
    return byAxis;
  }, [productOptions, facetTypeByValue]);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return productOptions.filter((p) => {
      if (activeTags.length && !activeTags.every((t) => p.tags.includes(t))) return false;
      if (!q) return true;
      return p.nameEn.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    });
  }, [productOptions, search, activeTags]);

  const toggleTag = (value: string) => {
    setActiveTags((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };
  const clearFilters = () => {
    setActiveTags([]);
    setSearch("");
  };

  // Auto-suggest slug from EN name when creating
  useEffect(() => {
    if (initial) return;
    if (slug) return;
    if (!nameEn) return;
    const auto = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setSlug(auto);
  }, [nameEn, slug, initial]);

  // Drop items that no longer belong to the selected category.
  useEffect(() => {
    const valid = new Set(productOptions.map((p) => p.id));
    setItemIds((prev) => prev.filter((id) => valid.has(id)));
  }, [categoryId, productOptions]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("itemProductIds", itemIds.join(","));
    startTransition(async () => {
      const res = await saveGiftBox(initial?.id ?? "new", fd);
      // CREATE redirects so the await never resolves on success; only
      // UPDATE returns a result here. ok:false is a typed error from
      // the action (Zod miss, slot conflict, DB error).
      if (res && res.ok === false) {
        setServerError(res.error);
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    });
  };

  const toggleStatus = () => {
    if (!initial) return;
    setServerError(null);
    const next = initial.status === "published" ? "draft" : "published";
    startStatusTransition(async () => {
      const res = await setGiftBoxStatus(initial.id, next);
      if (res && res.ok === false) {
        setServerError(res.error);
        return;
      }
      router.refresh();
    });
  };

  const remove = () => {
    if (!initial) return;
    if (!confirm(`Delete gift box "${initial.nameEn}"? This cannot be undone.`)) return;
    setServerError(null);
    startStatusTransition(async () => {
      const res = await deleteGiftBox(initial.id);
      // Success path redirects, so this only resolves on failure.
      if (res && res.ok === false) setServerError(res.error);
    });
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    setItemIds((prev) => {
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return next;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const toggleItem = (productId: string) => {
    setItemIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const labelCls = "font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant block mb-2";
  const inputCls =
    "w-full px-3 py-3 min-h-[44px] border border-bb-line bg-bb-bg text-bb-primary text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1";

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      {/* Identity */}
      <section className="space-y-6">
        <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
          Identity
        </h2>
        {/* Slug is generated from the English name and not surfaced to
            avoid accidental edits that would break public URLs. Kept as
            a hidden form input so the server action still sees it. */}
        <input type="hidden" name="slug" value={slug} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelCls} htmlFor="categoryId">Category *</label>
            <select
              id="categoryId"
              name="categoryId"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputCls}
            >
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.nameEn}</option>
              ))}
            </select>
            <p className={HELP_CLS}>Cosmetics or Fine Épicerie. Determines which catalogue page the box appears on.</p>
          </div>
          <div>
            <label className={labelCls} htmlFor="defaultQuantityMin">Minimum quantity per order *</label>
            <input
              id="defaultQuantityMin"
              name="defaultQuantityMin"
              type="number"
              min={1}
              required
              value={defaultQuantityMin}
              onChange={(e) => setDefaultQuantityMin(parseInt(e.target.value, 10) || 1)}
              className={inputCls}
            />
            <p className={HELP_CLS}>MOQ. Buyers cannot drop the box quantity below this value.</p>
          </div>
          <div>
            <label className={labelCls} htmlFor="leadTimeWeeksMin">Lead time (weeks)</label>
            <div className="flex items-center gap-2">
              <input
                id="leadTimeWeeksMin"
                name="leadTimeWeeksMin"
                type="number"
                min={1}
                max={52}
                required
                value={leadTimeWeeksMin}
                onChange={(e) => setLeadTimeWeeksMin(parseInt(e.target.value, 10) || 1)}
                className={inputCls}
                aria-label="Lead time minimum weeks"
              />
              <span className="text-bb-on-surface-variant text-[12px]">to</span>
              <input
                id="leadTimeWeeksMax"
                name="leadTimeWeeksMax"
                type="number"
                min={leadTimeWeeksMin}
                max={52}
                required
                value={leadTimeWeeksMax}
                onChange={(e) => setLeadTimeWeeksMax(parseInt(e.target.value, 10) || leadTimeWeeksMin)}
                className={inputCls}
                aria-label="Lead time maximum weeks"
              />
            </div>
            <p className={HELP_CLS}>Production lead-time band in weeks, shown publicly on the box page and in the Product schema. Curated boxes default to 4 to 6 weeks; bespoke configurations typically 8 to 10.</p>
          </div>
          <div>
            <label className={labelCls} htmlFor="sortOrder">Display order</label>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
              className={inputCls}
            />
            <p className={HELP_CLS}>Lower numbers appear first in the catalogue grid.</p>
          </div>
          <div className="sm:col-span-2 flex items-start gap-3">
            {(() => {
              const owner = customizableOwnerByCategory[categoryId] ?? null;
              const ownedByAnother = owner !== null && owner !== initial?.id;
              const disabled = ownedByAnother && !isCustomizable;
              return (
                <>
                  <input
                    id="isCustomizable"
                    name="isCustomizable"
                    type="checkbox"
                    checked={isCustomizable}
                    onChange={(e) => setIsCustomizable(e.target.checked)}
                    disabled={disabled}
                    aria-describedby={
                      ownedByAnother
                        ? "isCustomizable-hint isCustomizable-conflict"
                        : "isCustomizable-hint"
                    }
                    className="h-5 w-5 accent-bb-primary mt-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <div>
                    <label
                      htmlFor="isCustomizable"
                      className={`text-[14px] font-medium ${disabled ? "text-bb-on-surface-variant" : "text-bb-primary"}`}
                    >
                      Compose-your-own box (wizard)
                    </label>
                    <p id="isCustomizable-hint" className={HELP_CLS}>
                      Check this for the single &quot;Compose your own&quot; entry per category. The Items section is hidden and the wizard generates each buyer&apos;s composition on demand. Curated (pre-set) boxes leave this unchecked.
                    </p>
                    {ownedByAnother && (
                      <p
                        id="isCustomizable-conflict"
                        className="font-sans text-[11px] text-bb-tertiary mt-1 leading-snug"
                      >
                        Another box in this category already holds the &quot;Compose your own&quot; slot. Only one customizable box per category is allowed; untick that box first if you want to move the slot here.
                      </p>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
          {isCustomizable && (
            <div className="sm:col-span-2">
              <label className={labelCls}>Wizard size options</label>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
                {[1, 2, 3, 4, 5, 6].map((n) => {
                  const checked = customSizeOptions.includes(n);
                  return (
                    <label
                      key={n}
                      htmlFor={`customSize-${n}`}
                      className={`inline-flex items-center gap-2 cursor-pointer select-none ${checked ? "text-bb-primary" : "text-bb-on-surface-variant"}`}
                    >
                      <input
                        id={`customSize-${n}`}
                        name="customSizeOptions"
                        type="checkbox"
                        value={n}
                        checked={checked}
                        onChange={() => toggleCustomSize(n)}
                        className="h-4 w-4 accent-bb-primary"
                      />
                      <span className="text-[14px]">{n} {n === 1 ? "piece" : "pieces"}</span>
                    </label>
                  );
                })}
              </div>
              <p className={HELP_CLS}>
                Which sizes the wizard offers buyers for this box. At least one must be selected (the DB rejects an empty array). When only one size is ticked, the size-pick screen is skipped and the wizard jumps straight to product selection.
              </p>
              {customSizeOptions.length === 0 && (
                <p className="font-sans text-[11px] text-bb-tertiary mt-1">
                  At least one size must be selected.
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className={labelCls}>Hero image</label>
          <HeroImageUploader
            value={heroImagePath}
            onChange={setHeroImagePath}
            name="heroImagePath"
            aspect="4/5"
            alt={nameEn || slug}
          />
        </div>
      </section>

      {/* Translations, tabbed, English first. Matches the pattern used
          in the product editor (TranslationTabs) so the house only
          fills out one locale at a time. */}
      <section className="space-y-6">
        <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
          Translations
        </h2>
        <div
          role="tablist"
          aria-label="Translation locale"
          className="flex gap-6 border-b border-bb-line"
        >
          {([
            { id: "en", label: "English" },
            { id: "fr", label: "Français" },
          ] as const).map((t) => {
            const active = translationLocale === t.id;
            return (
              <button
                key={t.id}
                id={`gift-box-tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`gift-box-panel-${t.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setTranslationLocale(t.id)}
                className={`pb-3 -mb-px font-sans text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  active
                    ? "text-bb-primary border-b-2 border-bb-primary"
                    : "text-bb-on-surface-variant hover:text-bb-primary"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Keep BOTH locales mounted so their inputs stay in the form on
            submit (browsers don't post unmounted fields). The inactive
            one hides visually but still serializes. */}
        <div
          role="tabpanel"
          id="gift-box-panel-en"
          aria-labelledby="gift-box-tab-en"
          hidden={translationLocale !== "en"}
          className={translationLocale === "en" ? "space-y-5" : "space-y-5 hidden"}
        >
          <div>
            <label className={labelCls} htmlFor="name_en">Name *</label>
            <input id="name_en" name="name_en" required value={nameEn} onChange={(e) => setNameEn(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="tagline_en">Tagline</label>
            <input id="tagline_en" name="tagline_en" value={taglineEn} onChange={(e) => setTaglineEn(e.target.value)} className={inputCls} />
            <p className={HELP_CLS}>A one-line evocative phrase shown under the box name. Example: &quot;Glow, softness, relaxation.&quot;</p>
          </div>
          <div>
            <label className={labelCls} htmlFor="storyIntro_en">Story intro</label>
            <textarea id="storyIntro_en" name="storyIntro_en" rows={4} value={storyIntroEn} onChange={(e) => setStoryIntroEn(e.target.value)} className={inputCls} />
            <p className={HELP_CLS}>2 to 3 sentences that set the scene for the buyer when they open the box detail page.</p>
          </div>
        </div>

        <div
          role="tabpanel"
          id="gift-box-panel-fr"
          aria-labelledby="gift-box-tab-fr"
          hidden={translationLocale !== "fr"}
          lang="fr"
          className={translationLocale === "fr" ? "space-y-5" : "space-y-5 hidden"}
        >
          <div>
            <label className={labelCls} htmlFor="name_fr">Nom *</label>
            <input id="name_fr" name="name_fr" required value={nameFr} onChange={(e) => setNameFr(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="tagline_fr">Slogan</label>
            <input id="tagline_fr" name="tagline_fr" value={taglineFr} onChange={(e) => setTaglineFr(e.target.value)} className={inputCls} />
            <p className={HELP_CLS}>Une phrase courte sous le nom du coffret. Exemple : &quot;Éclat, douceur, relaxation.&quot;</p>
          </div>
          <div>
            <label className={labelCls} htmlFor="storyIntro_fr">Introduction</label>
            <textarea id="storyIntro_fr" name="storyIntro_fr" rows={4} value={storyIntroFr} onChange={(e) => setStoryIntroFr(e.target.value)} className={inputCls} />
            <p className={HELP_CLS}>2 à 3 phrases narratives, affichées en haut de la page coffret.</p>
          </div>
        </div>
      </section>

      {/* Items picker, hidden for wizard boxes (buyers compose
          their own on demand). */}
      {!isCustomizable && (
        <section className="space-y-6">
          <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
            Items ({itemIds.length})
          </h2>
          <p className="text-[13px] text-bb-on-surface-variant">
            Pick items from the selected category and order them. The order here is the order shown on the public box detail page.
          </p>

          {/* Picked items, ordered */}
          {itemIds.length > 0 && (
            <ol className="space-y-2 border-l-2 border-bb-secondary-deep pl-4">
              {itemIds.map((id, i) => {
                const p = productOptions.find((o) => o.id === id);
                if (!p) return null;
                return (
                  <li key={id} className="flex items-center gap-3 bg-bb-bg-low px-3 py-2">
                    <span className="font-mono text-[12px] text-bb-secondary-deep w-6">{i + 1}.</span>
                    <span className="flex-1 text-[14px] text-bb-primary">{p.nameEn}</span>
                    <button
                      type="button"
                      onClick={() => moveItem(i, -1)}
                      aria-label={`Move ${p.nameEn} up`}
                      disabled={i === 0}
                      className="px-2 py-1 text-bb-on-surface-variant hover:text-bb-primary disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(i, 1)}
                      aria-label={`Move ${p.nameEn} down`}
                      disabled={i === itemIds.length - 1}
                      className="px-2 py-1 text-bb-on-surface-variant hover:text-bb-primary disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleItem(id)}
                      aria-label={`Remove ${p.nameEn} from box`}
                      className="px-2 py-1 text-bb-tertiary hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ol>
          )}

          {/* Search + filter controls. Same UX as the public wizard:
              text search + collapsible facet-axis panel + active filter
              chips with one-click removal. */}
          <div className="space-y-3 border border-bb-line bg-bb-bg-low p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                aria-label="Search items by name or slug"
                placeholder="Search items by name or slug…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 min-h-[40px] border border-bb-line bg-bb-bg text-bb-primary text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1"
              />
              <button
                type="button"
                onClick={() => setFilterPanelOpen((v) => !v)}
                aria-expanded={filterPanelOpen}
                className="inline-flex items-center gap-2 px-3 py-2 min-h-[40px] border border-bb-line text-bb-on-surface text-[11px] uppercase tracking-[0.16em] hover:border-bb-primary transition-colors"
              >
                Filters
                {activeTags.length > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 bg-bb-secondary-deep text-white text-[10px] tabular-nums">
                    {activeTags.length}
                  </span>
                )}
              </button>
              {(activeTags.length > 0 || search) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="font-sans text-[11px] uppercase tracking-[0.16em] text-bb-on-surface-variant hover:text-bb-primary px-2 py-2 min-h-[40px]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Active filter chips, click to remove */}
            {activeTags.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {activeTags.map((tag) => (
                  <li key={tag}>
                    <button
                      type="button"
                      onClick={() => toggleTag(tag)}
                      aria-label={`Remove filter ${tag}`}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-bb-secondary-deep/15 text-bb-secondary-deep border border-bb-secondary-deep/40 text-[11px]"
                    >
                      {tag} <span aria-hidden="true">×</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {filterPanelOpen && (
              <div className="border-t border-bb-line pt-3 space-y-4">
                {FACET_AXES.map((axis) => {
                  const values = tagsByAxis[axis.key] ?? [];
                  if (values.length === 0) return null;
                  return (
                    <div key={axis.key} className="space-y-2">
                      <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-secondary-deep">
                        {axis.label}
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {values.map((value) => {
                          const active = activeTags.includes(value);
                          return (
                            <li key={value}>
                              <button
                                type="button"
                                onClick={() => toggleTag(value)}
                                aria-pressed={active}
                                className={`px-2 py-1 border text-[11px] transition-colors ${
                                  active
                                    ? "border-bb-secondary-deep text-bb-secondary-deep bg-bb-secondary-deep/10"
                                    : "border-bb-line text-bb-on-surface-variant hover:border-bb-primary"
                                }`}
                              >
                                {value}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
                {Object.keys(tagsByAxis).length === 0 && (
                  <p className="text-[12px] text-bb-on-surface-variant italic">
                    No facet tags assigned to items in this category yet.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Available items grid. Empty when filtered down to zero. */}
          <details className="border border-bb-line bg-bb-bg-low" open>
            <summary className="cursor-pointer px-4 py-3 font-sans text-[12px] uppercase tracking-[0.18em] text-bb-primary">
              Items ({filteredOptions.length} of {productOptions.length})
            </summary>
            <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {filteredOptions.map((p) => {
                const picked = itemIds.includes(p.id);
                const imgUrl = p.image
                  ? p.image.startsWith("/")
                    ? p.image
                    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${p.image}`
                  : null;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleItem(p.id)}
                    aria-pressed={picked}
                    className={`relative text-left border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary ${
                      picked
                        ? "border-bb-secondary-deep ring-2 ring-bb-secondary-deep/30"
                        : "border-bb-line hover:border-bb-secondary-deep"
                    }`}
                  >
                    <div className="relative aspect-square overflow-hidden bg-bb-bg">
                      {imgUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-bb-primary/20 to-bb-secondary/20" />
                      )}
                      {picked && (
                        <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-bb-secondary-deep text-white flex items-center justify-center text-[14px]">
                          ✓
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-[12px] text-bb-on-surface font-medium leading-tight line-clamp-2">
                        {p.nameEn}
                      </p>
                    </div>
                  </button>
                );
              })}
              {productOptions.length === 0 && (
                <p className="col-span-full text-[13px] text-bb-on-surface-variant italic">
                  No published items in this category yet. Add items first.
                </p>
              )}
              {productOptions.length > 0 && filteredOptions.length === 0 && (
                <p className="col-span-full text-[13px] text-bb-on-surface-variant italic">
                  No items match the current search or filters.
                </p>
              )}
            </div>
          </details>
        </section>
      )}

      {serverError && (
        <p
          role="alert"
          className="px-4 py-3 border border-red-200 bg-red-50 text-red-800 font-sans text-[13px]"
        >
          {serverError}
        </p>
      )}
      {savedAt && !serverError && (
        <p
          role="status"
          className="px-4 py-3 border border-bb-secondary/40 bg-bb-secondary/10 text-bb-secondary-deep font-sans text-[13px]"
        >
          Saved.
        </p>
      )}

      {/* Action bar. Negative margins compensate for the main container
          padding (px-4 mobile, px-8 desktop) so the sticky footer reaches
          the viewport edges. */}
      <footer className="sticky bottom-0 bg-bb-bg border-t border-bb-line py-4 -mx-4 md:-mx-8 px-4 md:px-8 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-bb-primary text-white font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container disabled:opacity-50 transition-colors"
        >
          {pending ? "Saving…" : initial ? "Save changes" : "Create draft"}
        </button>
        {initial && (
          <>
            <button
              type="button"
              onClick={toggleStatus}
              disabled={statusPending}
              className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] border border-bb-line text-bb-primary font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-bg-low disabled:opacity-50 transition-colors"
            >
              {statusPending ? "…" : initial.status === "published" ? "Unpublish" : "Publish"}
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={statusPending}
              className="ml-auto inline-flex items-center gap-2 px-5 py-3 min-h-[44px] border border-bb-tertiary text-bb-tertiary font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-tertiary hover:text-white disabled:opacity-50 transition-colors"
            >
              Delete
            </button>
          </>
        )}
      </footer>
    </form>
  );
}
