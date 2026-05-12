"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/journal", label: "Journal" },
  { href: "/admin/ateliers", label: "Ateliers" },
  { href: "/admin/rituals", label: "Rituals" },
  { href: "/admin/facets", label: "Facets" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/activity", label: "Activity" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-[240px] shrink-0 border-r border-bb-line bg-bb-bg min-h-screen">
      <div className="px-6 py-8 border-b border-bb-line">
        <p className="font-serif text-[22px] leading-none">Barbaria</p>
        <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-secondary mt-2">Admin</p>
      </div>
      <nav className="py-4">
        {NAV.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-6 py-3 font-sans text-[13px] tracking-[0.02em] border-l-2 transition-colors",
                isActive
                  ? "text-bb-primary border-bb-secondary bg-bb-bg-low"
                  : "text-bb-on-surface-variant border-transparent hover:text-bb-primary"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
