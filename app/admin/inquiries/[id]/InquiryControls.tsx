"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateInquiry } from "./actions";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

interface Props {
  id: string;
  initialStatus: string;
  initialNotes: string;
}

export default function InquiryControls({ id, initialStatus, initialNotes }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateInquiry(id, fd);
      if (res && res.ok === false) {
        setError(res.error);
        return;
      }
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2400);
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 px-4 md:px-6 py-4">
      <div>
        <label htmlFor="inquiry-status" className="block font-sans text-[11px] uppercase tracking-[0.14em] text-bb-on-surface-variant mb-2">
          Status
        </label>
        <select
          id="inquiry-status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-3 min-h-[44px] border border-bb-line bg-bb-bg text-bb-primary text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="inquiry-notes" className="block font-sans text-[11px] uppercase tracking-[0.14em] text-bb-on-surface-variant mb-2">
          Internal notes
        </label>
        <textarea
          id="inquiry-notes"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Anything the concierge or the house needs to remember about this inquiry."
          className="w-full px-3 py-3 border border-bb-line bg-bb-bg text-bb-primary text-[13px] leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center px-5 py-3 min-h-[44px] bg-bb-primary text-white font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container disabled:opacity-50 transition-colors"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {saved && (
          <span role="status" className="font-sans text-[12px] text-bb-secondary-deep">
            Saved
          </span>
        )}
      </div>
      {error && (
        <p
          role="alert"
          className="px-3 py-2 border border-red-200 bg-red-50 text-red-800 font-sans text-[12px]"
        >
          {error}
        </p>
      )}
    </form>
  );
}
