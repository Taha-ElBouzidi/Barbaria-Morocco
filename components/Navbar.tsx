"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useInquiry } from "@/lib/inquiry-context";

const WHATSAPP_NUMBER = "212659658863";
const INSTAGRAM_HANDLE = "barbaria_00";

export default function Navbar({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const categories = [
    { href: "/cosmetics", label: t("cosmetics"), dot: "#E299A1" },
    { href: "/textile",   label: t("textile"),   dot: "#A0856A" },
    { href: "/food",      label: t("food"),       dot: "#C9963A" },
  ];

  const { totalItems } = useInquiry();
  const otherLocale = locale === "fr" ? "en" : "fr";
  const isHeroPage = pathname === "/";
  const isDark = !scrolled && isHeroPage && !menuOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || menuOpen ? "glass shadow-sm" : isHeroPage ? "bg-transparent" : "glass"
      }`}
    >
      <nav className="relative max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo — left */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <Image
            src="/brand_photos/barbaria-logo-new.jpg"
            alt="Barbaria Morocco"
            width={36}
            height={36}
            className="rounded-full"
          />
          <div className="flex flex-col leading-none">
            <span
              className={`font-playfair text-lg font-bold tracking-widest uppercase transition-colors duration-300 ${
                isDark ? "text-[#F7F2EA]" : "text-[#2C1A0E]"
              }`}
            >
              Barbaria
            </span>
            <span className="text-[10px] tracking-[0.3em] text-[#C9963A] uppercase font-medium">
              Morocco
            </span>
          </div>
        </Link>

        {/* Category links — absolutely centered */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
          {categories.map(({ href, label, dot }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 text-sm tracking-wider uppercase transition-all duration-300 ${
                  isActive
                    ? isDark
                      ? "text-[#F7F2EA] font-medium"
                      : "text-[#2C1A0E] font-medium"
                    : isDark
                    ? "text-[#F7F2EA]/60 hover:text-[#F7F2EA]"
                    : "text-[#2C1A0E]/55 hover:text-[#2C1A0E]"
                }`}
              >
                <span
                  className="rounded-full flex-shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: dot,
                    width: isActive ? "7px" : "5px",
                    height: isActive ? "7px" : "5px",
                    opacity: isActive ? 1 : 0.7,
                  }}
                />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right — contact + locale + mobile toggle */}
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Link
              href="/order"
              className="btn-glass-gold btn-ripple px-4 py-1.5 text-xs tracking-widest uppercase rounded-full"
            >
              {t("order")}
            </Link>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#E299A1] text-white text-[9px] font-bold flex items-center justify-center pointer-events-none">
                {totalItems > 99 ? "99" : totalItems}
              </span>
            )}
          </div>
          <Link
            href="/contact"
            className={`hidden md:block text-xs tracking-widest uppercase transition-colors duration-300 hover:text-[#C9963A] ${
              pathname === "/contact"
                ? "text-[#C9963A]"
                : isDark
                ? "text-[#F7F2EA]/50"
                : "text-[#2C1A0E]/45"
            }`}
          >
            {t("contact")}
          </Link>
          <a
            href={`/${otherLocale}${pathname}`}
            className={`text-xs tracking-widest uppercase px-3 py-1.5 rounded-full glass border-none hover:shadow-md transition-all duration-300 ${
              isDark
                ? "text-[#F7F2EA]/70 hover:text-[#C9963A]"
                : "text-[#2C1A0E]/70 hover:text-[#C9963A]"
            }`}
          >
            {otherLocale.toUpperCase()}
          </a>
          <button
            className={`md:hidden p-1 transition-transform duration-200 hover:scale-110 ${
              isDark ? "text-[#F7F2EA]" : "text-[#2C1A0E]"
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-white/30 px-6 py-6">
          <ul className="flex flex-col gap-4">
            {categories.map(({ href, label, dot }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 text-sm tracking-wider uppercase text-[#2C1A0E] hover:text-[#C9963A] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: dot }}
                  />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-[#2C1A0E]/10 flex items-center gap-4">
            <Link
              href="/order"
              className="text-xs tracking-widest uppercase text-[#C9963A] font-medium hover:text-[#C9963A]/80 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {t("order")}
            </Link>
            <span className="text-[#2C1A0E]/20">·</span>
            <Link
              href="/contact"
              className="text-xs tracking-widest uppercase text-[#2C1A0E]/55 hover:text-[#C9963A] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {t("contact")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export { WHATSAPP_NUMBER, INSTAGRAM_HANDLE };
