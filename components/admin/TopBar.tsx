"use client";

import type { AdminUser } from "@/lib/admin/auth";
import Icon from "@/components/primitives/Icon";

interface Props {
  admin: AdminUser;
  onOpenSidebar: () => void;
}

export default function TopBar({ admin, onOpenSidebar }: Props) {
  return (
    <header className="flex items-center justify-between gap-3 px-4 md:px-8 py-3 md:py-4 border-b border-bb-line bg-bb-bg">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] text-bb-on-surface hover:text-bb-primary transition-colors"
        aria-label="Open admin menu"
      >
        <Icon name="menu" size={22} />
      </button>
      <div className="flex items-center gap-3 ml-auto">
        <div className="text-right">
          <p className="font-sans text-[13px] text-bb-on-surface truncate max-w-[180px] md:max-w-none">
            {admin.displayName ?? admin.email}
          </p>
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-on-surface-variant">
            {admin.role}
          </p>
        </div>
        {/*
          Logout MUST be a POST form, not a Link. Next.js prefetches every
          <Link> on the page; if /admin/logout responded to GET, the
          prefetch would silently log the user out on render.
        */}
        <form action="/admin/logout" method="POST">
          <button
            type="submit"
            className="font-sans text-[11px] md:text-[12px] uppercase tracking-[0.18em] text-bb-on-surface-variant hover:text-bb-primary border border-bb-line px-3 md:px-4 py-2 min-h-[40px] transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
