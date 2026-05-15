"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface JournalCard {
  id: string;
  slug: string;
  date: string;
  image_path: string | null;
  feature: boolean;
  status: string;
  updated_at: string | null;
  translations: Array<{ locale: string; kicker: string; headline: string }>;
}

interface JournalListProps {
  cards: JournalCard[];
}

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

export default function JournalList({ cards }: JournalListProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = cards.filter((c) => {
    if (status !== "all" && c.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      const enHeadline =
        c.translations.find((t) => t.locale === "en")?.headline?.toLowerCase() ?? "";
      if (!c.slug.includes(q) && !enHeadline.includes(q)) return false;
    }
    return true;
  });

  function getEnHeadline(c: JournalCard): string {
    return c.translations.find((t) => t.locale === "en")?.headline ?? c.slug;
  }

  function getEnKicker(c: JournalCard): string {
    return c.translations.find((t) => t.locale === "en")?.kicker ?? "";
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by headline or slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-bb-bg border border-bb-line px-4 py-2.5 font-sans text-[13px] w-[280px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-bb-bg border border-bb-line px-4 py-2.5 font-sans text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <p className="font-sans text-[12px] text-bb-on-surface-variant">
        {filtered.length} card{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="font-sans text-[13px] text-bb-on-surface-variant py-8 text-center">
          No cards match the current filters.
        </p>
      ) : (
        <div className="border border-bb-line overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bb-line bg-bb-bg-low">
                <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  Headline (EN)
                </th>
                <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  Kicker (EN)
                </th>
                <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  Feature
                </th>
                <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => startTransition(() => router.push(`/admin/journal/${c.id}`))}
                  className="border-b border-bb-line last:border-0 hover:bg-bb-bg-low cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-sans text-[13px] text-bb-on-surface font-medium">
                    {getEnHeadline(c)}
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant">
                    {getEnKicker(c)}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-bb-on-surface-variant">
                    {c.date}
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant">
                    {c.feature ? "Yes" : ","}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 border font-sans text-[10px] uppercase tracking-[0.1em]",
                        c.status === "published"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      )}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/journal/${c.id}`}
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
