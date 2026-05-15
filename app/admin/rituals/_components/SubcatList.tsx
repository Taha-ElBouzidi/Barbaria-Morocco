"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addSubcat,
  renameSubcat,
  reorderSubcat,
  deleteSubcat,
} from "@/app/admin/rituals/[id]/actions";

interface SubcatRow {
  id: string;
  slug: string;
  sort_order: number | null;
  productCount: number;
  translations: Array<{ locale: string; name: string }>;
}

interface SubcatListProps {
  ritualId: string;
  subcategories: SubcatRow[];
}

export default function SubcatList({ ritualId, subcategories }: SubcatListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Add form state
  const [newSlug, setNewSlug] = useState("");
  const [newNameEn, setNewNameEn] = useState("");
  const [newNameFr, setNewNameFr] = useState("");
  const [newSortOrder, setNewSortOrder] = useState("0");

  // Inline edit state, map of subcatId -> { nameEn, nameFr }
  const [editing, setEditing] = useState<Record<string, { nameEn: string; nameFr: string }>>({});

  function getEnName(sc: SubcatRow) {
    return sc.translations.find((t) => t.locale === "en")?.name ?? sc.slug;
  }

  function getFrName(sc: SubcatRow) {
    return sc.translations.find((t) => t.locale === "fr")?.name ?? sc.slug;
  }

  function startEditing(sc: SubcatRow) {
    setEditing((prev) => ({
      ...prev,
      [sc.id]: { nameEn: getEnName(sc), nameFr: getFrName(sc) },
    }));
  }

  function cancelEditing(id: string) {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function handleAdd(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addSubcat(ritualId, formData);
      if (!result.ok) {
        setError(result.error ?? "Unknown error");
      } else {
        setNewSlug("");
        setNewNameEn("");
        setNewNameFr("");
        setNewSortOrder("0");
        router.refresh();
      }
    });
  }

  function handleRename(subcatId: string) {
    const vals = editing[subcatId];
    if (!vals) return;
    setError(null);
    startTransition(async () => {
      const result = await renameSubcat(subcatId, ritualId, vals.nameEn, vals.nameFr);
      if (!result.ok) {
        setError(result.error ?? "Unknown error");
      } else {
        cancelEditing(subcatId);
        router.refresh();
      }
    });
  }

  function handleReorder(subcatId: string, direction: "up" | "down", currentOrder: number) {
    setError(null);
    startTransition(async () => {
      const result = await reorderSubcat(subcatId, ritualId, direction, currentOrder);
      if (!result.ok) setError(result.error ?? "Unknown error");
      else router.refresh();
    });
  }

  function handleDelete(subcatId: string, name: string) {
    if (!confirm(`Delete sub-category "${name}"? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteSubcat(subcatId, ritualId);
      if (!result.ok) {
        setError(result.error ?? "Unknown error");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="border border-bb-tertiary bg-bb-tertiary/5 px-4 py-3">
          <p className="font-sans text-[13px] text-bb-tertiary" role="alert">
            {error}
          </p>
        </div>
      )}

      {subcategories.length === 0 ? (
        <p className="font-sans text-[13px] text-bb-on-surface-variant">No sub-categories yet.</p>
      ) : (
        <div className="border border-bb-line overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bb-line bg-bb-bg-low">
                <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  Slug
                </th>
                <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  Name EN
                </th>
                <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  Name FR
                </th>
                <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  Order
                </th>
                <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  Products
                </th>
                <th className="text-left px-4 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {subcategories.map((sc, index) => {
                const isEditing = !!editing[sc.id];
                const editVals = editing[sc.id];
                return (
                  <tr key={sc.id} className="border-b border-bb-line last:border-0">
                    <td className="px-4 py-3 font-mono text-[11px] text-bb-on-surface-variant">
                      {sc.slug}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editVals.nameEn}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [sc.id]: { ...prev[sc.id], nameEn: e.target.value },
                            }))
                          }
                          className="w-full bg-transparent border-0 border-b border-bb-line py-1 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
                        />
                      ) : (
                        <span className="font-sans text-[13px] text-bb-on-surface">
                          {getEnName(sc)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editVals.nameFr}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [sc.id]: { ...prev[sc.id], nameFr: e.target.value },
                            }))
                          }
                          className="w-full bg-transparent border-0 border-b border-bb-line py-1 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
                        />
                      ) : (
                        <span className="font-sans text-[13px] text-bb-on-surface-variant">
                          {getFrName(sc)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant">
                      {sc.sort_order ?? 0}
                    </td>
                    <td className="px-4 py-3 font-sans text-[12px] text-bb-on-surface-variant">
                      {sc.productCount}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRename(sc.id)}
                              disabled={isPending}
                              className="font-sans text-[11px] text-bb-primary hover:underline disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelEditing(sc.id)}
                              className="font-sans text-[11px] text-bb-on-surface-variant hover:underline"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing(sc)}
                              className="font-sans text-[11px] text-bb-primary hover:underline"
                            >
                              Rename
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleReorder(sc.id, "up", sc.sort_order ?? index)
                              }
                              disabled={isPending || index === 0}
                              className="font-sans text-[11px] text-bb-on-surface-variant hover:text-bb-primary disabled:opacity-30"
                              title="Move up"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleReorder(
                                  sc.id,
                                  "down",
                                  sc.sort_order ?? index
                                )
                              }
                              disabled={isPending || index === subcategories.length - 1}
                              className="font-sans text-[11px] text-bb-on-surface-variant hover:text-bb-primary disabled:opacity-30"
                              title="Move down"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(sc.id, getEnName(sc))}
                              disabled={isPending}
                              className="font-sans text-[11px] text-bb-tertiary hover:underline disabled:opacity-50"
                            >
                              Delete{sc.productCount > 0 ? ` (${sc.productCount} products)` : ""}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add new sub-category */}
      <div className="border border-bb-line p-6 space-y-4">
        <h3 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep">
          Add sub-category
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            handleAdd(fd);
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <label className="block">
            <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
              Slug *
            </span>
            <input
              type="text"
              name="slug"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              pattern="[a-z0-9-]+"
              required
              className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface font-mono text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
              placeholder="e.g. body-scrubs"
            />
          </label>

          <label className="block">
            <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
              Sort order
            </span>
            <input
              type="number"
              name="sortOrder"
              value={newSortOrder}
              onChange={(e) => setNewSortOrder(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
            />
          </label>

          <label className="block">
            <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
              Name (EN) *
            </span>
            <input
              type="text"
              name="nameEn"
              value={newNameEn}
              onChange={(e) => setNewNameEn(e.target.value)}
              required
              className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
              placeholder="e.g. Body Scrubs"
            />
          </label>

          <label className="block">
            <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-2">
              Name (FR) *
            </span>
            <input
              type="text"
              name="nameFr"
              value={newNameFr}
              onChange={(e) => setNewNameFr(e.target.value)}
              required
              className="w-full bg-transparent border-0 border-b border-bb-line py-2 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
              placeholder="e.g. Gommages Corps"
            />
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-bb-primary text-bb-bg px-6 py-3 font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors disabled:opacity-50"
            >
              {isPending ? "Adding…" : "Add sub-category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
