"use client";

import { useCallback, useState } from "react";
import type { AdminUser } from "@/lib/admin/auth";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

/**
 * Admin chrome. On md+ the sidebar is a permanent 240px aside. On mobile
 * it slides in as a drawer triggered by the TopBar burger. Body scroll
 * is locked while the drawer is open.
 */
export default function AdminShell({
  admin,
  children,
}: {
  admin: AdminUser;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen bg-bb-bg-low text-bb-on-surface flex">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar admin={admin} onOpenSidebar={openSidebar} />
        <main className="flex-1 px-4 md:px-8 py-6 md:py-10 max-w-[1280px] w-full">{children}</main>
      </div>
    </div>
  );
}
