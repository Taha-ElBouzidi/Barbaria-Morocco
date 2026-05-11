"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Check, ChevronDown } from "lucide-react";
import Image from "next/image";
import type { ProductDef } from "@/lib/products";
import { useCart } from "@/lib/inquiry-context";
import ProductPlaceholder from "@/components/shared/ProductPlaceholder";

export default function CompactProductCard({ product }: { product: ProductDef }) {
  const t = useTranslations(`cosmetics.products.${product.key}`);
  const { cart, toggle } = useCart();
  const inCart = cart.has(product.key);
  const [animating, setAnimating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  function handleToggle() {
    setAnimating(true);
    toggle(product.key);
    setTimeout(() => setAnimating(false), 300);
  }

  return (
    <article className="group flex flex-col glass rounded-sm card-hover overflow-hidden">
      {/* Photo area */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#EAD9C0]/40 flex-shrink-0">
        {product.photo ? (
          <Image
            src={product.photo}
            alt={t("name")}
            fill
            loading="lazy"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <ProductPlaceholder name={t("name")} />
        )}
        {/* Tag badge */}
        {product.tag && (
          <div className="absolute top-3 left-3">
            <span className="text-[9px] tracking-[0.15em] uppercase font-medium px-2 py-1 bg-[#2C1A0E]/70 text-[#E299A1] backdrop-blur-sm rounded-full">
              {product.tag}
            </span>
          </div>
        )}
        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1A0E]/20 to-transparent pointer-events-none" />

        {/* Add to cart button — bottom-right of photo */}
        <button
          onClick={handleToggle}
          aria-label={inCart ? t("added") : t("add_to_cart")}
          className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
            animating ? "scale-125" : "scale-100"
          } ${
            inCart
              ? "bg-[#C9963A] border border-[#E8C97A]/50 text-white shadow-[0_0_12px_rgba(201,150,58,0.5)]"
              : "bg-[#E299A1]/90 border border-[#F0C4CA]/50 text-white hover:bg-[#E299A1] hover:scale-110"
          }`}
        >
          {inCart ? <Check size={15} strokeWidth={2.5} /> : <Plus size={15} strokeWidth={2.5} />}
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-4">
        <p className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-[#E299A1] mb-1">{t("tagline")}</p>
        <h3 className="font-playfair text-sm sm:text-base font-bold text-[#2C1A0E] mb-1.5 sm:mb-2 leading-snug">{t("name")}</h3>
        <p className={`text-[11px] sm:text-xs text-[#2C1A0E]/65 leading-relaxed mb-1 flex-1 ${expanded ? "" : "line-clamp-2"}`}>
          {t("description")}
        </p>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[9px] tracking-wider uppercase text-[#E299A1] hover:text-[#C9963A] transition-colors mb-3 self-start"
        >
          {expanded ? "Réduire" : "Lire plus"}
          <ChevronDown size={10} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </button>

        {/* INCI key ingredient pill */}
        {product.inci[0] && (
          <div>
            <span className="inline-block text-[9px] tracking-wider text-[#9B8B7A] bg-[#EAD9C0]/60 px-2 py-1 rounded-full font-mono truncate max-w-full">
              {expanded
                ? product.inci.join(" · ")
                : `${product.inci[0].split(" ")[0]} ${product.inci[0].split(" ")[1] ?? ""}`}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
