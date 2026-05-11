"use client";

import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type RevealProps = HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  delayMs?: number;
  as?: React.ElementType;
};

export default function Reveal({ children, delayMs = 0, as: Tag = "div", className, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  // SSR-safe default: visible. Reduced-motion users + above-fold content stay visible.
  // Effect below hides + animates only when motion is allowed AND element is below the fold.
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    // Already in or near viewport — no reveal animation needed.
    if (rect.top < window.innerHeight) return;
    // Below the fold — hide and arm the observer.
    setShown(false);
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            obs.disconnect();
            return;
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={cn(className)}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 600ms cubic-bezier(.2,.6,.2,1) ${delayMs}ms, transform 600ms cubic-bezier(.2,.6,.2,1) ${delayMs}ms`,
        willChange: shown ? "auto" : "opacity, transform",
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
