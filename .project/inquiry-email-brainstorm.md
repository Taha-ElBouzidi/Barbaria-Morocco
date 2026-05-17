# Inquiry Email Pipeline, Brainstorm

**Date:** 2026-05-17
**Status:** Decision pending. No code yet.
**Owner:** Taha
**Scope:** Wire up email delivery so the concierge is notified when a B2B
inquiry arrives, and the buyer receives an auto-reply confirming receipt.

## Current state

`app/api/inquiry/route.ts` line 62: `// Email/Resend integration is deferred.`
Inquiries land in the `inquiries` table (Supabase) and surface in
`/admin/inquiries`. No one is notified outside the admin UI. If the
concierge does not log in for two days, two days of leads sit untouched.

## What we need

1. **Concierge notification:** a transactional email to the house when an
   inquiry submits. Subject line includes company + occasion so it is
   triagable in Gmail. Body contains the full inquiry payload + a link
   to `/admin/inquiries/[id]`.
2. **Buyer auto-reply:** a confirmation email back to the buyer's address,
   in their preferred locale (FR/EN), thanking them and stating the
   24-hour SLA.
3. **Bounce handling:** if either email bounces, we log it on the
   inquiry record so the admin sees it.
4. **No SPF/DKIM misalignment:** emails must arrive in Inbox, not Spam.
   Requires DNS records on the production domain.
5. **Free or near-free** at our volume (estimated 5–50 inquiries/month
   based on luxury B2B benchmarks).

## Option survey

Pricing and limits checked 2026-05-17 from primary provider docs and
recent comparison articles.

| Provider     | Free tier                  | Domain DNS | API DX        | Permanent? |
|--------------|-----------------------------|------------|----------------|------------|
| **Resend**   | 3,000 emails/month          | required   | excellent      | yes        |
| **Brevo**    | 300/day (~9,000/month)      | required   | good           | yes        |
| **Mailgun**  | testing only, then paid     | required   | good           | no         |
| **SendGrid** | 100/day for 60 days only    | required   | good           | no         |
| **Postmark** | 100/month total             | required   | excellent      | yes (tiny) |
| **Formspree**| 50 submissions/month        | none       | trivial        | yes        |
| **EmailJS**  | 200/month                   | none       | client-side    | yes        |
| **AWS SES**  | 200/day (in EC2) or paid    | required   | clunky         | yes        |

## Decision

**Recommended: Resend.**

Why:

1. **Free tier is permanent and generous.** 3,000/month is 60× our
   expected volume. No surprise downgrade after 60 days like SendGrid.
2. **Best developer experience for Next.js.** Native React, simple
   API key, examples that match our Server Action + API Route patterns.
3. **Pairs naturally with the domain DNS task we already have to do.**
   When the real `barbariamorocco.com` (or whichever) goes live, the
   DKIM/SPF records are part of the same DNS work, not a separate trip.
4. **Excellent deliverability.** Postmark's reputation is similar, but
   Postmark's free tier (100/month total) does not survive a single busy
   month for us.
5. **React Email** templates render JSX to HTML, so the FR/EN
   notification + auto-reply templates can live in `emails/` and reuse
   our design tokens.

**Runner-up: Brevo.** Pick this instead only if the house decides to
also send marketing newsletters from the same provider. 300/day free
permanent. Otherwise Resend wins on DX.

**Reject Formspree.** Already in our CSP for the contact form fallback,
but as the primary notification channel it has too many constraints:
50/month is tight, no auto-reply, no bounce webhook, and we lose
control over templating.

## Implementation plan (when domain DNS is ready)

### Phase A: Provision (Taha, 15 min)
1. Sign up at https://resend.com.
2. Add the production domain. Resend gives DNS records (SPF, DKIM, DMARC).
3. Add those records at the registrar. Wait for verification.
4. Create an API key (Production scope).
5. Set `RESEND_API_KEY` in Vercel (Production + Preview).
6. Set `RESEND_FROM=concierge@barbariamorocco.com` (Vercel).
7. Set `RESEND_TO_CONCIERGE=concierge@barbariamorocco.com` (Vercel).

