"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveOccasion, setOccasionStatus, deleteOccasion } from "../[id]/actions";
import type { OccasionAdminDetail } from "@/lib/admin/occasions";

interface Props {
  initial?: OccasionAdminDetail;
}

export default function OccasionEditor({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [statusPending, startStatusTransition] = useTransition();

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [nameEn, setNameEn] = useState(initial?.translations.en.name ?? "");
  const [nameFr, setNameFr] = useState(initial?.translations.fr.name ?? "");

  useEffect(() => {
    if (initial) return;
    if (slug) return;
    if (!nameEn) return;
    const auto = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setSlug(auto);
  }, [nameEn, slug, initial]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveOccasion(initial?.id ?? "new", fd);
      router.refresh();
    });
  };

  const toggleStatus = () => {
    if (!initial) return;
    const next = initial.status === "published" ? "draft" : "published";
    startStatusTransition(async () => {
      await setOccasionStatus(initial.id, next);
      router.refresh();
    });
  };

  const remove = () => {
    if (!initial) return;
    if (!confirm(`Delete occasion "${initial.nameEn}"? This cannot be undone.`)) return;
    startStatusTransition(async () => {
      await deleteOccasion(initial.id);
    });
  };

  const labelCls = "font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant block mb-2";
  const inputCls =
    "w-full px-3 py-3 min-h-[44px] border border-bb-line bg-bb-bg text-bb-primary text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1";

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <section className="space-y-6">
        <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
          Identity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelCls} htmlFor="slug">Slug *</label>
            <input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              pattern="[a-z0-9-]+"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="sortOrder">Sort order</label>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
              className={inputCls}
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
          Translations
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant">English</p>
            <div>
              <label className={labelCls} htmlFor="name_en">Name *</label>
              <input id="name_en" name="name_en" required value={nameEn} onChange={(e) => setNameEn(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="space-y-5" lang="fr">
            <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant">Français</p>
            <div>
              <label className={labelCls} htmlFor="name_fr">Nom *</label>
              <input id="name_fr" name="name_fr" required value={nameFr} onChange={(e) => setNameFr(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>
      </section>

      <footer className="sticky bottom-0 bg-bb-bg border-t border-bb-line py-4 -mx-8 px-8 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-bb-primary text-white font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container disabled:opacity-50 transition-colors"
        >
          {pending ? "Saving…" : initial ? "Save changes" : "Create occasion"}
        </button>
        {initial && (
          <>
            <button
              type="button"
              onClick={toggleStatus}
              disabled={statusPending}
              className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] border border-bb-line text-bb-primary font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-bg-low disabled:opacity-50 transition-colors"
            >
              {statusPending ? "…" : initial.status === "published" ? "Unpublish" : "Publish"}
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={statusPending}
              className="ml-auto inline-flex items-center gap-2 px-5 py-3 min-h-[44px] border border-bb-tertiary text-bb-tertiary font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-tertiary hover:text-white disabled:opacity-50 transition-colors"
            >
              Delete
            </button>
          </>
        )}
      </footer>
    </form>
  );
}
