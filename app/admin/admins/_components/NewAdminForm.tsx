"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAdmin } from "../actions";

interface Created {
  email: string;
  tempPassword: string;
}

export default function NewAdminForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);
  const [copied, setCopied] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createAdmin(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setCreated({ email: res.email, tempPassword: res.tempPassword });
      router.refresh();
    });
  };

  function copyPassword() {
    if (!created) return;
    navigator.clipboard?.writeText(created.tempPassword).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2400);
      },
      () => {
        // Clipboard refusals are non-fatal; the password is visible on
        // the page so the user can copy by hand.
      }
    );
  }

  if (created) {
    return (
      <div className="border border-bb-secondary-deep/40 bg-bb-bg-low p-6 space-y-4">
        <header className="space-y-1">
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-secondary-deep">
            Admin created
          </p>
          <h2 className="font-serif text-[22px] leading-tight">
            Temporary password
          </h2>
          <p className="font-sans text-[13px] text-bb-on-surface">
            Share this once with <strong className="font-medium">{created.email}</strong> through a private channel. They can rotate it from the Supabase dashboard.
            We will not show it again.
          </p>
        </header>
        <div className="flex items-stretch gap-2">
          <code className="flex-1 px-4 py-3 border border-bb-line bg-bb-bg font-mono text-[14px] tracking-wider break-all">
            {created.tempPassword}
          </code>
          <button
            type="button"
            onClick={copyPassword}
            aria-label="Copy temporary password to clipboard"
            className="shrink-0 px-4 py-3 min-h-[44px] border border-bb-line font-sans text-[11px] uppercase tracking-[0.16em] text-bb-on-surface hover:border-bb-primary transition-colors"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setCreated(null);
              setError(null);
              setCopied(false);
            }}
            className="px-5 py-3 min-h-[44px] bg-bb-primary text-white font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container transition-colors"
          >
            Create another
          </button>
          <a
            href="/admin/admins"
            className="px-5 py-3 min-h-[44px] border border-bb-line font-sans text-[12px] uppercase tracking-[0.18em] text-bb-on-surface hover:border-bb-primary transition-colors inline-flex items-center justify-center"
          >
            Back to admins
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-lg">
      {error && (
        <p
          role="alert"
          className="px-4 py-3 border border-red-200 bg-red-50 text-red-800 font-sans text-[13px]"
        >
          {error}
        </p>
      )}

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block font-sans text-[11px] uppercase tracking-[0.14em] text-bb-on-surface-variant"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="off"
          className="w-full px-3 py-3 min-h-[44px] border border-bb-line bg-bb-bg text-bb-primary text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="displayName"
          className="block font-sans text-[11px] uppercase tracking-[0.14em] text-bb-on-surface-variant"
        >
          Display name <span className="text-bb-on-surface-variant lowercase tracking-normal">(optional)</span>
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          maxLength={120}
          className="w-full px-3 py-3 min-h-[44px] border border-bb-line bg-bb-bg text-bb-primary text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="role"
          className="block font-sans text-[11px] uppercase tracking-[0.14em] text-bb-on-surface-variant"
        >
          Role
        </label>
        <select
          id="role"
          name="role"
          defaultValue="admin"
          className="w-full px-3 py-3 min-h-[44px] border border-bb-line bg-bb-bg text-bb-primary text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-secondary"
        >
          <option value="admin">Admin (everything except admin management)</option>
          <option value="superadmin">Superadmin (also manages admins)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="px-6 py-3 min-h-[44px] bg-bb-primary text-white font-sans text-[12px] uppercase tracking-[0.18em] hover:bg-bb-primary-container disabled:opacity-50 transition-colors"
      >
        {pending ? "Creating…" : "Create admin"}
      </button>
    </form>
  );
}
