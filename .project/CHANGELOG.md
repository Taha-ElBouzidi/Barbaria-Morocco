# Changelog

Real-time log of non-trivial actions on this codebase. Every commit, decision, scaffold, or scoping move gets one entry. Newest first.

Format: `YYYY-MM-DD HH:MM TZ — <one-line summary>`

---

## 2026-05-11

- 05:30 CET — Task 12: 301-redirected /cosmetics, /food, /textile, /order, /about → new IA; deleted retired routes, components, legacy exports; renamed contact_b2b → contact namespace.
- 04:15 CET — Task 11: Contact 2-step concierge form + sticky inquiry sidebar + mailto submit.
- 00:30 CET — Task 10: editorial pages — Story (3 chapters) + Ateliers (6 cooperatives) + Journal (1 feature + 5 standards).
- 23:55 CET — Task 9: PDP at /product/[id] — sticky image stack, spec column, proof strip, ritual steps, cooperative band, related row.
- 23:15 CET — Task 8: Category page /rituals/[world] with sub-chips + filter rail + sortable grid.
- 22:45 CET — Task 7: Home — Hero + CredentialStrip + EditorialBlock + BentoRituals + Heritage3Up. ShellChrome main top-padding removed; hero pages render edge-to-edge.
- 22:10 CET — Task 6: data layer — 17 products, 3 rituals, full i18n catalogue.
- 21:30 CET — Task 5: Footer + MenuDrawer + InquiryDrawer wired into ShellChrome.
- 21:00 CET — Task 4: Header (sticky transparent→sand) + ShellChrome wrapper.
- 20:30 CET — Task 3: rename cart-context → inquiry-context, storage key migrated to bb.inquiry.
- 20:05 CET — Task 2: primitives — Reveal, Eyebrow, DisplayHeading, Photo, Icon.
- 19:30 CET — Task 1: design tokens + next/font wiring landed.
- 18:15 CET — Sprint 1 implementation plan written: `.project/plans/2026-05-11-stitch-redesign-port.md`. 14 tasks, bite-sized TDD-flavored steps, locked file structure, risk register. Ready for subagent dispatch.
- 17:30 CET — Scope expanded mid-session: user added admin dashboard + SQL DB + analytics ask. Refused to fold into Sprint 1; decomposed into 3 sequential sprints (redesign port → DB+admin → inquiry backend+analytics). Backlog created at `.project/specs/_backlog.md`.
- 17:00 CET — Spec written for Sprint 1 (Stitch redesign port) at `.project/specs/2026-05-11-stitch-redesign-port-design.md`. Locks taxonomy mapping: 3 rituals (Hammam/Botanical/Heritage), `/food` retires (was "Coming soon" placeholder, never shipped), oils + serums migrate into Botanical, existing textile into Heritage.
- 16:45 CET — `.project/` governance scaffolded: `CHANGELOG.md` (this file), `DECISIONS.md`, `specs/_backlog.md`.
- 16:30 CET — Build verified green on cloned `master`: Next 16.2.1 + Turbopack, 5.8s compile, all routes type-clean. One warning: lockfile root inferred wrong (fixed in same commit by setting `turbopack.root` in `next.config.ts`).
- 16:15 CET — Branch `feat/stitch-redesign` cut off `master`.
- 16:00 CET — Repo cloned from `github.com/Taha-ElBouzidi/barbaria-morocco-website` to `D:\dev\Havok\BARBARIA\LATEST\`. `npm install` clean (651 packages, 11 vulns — deferred to follow-up audit).
