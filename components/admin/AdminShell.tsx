"use client";

import type { AdminUser } from "@/lib/admin/auth";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AdminShell({
  admin,
  children,
}: {
  admin: AdminUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bb-bg-low text-bb-on-surface flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar admin={admin} />
        <main className="flex-1 px-8 py-10 max-w-[1280px] w-full">{children}</main>
      </div>
    </div>
  );
}
