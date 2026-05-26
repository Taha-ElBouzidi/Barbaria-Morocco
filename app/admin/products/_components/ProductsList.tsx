"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { reorderProduct } from "../actions";

interface ProductRow {
  id: string;
  slug: string;
  /** Resolved category slug from the joined categories row. PostgREST
   *  returns the embedded `categories(slug)` as a single object for the
   *  many-to-one FK, but the Supabase client types it as an array of
   *  length 1; we accept both shapes. */
  category: { slug: string } | Array<{ slug: string }> | null;
  moq: number;
  status: string;
  sort_order: number;
  updated_at: string | null;
  translations: Array<{ locale: string; name: string }>;
  images: Array<{ path: string; sort_order: number | null }>;
}

interface ProductsListProps {
  products: ProductRow[];
  supabaseUrl: string;
}

const CATEGORY_TABS = [
  { slug: "cosmetiques", label: "Cosmetics" },
  { slug: "epicerie_fine", label: "Fine Épicerie" },
] as const;

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

type CategorySlug = (typeof CATEGORY_TABS)[number]["slug"];

function resolveCategorySlug(p: ProductRow): string {
  if (!p.category) return "";
  if (Array.isArray(p.category)) return p.category[0]?.slug ?? "";
  return p.category.slug ?? "";
}

