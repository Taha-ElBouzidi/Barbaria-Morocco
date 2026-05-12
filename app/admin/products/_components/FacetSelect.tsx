"use client";

import { cn } from "@/lib/utils";

interface Facet {
  id: string;
  type: string;
  value_en: string;
  value_fr: string;
}

interface FacetSelectProps {
  facets: Facet[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const AXIS_LABELS: Record<string, string> = {
  ingredient: "Ingredients",
  use: "Use / Application",
  format: "Format",
  packaging: "Packaging",
  certification: "Certifications",
};

const AXIS_ORDER = ["ingredient", "use", "format", "packaging", "certification"];

export default function FacetSelect({ facets, selected, onChange }: FacetSelectProps) {
  const byType = AXIS_ORDER.reduce<Record<string, Facet[]>>((acc, type) => {
    acc[type] = facets.filter((f) => f.type === type);
    return acc;
  }, {});

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="space-y-6">
      {AXIS_ORDER.map((type) => {
        const group = byType[type];
        if (!group || group.length === 0) return null;
        return (
          <div key={type}>
            <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant mb-3">
              {AXIS_LABELS[type] ?? type}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.map((facet) => {
                const isSelected = selected.includes(facet.id);
                return (
                  <button
                    key={facet.id}
                    type="button"
                    onClick={() => toggle(facet.id)}
                    className={cn(
                      "px-3 py-1.5 font-sans text-[12px] border transition-colors",
                      isSelected
                        ? "bg-bb-primary text-bb-bg border-bb-primary"
                        : "bg-transparent text-bb-on-surface border-bb-line hover:border-bb-primary"
                    )}
                  >
                    {facet.value_en}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Hidden inputs for form submission */}
      {selected.map((id) => (
        <input key={id} type="hidden" name="facetIds" value={id} />
      ))}
    </div>
  );
}
