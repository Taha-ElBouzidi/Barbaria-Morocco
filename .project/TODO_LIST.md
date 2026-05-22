# Future TODOs

Forward-looking items the client team can pick up after handoff. Items that
were already completed during development are not listed.

## Inquiry submission pipeline (phase 2, mostly shipped)

The full inquiry pipeline now runs end-to-end: Zod-validated POST
`/api/inquiry`, persistence into `inquiries` + `inquiry_items`, honeypot
field, in-memory rate limiter, **and Resend email** (one house notification
to `contact@barbariamorocco.com` + one auto-reply to the buyer in FR or
EN, depending on form locale). Templates live in `lib/email/templates/`
and the client wrapper in `lib/email/resend.ts`.

**Operational steps the owner team still needs to do**:

- **Verify `mail.barbariamorocco.com` in Resend.** Resend will generate
  DKIM + SPF records on first add; paste into Cloudflare DNS. Until
  verified, emails ship from `onboarding@resend.dev` which works but
  shows a Resend sender in the recipient's inbox.
- **Once verified, override `RESEND_FROM_EMAIL`** in Vercel env to
  something like `"Barbaria <inquiries@mail.barbariamorocco.com>"`.
- **Set `RESEND_API_KEY`** in Vercel (Production + Preview). Use a
  freshly-generated key, never one that has ever appeared in chat or
  documentation. Code is wired to fall open if the key is missing
  (inquiry still saves; warning logged).

**Deferred (not blocking launch)**:

- Webhook `/api/webhooks/resend` for bounces / complaints (updates the
  `inquiries` row with a `bounced` flag when delivery fails).
- Rate limit: in-memory bucket is 5/min/IP, 50/day/IP. When the client
  is ready, migrate to Upstash Redis so the limit survives cold starts.
- Optional: Cloudflare Turnstile on the form (honeypot is the v1
  protection; Turnstile adds defence-in-depth without breaking real users).

## UX fixes flagged 2026-05-22 by Taha

These came out of live testing on `barbariamorocco.com` after the
launch deployment. Not blocking, but worth fixing in the next polish
sprint.

### 1. Quantity input is stepper-only
The wizard and box-detail pages use a `[-] qty [+]` control with no
typeable field, so a buyer wanting 250 units has to click `+` 244
times from the default of 6. Replace with a number input that accepts
direct typing, with the stepper buttons as a flanking convenience.
Bound to the same `minQty` / `maxQty` validation already wired into
the Zod schema on `/api/inquiry`. Files: the qty control component
(probably `components/wizard/QuantityStepper.tsx` or similar) plus
any consumer that imports it.

### 2. No "back to menu" after adding a box
When a buyer adds a box to their inquiry, the page stays exactly
where it was, with no visible cue that the action succeeded and no
path back to discovery. **Recommendation: a toast/modal confirmation
with two CTAs**: "Continue browsing" (returns to the gift-boxes
menu) and "Review your inquiry" (jumps to the inquiry cart/checkout
state). This is the standard e-commerce add-to-cart pattern and
serves both single-box and multi-box buyers. Files: the box card or
wizard "add" action, plus likely a new shared `<InquiryAddedToast>`
or modal.

## Contact data (managed in admin dashboard)

Public-facing contact info lives in `site_settings` (single row, editable
from `/admin/settings`). Fallback values in `lib/constants.ts` exist only
for cases where the row is missing. The dashboard is the source of truth:

- Phones (split on `/` for multi-line dial-tos)
- Contact email
- WhatsApp number
- Instagram, LinkedIn, X handles (LinkedIn / X currently placeholders;
  set or hide via `site_settings` when confirmed)

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
- ~~Application steps~~ (removed from product editor UI, DB rows retained; bring back if the house decides to publish how-to-use content)
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

- **Origin** (e.g. "Marrakech, Atlas, Souss"): could be a managed list with autocomplete (datalist) so the house can either pick an existing region or add a new one.
- **Ritual label** (e.g. "Or Liquide du Maroc"): low value to convert; per-product unique copy.
- **Format**: already exists as a facet type, but products also have a text[] `formats` column. Decision needed: collapse to facet picker, or keep both.

Name + description fields stay as free text per user direction.

## Future admin improvements
- Drag-and-drop reordering for ordered lists (currently up/down buttons only , buttons are touch-friendly, drag-and-drop is desktop-only).
- Bulk publish / unpublish.
- Soft-delete with 5-second undo toast.
- Image cropping in the upload flow.
