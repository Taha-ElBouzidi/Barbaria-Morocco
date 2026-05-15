"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProductRow {
  id: string;
  slug: string;
  ritual_id: string | null;
  moq: number;
  status: string;
  updated_at: string | null;
  translations: Array<{ locale: string; name: string }>;
  images: Array<{ path: string; sort_order: number | null }>;
}

interface ProductsListProps {
  products: ProductRow[];
  supabaseUrl: string;
}

const RITUAL_OPTIONS = [
  { value: "all", label: "All rituals" },
  { value: "hammam", label: "Hammam" },
  { value: "botanical", label: "Botanical" },
  { value: "heritage", label: "Heritage" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

export default function ProductsList({ products, supabaseUrl }: ProductsListProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [ritual, setRitual] = useState("all");
  const [status, setStatus] = useState("all");

  function getPublicUrl(path: string) {
    return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`;
  }

  const filtered = products.filter((p) => {
    if (ritual !== "all" && p.ritual_id !== ritual) return false;
    if (status !== "all" && p.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      const enName =
        p.translations.find((t) => t.locale === "en")?.name?.toLowerCase() ?? "";
      if (!p.slug.includes(q) && !enName.includes(q)) return false;
    }
    return true;
  });

  function getHeroImage(p: ProductRow): string | null {
    if (!p.images || p.images.length === 0) return null;
    const sorted = [...p.images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    return sorted[0]?.path ?? null;
  }

  function getEnName(p: ProductRow): string {
    return p.translations.find((t) => t.locale === "en")?.name ?? p.slug;
  }

  return (
    <div className="space-y-6">
      {/* Filters. Inputs are full-width on mobile, sized on desktop. Min
          height 44px to meet touch-target rule. */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by name or slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-bb-bg border border-bb-line px-4 py-3 min-h-[44px] font-sans text-[13px] sm:w-[280px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
        />
        <select
          value={ritual}
          onChange={(e) => setRitual(e.target.value)}
          className="bg-bb-bg border border-bb-line px-4 py-3 min-h-[44px] font-sans text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
        >
          {RITUAL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={status}
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

      <p className="font-sans text-[12px] text-bb-on-surface-variant">
        {filtered.length} product{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="font-sans text-[13px] text-bb-on-surface-variant py-8 text-center">
          No products match the current filters.
        </p>
      ) : (
        <>
          {/* Mobile: stacked cards. Hidden at md+. */}
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((p) => {
              const heroPath = getHeroImage(p);
              return (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}`}
                  className="flex items-start gap-3 p-3 border border-bb-line bg-bb-bg hover:border-bb-secondary-deep transition-colors"
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
                      {getEnName(p)}
                    </p>
                    <p className="font-mono text-[11px] text-bb-on-surface-variant truncate">
                      {p.slug}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
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
                      <span className="font-sans text-[11px] text-bb-on-surface-variant capitalize">
                        {p.ritual_id ?? "no ritual"}
                      </span>
                      <span className="font-sans text-[11px] text-bb-on-surface-variant">
                        MOQ {p.moq}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop: table. Hidden below md. */}
          <div className="hidden md:block border border-bb-line overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-bb-line bg-bb-bg-low">
                  <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant w-16">Image</th>
                  <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">Name (EN)</th>
                  <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">Slug</th>
                  <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">Ritual</th>
                  <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">MOQ</th>
                  <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">Status</th>
                  <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">Edit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const heroPath = getHeroImage(p);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => startTransition(() => router.push(`/admin/products/${p.id}`))}
                      className="border-b border-bb-line last:border-0 hover:bg-bb-bg-low cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        {heroPath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={getPublicUrl(heroPath)} alt="" className="w-12 h-12 object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-bb-primary/20 to-bb-secondary/20" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-sans text-[13px] text-bb-on-surface font-medium">{getEnName(p)}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-bb-on-surface-variant">{p.slug}</td>
                      <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant capitalize">{p.ritual_id ?? ","}</td>
                      <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant">{p.moq}</td>
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
                          onClick={(e) => e.stopPropagation()}
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
  );
}