### Phase B: Code (Claude, 1–2 hours)
1. `npm i resend` (and optionally `npm i @react-email/components` for templates).
2. `lib/email/client.ts`: lazy-init Resend client from env var. Throw at
   call time, not import time, so the build does not fail when the key
   is unset in dev.
3. `lib/email/templates/inquiry-notification.{tsx,fr.tsx,en.tsx}`:
   - To: concierge
   - Subject: `[Demande] <company> · <occasion>`
   - Body: company, contact, email, phone, quantity, event date,
     occasion, message, link to admin inquiry detail page.
4. `lib/email/templates/inquiry-auto-reply.{fr,en}.tsx`:
   - To: buyer
   - Subject: FR `Votre demande Barbaria Morocco` / EN `Your Barbaria Morocco request`
   - Body: confirmation, 24-hour SLA, contact links, signature.
5. Edit `app/api/inquiry/route.ts`:
   - After the existing insert, call `resend.emails.send` twice
     (concierge + buyer). Wrap in `try/catch`; failures get logged via
     `console.error` and written to a new `email_status` column on
     `inquiries`. The submission still succeeds: email is a notification
     channel, not the source of truth.
6. (Optional, later) Resend webhook for bounces: `app/api/webhooks/resend/route.ts`
   verifies the signature and updates `email_status` on the matching inquiry.

### Phase C: Verify (Taha, 5 min)
1. Submit a real inquiry from `/contact` with the buyer email = a
   personal Gmail you control.
2. Confirm: concierge gets the notification, buyer gets the auto-reply,
   both arrive in Inbox (not Spam).
3. Submit again with a known-bad email (`bounce@simulator.amazonses.com`
   does not work for Resend; use a typo like `nobody@invalid.example`).
   Confirm the failure shows on the inquiry row in admin.

## Failure modes and mitigation

| Failure                          | Mitigation                                                                 |
|----------------------------------|---------------------------------------------------------------------------|
| Resend API down                  | DB insert still succeeds; `email_status` set to `pending_retry`. Admin sees the inquiry, can manually email.|
| Buyer email bounces              | Webhook flags inquiry; concierge calls the phone number on file.          |
| Concierge email bounces          | Surface a banner on `/admin/inquiries` if any unread inquiry has `email_status=concierge_bounced`. |
| API key leaked                   | Resend lets you rotate keys without downtime. Doc this in HANDOFF.        |
| Free-tier overage                | Resend hard-caps; the API call returns 429. Email failure logged, DB insert still succeeds. |

## Estimated effort

- Provisioning (Taha + DNS): ~30 min after the production domain is live.
- Coding (Claude): 1 session, roughly 1.5 hours.
- Templates (Claude + Taha approval on copy): 30 min iteration.
- End-to-end test: 15 min.

Total wall-clock: half a day, blocked only on the domain being live.

## What I am NOT recommending and why

- **Skipping email entirely** and relying on `/admin/inquiries` polling.
  Defensible for a soft launch but the concierge will miss leads.
- **Sending via the user's own Gmail SMTP.** Tempting because it is
  free, but Gmail rate-limits at ~500/day with daily resets, has worse
  deliverability for transactional, and ties the email pipeline to a
  personal account.
- **Adding marketing automation now.** Out of scope. If the house wants
  a newsletter later, Resend has audience features; if not, no churn.

## Sources

- [Resend pricing](https://resend.com/pricing)
- [Brevo pricing](https://www.brevo.com/pricing/)
- [Postmark pricing](https://postmarkapp.com/pricing)
- [Email API Pricing Comparison (April 2026)](https://www.buildmvpfast.com/api-costs/email)
- [Best Transactional Email Services 2026, Sequenzy](https://www.sequenzy.com/blog/best-transactional-email-services)
