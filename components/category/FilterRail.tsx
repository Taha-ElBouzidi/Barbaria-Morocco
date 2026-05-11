"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Icon from "@/components/primitives/Icon";
import { FACETS } from "@/lib/rituals";
import { useTranslations } from "next-intl";

interface Props {
  selected: Record<string, string[]>;
  onToggle: (axis: string, value: string) => void;
  onClear: () => void;
}

type Axis = keyof typeof FACETS;

const AXES: Array<{ id: Axis; labelKey: string }> = [
  { id: "ingredient", labelKey: "f_ingredient" },
  { id: "use",        labelKey: "f_application" },
  { id: "format",     labelKey: "f_format" },
  { id: "packaging",  labelKey: "f_packaging" },
  { id: "certif",     labelKey: "f_certif" },
];

export default function FilterRail({ selected, onToggle, onClear }: Props) {
  const t = useTranslations("rituals");
  const [openAxis, setOpenAxis] = useState<Axis | null>("ingredient");
  const totalSelected = Object.values(selected).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <aside className="lg:w-[280px] shrink-0">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-sans text-[12px] uppercase tracking-[0.18em] text-bb-primary">{t("filter_by")}</h3>
        {totalSelected > 0 && (
          <button
            onClick={onClear}
            className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary"
          >
            Clear ({totalSelected})
          </button>
        )}
      </div>
      <div className="divide-y divide-bb-line border-y border-bb-line">
        {AXES.map(({ id, labelKey }) => {
          const isOpen = openAxis === id;
          const options = FACETS[id] as readonly string[];
          const chosen = selected[id] ?? [];
          return (
            <div key={id}>
              <button
                onClick={() => setOpenAxis(isOpen ? null : id)}
                className="flex w-full items-center justify-between py-4 font-sans text-[12px] uppercase tracking-[0.12em] text-bb-on-surface"
              >
                <span>
                  {t(labelKey)}{" "}
                  {chosen.length > 0 && <span className="text-bb-secondary">({chosen.length})</span>}
                </span>
                <Icon name={isOpen ? "minus" : "plus"} size={14} />
              </button>
              {isOpen && (
                <ul className="space-y-2 pb-4">
                  {options.map((opt) => {
                    const isChosen = chosen.includes(opt);
                    return (
                      <li key={opt}>
                        <label
                          className={cn(
                            "flex items-center gap-3 cursor-pointer text-[13px]",
                            isChosen ? "text-bb-primary" : "text-bb-on-surface-variant"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isChosen}
                            onChange={() => onToggle(id, opt)}
                            className="h-4 w-4 accent-bb-primary"
                          />
                          {opt}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
