"use client";

import type { AdminUser } from "@/lib/admin/auth";

export default function TopBar({ admin }: { admin: AdminUser }) {
  return (
    <header className="flex items-center justify-end gap-4 px-8 py-4 border-b border-bb-line bg-bb-bg">
      <div className="text-right">
        <p className="font-sans text-[13px] text-bb-on-surface">{admin.displayName ?? admin.email}</p>
        <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">{admin.role}</p>
      </div>
      {/*
        Logout MUST be a POST form, not a Link. Next.js prefetches every
        <Link> on the page; if /admin/logout responded to GET (which used to
        call signOut()), the prefetch would silently log the user out the
        moment the TopBar rendered. Hard-learned. See proxy.ts session
        history.
      */}
      <form action="/admin/logout" method="POST">
        <button
          type="submit"
          className="font-sans text-[12px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary border border-bb-line px-4 py-2 transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </form>
    </header>
  );
}
