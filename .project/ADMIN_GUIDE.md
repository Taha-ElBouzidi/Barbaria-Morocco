# Barbaria Admin Guide

How to use the Barbaria admin dashboard at `https://<your-domain>/admin`. Covers desktop and mobile. Last updated alongside the Sprint 2.4 mobile redesign.

## Table of contents
- [Signing in and out](#signing-in-and-out)
- [Layout and navigation](#layout-and-navigation)
- [Mobile vs. desktop](#mobile-vs-desktop)
- [Dashboard](#dashboard)
- [Gift boxes](#gift-boxes)
- [Products](#products)
- [Facets](#facets)
- [Occasions](#occasions)
- [Ateliers](#ateliers)
- [Journal](#journal)
- [Rituals (internal)](#rituals-internal)
- [Inquiries](#inquiries)
- [Activity log](#activity-log)
- [Publishing rules](#publishing-rules)
- [Troubleshooting](#troubleshooting)
- [Glossary](#glossary)

## Signing in and out
- Go to `/admin/login`. Email + password.
- Sessions persist across browser restarts (cookie-based). Sign out from the top right of any admin page.
- Sign-out submits a POST form. Do not bookmark `/admin/logout` directly: that route only accepts POST and will not log you out on a GET visit.

## Layout and navigation
- The left sidebar lists every section. The current section is highlighted.
- The top bar shows your name, role, and a Sign out button.
- The main column shows the active page.

## Mobile vs. desktop
- **Desktop (>= 768px wide)**: the sidebar is always visible on the left.
- **Mobile (< 768px wide)**: the sidebar is hidden by default. Tap the burger icon in the top-left of the top bar to slide it in. Tap outside the panel, the close button, or press Escape to close it.
- Lists (products, gift boxes, occasions) render as stacked cards on mobile and as data tables on desktop. The same data is visible in both views, just laid out for the screen size.
- All buttons and inputs respect a 44 px minimum touch target.

## Dashboard
Route: `/admin`.

- Four stat tiles at the top: published products, drafts, ateliers, published journal entries. Click any tile to jump to that section, filtered if applicable.
- Three quick-create buttons: new product, new journal entry, new atelier.
- Recent activity feed at the bottom: last 30 admin actions across the catalogue.

## Gift boxes
Route: `/admin/gift-boxes`.

What this controls: every box surfaced on the public site, both curated boxes and the "compose your own" wizard entry.

### List
- Filter by category (Cosmetics / Fine Épicerie / All) and status (Published / Draft).
- Search by name or slug.
- Each card / row links to the editor.

### Create
- Click **+ New gift box** (top right of the list page).
- Required: slug (lowercase, hyphens), category, EN name, FR name.
- Sort order controls the position in the curated grid.
- **Customizable** checkbox: turn this on for the one box per category that drives the wizard ("compose your own"). The Items section is hidden for customizable boxes; the wizard builds the composition at run time.
- New boxes are created as **draft**. Publish from the edit page once translations and items are in place.

### Edit
- Identity: slug, category, hero image path, minimum quantity, sort order, customizable toggle.
- Translations: EN + FR name, tagline, story intro.
- Items (curated boxes only): pick products from the chosen category, reorder with the up/down arrows, remove with the X. Saving wipes and rewrites the box's item list.
- Action footer (sticky at the bottom): Save, Publish/Unpublish, Delete.
- The public site revalidates within 60 seconds of any save. Pages do not need a manual refresh.

## Products
Route: `/admin/products`.

What this controls: every product piece. Products live as components of gift boxes; the public site does not sell products individually.

### List
- Filter by ritual (Hammam, Botanical, Heritage) and status.
- Search by name or slug.
- Mobile cards show thumbnail, name, slug, status, ritual, MOQ.

### Create / Edit
- Identity: slug, category, ritual, sub-category, MOQ, formats, lead time (production time), origin, ritual label, hero flag.
- Translations: EN + FR name, short, lede.
- Images: upload to Supabase Storage. First image is the hero. Reorder with up/down arrows.
- Application steps: ordered list of method-of-use rituals (EN + FR title and body each).
- Facets: pick from ingredient, application, format, packaging, certification axes. New facet values are managed under Facets.

## Facets
Route: `/admin/facets`.

What this controls: the facet vocabulary used on product cards and (eventually) catalogue filters. Five axes: ingredient, application, format, packaging, certification.

- Click an axis to manage its values. Each value carries EN + FR labels and a sort order.
- Adding a new facet value makes it selectable on every product editor.

## Occasions
Route: `/admin/occasions`. *New in Sprint 2.7.*

What this controls: the Occasion dropdown on the public contact form (Step 02 of the inquiry form).

- 12 default occasions are seeded: Year-end, Onboarding, Anniversary, Press, Wedding, Mother's Day, Valentine's, Christmas, Eid, Ramadan, Hanukkah, Other.
- Sort order groups them visually in the dropdown (lower numbers first).
- Unpublishing hides an occasion from the public dropdown but keeps the record (for historical inquiries that referenced it).
- Slug is the stable identifier. Translations are EN + FR name only.

## Ateliers
Route: `/admin/ateliers`.

What this controls: the six (or more) artisanal cooperatives shown on `/ateliers`.

- Identity: slug, region, since-year, image.
- Translations: EN + FR name and description.

## Journal
Route: `/admin/journal`.

What this controls: editorial cards shown on `/journal`.

- Feature flag promotes one card to the large feature slot at the top.
- Identity: slug, date, image, feature flag.
- Translations: EN + FR kicker, headline.
- Article pages themselves are deferred to a later sprint.

## Rituals (internal)
Route: `/admin/rituals`.

The rituals taxonomy (Hammam, Botanical, Heritage) is internal product tagging only. Not surfaced in the public information architecture since Sprint 2.0. Edit copy here only if you are sure of the impact on filtering.

## Inquiries
Route: `/admin/inquiries`.

What this controls: incoming B2B quote requests. Phase 1 of the site sends emails via mailto so requests do not yet land in this list automatically. Once the `/api/inquiry` endpoint ships, every form submission will appear here with the buyer's company info, occasion, and the list of boxes (curated + custom) plus quantities.

Per-inquiry view (when wired): mark status (New, Contacted, Quoted, Won, Lost) and leave internal notes.

## Activity log
Route: `/admin/activity`.

Filterable list of every admin action (create, update, delete, publish). Filter by entity type (product, gift box, occasion, atelier, etc.) and action.

## Publishing rules
- New rows are always **draft** by default (except occasions, which seed as published).
- Public pages query Supabase with `status = 'published'`. Draft rows are invisible to anonymous visitors.
- The public site revalidates affected paths within 60 seconds of any save action (gift boxes, products, occasions).
- RLS enforces the rules at the database level. Even if a draft row leaked to the wire, anonymous queries would not return it.

## Troubleshooting

| Symptom | Likely cause | Fix |
|--------|--------------|-----|
| Public site does not show my edit | 60-second revalidate window | Wait 60 seconds, hard refresh (Ctrl+Shift+R) |
| "Permission denied for function is_admin" | Anonymous role missing EXECUTE grant | Re-run migration 0007 |
| Cannot create a record, "duplicate key" | Slug already taken | Pick a different slug |
| Sidebar covers the page on mobile | Drawer stuck open | Tap outside the panel or press Escape |
| Image upload fails | File exceeds 8 MB or wrong MIME type | Resize / re-encode as JPG, PNG, or WebP |
| Sign-out signs me out by surprise | Should never happen with current code | Check for `<Link>` to `/admin/logout`; logout must be POST only |

## Glossary
Plain-language definition of every admin field, kept separately at `.project/ADMIN_GLOSSARY.md`. Worth pinning open next to the editor pages.

## Files of note
- Schema migrations: `db/migrations/*.sql`. Migrations 0006 (categories + gift boxes), 0008 (box-level inquiry), and 0009 (occasions) are the recent additions.
- Admin auth helper: `lib/admin/auth.ts`.
- Per-entity admin helpers: `lib/admin/{gift-boxes,products,occasions,ateliers,journal,inquiries}.ts`.
- Server actions: `app/admin/<entity>/[id]/actions.ts`.
- Shared admin shell: `components/admin/{AdminShell,Sidebar,TopBar}.tsx`.
