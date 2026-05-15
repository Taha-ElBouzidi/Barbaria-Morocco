"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Icon from "@/components/primitives/Icon";

// Order is intentional: Inquiries before Activity so the maison sees
// incoming requests first when they sign in. Gift Boxes + Products are
// the daily-touched catalogue tables; everything below is configuration.
const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/gift-boxes", label: "Gift Boxes" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/occasions", label: "Occasions" },
  { href: "/admin/ateliers", label: "Ateliers" },
  { href: "/admin/journal", label: "Journal" },
  { href: "/admin/facets", label: "Tags" },
  { href: "/admin/rituals", label: "Rituals (internal)" },
  { href: "/admin/activity", label: "Activity" },
];

interface Props {
  /** Mobile-only: controls the slide-out drawer state. Ignored at md+. */
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const navLinks = NAV.map((item) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={cn(
          "block px-6 py-3 min-h-[44px] font-sans text-[13px] tracking-[0.02em] border-l-2 transition-colors",
          isActive
            ? "text-bb-primary border-bb-secondary bg-bb-bg-low"
            : "text-bb-on-surface-variant border-transparent hover:text-bb-primary"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {item.label}
      </Link>
    );
  });

  return (
    <>
      {/* Mobile backdrop. Hidden on md+ where the sidebar is static. */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-[60] bg-bb-primary/40 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer / static aside. On md+ this lives in the document flow as a
          240px column. On mobile it becomes a fixed slide-out panel. */}
      <aside
        aria-label="Admin navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-[61] w-[min(80vw,280px)] bg-bb-bg shadow-2xl transition-transform duration-300",
          "md:static md:w-[240px] md:shrink-0 md:border-r md:border-bb-line md:bg-bb-bg md:shadow-none md:transform-none md:transition-none md:min-h-screen",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-6 py-8 border-b border-bb-line">
          <div>
            <p className="font-serif text-[22px] leading-none">Barbaria</p>
            <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-bb-secondary mt-2">Admin</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-3 min-h-[44px] min-w-[44px] text-bb-on-surface"
            aria-label="Close menu"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <nav className="py-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 96px)" }}>
          {navLinks}
        </nav>
      </aside>
    </>
  );
}
