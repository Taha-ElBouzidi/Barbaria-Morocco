/**
 * Renders a value from `CLIENT_DATA`. Auto-detects whether the value
 * is still a placeholder (CLIENT-FILL / À COMPLÉTER) and applies the
 * dashed gold underline; once the client has supplied the real text,
 * the component renders the value as plain inline text.
 *
 * Usage:
 *   <L>{CLIENT_DATA.legalName.fr}</L>
 *   <L>{CLIENT_DATA.iceNumber.en}</L>
 */
export function L({ children }: { children: string }) {
  const isPlaceholder = /^\[(CLIENT-FILL|À COMPLÉTER)/.test(children);
  if (isPlaceholder) {
    return <span className="legal-placeholder">{children}</span>;
  }
  return <>{children}</>;
}
