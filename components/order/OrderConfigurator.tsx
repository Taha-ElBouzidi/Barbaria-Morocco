"use client";

import { useTranslations } from "next-intl";
import { GammeAccordion, TextileAccordion } from "./GammeAccordion";
import OrderSummary from "./OrderSummary";
import ShareActions from "./ShareActions";
import { GAMMES, TEXTILE_PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/inquiry-context";

export default function OrderConfigurator() {
  const t = useTranslations("order");
  const { cart: order, toggle, setQty, remove, clear } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12 items-start">
        {/* Left: product selection */}
        <div className="lg:col-span-2 space-y-3">
          {/* Cosmetics section */}
          <div className="mb-2">
            <p className="text-xs tracking-[0.4em] uppercase text-[#E299A1] font-medium mb-4">
              {t("section_cosmetics")}
            </p>
            <div className="space-y-2">
              {GAMMES.map((gamme) => (
                <GammeAccordion
                  key={gamme.key}
                  gamme={gamme}
                  order={order}
                  onToggle={toggle}
                  onQuantityChange={setQty}
                />
              ))}
            </div>
          </div>

          {/* Textile section */}
          <div className="mb-2">
            <p className="text-xs tracking-[0.4em] uppercase text-[#A0856A] font-medium mb-4">
              {t("section_textile")}
            </p>
            <TextileAccordion
              products={TEXTILE_PRODUCTS}
              order={order}
              onToggle={toggle}
              onQuantityChange={setQty}
            />
          </div>

          {/* Food - placeholder */}
          <div className="border border-[#DDD0BC]/40 rounded-sm px-5 py-4 bg-[#F7F2EA]/50">
            <p className="text-xs tracking-[0.4em] uppercase text-[#C9963A] font-medium mb-1">
              {t("section_food")}
            </p>
            <p className="text-xs text-[#9B8B7A] italic">{t("food_coming_soon")}</p>
          </div>
        </div>

        {/* Right: sticky summary */}
        <div className="lg:sticky lg:top-28">
          <OrderSummary
            order={order}
            gammes={GAMMES}
            textileProducts={TEXTILE_PRODUCTS}
            onRemove={remove}
            onClear={clear}
          >
            <ShareActions
              order={order}
              gammes={GAMMES}
              textileProducts={TEXTILE_PRODUCTS}
              disabled={order.size === 0}
            />
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}
