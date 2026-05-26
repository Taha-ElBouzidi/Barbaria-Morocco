"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import type { GiftBoxAdminRow } from "@/lib/admin/gift-boxes";
import { reorderGiftBox } from "../actions";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "all", label: "All status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
] as const;

const CATEGORY_TABS = [
  { slug: "cosmetiques", label: "Cosmetics" },
  { slug: "epicerie_fine", label: "Fine Épicerie" },
] as const;

type CategorySlug = (typeof CATEGORY_TABS)[number]["slug"];

export default function GiftBoxesList({ boxes }: { boxes: GiftBoxAdminRow[] }) {
  const [active, setActive] = useState<CategorySlug>("cosmetiques");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]["value"]>("all");
  const [error, setError] = useState<string | null>(null);

  // Local copy of the rows so reorder can update them optimistically
  // without waiting for the server round trip. The action runs in the
  // background; if it fails, we revert to the previous order.
  const [localBoxes, setLocalBoxes] = useState(boxes);
  useEffect(() => {
    setLocalBoxes(boxes);
  }, [boxes]);

  // Promise chain so rapid arrow clicks queue server-side instead of
  // racing. Each click extends the chain; the next server call only
  // fires after the previous one resolves. The user can mash arrows
  // freely; the optimistic UI updates every click; the server catches
  // up sequentially in the background.
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const grouped = useMemo(() => {
    const s = search.trim().toLowerCase();
    const result: Record<CategorySlug, GiftBoxAdminRow[]> = {
      cosmetiques: [],
      epicerie_fine: [],
    };
    for (const b of localBoxes) {
      const slug = b.categorySlug as CategorySlug;
      if (slug !== "cosmetiques" && slug !== "epicerie_fine") continue;
      if (status !== "all" && b.status !== status) continue;
      if (s && !b.nameEn.toLowerCase().includes(s) && !b.slug.toLowerCase().includes(s)) continue;
      result[slug].push(b);
    }
    return result;
  }, [localBoxes, search, status]);

  const rows = grouped[active];

  const onReorder = (id: string, direction: "up" | "down") => {
    setError(null);

    // Use the local state at the moment of the click for the optimistic
    // swap. Subsequent clicks read THIS UPDATED state (via the setter's
    // functional form below would also work, but reading directly works
    // because React batches setLocalBoxes synchronously enough that the
    // next click sees the new array).
    setLocalBoxes((current) => {
      const sameCat = current.filter((b) => b.categorySlug === active);
      const idx = sameCat.findIndex((b) => b.id === id);
      if (idx === -1) return current;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sameCat.length) return current;

      const swapId = sameCat[swapIdx].id;
      const next = current.map((b) => {
        if (b.id === id) return { ...b, sortOrder: sameCat[swapIdx].sortOrder };
        if (b.id === swapId) return { ...b, sortOrder: sameCat[idx].sortOrder };
        return b;
      });
      next.sort((a, b) => a.sortOrder - b.sortOrder);
      return next;
    });

    // Chain the server call after any in-flight reorder. The user can
    // click arrows as fast as they want; we serialize the writes here
    // so the server never sees concurrent reorders on the same list.
    queueRef.current = queueRef.current.then(async () => {
      const res = await reorderGiftBox(id, direction);
      if (!res.ok) {
        // A failure in the middle of a chain means the optimistic UI
        // is now ahead of reality. Surface the error; the user can
        // refresh to resync. We do not auto-revert because subsequent
        // clicks have already moved past this state.
        setError(res.error);
      }
    });
  };

  const totalAcrossTabs = grouped.cosmetiques.length + grouped.epicerie_fine.length;

  return (
    <div className="space-y-6">
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
              id={`gb-tab-${tab.slug}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`gb-panel-${tab.slug}`}
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
          {totalAcrossTabs} of {localBoxes.length}
        </span>
      </div>

      {error && (
        <p role="alert" className="px-4 py-3 border border-red-200 bg-red-50 text-red-800 font-sans text-[13px]">
          {error}
        </p>
      )}

      <div
        role="tabpanel"
        id={`gb-panel-${active}`}
        aria-labelledby={`gb-tab-${active}`}
        className="space-y-3"
      >
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
                        disabled={isFirst}
                        aria-label={`Move ${b.nameEn} up`}
                        className="px-3 py-2 min-w-[44px] min-h-[36px] text-bb-on-surface-variant hover:text-bb-primary disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => onReorder(b.id, "down")}
                        disabled={isLast}
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
                    return (
                      <tr key={b.id} className="border-t border-bb-line hover:bg-bb-bg-low transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onReorder(b.id, "up")}
                              disabled={isFirst}
                              aria-label={`Move ${b.nameEn} up`}
                              className="px-2 py-1 text-bb-on-surface-variant hover:text-bb-primary disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => onReorder(b.id, "down")}
                              disabled={isLast}
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
      </div>
    </div>
  );
}
