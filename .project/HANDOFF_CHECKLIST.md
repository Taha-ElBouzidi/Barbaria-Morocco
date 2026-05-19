# Pre-Launch Handoff Checklist

Last updated: 2026-05-17. Maintained by the engineering lead (Taha).
Every item here is a thing that **must be true before the production URL goes
to the client**. Items are grouped by who can do them, in roughly the order
they should be completed.

---

## A. What only Taha can do (manual steps, no code can replace these)

### A.1. Domain & DNS — gate for half the items below
- [ ] Confirm the real domain with the house (`barbariamorocco.com` or other).
- [ ] Buy or transfer the domain to whichever registrar is convenient.
- [ ] In Vercel project settings, add the domain. Vercel will display the DNS
      records (A / CNAME) needed at the registrar.
- [ ] Add those records at the registrar. Wait for propagation (5 minutes to
      a few hours).
- [ ] In Vercel → Settings → Environment Variables, set in **both** Production
      and Preview environments:
      ```
      NEXT_PUBLIC_BASE_URL = https://www.barbariamorocco.com   (or your domain)
      ```
- [ ] Trigger a redeploy. Every canonical, sitemap entry, OG meta, JSON-LD
      URL, and `robots.txt` will automatically use the new domain.

### A.2. Supabase security toggles (Dashboard, no code)
- [ ] Sign in to Supabase → project `jnparcnvkghiuryarbac` → Authentication
      → Providers → Email → enable **"Password protection (HIBP check)"**. This
      makes Supabase reject passwords that appear in known breach corpora.
- [ ] Confirm the **storage region** of the project matches what we declare
      in the privacy policy (currently a `[CLIENT-FILL]` placeholder).
- [ ] Rotate the `SUPABASE_SERVICE_ROLE_KEY` if it has ever appeared in a
      shared channel (chat, email, screenshot). Vercel env var swap, no
      code change.

### A.3. Catalogue content review
- [ ] Open `/admin/products`, walk through all 39 seeded products, confirm
      names / descriptions / images / pricing tier are what the house
      wants the world to see. The seed came from the client's B2B PDF;
      no record of formal sign-off yet.
- [ ] Same for gift boxes (`/admin/gift-boxes`), ateliers
      (`/admin/ateliers`), journal entries (`/admin/journal`), occasions,
      and the site settings page.
- [ ] Decide whether any seeded products should be draft-state instead
      of published.

### A.4. Admin bootstrap
- [ ] In Vercel env, ensure `BOOTSTRAP_ADMIN_EMAIL` is set to your email
      (`ta.elbouzidi@gmail.com`).
- [ ] Sign in at `/admin/login` with that email's Supabase password. The
      first sign-in auto-creates the admin_users row.
- [ ] After bootstrap, **unset** `BOOTSTRAP_ADMIN_EMAIL` in Vercel so the
      flag isn't a recovery hatch in production.
- [ ] If the house wants additional admins, create them from
      `/admin/admins` once you have the superadmin role.

### A.5. OG image audit
- [ ] Open `/brand_photos/products-all-three.jpg`, confirm it is at least
      1200×630 px (preferred 2400×1260 for retina). If not, replace it
      with a properly-sized image. The path is referenced in
      `app/[locale]/layout.tsx` and propagates to Twitter card + LinkedIn
      thumbnails.

---

## B. What is already done in code (commits to thank, files to know about)

Listed for traceability. Nothing to do in this section unless something
broke.

- ✅ **BASE_URL is env-driven** (`b15aa06`). Single source of truth.
- ✅ **Cookie consent banner + analytics gate** (`04ad846`). GDPR/CNDP
      compliant. Vercel Analytics + Speed Insights only mount after
      analytics consent.
- ✅ **Four legal pages** (`71c5796`): `/legal/legal-notice`, `/privacy`,
      `/terms`, `/cookies`. FR + EN. Linked from footer.
- ✅ **404 page** (sahara theme + shooting stars). Same for missed admin
      routes via the root not-found.
- ✅ **Image upload pipeline** with sharp compression (WebP, 2400px max,
      EXIF strip).
- ✅ **Inquiry endpoint** stores submissions in DB. **Email delivery is
      DEFERRED** — see B.1 below.
- ✅ **Honeypot field** on inquiry form. **Turnstile not yet integrated.**
- ✅ **Admin dashboard** with products/gift-boxes/ateliers/journal/
      inquiries/admins CRUD, dashboard analytics, audit log.

### B.1. Inquiry email pipeline — code waiting on domain DNS

The decision doc is at `.project/inquiry-email-brainstorm.md`.
Recommendation: **Resend** (3000 emails/month free permanent, best DX,
pairs with the domain DNS task). Once the domain is live and Taha has the
DKIM/SPF records propagated, the implementation is a half-day code session.

---

## C. Nice-to-have, deferrable, not blocking launch

- [ ] **Per-box stories** with admin tab and per-step backgrounds (feature
      Taha sketched). 1 to 1.5 sprints; full spec needed first.
- [ ] **Turnstile** on the inquiry form (currently honeypot-only).
- [ ] **Inquiry rate-limiter to a persistent store** (currently in-memory,
      resets on cold start; fine for v1 traffic).
- [ ] **CSP nonce + strict-dynamic** to drop `'unsafe-inline'` from
      `script-src`. Documented as known in `next.config.ts`.
- [ ] **Admin drag-reorder** for product images, gift-box items, gallery.
- [ ] **Soft-delete + undo** on admin destructive actions.
- [ ] **Bulk publish** for products.
- [ ] **Resend webhook for bounce handling** (`/api/webhooks/resend`).
- [ ] **Admin recovery doc** for the case where the only superadmin loses
      access. Currently no documented recovery path other than
      `BOOTSTRAP_ADMIN_EMAIL`.

---

## D. Final pre-launch smoke test (to run after A is done)

- [ ] `/` redirects to `/fr` (or `/en` based on browser language).
- [ ] All locale switching works on every page.
- [ ] Cookie banner appears on first visit; accept-all hides it; "Manage
      cookies" in the footer reopens it; reject saves a state where
      `/_vercel/insights` is **not** loaded (check DevTools Network).
- [ ] All four legal pages render in FR and EN with real company data
      (Barbaria Morocco SARL, RC 719643, ICE, IF, TP, OMPIC 3121576).
- [ ] `/admin/login` works with your Supabase password.
- [ ] You can publish a new product end-to-end from `/admin/products/new`,
      and it appears on the public catalogue.
- [ ] You can submit a real inquiry from `/contact`, see it land in
      `/admin/inquiries`, and (once email is wired) receive the
      notification + auto-reply in your inbox.
- [ ] `/sitemap.xml` and `/robots.txt` both point to the production domain,
      not `vercel.app`.
- [ ] The 404 page (visit `/random-broken-url`) shows the sahara theme
      with shooting stars in the correct locale.
- [ ] Lighthouse score on the home page: Performance ≥ 85, Accessibility
      ≥ 95, Best Practices ≥ 90, SEO ≥ 95.

---

## E. Day-one operations

Once live:

- [ ] Add the production URL to Google Search Console; submit the sitemap.
- [ ] Set up Vercel error alerts (Settings → Notifications) to your email.
- [ ] If the inquiry pipeline is wired, set up a Resend webhook for
      bounces so the inquiry detail page can flag stale email.
- [ ] Save a copy of all signed DPAs and CNDP receipts in a single folder
      the house can access if audited.
