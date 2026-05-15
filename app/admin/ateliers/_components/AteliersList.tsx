"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AtelierRow {
  id: string;
  slug: string;
  name: string;
  region: string;
  since_year: number;
  sort_order: number | null;
  updated_at: string | null;
  translations: Array<{ locale: string; description: string }>;
}

interface AteliersListProps {
  ateliers: AtelierRow[];
}

export default function AteliersList({ ateliers }: AteliersListProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const filtered = ateliers.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.slug.includes(q) || a.name.toLowerCase().includes(q) || a.region.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by name, slug, or region…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-bb-bg border border-bb-line px-4 py-2.5 font-sans text-[13px] w-[280px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
        />
      </div>

      <p className="font-sans text-[12px] text-bb-on-surface-variant">
        {filtered.length} atelier{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="font-sans text-[13px] text-bb-on-surface-variant py-8 text-center">
          No ateliers match the current search.
        </p>
      ) : (
        <div className="border border-bb-line overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bb-line bg-bb-bg-low">
                <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  Region
                </th>
                <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  Since
                </th>
                <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  Order
                </th>
                <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => startTransition(() => router.push(`/admin/ateliers/${a.id}`))}
                  className="border-b border-bb-line last:border-0 hover:bg-bb-bg-low cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-sans text-[13px] text-bb-on-surface font-medium">
                    {a.name}
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant">
                    {a.region}
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant">
                    {a.since_year}
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant">
                    {a.sort_order ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/ateliers/${a.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-sans text-[12px] text-bb-primary hover:underline"
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
    </div>
  );
}
