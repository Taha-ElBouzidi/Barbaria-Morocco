import { cn } from "@/lib/utils";

type Size = "xl" | "lg" | "md";

interface DisplayHeadingProps {
  children: React.ReactNode;
  size?: Size;
  as?: "h1" | "h2" | "h3";
  className?: string;
}

const SIZE_CLASS: Record<Size, string> = {
  xl: "text-[clamp(48px,6vw,96px)] leading-[1.02] tracking-[-0.02em]",
  lg: "text-[clamp(32px,4vw,72px)] leading-[1.05] tracking-[-0.015em]",
  md: "text-[clamp(28px,3vw,56px)] leading-[1.08] tracking-[-0.01em]",
};

export default function DisplayHeading({ children, size = "lg", as: Tag = "h2", className }: DisplayHeadingProps) {
  return (
    <Tag className={cn("font-serif font-normal text-bb-on-surface", SIZE_CLASS[size], className)}>{children}</Tag>
  );
}
