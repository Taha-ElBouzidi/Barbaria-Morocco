"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { GiftBoxAdminRow } from "@/lib/admin/gift-boxes";

const CATEGORY_FILTERS = [
  { value: "all", label: "All categories" },
  { value: "cosmetiques", label: "Cosmetics" },
  { value: "epicerie_fine", label: "Fine Épicerie" },
] as const;

const STATUS_FILTERS = [
  { value: "all", label: "All status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
] as const;

export default function GiftBoxesList({ boxes }: { boxes: GiftBoxAdminRow[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORY_FILTERS)[number]["value"]>("all");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]["value"]>("all");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return boxes.filter((b) => {
      if (category !== "all" && b.categorySlug !== category) return false;
      if (status !== "all" && b.status !== status) return false;
      if (!s) return true;
      return b.nameEn.toLowerCase().includes(s) || b.slug.toLowerCase().includes(s);
    });
  }, [boxes, search, category, status]);

  return (
    <section className="space-y-6">
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
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value as typeof category)}
          className="px-3 py-3 min-h-[44px] border border-bb-line bg-bb-bg text-bb-primary text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1"
        >
          {CATEGORY_FILTERS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
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
          {filtered.length} of {boxes.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="font-display italic text-bb-on-surface-variant py-12 text-center">
          No gift boxes match the current filters.
        </p>
      ) : (
        <div className="overflow-x-auto border border-bb-line bg-bb-bg">
          <table className="w-full text-[14px]">
            <thead className="bg-bb-bg-low text-[11px] uppercase tracking-[0.12em] text-bb-on-surface-variant">
              <tr>
                <th scope="col" className="text-left p-4">Name</th>
                <th scope="col" className="text-left p-4 hidden sm:table-cell">Category</th>
                <th scope="col" className="text-left p-4 hidden md:table-cell">Type</th>
                <th scope="col" className="text-left p-4 hidden md:table-cell">Items</th>
                <th scope="col" className="text-left p-4 hidden sm:table-cell">Min</th>
                <th scope="col" className="text-left p-4">Status</th>
                <th scope="col" className="text-right p-4 sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-t border-bb-line hover:bg-bb-bg-low transition-colors">
                  <td className="p-4">
                    <Link
                      href={`/admin/gift-boxes/${b.id}`}
                      className="font-display text-[16px] text-bb-primary hover:text-bb-secondary-deep transition-colors"
                    >
                      {b.nameEn}
                    </Link>
                    <p className="text-[11px] text-bb-on-surface-variant font-mono mt-0.5">{b.slug}</p>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-bb-on-surface-variant">
                    {b.categorySlug}
                  </td>
                  <td className="p-4 hidden md:table-cell text-bb-on-surface-variant">
                    {b.isCustomizable ? "Customizable" : "Curated"}
                  </td>
                  <td className="p-4 hidden md:table-cell text-bb-on-surface-variant">
                    {b.itemCount}
                  </td>
                  <td className="p-4 hidden sm:table-cell text-bb-on-surface-variant">
                    {b.defaultQuantityMin}
                  </td>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
