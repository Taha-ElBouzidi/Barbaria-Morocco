import Image from "next/image";
import { useId } from "react";
import { cn } from "@/lib/utils";

interface PhotoProps {
  src: string | null;
  alt: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  containerClassName?: string;
  needsShot?: boolean;
}

/**
 * Resolve an image path stored in the DB to a renderable URL.
 *
 * Stored paths come from two sources, just like the admin uploader's
 * helper in lib/admin/products.ts:
 * - Sprint 1.5 seed rows hold `/brand_photos/...` — absolute paths to
 *   files shipped in /public. Use as-is.
 * - The admin uploader writes Supabase Storage object paths (no
 *   leading slash). Prefix with the public-bucket URL.
 *
 * Without this transform, next/image would resolve relative paths
 * against the page origin and 404 every uploaded hero image.
 */
function resolveImageSrc(path: string): string {
  if (path.startsWith("/") || path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return path; // dev-fallback; in prod the env is set
  return `${base}/storage/v1/object/public/product-images/${path}`;
}

export default function Photo({
  src,
  alt,
  priority,
  fill,
  width,
  height,
  sizes,
  className,
  containerClassName,
  needsShot,
}: PhotoProps) {
  const noiseId = useId();
  if (!src || needsShot) {
    return (
      <div
        aria-label={alt}
        role="img"
        data-needs-shot={needsShot || undefined}
        className={cn(
          "relative overflow-hidden",
          "bg-[linear-gradient(180deg,#2a4632,#1b3022)]",
          containerClassName
        )}
      >
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-[0.06] mix-blend-overlay"
          viewBox="0 0 24 24"
          preserveAspectRatio="xMidYMid slice"
        >
          <filter id={noiseId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
          </filter>
          <rect width="24" height="24" filter={`url(#${noiseId})`} />
        </svg>
      </div>
    );
  }

  const resolved = resolveImageSrc(src);

  if (fill) {
    return (
      <div className={cn("relative overflow-hidden", containerClassName)}>
        <Image
          src={resolved}
          alt={alt}
          fill
          sizes={sizes ?? "100vw"}
          priority={priority}
          quality={88}
          className={cn("object-cover", className)}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      <Image
        src={resolved}
        alt={alt}
        width={width ?? 1200}
        height={height ?? 1500}
        sizes={sizes ?? "(min-width: 1024px) 50vw, 100vw"}
        priority={priority}
        quality={88}
        className={cn("h-auto w-full", className)}
      />
    </div>
  );
}
