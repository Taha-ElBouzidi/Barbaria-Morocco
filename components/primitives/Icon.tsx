import { cn } from "@/lib/utils";

const PATHS: Record<string, string> = {
  "arrow-right": "M5 12h14M13 5l7 7-7 7",
  "arrow-up-right": "M7 17L17 7M7 7h10v10",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M6 18L18 6",
  globe: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 0c-3 3-4 6-4 10s1 7 4 10m0-20c3 3 4 6 4 10s-1 7-4 10M2 12h20",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zm0 0l6 6",
  instagram: "M3 8a5 5 0 015-5h8a5 5 0 015 5v8a5 5 0 01-5 5H8a5 5 0 01-5-5V8zm9 8a4 4 0 100-8 4 4 0 000 8zm5-9a1 1 0 100 2 1 1 0 000-2z",
  whatsapp: "M20 4a10 10 0 00-15 13l-1 4 4-1A10 10 0 0020 4zm-3 11c-2 2-7-3-5-5l1-1 2 1-1 2c1 1 2 2 3 2l1-1 2 1-3 1z",
  mail: "M3 7l9 6 9-6M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7a2 2 0 012-2h14a2 2 0 012 2",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  check: "M5 12l5 5 9-11",
  location: "M12 2a8 8 0 00-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 00-8-8zm0 11a3 3 0 100-6 3 3 0 000 6z",
  hammam: "M4 16c4-1 6 1 8 1s4-2 8-1M4 12c4-1 6 1 8 1s4-2 8-1M8 3v6M12 3v6M16 3v6",
  leaf: "M5 19c8-2 13-7 14-15-8 1-13 6-14 14m0 0l4-4",
  diamond: "M6 9l6-6 6 6-6 12-6-12zm0 0h12",
  concierge: "M4 18h16M6 18a6 6 0 0112 0M12 6V3",
  x: "M6 6l12 12M6 18L18 6", // alias of close
  phone: "M5 4l3 3-2 2a10 10 0 005 5l2-2 3 3a2 2 0 01-2 2 12 12 0 01-11-11 2 2 0 012-2z",
  calendar: "M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1zM4 10h16M8 3v4M16 3v4",
};

interface IconProps {
  name: keyof typeof PATHS;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export default function Icon({ name, size = 24, className, strokeWidth = 1.6 }: IconProps) {
  const d = PATHS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <path d={d} />
    </svg>
  );
}
