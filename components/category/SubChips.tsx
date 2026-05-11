"use client";
import { cn } from "@/lib/utils";
import type { SubCat } from "@/lib/rituals";

interface Props {
  subs: SubCat[];
  active: string | null;
  onChange: (sub: string | null) => void;
  lang: "en" | "fr";
  allLabel: string;
}

export default function SubChips({ subs, active, onChange, lang, allLabel }: Props) {
  const items: Array<{ id: string | null; label: string }> = [
    { id: null, label: allLabel },
    ...subs.map((s) => ({ id: s.id, label: s.name[lang] })),
  ];
  return (
    <nav className="border-b border-bb-line">
      <ul className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] flex flex-wrap items-center gap-x-8 gap-y-3 py-5 font-sans text-[12px] uppercase tracking-[0.18em]">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id ?? "all"}>
              <button
                onClick={() => onChange(item.id)}
                className={cn(
                  "pb-1 transition-colors border-b",
                  isActive
                    ? "text-bb-primary border-bb-secondary"
                    : "text-bb-on-surface-variant border-transparent hover:text-bb-primary"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
