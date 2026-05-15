"use client";
import { useState } from "react";
import Photo from "@/components/primitives/Photo";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "@/lib/data/types";

interface Props { product: ProductDetail; lang: "en" | "fr"; }

export default function ImageStack({ product, lang: _lang }: Props) {
  const imagePaths = product.images.length > 0
    ? product.images.map((img) => img.path)
    : [null];
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="lg:sticky lg:top-[88px] lg:self-start space-y-6">
      {/* viewTransitionName matches the source thumbnail on gift-box detail
          pages so the browser zooms the card into the hero on navigation. */}
      <div
        className="aspect-square"
        style={{ viewTransitionName: `product-${product.slug}` }}
      >
        <Photo
          src={imagePaths[activeIdx] ?? null}
          alt={product.name}
          width={1100}
          height={1100}
          priority
          sizes="(min-width:1024px) 55vw, 100vw"
          containerClassName="aspect-square"
        />
      </div>
      {imagePaths.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {imagePaths.map((src, i) => (
            <button
              key={`${src}-${i}`}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "block aspect-square overflow-hidden border transition-colors",
                i === activeIdx ? "border-bb-primary" : "border-bb-line hover:border-bb-on-surface-variant"
              )}
              aria-label={`${product.name}, image ${i + 1} of ${imagePaths.length}`}
              aria-pressed={i === activeIdx}
            >
              <Photo
                src={src}
                alt=""
                width={200}
                height={200}
                sizes="20vw"
                containerClassName="h-full w-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
