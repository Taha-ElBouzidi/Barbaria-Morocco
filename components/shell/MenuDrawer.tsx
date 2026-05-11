"use client";

import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Icon from "@/components/primitives/Icon";
import { cn } from "@/lib/utils";

interface MenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

const RITUALS = ["hammam", "botanical", "heritage"] as const;
const SECONDARY = [
  { href: "/story", key: "story" },
  { href: "/ateliers", key: "ateliers" },
  { href: "/journal", key: "journal" },
  { href: "/contact", key: "contact" },
] as const;

export default function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  const t = useTranslations("nav");
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Esc to close + focus trap + body scroll lock
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          "a, button, [tabindex]:not([tabindex='-1'])"
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-bb-primary/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />
      {/* Panel */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("menu_aria")}
        className={cn(
          "fixed inset-y-0 right-0 z-[61] flex w-[clamp(320px,80vw,480px)] flex-col bg-bb-bg shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-bb-line px-8 py-6">
          <span className="font-sans text-[11px] uppercase tracking-[0.18em] text-bb-secondary">
            {t("menu_title")}
          </span>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="p-3 text-bb-on-surface"
            aria-label={t("menu_close")}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 px-8 py-10">
          {RITUALS.map((r) => (
            <Link
              key={r}
              href={`/rituals/${r}`}
              onClick={onClose}
              className="font-serif text-[clamp(36px,5vw,56px)] leading-[1.05] tracking-[-0.015em] text-bb-on-surface transition-opacity hover:opacity-70"
            >
              {t(r)}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-bb-line px-8 py-8">
          <nav className="flex flex-col gap-3">
            {SECONDARY.map(({ href, key }) => (
              <Link
                key={key}
                href={href}
                onClick={onClose}
                className="font-sans text-[14px] uppercase tracking-[0.18em] text-bb-on-surface-variant transition-colors hover:text-bb-primary"
              >
                {t(key)}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
