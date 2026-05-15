"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { OccasionAdminRow } from "@/lib/admin/occasions";

const STATUS_FILTERS = [
  { value: "all", label: "All status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
] as const;

export default function OccasionsList({ occasions }: { occasions: OccasionAdminRow[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]["value"]>("all");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return occasions.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (!s) return true;
      return (
        o.nameEn.toLowerCase().includes(s) ||
        o.nameFr.toLowerCase().includes(s) ||
        o.slug.toLowerCase().includes(s)
      );
    });
  }, [occasions, search, status]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="search"
          aria-label="Search occasions"
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
          {filtered.length} of {occasions.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="font-display italic text-bb-on-surface-variant py-12 text-center">
          No occasions match the current filters.
        </p>
      ) : (
        <div className="overflow-x-auto border border-bb-line bg-bb-bg">
          <table className="w-full text-[14px]">
            <thead className="bg-bb-bg-low text-[11px] uppercase tracking-[0.12em] text-bb-on-surface-variant">
              <tr>
                <th scope="col" className="text-left p-4">Name (EN)</th>
                <th scope="col" className="text-left p-4 hidden md:table-cell">Name (FR)</th>
                <th scope="col" className="text-left p-4 hidden sm:table-cell">Order</th>
                <th scope="col" className="text-left p-4">Status</th>
                <th scope="col" className="text-right p-4 sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-t border-bb-line hover:bg-bb-bg-low transition-colors">
                  <td className="p-4">
                    <Link
                      href={`/admin/occasions/${o.id}`}
                      className="font-display text-[16px] text-bb-primary hover:text-bb-secondary-deep transition-colors"
                    >
                      {o.nameEn}
                    </Link>
                    <p className="text-[11px] text-bb-on-surface-variant font-mono mt-0.5">{o.slug}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell text-bb-on-surface-variant">
                    {o.nameFr}
                  </td>
                  <td className="p-4 hidden sm:table-cell text-bb-on-surface-variant">
                    {o.sortOrder}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${
                        o.status === "published"
                          ? "bg-bb-secondary/15 text-bb-secondary-deep"
                          : "bg-bb-bg-mid text-bb-on-surface-variant"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/occasions/${o.id}`}
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
