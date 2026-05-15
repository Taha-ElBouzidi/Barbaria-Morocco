"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveFacet, deleteFacet, reorderFacet } from "@/app/admin/facets/actions";
import { FACET_TYPES, type FacetType } from "@/lib/admin/facets";

interface FacetRow {
  id: string;
  type: string;
  value_en: string;
  value_fr: string;
  sort_order: number | null;
  productCount: number;
}

interface FacetEditorProps {
  facetsByType: Record<FacetType, FacetRow[]>;
}

const TYPE_LABELS: Record<FacetType, string> = {
  ingredient: "Ingredient",
  use: "Use",
  format: "Format",
  packaging: "Packaging",
  certification: "Certification",
};

export default function FacetEditor({ facetsByType }: FacetEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // inline edit state: facetId -> { valueEn, valueFr }
  const [editing, setEditing] = useState<Record<string, { valueEn: string; valueFr: string }>>({});

  // add form state per type
  const [addForms, setAddForms] = useState<
    Record<FacetType, { valueEn: string; valueFr: string; sortOrder: string }>
  >(
    Object.fromEntries(
      FACET_TYPES.map((t) => [t, { valueEn: "", valueFr: "", sortOrder: "0" }])
    ) as Record<FacetType, { valueEn: string; valueFr: string; sortOrder: string }>
  );

  function setError(key: string, msg: string) {
    setErrors((prev) => ({ ...prev, [key]: msg }));
  }

  function clearError(key: string) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function startEditing(f: FacetRow) {
    setEditing((prev) => ({
      ...prev,
      [f.id]: { valueEn: f.value_en, valueFr: f.value_fr },
    }));
  }

  function cancelEditing(id: string) {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function handleSaveEdit(f: FacetRow) {
    const vals = editing[f.id];
    if (!vals) return;
    clearError(`edit_${f.id}`);

    const fd = new FormData();
    fd.set("id", f.id);
    fd.set("type", f.type);
    fd.set("valueEn", vals.valueEn);
    fd.set("valueFr", vals.valueFr);
    fd.set("sortOrder", String(f.sort_order ?? 0));

    startTransition(async () => {
      const result = await saveFacet(fd);
      if (!result.ok) {
        setError(`edit_${f.id}`, result.error ?? "Save failed");
      } else {
        cancelEditing(f.id);
        router.refresh();
      }
    });
  }

  function handleDelete(f: FacetRow) {
    if (
      !confirm(
        f.productCount > 0
          ? `This facet is used by ${f.productCount} product${f.productCount === 1 ? "" : "s"}. Delete is blocked.`
          : `Delete "${f.value_en}"?`
      )
    )
      return;

    clearError(`delete_${f.id}`);
    startTransition(async () => {
      const result = await deleteFacet(f.id);
      if (!result.ok) {
        setError(`delete_${f.id}`, result.error ?? "Delete failed");
      } else {
        router.refresh();
      }
    });
  }

  function handleReorder(f: FacetRow, direction: "up" | "down") {
    startTransition(async () => {
      await reorderFacet(f.id, f.type, direction, f.sort_order ?? 0);
      router.refresh();
    });
  }

  function handleAdd(type: FacetType) {
    const vals = addForms[type];
    clearError(`add_${type}`);

    const fd = new FormData();
    fd.set("type", type);
    fd.set("valueEn", vals.valueEn);
    fd.set("valueFr", vals.valueFr);
    fd.set("sortOrder", vals.sortOrder);

    startTransition(async () => {
      const result = await saveFacet(fd);
      if (!result.ok) {
        setError(`add_${type}`, result.error ?? "Add failed");
      } else {
        setAddForms((prev) => ({
          ...prev,
          [type]: { valueEn: "", valueFr: "", sortOrder: "0" },
        }));
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-12">
      {FACET_TYPES.map((type) => {
        const facets = facetsByType[type] ?? [];
        const addVals = addForms[type];
        return (
          <section key={type} className="space-y-6">
            <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
              {TYPE_LABELS[type]}
            </h2>

            {/* Existing facets */}
            {facets.length === 0 ? (
              <p className="font-sans text-[13px] text-bb-on-surface-variant">No values yet.</p>
            ) : (
              <div className="border border-bb-line overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-bb-line bg-bb-bg-low">
                      <th className="text-left px-4 py-2.5 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                        EN
                      </th>
                      <th className="text-left px-4 py-2.5 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                        FR
                      </th>
                      <th className="text-left px-4 py-2.5 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                        Order
                      </th>
                      <th className="text-left px-4 py-2.5 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                        Products
                      </th>
                      <th className="text-left px-4 py-2.5 font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {facets.map((f, index) => {
                      const isEditing = !!editing[f.id];
                      const editVals = editing[f.id];
                      return (
                        <tr key={f.id} className="border-b border-bb-line last:border-0">
                          <td className="px-4 py-2.5">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editVals.valueEn}
                                onChange={(e) =>
                                  setEditing((prev) => ({
                                    ...prev,
                                    [f.id]: { ...prev[f.id], valueEn: e.target.value },
                                  }))
                                }
                                className="w-full bg-transparent border-0 border-b border-bb-line py-1 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
                              />
                            ) : (
                              <span className="font-sans text-[13px] text-bb-on-surface">
                                {f.value_en}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editVals.valueFr}
                                onChange={(e) =>
                                  setEditing((prev) => ({
                                    ...prev,
                                    [f.id]: { ...prev[f.id], valueFr: e.target.value },
                                  }))
                                }
                                className="w-full bg-transparent border-0 border-b border-bb-line py-1 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary"
                              />
                            ) : (
                              <span className="font-sans text-[12px] text-bb-on-surface-variant">
                                {f.value_fr}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 font-sans text-[12px] text-bb-on-surface-variant">
                            {f.sort_order ?? 0}
                          </td>
                          <td className="px-4 py-2.5 font-sans text-[12px] text-bb-on-surface-variant">
                            {f.productCount}
                          </td>
                          <td className="px-4 py-2.5">
                            {errors[`edit_${f.id}`] && (
                              <p className="font-sans text-[11px] text-bb-tertiary mb-1">
                                {errors[`edit_${f.id}`]}
                              </p>
                            )}
                            {errors[`delete_${f.id}`] && (
                              <p className="font-sans text-[11px] text-bb-tertiary mb-1">
                                {errors[`delete_${f.id}`]}
                              </p>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(f)}
                                    disabled={isPending}
                                    className="font-sans text-[11px] text-bb-primary hover:underline disabled:opacity-50"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => cancelEditing(f.id)}
                                    className="font-sans text-[11px] text-bb-on-surface-variant hover:underline"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => startEditing(f)}
                                    className="font-sans text-[11px] text-bb-primary hover:underline"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReorder(f, "up")}
                                    disabled={isPending || index === 0}
                                    className="font-sans text-[11px] text-bb-on-surface-variant hover:text-bb-primary disabled:opacity-30"
                                    title="Move up"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReorder(f, "down")}
                                    disabled={isPending || index === facets.length - 1}
                                    className="font-sans text-[11px] text-bb-on-surface-variant hover:text-bb-primary disabled:opacity-30"
                                    title="Move down"
                                  >
                                    ↓
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(f)}
                                    disabled={isPending}
                                    className="font-sans text-[11px] text-bb-tertiary hover:underline disabled:opacity-50"
                                  >
                                    Delete
                                    {f.productCount > 0 ? ` (${f.productCount})` : ""}
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

            {/* Add new value */}
            {errors[`add_${type}`] && (
              <p className="font-sans text-[12px] text-bb-tertiary" role="alert">
                {errors[`add_${type}`]}
              </p>
            )}
            <div className="border border-dashed border-bb-line p-4">
              <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-4">
                Add value
              </p>
              <div className="flex flex-wrap gap-3 items-end">
                <label className="block">
                  <span className="block font-sans text-[10px] uppercase tracking-[0.14em] text-bb-on-surface-variant mb-1">
                    EN *
                  </span>
                  <input
                    type="text"
                    value={addVals.valueEn}
                    onChange={(e) =>
                      setAddForms((prev) => ({
                        ...prev,
                        [type]: { ...prev[type], valueEn: e.target.value },
                      }))
                    }
                    className="bg-transparent border-0 border-b border-bb-line py-1.5 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary w-36"
                    placeholder="English"
                  />
                </label>
                <label className="block">
                  <span className="block font-sans text-[10px] uppercase tracking-[0.14em] text-bb-on-surface-variant mb-1">
                    FR *
                  </span>
                  <input
                    type="text"
                    value={addVals.valueFr}
                    onChange={(e) =>
                      setAddForms((prev) => ({
                        ...prev,
                        [type]: { ...prev[type], valueFr: e.target.value },
                      }))
                    }
                    className="bg-transparent border-0 border-b border-bb-line py-1.5 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary w-36"
                    placeholder="Français"
                  />
                </label>
                <label className="block">
                  <span className="block font-sans text-[10px] uppercase tracking-[0.14em] text-bb-on-surface-variant mb-1">
                    Order
                  </span>
                  <input
                    type="number"
                    value={addVals.sortOrder}
                    onChange={(e) =>
                      setAddForms((prev) => ({
                        ...prev,
                        [type]: { ...prev[type], sortOrder: e.target.value },
                      }))
                    }
                    className="bg-transparent border-0 border-b border-bb-line py-1.5 text-bb-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1 focus:border-bb-primary w-20"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleAdd(type)}
                  disabled={isPending || !addVals.valueEn || !addVals.valueFr}
                  className="bg-bb-primary text-bb-bg px-5 py-2 font-sans text-[11px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors disabled:opacity-50"
                >
                  {isPending ? "Adding…" : "Add"}
                </button>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
