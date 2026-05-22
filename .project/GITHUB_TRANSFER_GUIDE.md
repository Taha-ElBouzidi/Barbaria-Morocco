# GitHub Transfer Guide

Step-by-step procedure to transfer the `Barbaria-Morocco` repository from
the outgoing engineer's personal GitHub account to the client's
organisation.

Status: ready to execute. Master is green. Two branches only: `master`,
`staging`. CI gate active (Node 24, type-check + critical CVE audit).

---

## Prerequisites

- [ ] Client GitHub organisation exists with `admin@barbariamorocco.com` as
      owner (or another email Inass controls). The outgoing engineer is
      invited as a member of that org with **Maintainer** role (so the
      transfer can be accepted from inside the destination org).
- [ ] Outgoing engineer's personal GitHub account has admin rights on
      `Taha-ElBouzidi/Barbaria-Morocco` (source repo).
- [ ] No open PRs against the source repo (transfer requires this).
- [ ] All local clones are up to date with `origin/master` and
      `origin/staging`.

---

## Step 1. Final sanity check (outgoing engineer, 2 min)

```bash
git fetch --prune
git log --oneline origin/master..HEAD                # should be empty
git log --oneline origin/staging..staging            # should be empty
git status                                            # should be clean
gh run list --branch master --limit 1                 # should show: completed, success
```

If anything is unexpected, fix before transferring.

---

## Step 2. Trigger the transfer (outgoing engineer, 2 min)

1. Go to `https://github.com/Taha-ElBouzidi/Barbaria-Morocco`
2. **Settings** (top right)
3. Scroll to the bottom → **Danger Zone**
4. Click **Transfer ownership**
5. Repository name to confirm: `Barbaria-Morocco`
6. New owner: the client organisation's handle (the one created with
   `admin@barbariamorocco.com`)
7. Click **I understand, transfer this repository**

GitHub sends a confirmation email to the destination org's billing email.

---

## Step 3. Accept the transfer (client org owner, 2 min)

1. Inass (or whoever holds `admin@barbariamorocco.com`) opens the email
   from GitHub titled *"Transfer request for Barbaria-Morocco"*
2. Click **Accept transfer**
3. The repo now lives at `https://github.com/<barbaria-org>/Barbaria-Morocco`.
   GitHub keeps the old URL as a 301 redirect so old clones continue to
   `git fetch` correctly, but every clone should be re-pointed.

---

## Step 4. Update the local remote (outgoing engineer, 1 min)

```bash
git remote set-url origin https://github.com/<barbaria-org>/Barbaria-Morocco.git
git remote -v                                          # confirm new URL
git fetch --prune                                      # confirm it works
```

Same step in any other clone that exists.

---

## Step 5. Restore Vercel integration (client team, 5 min)

GitHub repository transfers **break the Vercel ↔ GitHub link** because
Vercel's GitHub App needs to be authorised on the new owner.

1. Open the Barbaria team in Vercel → project → **Settings** → **Git**
2. Vercel will show the repo as disconnected
3. Click **Connect Git Repository** → authorise Vercel's GitHub App on
   the new client organisation
4. Select `<barbaria-org>/Barbaria-Morocco`
5. Confirm production branch: `master`
6. Confirm staging branch maps to a Preview environment (Vercel auto-creates this)
7. Trigger a manual redeploy from the latest master commit to confirm
   the new wiring works

---

## Step 6. Restore CI (client team, 1 min)

GitHub Actions follows the repo on transfer. The `.github/workflows/ci.yml`
keeps running. The only manual step:

1. New repo → **Settings** → **Actions** → **General**
2. Confirm **Actions permissions** allow workflows to run (default is
   allowed; some org defaults disable this).

---

## Step 7. Set up branch protection (client team, 5 min)

This is the post-transfer hardening that keeps the production branch
defendable:

1. New repo → **Settings** → **Branches** → **Add branch ruleset**
2. **Target**: `master`
3. **Rules**:
   - **Require a pull request before merging** ✓
     - Require approvals: 1 (or 0 if a single-engineer team, but still go through PR for the audit trail)
     - Dismiss stale reviews when new commits are pushed ✓
   - **Require status checks to pass before merging** ✓
     - Required check: `Type check + security audit` (from `ci.yml`)
   - **Require linear history** ✓ (no merge commits in master)
   - **Block force pushes** ✓
4. Repeat for `staging` if you want PR-only access (optional; many teams
   leave staging looser for fast preview iteration).

---

## Step 8. Add CODEOWNERS (client team, 2 min)

Once the new team exists on GitHub:

```
# .github/CODEOWNERS
*                                @<barbaria-org>/maintainers
/db/migrations/                  @<barbaria-org>/maintainers
/lib/legal/                      @<barbaria-org>/owners
/.github/workflows/              @<barbaria-org>/maintainers
```

Anyone on the team named in the CODEOWNERS line is auto-requested for
review on PRs that touch those paths. The legal directory should
require an `owners` (Inass-level) review because changes there affect
the published mentions légales.

---

## Step 9. Optional cleanup (outgoing engineer)

After the transfer is confirmed working:

- [ ] Leave the source-repo's local clone in place for reference, or
      delete the personal account's local working copy
- [ ] If keeping access for ongoing support: stay on the client org as
      a contractor (member role, not owner)
- [ ] If clean break: leave the client org, hand over any access tokens

---

## What carries over vs what does not

| Carries over | Does not |
|---|---|
| All branches, tags, commit history | Local clones, must be re-pointed |
| All issues + PRs (with full thread history) | Vercel ↔ GitHub link, re-connect required |
| Wikis | Personal access tokens / GitHub Apps installed on the old owner |
| GitHub Pages (none in this repo) | GitHub Actions secrets that contained owner-specific values |
| Releases + release artefacts | Webhooks pointing at the old owner's services |
| GitHub Actions workflows + their config | Branch protection rules (must be re-created) |
| Repository description, topics, README | Repository starring (stars from users do carry; the source-repo's own star count does) |

---

## Failure modes + recovery

**"Transfer failed because there are open PRs."**
Close any open PRs (or merge them) first. Transfer requires zero open PRs.

**"Transfer failed because the destination has a repo with the same name."**
Rename the destination's repo first, or rename the source before transfer.

**"After accepting, the repo doesn't show under the new org."**
Refresh. Sometimes there's a 30-second lag.

**"Local `git push` fails after transfer."**
The remote URL still points at the old owner. Run the `git remote set-url`
command from Step 4.

**"Vercel keeps trying to deploy from the old URL."**
Step 5 wasn't completed. Open the Vercel project's Git settings and
re-connect.
