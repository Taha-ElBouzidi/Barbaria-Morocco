"use client";

import { useCart } from "@/lib/inquiry-context";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

export default function CartStickyBar() {
  const { totalItems } = useCart();
  const pathname = usePathname();
  const t = useTranslations("cosmetics");

  // Hide on the order page itself — it has its own full summary
  if (totalItems === 0 || pathname === "/order") return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
      <Link
        href="/order"
        className="flex items-center justify-between w-full px-5 py-4 bg-[#2C1A0E]/95 backdrop-blur-md border-t border-[#C9963A]/20 text-[#F7F2EA]"
      >
        <span className="text-xs tracking-wider uppercase text-[#F7F2EA]/70">
          {t("cart_bar", { count: totalItems })}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-[#C9963A] font-medium whitespace-nowrap">
          {t("view_cart")}<ArrowRight size={12} />
        </span>
      </Link>
    </div>
  );
}
