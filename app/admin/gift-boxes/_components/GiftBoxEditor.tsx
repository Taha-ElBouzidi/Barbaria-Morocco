"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveGiftBox, setGiftBoxStatus, deleteGiftBox } from "../[id]/actions";
import type { GiftBoxAdminDetail } from "@/lib/admin/gift-boxes";
import HeroImageUploader from "@/components/admin/HeroImageUploader";

const HELP_CLS = "font-sans text-[11px] text-bb-on-surface-variant mt-1 leading-snug";

interface ProductOption {
  id: string;
  slug: string;
  nameEn: string;
  image: string | null;
}

interface Props {
  initial?: GiftBoxAdminDetail;
  categoryOptions: Array<{ id: string; slug: string; nameEn: string }>;
  /** Map of category id → its product options (for the items picker). */
  productOptionsByCategory: Record<string, ProductOption[]>;
}

export default function GiftBoxEditor({ initial, categoryOptions, productOptionsByCategory }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [statusPending, startStatusTransition] = useTransition();

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categoryOptions[0]?.id ?? "");
  const [heroImagePath, setHeroImagePath] = useState(initial?.heroImagePath ?? "");
  const [defaultQuantityMin, setDefaultQuantityMin] = useState(initial?.defaultQuantityMin ?? 5);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [isCustomizable, setIsCustomizable] = useState(initial?.isCustomizable ?? false);
  const [nameEn, setNameEn] = useState(initial?.translations.en.name ?? "");
  const [taglineEn, setTaglineEn] = useState(initial?.translations.en.tagline ?? "");
  const [storyIntroEn, setStoryIntroEn] = useState(initial?.translations.en.storyIntro ?? "");
  const [nameFr, setNameFr] = useState(initial?.translations.fr.name ?? "");
  const [taglineFr, setTaglineFr] = useState(initial?.translations.fr.tagline ?? "");
  const [storyIntroFr, setStoryIntroFr] = useState(initial?.translations.fr.storyIntro ?? "");
  const [itemIds, setItemIds] = useState<string[]>(initial?.itemProductIds ?? []);

  const productOptions = productOptionsByCategory[categoryId] ?? [];

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
    const fd = new FormData(e.currentTarget);
    fd.set("itemProductIds", itemIds.join(","));
    startTransition(async () => {
      await saveGiftBox(initial?.id ?? "new", fd);
      router.refresh();
    });
  };

  const toggleStatus = () => {
    if (!initial) return;
    const next = initial.status === "published" ? "draft" : "published";
    startStatusTransition(async () => {
      await setGiftBoxStatus(initial.id, next);
      router.refresh();
    });
  };

  const remove = () => {
    if (!initial) return;
    if (!confirm(`Delete gift box "${initial.nameEn}"? This cannot be undone.`)) return;
    startStatusTransition(async () => {
      await deleteGiftBox(initial.id);
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
            <input
              id="isCustomizable"
              name="isCustomizable"
              type="checkbox"
              checked={isCustomizable}
              onChange={(e) => setIsCustomizable(e.target.checked)}
              className="h-5 w-5 accent-bb-primary mt-0.5"
            />
            <div>
              <label htmlFor="isCustomizable" className="text-[14px] text-bb-primary font-medium">
                Compose-your-own box (wizard)
              </label>
              <p className={HELP_CLS}>
                Check this for the single "Compose your own" entry per category. The Items section is hidden and the wizard generates each buyer's composition on demand. Curated (pre-set) boxes leave this unchecked.
              </p>
            </div>
          </div>
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

      {/* Translations */}
      <section className="space-y-6">
        <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
          Translations
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant">English</p>
            <div>
              <label className={labelCls} htmlFor="name_en">Name *</label>
              <input id="name_en" name="name_en" required value={nameEn} onChange={(e) => setNameEn(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="tagline_en">Tagline</label>
              <input id="tagline_en" name="tagline_en" value={taglineEn} onChange={(e) => setTaglineEn(e.target.value)} className={inputCls} />
              <p className={HELP_CLS}>A one-line evocative phrase shown under the box name. Example: "Glow, softness, relaxation."</p>
            </div>
            <div>
              <label className={labelCls} htmlFor="storyIntro_en">Story intro</label>
              <textarea id="storyIntro_en" name="storyIntro_en" rows={4} value={storyIntroEn} onChange={(e) => setStoryIntroEn(e.target.value)} className={inputCls} />
              <p className={HELP_CLS}>2 to 3 sentences that set the scene for the buyer when they open the box detail page.</p>
            </div>
          </div>
          <div className="space-y-5" lang="fr">
            <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant">Français</p>
            <div>
              <label className={labelCls} htmlFor="name_fr">Nom *</label>
              <input id="name_fr" name="name_fr" required value={nameFr} onChange={(e) => setNameFr(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="tagline_fr">Slogan</label>
              <input id="tagline_fr" name="tagline_fr" value={taglineFr} onChange={(e) => setTaglineFr(e.target.value)} className={inputCls} />
              <p className={HELP_CLS}>Une phrase courte sous le nom du coffret. Exemple : "Éclat, douceur, relaxation."</p>
            </div>
            <div>
              <label className={labelCls} htmlFor="storyIntro_fr">Introduction</label>
              <textarea id="storyIntro_fr" name="storyIntro_fr" rows={4} value={storyIntroFr} onChange={(e) => setStoryIntroFr(e.target.value)} className={inputCls} />
              <p className={HELP_CLS}>2 à 3 phrases narratives, affichées en haut de la page coffret.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
          <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
            Pieces ({itemIds.length})
          </h2>
          <p className="text-[13px] text-bb-on-surface-variant">
            {isCustomizable
              ? "These are the pieces buyers can choose from when they enter the compose-your-own wizard for this box. If you leave this empty, the wizard falls back to every published piece in the category."
              : "Pick pieces from the selected category and order them. The order here is the order shown on the public box detail page."}
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

          {/* Available products to add. Compact tile grid: thumbnail + name,
              checkmark overlay when picked. 2 columns on phone, denser on
              desktop. */}
          <details className="border border-bb-line bg-bb-bg-low" open>
            <summary className="cursor-pointer px-4 py-3 font-sans text-[12px] uppercase tracking-[0.18em] text-bb-primary">
              Pieces ({productOptions.length} available in this category)
            </summary>
            <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {productOptions.map((p) => {
                const picked = itemIds.includes(p.id);
                const imgUrl = p.image
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${p.image}`
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
                  No published products in this category yet. Add products first.
                </p>
              )}
            </div>
          </details>
        </section>

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
