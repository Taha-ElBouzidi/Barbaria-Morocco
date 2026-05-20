/**
 * Inline JSON-LD script tag, hardened against `</script>` injection.
 *
 * `JSON.stringify` does not escape `<` inside string values, so any
 * admin-editable text that contains `</script><script>...</script>`
 * would break out of the JSON-LD <script> tag and execute. Replacing
 * `<` with the JSON Unicode escape `<` keeps the payload valid
 * JSON while making the closing-tag pattern impossible to forge.
 *
 * This is the standard mitigation recommended by OWASP for inline
 * JSON-in-HTML.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
