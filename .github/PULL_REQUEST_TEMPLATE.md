# Summary

<!-- 1 to 3 bullets describing what changes and why. -->

-
-

## Type

<!-- Tick all that apply. -->

- [ ] `feat` — new user-facing capability
- [ ] `fix` — bug correction
- [ ] `refactor` — code change with no behavioural impact
- [ ] `docs` — documentation only
- [ ] `chore` / `ci` — tooling, deps, infra, CI
- [ ] `security` — vulnerability patch, header hardening, RLS tightening

## Test plan

<!-- How to verify this works. Be specific. Live URLs to hit, queries to
run, admin pages to click. CI green is not a test plan. -->

- [ ]
- [ ]

## Risk + rollback

<!-- What can break? How do we revert? -->

-

## Checks before merging

- [ ] CI green on this branch
- [ ] Tested against a real deployment (staging or local), not just type-check
- [ ] No new hardcoded URLs, emails, secrets, or personal paths
- [ ] If touching legal pages, mentions légales, or `lib/legal/client-data.ts`: verified by Barbaria owner before merge
- [ ] If touching DB schema: migration file added in `db/migrations/`, applied to the live project
- [ ] No em-dashes anywhere (UI strings, code, commit message, PR body)