export default function ProductsList({ products, supabaseUrl }: ProductsListProps) {
  const [active, setActive] = useState<CategorySlug>("cosmetiques");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState<string | null>(null);

  // Local copy of the rows so reorder can update them optimistically
  // without waiting for the server round trip. The action runs in the
  // background.
  const [localProducts, setLocalProducts] = useState(products);
  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  // Promise chain so rapid arrow clicks queue server-side instead of
  // racing. Each click extends the chain; the next server call only
  // fires after the previous one resolves. The user can mash arrows
  // freely; the optimistic UI updates every click; the server catches
  // up sequentially in the background.
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  function getPublicUrl(path: string) {
    if (path.startsWith("/")) return path;
    return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`;
  }

  function getHeroImage(p: ProductRow): string | null {
    if (!p.images || p.images.length === 0) return null;
    const sorted = [...p.images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    return sorted[0]?.path ?? null;
  }

  function getEnName(p: ProductRow): string {
    return p.translations.find((t) => t.locale === "en")?.name ?? p.slug;
  }

  // Group products by category. We always render exactly one category
  // table (the active tab), so the grouping happens client-side; the
  // server already orders by sort_order, the client just filters.
  const grouped = useMemo(() => {
    const s = search.trim().toLowerCase();
    const result: Record<CategorySlug, ProductRow[]> = {
      cosmetiques: [],
      epicerie_fine: [],
    };
    for (const p of localProducts) {
      const slug = resolveCategorySlug(p) as CategorySlug;
      if (slug !== "cosmetiques" && slug !== "epicerie_fine") continue;
      if (status !== "all" && p.status !== status) continue;
      if (s) {
        const enName = getEnName(p).toLowerCase();
        if (!p.slug.toLowerCase().includes(s) && !enName.includes(s)) continue;
      }
      result[slug].push(p);
    }
    return result;
  }, [localProducts, search, status]);

  const rows = grouped[active];

  const onReorder = (id: string, direction: "up" | "down") => {
    setError(null);

    // Optimistic swap. Use the functional setter so rapid clicks
    // compose on the latest state, not a stale closure.
    setLocalProducts((current) => {
      const sameCat = current.filter((p) => resolveCategorySlug(p) === active);
      const idx = sameCat.findIndex((p) => p.id === id);
      if (idx === -1) return current;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sameCat.length) return current;

      const swapId = sameCat[swapIdx].id;
      const next = current.map((p) => {
        if (p.id === id) return { ...p, sort_order: sameCat[swapIdx].sort_order };
        if (p.id === swapId) return { ...p, sort_order: sameCat[idx].sort_order };
        return p;
      });
      next.sort((a, b) => a.sort_order - b.sort_order);
      return next;
    });

    // Queue the server write after any in-flight reorder, so the user
    // can click as fast as they want without the server seeing
    // concurrent writes on the same category.
    queueRef.current = queueRef.current.then(async () => {
      const res = await reorderProduct(id, direction);
      if (!res.ok) {
        // A failure mid-chain means the optimistic UI is ahead of
        // reality. Surface the error; user can refresh to resync.
        // We do not auto-revert because subsequent queued clicks
        // have already moved past this state.
        setError(res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Category tabs. Same shape as TranslationTabs.tsx (EN/FR
          switcher in the product editor) per the house's request. */}
      <div
        role="tablist"
        aria-label="Filter by category"
        className="flex border-b border-bb-line gap-0"
      >
        {CATEGORY_TABS.map((tab) => {
          const count = grouped[tab.slug].length;
          const isActive = active === tab.slug;
          return (
            <button
              key={tab.slug}
              id={`tab-${tab.slug}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.slug}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(tab.slug)}
              className={cn(
                "px-6 py-3 font-sans text-[12px] uppercase tracking-[0.18em] border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-bb-primary text-bb-primary"
                  : "border-transparent text-bb-on-surface-variant hover:text-bb-on-surface"
              )}
            >
              {tab.label}
              <span className="ml-2 text-bb-on-surface-variant text-[10px]">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by name or slug…"
          aria-label="Search products by name or slug"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-bb-bg border border-bb-line px-4 py-3 min-h-[44px] font-sans text-[13px] sm:w-[280px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
        />
        <select
          value={status}
          aria-label="Filter by status"
          onChange={(e) => setStatus(e.target.value)}
          className="bg-bb-bg border border-bb-line px-4 py-3 min-h-[44px] font-sans text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p
          role="alert"
          className="px-4 py-3 border border-red-200 bg-red-50 text-red-800 font-sans text-[13px]"
        >
          {error}
        </p>
      )}

      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="space-y-3"
      >
        {rows.length === 0 ? (
          <p className="font-sans text-[13px] text-bb-on-surface-variant py-8 text-center">
            No products in this category match the current filters.
          </p>
        ) : (
          <>
            <div className="md:hidden flex flex-col gap-3">
              {rows.map((p, i) => {
                const isFirst = i === 0;
                const isLast = i === rows.length - 1;
                const heroPath = getHeroImage(p);
                const name = getEnName(p);
                return (
                  <div key={p.id} className="p-3 border border-bb-line bg-bb-bg space-y-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="flex items-start gap-3 hover:opacity-80 transition-opacity"
                    >
                      {heroPath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getPublicUrl(heroPath)}
                          alt=""
                          className="w-16 h-16 object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-bb-primary/20 to-bb-secondary/20 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-sans text-[14px] text-bb-on-surface font-medium truncate">
                          {name}
                        </p>
                        <p className="font-mono text-[11px] text-bb-on-surface-variant truncate">
                          {p.slug}
                        </p>
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 border font-sans text-[10px] uppercase tracking-[0.1em]",
                            p.status === "published"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {p.status}
                        </span>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onReorder(p.id, "up")}
                        disabled={isFirst}
                        aria-label={`Move ${name} up`}
                        className="px-3 py-2 min-w-[44px] min-h-[36px] text-bb-on-surface-variant hover:text-bb-primary disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => onReorder(p.id, "down")}
                        disabled={isLast}
                        aria-label={`Move ${name} down`}
                        className="px-3 py-2 min-w-[44px] min-h-[36px] text-bb-on-surface-variant hover:text-bb-primary disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block border border-bb-line overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-bb-line bg-bb-bg-low">
                    <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant w-[100px]">Order</th>
                    <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant w-16">Image</th>
                    <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">Name (EN)</th>
                    <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">Slug</th>
                    <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">Status</th>
                    <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p, i) => {
                    const isFirst = i === 0;
                    const isLast = i === rows.length - 1;
                    const heroPath = getHeroImage(p);
                    const name = getEnName(p);
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-bb-line last:border-0 hover:bg-bb-bg-low transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onReorder(p.id, "up")}
                              disabled={isFirst}
                              aria-label={`Move ${name} up`}
                              className="px-2 py-1 text-bb-on-surface-variant hover:text-bb-primary disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => onReorder(p.id, "down")}
                              disabled={isLast}
                              aria-label={`Move ${name} down`}
                              className="px-2 py-1 text-bb-on-surface-variant hover:text-bb-primary disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
                            >
                              ↓
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {heroPath ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={getPublicUrl(heroPath)} alt="" className="w-12 h-12 object-cover" />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-bb-primary/20 to-bb-secondary/20" />
                          )}
                        </td>
                        <td className="px-4 py-3 font-sans text-[13px] text-bb-on-surface font-medium">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="hover:text-bb-secondary-deep transition-colors"
                          >
                            {name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px] text-bb-on-surface-variant">{p.slug}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 border font-sans text-[10px] uppercase tracking-[0.1em]",
                              p.status === "published"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            )}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="font-sans text-[12px] text-bb-primary hover:underline"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
