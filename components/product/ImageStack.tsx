"use client";
import { useState } from "react";
import Photo from "@/components/primitives/Photo";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";

interface Props { product: Product; lang: "en" | "fr"; }

export default function ImageStack({ product, lang }: Props) {
  const images = product.images.length > 0 ? product.images : [null];
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="lg:sticky lg:top-[88px] lg:self-start space-y-6">
      <Photo
        src={images[activeIdx]}
        alt={product.name[lang]}
        width={1100}
        height={1100}
        priority
        sizes="(min-width:1024px) 55vw, 100vw"
        containerClassName="aspect-square"
      />
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "block aspect-square overflow-hidden border transition-colors",
                i === activeIdx ? "border-bb-primary" : "border-bb-line hover:border-bb-on-surface-variant"
              )}
              aria-label={`Image ${i + 1}`}
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
