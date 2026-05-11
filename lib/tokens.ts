// CSS custom-property names re-exported for JS consumers
// (use `var(--bb-...)` directly in CSS; use these constants in inline styles or motion configs).
export const TOKENS = {
  color: {
    bg: "var(--bb-bg)",
    bgLow: "var(--bb-bg-low)",
    primary: "var(--bb-primary)",
    primaryContainer: "var(--bb-primary-container)",
    secondary: "var(--bb-secondary)",
    line: "var(--bb-line)",
    onSurface: "var(--bb-on-surface)",
    onSurfaceVariant: "var(--bb-on-surface-variant)",
  },
  ease: {
    standard: "cubic-bezier(.2,.6,.2,1)",
  },
  reveal: {
    durationMs: 600,
    offsetPx: 16,
    staggerMs: 80,
  },
} as const;
