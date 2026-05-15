"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSiteSettings } from "./actions";
import type { SiteSettingsAdminRow } from "@/lib/admin/site-settings";

interface Props {
  initial: SiteSettingsAdminRow;
}

const LABEL_CLS =
  "font-sans text-[11px] uppercase tracking-[0.18em] text-bb-on-surface-variant block mb-2";
const INPUT_CLS =
  "w-full px-3 py-3 min-h-[44px] border border-bb-line bg-bb-bg text-bb-primary text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary focus-visible:ring-offset-1";
const HELP_CLS = "font-sans text-[11px] text-bb-on-surface-variant mt-1 leading-snug";

export default function SettingsEditor({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    instagramUrl: initial.instagramUrl,
    linkedinUrl: initial.linkedinUrl,
    xUrl: initial.xUrl,
    whatsappUrl: initial.whatsappUrl,
    contactEmail: initial.contactEmail,
    contactPhone: initial.contactPhone,
  });
  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await saveSiteSettings(fd);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2400);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <section className="space-y-6">
        <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
          Social media
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={LABEL_CLS} htmlFor="instagramUrl">Instagram</label>
            <input
              id="instagramUrl"
              name="instagramUrl"
              type="url"
              value={form.instagramUrl}
              onChange={(e) => update("instagramUrl", e.target.value)}
              placeholder="https://instagram.com/your_handle"
              className={INPUT_CLS}
            />
            <p className={HELP_CLS}>Full profile URL. Shown as an icon in the public footer and the mobile menu.</p>
          </div>
          <div>
            <label className={LABEL_CLS} htmlFor="linkedinUrl">LinkedIn</label>
            <input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              value={form.linkedinUrl}
              onChange={(e) => update("linkedinUrl", e.target.value)}
              placeholder="https://www.linkedin.com/company/your-page"
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS} htmlFor="xUrl">X (Twitter)</label>
            <input
              id="xUrl"
              name="xUrl"
              type="url"
              value={form.xUrl}
              onChange={(e) => update("xUrl", e.target.value)}
              placeholder="https://x.com/your_handle"
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS} htmlFor="whatsappUrl">WhatsApp</label>
            <input
              id="whatsappUrl"
              name="whatsappUrl"
              type="url"
              value={form.whatsappUrl}
              onChange={(e) => update("whatsappUrl", e.target.value)}
              placeholder="https://wa.me/212XXXXXXXXX"
              className={INPUT_CLS}
            />
            <p className={HELP_CLS}>Use the wa.me link format with the country code, no plus sign.</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary-deep border-b border-bb-line pb-2">
          Contact
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={LABEL_CLS} htmlFor="contactEmail">Email</label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              placeholder="concierge@barbariamorocco.com"
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS} htmlFor="contactPhone">Phone</label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              value={form.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
              placeholder="+212XXXXXXXXX"
              className={INPUT_CLS}
            />
          </div>
        </div>
      </section>

      <footer className="sticky bottom-0 bg-bb-bg border-t border-bb-line py-4 -mx-4 md:-mx-8 px-4 md:px-8 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] bg-bb-primary text-white font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container disabled:opacity-50 transition-colors"
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
        {saved && (
          <span role="status" className="font-sans text-[12px] uppercase tracking-[0.18em] text-bb-secondary-deep">
            ✓ Saved
          </span>
        )}
        {error && (
          <span role="alert" className="font-sans text-[12px] text-bb-tertiary">
            {error}
          </span>
        )}
        {initial.updatedAt && (
          <span className="ml-auto font-sans text-[11px] text-bb-on-surface-variant">
            Last edit: {new Date(initial.updatedAt).toLocaleString("en-GB")}
          </span>
        )}
      </footer>
    </form>
  );
}
