import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  tone?: "gold" | "green" | "muted";
}

export default function Eyebrow({ children, className, tone = "gold" }: EyebrowProps) {
  const toneClass =
    tone === "gold" ? "text-bb-secondary" : tone === "green" ? "text-bb-primary" : "text-bb-on-surface-variant";
  return (
    <span
      className={cn(
        "block font-sans font-semibold uppercase tracking-[0.18em] text-[11px] leading-none",
        toneClass,
        className
      )}
    >
      {children}
    </span>
  );
}
