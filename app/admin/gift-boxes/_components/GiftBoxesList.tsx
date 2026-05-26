"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { GiftBoxAdminRow } from "@/lib/admin/gift-boxes";
import { reorderGiftBox } from "../actions";

const STATUS_FILTERS = [
  { value: "all", label: "All status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
] as const;

const CATEGORY_SECTIONS = [
  { slug: "cosmetiques", label: "Cosmetics" },
  { slug: "epicerie_fine", label: "Fine Épicerie" },
] as const;

export default function GiftBoxesList({ boxes }: { boxes: GiftBoxAdminRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]["value"]>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const s = search.trim().toLowerCase();
    const result: Record<string, GiftBoxAdminRow[]> = { cosmetiques: [], epicerie_fine: [] };
    for (const b of boxes) {
      if (status !== "all" && b.status !== status) continue;
      if (s && !b.nameEn.toLowerCase().includes(s) && !b.slug.toLowerCase().includes(s)) continue;
      if (result[b.categorySlug] !== undefined) {
        result[b.categorySlug].push(b);
      }
    }
    return result;
  }, [boxes, search, status]);

  const total = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);

  const onReorder = (id: string, direction: "up" | "down") => {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const res = await reorderGiftBox(id, direction);
      setPendingId(null);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="search"
          aria-label="Search gift boxes by name or slug"
          placeholder="Search by name or slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-[280px] px-4 py-3 min-h-[44px] border border-bb-line bg-bb-bg text-bb-primary text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1"
        />
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="px-3 py-3 min-h-[44px] border border-bb-line bg-bb-bg text-bb-primary text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1"
        >
          {STATUS_FILTERS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="text-[12px] text-bb-on-surface-variant ml-auto">
          {total} of {boxes.length}
        </span>
      </div>

      {error && (
        <p role="alert" className="px-4 py-3 border border-red-200 bg-red-50 text-red-800 font-sans text-[13px]">
          {error}
        </p>
      )}

      {CATEGORY_SECTIONS.map((section) => {
        const rows = grouped[section.slug] ?? [];
        return (
          <section key={section.slug} className="space-y-4" aria-label={`${section.label} gift boxes`}>
            <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
              {section.label}
              <span className="text-bb-on-surface-variant ml-2 text-[10px]">({rows.length})</span>
            </h2>

            {rows.length === 0 ? (
              <p className="font-display italic text-bb-on-surface-variant py-6 text-center">
                No boxes in this category match the current filters.
              </p>
            ) : (
              <>
                <div className="md:hidden flex flex-col gap-3">
                  {rows.map((b, i) => {
                    const isFirst = i === 0;
                    const isLast = i === rows.length - 1;
                    const busy = pendingId === b.id;
                    return (
                      <div key={b.id} className="p-4 border border-bb-line bg-bb-bg space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/admin/gift-boxes/${b.id}`}
                              className="font-display text-[16px] text-bb-primary truncate hover:text-bb-secondary-deep transition-colors block"
                            >
                              {b.nameEn}
                            </Link>
                            <p className="text-[11px] text-bb-on-surface-variant font-mono truncate">{b.slug}</p>
                          </div>
                          <span
                            className={`shrink-0 inline-block px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${
                              b.status === "published"
                                ? "bg-bb-secondary/15 text-bb-secondary-deep"
                                : "bg-bb-bg-mid text-bb-on-surface-variant"
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-bb-on-surface-variant">
                          <span>{b.isCustomizable ? "Customizable" : "Curated"}</span>
                          <span>·</span>
                          <span>{b.itemCount} items</span>
                          <span>·</span>
                          <span>Min {b.defaultQuantityMin}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => onReorder(b.id, "up")}
                            disabled={isFirst || busy}
                            aria-label={`Move ${b.nameEn} up`}
                            className="px-3 py-2 min-w-[44px] min-h-[36px] text-bb-on-surface-variant hover:text-bb-primary disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => onReorder(b.id, "down")}
                            disabled={isLast || busy}
                            aria-label={`Move ${b.nameEn} down`}
                            className="px-3 py-2 min-w-[44px] min-h-[36px] text-bb-on-surface-variant hover:text-bb-primary disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="hidden md:block overflow-x-auto border border-bb-line bg-bb-bg">
                  <table className="w-full text-[14px]">
                    <thead className="bg-bb-bg-low text-[11px] uppercase tracking-[0.12em] text-bb-on-surface-variant">
                      <tr>
                        <th scope="col" className="text-left p-4 w-[100px]">Order</th>
                        <th scope="col" className="text-left p-4">Name</th>
                        <th scope="col" className="text-left p-4">Type</th>
                        <th scope="col" className="text-left p-4">Items</th>
                        <th scope="col" className="text-left p-4">Min</th>
                        <th scope="col" className="text-left p-4">Status</th>
                        <th scope="col" className="text-right p-4 sr-only">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((b, i) => {
                        const isFirst = i === 0;
                        const isLast = i === rows.length - 1;
                        const busy = pendingId === b.id;
                        return (
                          <tr key={b.id} className="border-t border-bb-line hover:bg-bb-bg-low transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => onReorder(b.id, "up")}
                                  disabled={isFirst || busy}
                                  aria-label={`Move ${b.nameEn} up`}
                                  className="px-2 py-1 text-bb-on-surface-variant hover:text-bb-primary disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onReorder(b.id, "down")}
                                  disabled={isLast || busy}
                                  aria-label={`Move ${b.nameEn} down`}
                                  className="px-2 py-1 text-bb-on-surface-variant hover:text-bb-primary disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
                                >
                                  ↓
                                </button>
                              </div>
                            </td>
                            <td className="p-4">
                              <Link
                                href={`/admin/gift-boxes/${b.id}`}
                                className="font-display text-[16px] text-bb-primary hover:text-bb-secondary-deep transition-colors"
                              >
                                {b.nameEn}
                              </Link>
                              <p className="text-[11px] text-bb-on-surface-variant font-mono mt-0.5">{b.slug}</p>
                            </td>
                            <td className="p-4 text-bb-on-surface-variant">
                              {b.isCustomizable ? "Customizable" : "Curated"}
                            </td>
                            <td className="p-4 text-bb-on-surface-variant">{b.itemCount}</td>
                            <td className="p-4 text-bb-on-surface-variant">{b.defaultQuantityMin}</td>
                            <td className="p-4">
                              <span
                                className={`inline-block px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${
                                  b.status === "published"
                                    ? "bg-bb-secondary/15 text-bb-secondary-deep"
                                    : "bg-bb-bg-mid text-bb-on-surface-variant"
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <Link
                                href={`/admin/gift-boxes/${b.id}`}
                                className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep hover:opacity-70"
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
          </section>
        );
      })}
    </div>
  );
}
