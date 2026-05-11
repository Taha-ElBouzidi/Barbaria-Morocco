"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Icon from "@/components/primitives/Icon";
import SubChips from "./SubChips";
import FilterRail from "./FilterRail";
import ProductGrid from "./ProductGrid";
import type { SubCat } from "@/lib/rituals";
import type { Product } from "@/lib/products";

interface Props {
  subs: SubCat[];
  products: Product[];
  lang: "en" | "fr";
}

type Sort = "rec" | "az" | "moq";

export default function CategoryContent({ subs, products, lang }: Props) {
  const t = useTranslations("rituals");
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [sort, setSort] = useState<Sort>("rec");

  const filtered = useMemo(() => {
    let list = products;
    if (activeSub) list = list.filter((p) => p.sub === activeSub);
    for (const [axis, values] of Object.entries(selected)) {
      if (values.length === 0) continue;
      list = list.filter((p) => values.every((v) => p.tags.includes(v)));
    }
    if (sort === "az") {
      list = [...list].sort((a, b) => a.name[lang].localeCompare(b.name[lang]));
    } else if (sort === "moq") {
      list = [...list].sort((a, b) => a.moq - b.moq);
    } else {
      // recommended: hero items first, then by id
      list = [...list].sort((a, b) => {
        if (a.hero && !b.hero) return -1;
        if (!a.hero && b.hero) return 1;
        return a.id.localeCompare(b.id);
      });
    }
    return list;
  }, [products, activeSub, selected, sort, lang]);

  const toggleFacet = (axis: string, value: string) => {
    setSelected((prev) => {
      const cur = prev[axis] ?? [];
      const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
      return { ...prev, [axis]: next };
    });
  };

  const clearFacets = () => setSelected({});
  const chips = Object.entries(selected).flatMap(([axis, values]) =>
    values.map((v) => ({ axis, value: v }))
  );

  return (
    <>
      <SubChips subs={subs} active={activeSub} onChange={setActiveSub} lang={lang} allLabel={t("all")} />
      <section className="mx-auto max-w-[1440px] px-[var(--bb-margin-edge)] py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 lg:gap-16">
        <FilterRail selected={selected} onToggle={toggleFacet} onClear={clearFacets} />
        <div>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <p className="font-sans text-[12px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
              {t("showing", { count: filtered.length })}
            </p>
            <label className="flex items-center gap-2 font-sans text-[12px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
              {t("sort")}:
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="bg-transparent border-b border-bb-line py-1 font-sans text-bb-primary focus:outline-none focus:border-bb-secondary"
              >
                <option value="rec">{t("sort_recommended")}</option>
                <option value="az">{t("sort_az")}</option>
                <option value="moq">{t("sort_moq")}</option>
              </select>
            </label>
          </div>
          {chips.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {chips.map(({ axis, value }) => (
                <button
                  key={`${axis}:${value}`}
                  onClick={() => toggleFacet(axis, value)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 border border-bb-line text-[11px] uppercase tracking-[0.18em] text-bb-primary hover:border-bb-secondary"
                >
                  {value} <Icon name="close" size={12} />
                </button>
              ))}
            </div>
          )}
          <h2 className="sr-only">{t("products_section_label")}</h2>
          <ProductGrid products={filtered} lang={lang} emptyMessage={t("empty_state")} />
        </div>
      </section>
    </>
  );
}
