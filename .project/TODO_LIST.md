# Future TODOs

Things flagged by Taha that are not in scope for the current sprint but need to be remembered.

## Inquiry submission pipeline (phase 2)
Currently the contact form sends a `mailto:` link. Phase 2 should land server-side persistence + transactional email.

- POST `/api/inquiry` endpoint with Zod validation
- Persist to `inquiries` + `inquiry_items` (schema already shipped in migration 0008)
- Transactional email via Resend (or equivalent): one to `concierge@barbariamorocco.com`, one auto-reply to the buyer
- Verify barbariamorocco.com domain in Resend with DKIM + SPF + DMARC
- Webhook for bounces / complaints, updates the inquiry record
- Anti-spam: Cloudflare Turnstile + honeypot already in place
- Rate limit: 5 inquiries / minute / IP, 50 / day / IP

## Real contact data
The site currently uses placeholder values. Replace with the actual maison data when confirmed:

- WhatsApp number (`lib/constants.ts` -> `WHATSAPP_NUMBER`)
- Phone number for the contact page sidebar
- Email address (`CONTACT_EMAIL` in `lib/constants.ts`)
- Instagram handle (`INSTAGRAM_HANDLE` in `lib/constants.ts`)
- Add LinkedIn URL when available
- Add X / Twitter URL when available
- Decide whether to add Facebook / Pinterest

## Social media visibility
Once the real social handles are in, surface them prominently. Two candidates:

1. **Footer** column: a "Follow us" stack of social icons (Instagram, LinkedIn, X). E-commerce sites with editorial brand voice (Aesop, Diptyque, Maison Margiela) typically use this pattern. Keeps the home page free of clutter.
2. **Home page**, at the bottom of the editorial section before the heritage 3-up: a single line of icons + "Suivez-nous" eyebrow.

Recommended: do both. Footer for steady visibility on every page, home page for emphasis.

## Catalogue terminology cleanup
The Products list filter is still using the legacy ritual taxonomy (Hammam, Botanical, Heritage). After Sprint 2.0 the public IA moved to category-based (Cosmetics, Fine Épicerie), so the admin filter should follow.

- Replace ritual filter with a category filter on `app/admin/products/_components/ProductsList.tsx`
- Keep the underlying `ritual_id` column for now (it powers ritual-based card classification on PDP)
- Eventually deprecate the `rituals` admin section once nothing depends on it

## Field cleanup on Product editor
The user flagged that several product fields no longer make sense now that products are not sold individually:

- ~~MOQ on products~~ (removed, DB column retained)
- ~~Lead time on products~~ (removed from product editor + wizard modal, DB column retained)
- ~~Hero flag~~ (removed, DB column retained)
- ~~Application steps~~ (removed from product editor UI, DB rows retained; bring back if the maison decides to publish how-to-use content)
- ~~Slug input~~ (hidden, auto-generated from EN name)
- Origin: keep
- Ritual label: keep (powers the eyebrow on PDP and wizard zoom modal)
- Format: keep

## Inline help / glossary
Several admin field names are jargon for a non-developer. The current sprint adds inline help text on:

- Slug (auto-generated; lowercase ID for the URL)
- Tagline (one-line evocative phrase shown under the name)
- Customizable wizard box (the box-builder entry point, not a curated box)
- Application steps (the "how to use" ritual; ordered list)
- Facets (currently labelled "Tags" or similar; eventually fold into the product editor with no top-level admin page)

Long-term: consider an in-context glossary modal accessible from a "?" icon next to each field label.

## Convert free-text fields to multi-select where practical
Admin feedback: typing custom values is hard and error-prone. Candidates to convert to picker / multi-select inputs:

- **Origin** (e.g. "Marrakech, Atlas, Souss"): could be a managed list with autocomplete (datalist) so the maison can either pick an existing region or add a new one.
- **Ritual label** (e.g. "Or Liquide du Maroc"): low value to convert; per-product unique copy.
- **Format**: already exists as a facet type, but products also have a text[] `formats` column. Decision needed: collapse to facet picker, or keep both.

Name + description fields stay as free text per user direction.

## Future admin improvements
- Drag-and-drop reordering for ordered lists (currently up/down buttons only , buttons are touch-friendly, drag-and-drop is desktop-only).
- Bulk publish / unpublish.
- Soft-delete with 5-second undo toast.
- Image cropping in the upload flow.
