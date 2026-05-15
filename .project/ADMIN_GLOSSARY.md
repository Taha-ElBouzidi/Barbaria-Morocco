# Admin glossary

Plain-language definitions of every field the admin form asks for. Companion to `.project/ADMIN_GUIDE.md`.

## URL slug
The address segment for a box, product, or page. Example: `pack-nila-oranger` in `barbariamorocco.com/products/cosmetiques/pack-nila-oranger`. Lowercase letters, numbers, hyphens only. Auto-suggested from the English name when you start a new record. **Do not change after publish or buyer bookmarks and outbound links break.**

## Category
The catalogue universe a box or product belongs to: Cosmetics or Fine Épicerie. Determines which catalogue page it appears on.

## Tagline
A short evocative phrase shown directly under the name on the public page. One line, ten words or fewer. Example: "Glow, softness, relaxation." Optional.

## Story intro
Two or three sentences that set the scene for the buyer at the top of the box detail page. Narrative voice. Example: "A complete hammam ritual composed for spas seeking the maison's blue-hour signature."

## Minimum quantity (MOQ)
The lowest box count a buyer can place in their inquiry for this box. B2B convention: production runs only kick off above this floor. The buyer's quantity stepper enforces this on the public site.

## Display order
Lower numbers appear first in the catalogue grid. Use to feature seasonal boxes or push slower sellers down.

## Compose-your-own (wizard) box
A special box per category. Buyers who land on this box's URL get the immersive wizard instead of a pre-set box. Currently the maison has two of these: `compose-cosmetiques` and `compose-epicerie`. Curated (pre-set) boxes leave this unchecked.

## Pieces / items
The component products inside a box. A curated box has a fixed list (you pick them in the editor). A wizard box has no list , the buyer assembles their own at run time.

## Status
Where a row sits in its publish lifecycle.
- **Draft**: only visible in the admin. Public site does not show it.
- **Published**: live on the public site.

## Production time
Internal field that used to surface on the product page as "Lead time". Removed from the admin UI; the box-level MOQ + concierge follow-up handle delivery commitments now.

## Origin
Geographic source of a product (Marrakech, Taliouine, Atlas, etc.). Shown on the product detail and in the wizard zoom modal.

## Ritual label
A short label that appears as an eyebrow above the product name. Example: "Or Liquide du Maroc" (for argan oil), "Signature Barbaria" (for the maison's flagship). Optional but evocative.

## Format
Packaging size or count. Example: "200 g pot", "30 ml amber glass". Multiple values allowed, comma-separated.

## Tags (formerly "Facets")
Keyword chips on products. Used to surface product attributes (Argan, Organic, Cold-pressed, 200g pot). Each tag belongs to one of five axes: ingredient, application, format, packaging, certification. Tags drive future catalogue filters; for now they show as pills on the product detail page.

## Application steps (removed from editor)
The "how to use" ritual that used to appear on product pages. **Removed from the product editor UI** because products no longer surface individually on the public site after the box-first IA shift. Existing rows in `product_application_steps` are preserved in the DB so they can be brought back if the maison decides to publish how-to-use content later.

## Occasion
The Occasion dropdown on the public contact form. Editable from `/admin/occasions` so the maison can surface seasonal events (Mother's Day, Eid, Christmas) without a code deploy.

## Inquiry
A B2B quote request submitted from the public `/contact` form. Each inquiry is one row in `inquiries` plus one row per requested box in `inquiry_items`. Status flow: new → contacted → quoted → won/lost. The admin reads them at `/admin/inquiries`.

## Curated vs. custom (on a box-line)
A line inside an inquiry. **Curated** means the buyer added a pre-set box from the catalogue. **Custom** means they composed it via the wizard. Custom lines also carry a composition (the list of pieces they picked) plus a minimum quantity snapshot.
