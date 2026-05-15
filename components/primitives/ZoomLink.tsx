"use client";

import { Link, useRouter } from "@/i18n/navigation";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link>;

/**
 * ZoomLink — drop-in replacement for `<Link>` that wraps the navigation
 * inside `document.startViewTransition`. Combined with a shared
 * `view-transition-name` on both the source thumbnail and the destination
 * hero image, the browser shared-element animation makes the source card
 * appear to zoom into the destination hero.
 *
 * Falls back to a plain Link in browsers without View Transitions support
 * (Firefox stable, older Safari) — they get the standard instant navigation,
 * no animation, no breakage.
 *
 * Used by the gift-box detail page items list and (later) the wizard
 * product picker.
 */
export default function ZoomLink({ href, onClick, children, ...rest }: Props) {
  const router = useRouter();

  return (
    <Link
      {...rest}
      href={href}
      onClick={(e) => {
        // Let modifier-click / middle-click open new tab unchanged.
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
          onClick?.(e);
          return;
        }
        if (
          typeof document !== "undefined" &&
          typeof document.startViewTransition === "function"
        ) {
          e.preventDefault();
          document.startViewTransition(() => {
            router.push(href as Parameters<typeof router.push>[0]);
          });
        }
        onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
}
