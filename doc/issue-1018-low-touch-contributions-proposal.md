# Issue #1018 — Low-Touch Device Contributions via a Bot-Authored PR (Phase 2, Refined)

> **Status:** Final technical proposal. **Supersedes** the contributor-side GitHub OAuth design sketched as "Phase 2" in `doc/issue-1018-technical-proposal-draft.md`.
> **Scope:** the website wizards under `website/src/js/` (`submit.js`, `update.js`, `wizard/`, `lib/`); a new serverless backend; one new GitHub App. No change to the validation pipeline, schema, or CI gates.

## Summary

The "Submit a device" (`/submit/`) and "Update a device" (`/update/`) wizards already do everything client-side — generate/patch comment-preserving vendor YAML, run payload codecs in a sandboxed Web Worker, validate against the compiled Ajv schema, and validate the product photo — but they **dead-end** at a checklist of GitHub web-editor deep links (`website/src/js/wizard/checklist.js`) that the contributor must click through manually. The goal of this proposal is to let device makers (corporate hardware/firmware engineers) finish a contribution with **low touch and great UX, without ever logging into GitHub**.

The key reframe — **do not make the contributor authenticate to GitHub**. Corporate GitHub SSO orgs frequently block third-party OAuth authorizations without admin approval, and many firmware engineers have no work GitHub account at all; contributor-side OAuth (the original Phase 2) walks straight into that wall. Instead, **the service authenticates as a bot** (a GitHub App installation token) and opens the PR on the contributor's behalf. The contributor proves only a lightweight email identity. GitHub stays the single source of truth, nothing auto-merges, every change still goes through CODEOWNERS review (`@Jaime-Trinidad` for `/vendor`) and the `validate.yml` CI gate, and the existing manual deep-link checklist is preserved as a no-backend fallback. The bot never pushes to `master` and never self-merges, so the production `release.yml` pipeline (Airtable/S3 sync, fires only on push-to-`master`) is never triggered by this flow.

---

## 1. Architecture

This is the backend that turns the wizard's in-memory artifacts (the complete `files` array, `prTitle`, `prBody`, and `cfg` already in scope at the `finish()` hook points) into a real pull request **without the contributor authenticating to GitHub**.

### 1.1 Identity: GitHub App (not OAuth App, not PAT)

Use a single **GitHub App** (e.g. `lorawan-devices-contributor-bot`). The App is the *only* GitHub identity in the flow; the contributor proves identity via the separate magic-link step (§2) and that verified email is recorded in the commit author + PR body for CLA attribution (§4).

Why a GitHub App over the alternatives:

- **vs contributor OAuth** — the thing we are explicitly replacing. Corporate GitHub SSO orgs block third-party OAuth without admin approval; many firmware engineers have no work GitHub account. A server-side installation token sidesteps both.
- **vs a personal access token (PAT)** — a PAT is tied to a human, carries that human's *full* account scope, and rotates manually. A GitHub App has narrowly-scoped per-installation permissions, short-lived tokens (~1 h), a per-installation rate limit, and a clear bot identity (`lorawan-devices-contributor-bot[bot]`).

#### Minimum permissions

Set these in the App's **Repository permissions** (everything else **No access**):

| Permission | Level | Why |
|---|---|---|
| **Contents** | Read & write | Create blobs/trees/commits and create/update a branch ref (Git Data API); read the base tip and existing file blobs for update diffs. Core requirement. |
| **Pull requests** | Read & write | Open the PR (`POST .../pulls`); find/update an existing PR on re-submission. |
| **Metadata** | Read-only | **Mandatory** — GitHub force-enables Metadata read for any App; repo/ref lookups require it. |

Do **not** request: Administration, Workflows, Actions, Checks, Webhooks, Secrets, or any org-level permission. No `workflows` permission means the App **cannot** create or edit files under `.github/workflows/` — a useful safety property the wizard never needs.

**Labels (optional).** The add-labels endpoint `POST /repos/{owner}/{repo}/issues/{number}/labels` is documented under **both** the Issues *and* the Pull requests permissions. Since the App already holds **Pull requests: write**, it can very likely label a PR with **no extra Issues grant**. Verify empirically against the `X-Accepted-GitHub-Permissions` response header before adding anything; only add **Issues: Read & write** if testing shows PR labeling actually requires it. Do not request Issues write speculatively.

#### Token model: down-scoped installation token, server-to-server

1. The service holds the App's **private key** (PEM) and **App ID** as secrets — never shipped to the browser.
2. It mints a short-lived **App JWT** (RS256, `iss` = App ID, `exp` ≤ 10 min) to call `POST /app/installations/{installation_id}/access_tokens`.
3. **Down-scope at mint time.** Pass a request body restricting the token to exactly the target repo and the two permissions:
   ```json
   { "repositories": ["lorawan-devices"],
     "permissions": { "contents": "write", "pull_requests": "write" } }
   ```
   The returned **installation access token** (`ghs_…`) is valid ~1 hour and limited to that scope, so a leaked token can only touch the one repo and only do branch/commit/PR work. All Git Data / PR calls use `Authorization: Bearer <installation_token>`.
4. `installation_id` is fixed (the single install on the target repo); resolve once via `GET /repos/{owner}/{repo}/installation` and cache it.

This is **server-to-server** auth: no user token, no OAuth redirect, no contributor GitHub session anywhere.

### 1.2 Branch strategy: same-repo branch vs bot-owned fork

**Option A — App installed on the upstream repo; push a branch directly to it.** The App creates `refs/heads/wizard/<vendor>/<model>-<rand>` in `TheThingsNetwork/lorawan-devices` and opens a same-repo PR (`head` = branch, `base` = `master`).
- **Pros:** simplest Git Data sequence (one repo, no cross-repo concerns); `validate.yml` runs immediately on `pull_request` with **no approval gate**; reviewers see a normal in-repo PR; update-flow base reads are trivially against the same repo.
- **Cons:** requires the org to install the App and grant Contents write to the canonical repo (the bot can write non-`master` branches only; branch protection + CODEOWNERS still gate merge). Some maintainers are uncomfortable with a bot holding write on the source-of-truth repo.

**Option B — App installed on a dedicated bot-owned fork; fork-and-PR.** The App pushes the branch to a fork (e.g. `ttn-device-bot/lorawan-devices`) and opens a cross-fork PR into `TheThingsNetwork/lorawan-devices:master`.
- **Pros:** the bot holds write only on its own fork; upstream grants nothing. Mirrors the human contribution model the README documents ("fork this repository and open a pull request"). Buildable and testable entirely under accounts you control — consistent with the MEMORY "no production push without approval" rule.
- **Cons / caveats:**
  - **First fork PRs do NOT auto-run CI on a public repo.** GitHub requires a maintainer with write access to click **"Approve and run"** for workflows on pull requests from first-time / outside contributors, per the repo's *"Approval for running fork pull request workflows from contributors"* setting. A brand-new `ttn-device-bot` fork is exactly an outside contributor, so its first PRs will **not** run `validate.yml` automatically — undercutting the "low-touch, CI runs normally" premise until the bot is a recognized contributor or the org sets approval to "all outside collaborators." This must be **confirmed before committing to Option B**, because "CI is the safety net" collapses if CI does not run.
  - **`GITHUB_TOKEN` is read-only on fork PRs and secrets are withheld** — fine for `validate.yml` (it needs no secrets), worth stating.
  - **Single-fork multi-tenant concurrency.** One fork is the `head` for *all* contributors' PRs. `merge-upstream` before each submission races on the fork's `master`; two contributors editing the same `<vendor>/<model>` must not collide (see idempotency — use a **random** branch suffix, not just a session hash). If `POST /repos/{fork}/merge-upstream` returns **409** (fork diverged), do **not** retry blindly: either hard-reset the fork's `master` to the upstream SHA (`PATCH /repos/{fork}/git/refs/heads/master` `{ sha: <upstream tip>, force: true }`) or branch off the upstream commit SHA directly rather than the fork's `master`.

**Recommendation:** build and test against **Option B (bot-owned fork)** for the staging rollout because it needs *zero* permission grants from the upstream org and matches the documented contribution model — but **verify the fork-PR CI approval behavior first**, and plan to **migrate to Option A** for production if maintainers prefer in-repo branches (Option A has no approval gate and no fork-sync/collision problem). Keep the push target (`owner/repo` for `head`) and the PR `base` (`TheThingsNetwork/lorawan-devices@master`) as **config, not hardcoded** — the wizard already threads `cfg = { repo, branch }` from `ghConfig()` (`gh.js:5-8`); add a "push target" config alongside it.

For Option B, sync the fork before each submission via `POST /repos/{fork}/merge-upstream` with `{ "branch": "master" }`, then branch off the fresh tip (handling 409 as above).

### 1.3 Building the commit: Git Data API (required — because of the PNG)

The **Contents API** (`PUT /repos/{o}/{r}/contents/{path}`) commits **one file per call** — a typical "add a device" PR touches 5–7 files, which would be 5–7 commits and 5–7 round-trips with race windows. Use it only as a degenerate fallback. The **Git Data API** builds a single atomic commit containing all text files **and** the binary PNG.

**The PNG bytes are the one required client change.** Today the validated image never leaves the photo-check closure — `state.file` in `photo-check.js:18,52` is hidden behind `hasFile()/isOK()/fileName()` (`photo-check.js:57-59`). Add one accessor to the returned object:

```js
// photo-check.js, after line 59
getFile: () => state.file,   // the raw, client-validated File
```

`finish()` then reads `photo.getFile()` and includes the bytes in the POST. No other data-flow change is needed; the `allFiles()` binary entry keeps `body:null, kind:'binary'` (`submit.js:156-161`).

#### Exact REST sequence (Git Data API)

`OWNER/REPO` = the push target (fork in Option B), `BASE` = `master`, down-scoped installation token in `Authorization`:

1. **Resolve base tip.** `GET /repos/{O}/{R}/git/ref/heads/{BASE}` → `object.sha` (base commit SHA).
2. **Get base tree.** `GET /repos/{O}/{R}/git/commits/{base_commit_sha}` → `tree.sha` (use as `base_tree`).
3. **Create a blob per text file.** For each `kind` `'new'` / `'edit'` (and the merged index files, §1.5): `POST /repos/{O}/{R}/git/blobs` `{ "content": <file.body>, "encoding": "utf-8" }` → `sha`.
4. **Create the PNG blob.** `POST /repos/{O}/{R}/git/blobs` `{ "content": <base64 png>, "encoding": "base64" }` → `sha`. base64 blobs let one commit carry binary content. (The wizard already validated PNG signature, ≤2000×2000, transparent bg client-side; CI re-validates server-side via `validate.js`.)
5. **Create the tree.** `POST /repos/{O}/{R}/git/trees` with `base_tree = <base_tree_sha>` and one entry per file: `{ "path": file.path, "mode": "100644", "type": "blob", "sha": <blob_sha> }`. `file.path` is the exact repo-relative path the wizard emits. `base_tree` means we only emit *changed/added* files; everything else is inherited.
6. **Create the commit.** `POST /repos/{O}/{R}/git/commits`:
   ```json
   {
     "message": "<prTitle>\n\n<short body>\n\nSigned-off-by: <Name> <verified-email>",
     "tree": "<new_tree_sha>",
     "parents": ["<base_commit_sha>"],
     "author":    { "name": "<contributor name>", "email": "<verified email>" },
     "committer": { "name": "lorawan-devices-contributor-bot", "email": "<bot email>" }
   }
   ```
   → `commit.sha`. The **author** is the verified contributor; the **committer** is the bot (see §4).
7. **Create the branch ref.** `POST /repos/{O}/{R}/git/refs` `{ "ref": "refs/heads/wizard/<vendor>/<model>-<rand>", "sha": "<commit_sha>" }`. On re-submission to an existing branch, `PATCH /repos/{O}/{R}/git/refs/heads/{branch}` `{ "sha": <new_commit_sha>, "force": true }` (see idempotency).
8. **Open the PR.** `POST /repos/{TheThingsNetwork}/{lorawan-devices}/pulls`:
   ```json
   {
     "title": "<prTitle>",
     "body":  "<prBody + attribution block>",
     "head":  "ttn-device-bot:wizard/<vendor>/<model>-<rand>",
     "base":  "master",
     "maintainer_can_modify": true
   }
   ```
   In Option A, `head` is just the branch name. → PR `number`, `html_url`.
9. **(optional) Labels.** `POST /repos/{TheThingsNetwork}/{lorawan-devices}/issues/{number}/labels` `{ "labels": ["submitted/via-wizard", "needs/triage"] }` (permission caveat in §1.1).

`prTitle` / `prBody` come straight from the wizard (`submit.js:248-254`, `update.js:730-731`); do not regenerate them server-side.

**Size limits:**
- `GET .../git/blobs/{sha}` is documented to support blobs up to **100 MB**; the **create** endpoint `POST .../git/blobs` has **no explicitly documented size ceiling** and is bounded in practice by request-body and timeout limits — do not cite "100 MB" as a documented create maximum. Either way, base64 blobs carry the PNG fine.
- The old `newFileURL` **7000-char prefill ceiling** (`gh.js:16-23`) **disappears** on this path — bodies are sent in the request body, not URL-encoded. (A concrete UX win to mention in the success copy.)
- base64-in-JSON inflates the PNG ~33%; the request-body cap is tied to the **Cloudflare account plan — 100 MB on Free/Pro** (413 beyond). The design's 2 MB total / ~4 MB pre-encode image caps (§2) sit far inside that floor.

### 1.4 GitHub rate limits — the **secondary** limit is the real ceiling

The **primary** rate limit is *not* the binding constraint. An installation token gives a **5,000 req/hour** floor (scaling +50/repo and +50/user above 20, capped at 12,500/hr; 15,000/hr if the App is owned by a GitHub Enterprise Cloud org) — orders of magnitude over expected load and **not** what limits a PR-opening bot.

The binding constraint is the **secondary (content-creation) rate limit**, which the create sequence hits directly:

| Secondary limit | Value |
|---|---|
| Content-creating requests | **80 / minute** and **500 / hour** |
| REST mutating points | **900 points / minute** (each POST/PATCH/PUT/DELETE = **5 points**) |
| Concurrent requests | **100** |

One submission is **~7–9 mutating calls** (blobs ×N, tree, commit, ref, PR, optional labels, plus the fork `merge-upstream`), i.e. **~35–45 points** and ~7–9 of the content-creation budget. At the design's own circuit-breaker ceiling (50 PRs / 24 h, §2) this is comfortable, but a **burst** or repeated **idempotency `PATCH+force` retries** can trip the **per-minute** secondary limit and return **403/429**. Therefore: implement **exponential backoff honoring the `Retry-After` / `x-ratelimit-reset` headers** on every mutating call, serialize the create sequence per submission, and treat the secondary limit — not the 5,000/hr primary — as the planning ceiling. The global 50-PR/day breaker keeps sustained load well under it.

### 1.5 Index files: do **not** blindly overwrite (data-loss bug)

> **Critical.** The Git Data tree blob **overwrites** whatever exists at `file.path`. That is correct for full-file bodies, but the **SUBMIT** wizard emits two `kind:'edit'` files that are **partial fragments, not full files**, and carry **no `oldText`**:
> - **New-vendor case:** `vendor/index.yaml` body = `vendorIndexSnippet()` (`submit.js:132-141`) — a **commented append fragment** (`# Add to vendor/index.yaml…`), note "append your vendor entry to the alphabetical list."
> - **Existing-vendor case:** `vendor/<v>/index.yaml` body = `indexYAML()` (`submit.js:130`) = `endDevices:\n  - <model>\n` — a **single-line fragment**, note "add `- <model>` to the endDevices list."
>
> Committing either verbatim **overwrites the real ~1369-entry `vendor/index.yaml` with a 7-line comment**, or **truncates an existing vendor's entire `endDevices` list down to one device**. Because `validate.js` only validates devices that are *listed*, such a PR could even pass CI while silently dropping the catalog. This corrupts the repo on the **very first new-device submission** and must be fixed before anything ships, even against a fork.

**Fix (chosen approach):** make every emitted body a true **full-file replacement with `oldText`**, so the backend's overwrite model is universally valid. The **submit wizard** must `fetchRaw` the live `vendor/index.yaml` and `vendor/<v>/index.yaml` at `finish()` (the update wizard already does exactly this via `gh.js:27-31`), splice the new vendor/device entry into the correct alphabetical/list position, re-emit the **full merged file** as `body`, and attach `oldText` = the fetched source. The two index entries then look identical to update-wizard edits.

**Backend defense-in-depth:** treat any `vendor/**/index.yaml` `kind:'edit'` arriving **without** `oldText` as a hard error (reject `400`), never an overwrite. Optionally tag merged entries `op:'append-vendor'` / `op:'append-endDevices'` so the backend can re-fetch-and-splice server-side as a backstop. Either way, the backend must never write a fragment over a full index file.

### 1.6 Handling UPDATE (existing-file) edits + firmware immutability

For the update wizard, each `kind:'edit'` body is **already the final file text** — the comment-preserving spliced output of `createPatcher.apply().text` (or a full re-emit when `reformatted:true`, carrying `oldText` + `validateKind`). In the Git Data sequence it is just a blob whose `path` already exists in `base_tree`, so the new tree entry overwrites it. No diff/patch logic server-side.

**Base drift + firmware-immutability (hard-block the device YAML).** Each update `edit` carries `oldText` = the GitHub source the wizard read at load time (`fetchRaw`). The base tip can move between load and submit. The repo constraints make `firmwareVersions` **append-only / immutable** (PR-template reviewer checklist + README), and `validate.js` enforces firmware/hardware *consistency* but has **no view of history**, so it cannot catch a *dropped* firmware entry. Because the update wizard's splices are against the load-time version, if a firmware version was added upstream after load, a verbatim overwrite would **silently regress** it — and a green CI run would not flag it.

Therefore the backend **MUST** compare each `edit` file's `oldText` against the **current blob at that path on the base tip** and **hard-block (HTTP 409, "this device changed upstream — reload and re-apply")** on drift for **at least the device `.yaml` that carries `firmwareVersions`**. Do **not** "proceed and add a note" for the firmware-bearing file — the append-only constraint cannot be enforced by CI alone. For non-firmware-bearing files (e.g. a profile or codec YAML), proceeding with a note and letting the human reviewer + CI catch conflicts is acceptable, but a 409-reload is the safer default. (Re-applying the wizard's structured changes server-side would avoid the reload but duplicates `createPatcher` in the Worker — not recommended.)

### 1.7 Idempotency / re-submission

Branch name = idempotency key: `wizard/<vendor>/<model>-<rand>`, where `<vendor>/<model>` come from `vendorSlug()/model()` (submit, `submit.js:22-23`) or `state.vendorId/state.modelId` (update, `update.js:95-96`), and `<rand>` is a **random** per-submission suffix (so two contributors submitting the *same* model never collide, and a genuinely new submission gets a fresh branch). A retry of the *same* submission reuses its branch via a stored submission→branch mapping.

On submit:
1. Resume check — look up an existing **branch** *and* open PR for that head: `GET /repos/{TheThingsNetwork}/{lorawan-devices}/pulls?head=ttn-device-bot:wizard/<vendor>/<model>-<rand>&state=open`, and on the push target `GET /repos/{O}/{R}/git/ref/heads/wizard/...` for the orphan-branch case (§1.8).
2. **No branch, no PR:** run the full create sequence (steps 1–9).
3. **Branch exists, PR exists:** rebuild the commit on the current base tip and `PATCH .../git/refs/heads/wizard/...` `{ sha, force: true }`. CI re-runs on the existing PR; no duplicate PR. Optionally post a comment noting the update.
4. **Branch exists, no PR (orphan):** open the PR for the existing branch (do not re-create the ref).

This makes the endpoint safely retriable (network blips, double-clicks) and lets a contributor return via the same magic link to amend a still-open submission.

### 1.8 Failure modes & rollback (not just the happy path)

The create sequence is 7–9 sequential calls; define behavior for partial failure:

- **Ref created (step 7) but `POST /pulls` (step 8) fails** → an **orphan branch** with no PR. On retry, the idempotency lookup by open PR finds none and a naive `POST .../git/refs` returns **422 "Reference already exists"** and dead-ends. **Fix:** the idempotency lookup also checks for an existing **branch ref**; if the branch exists but no PR does, **resume by opening the PR** (step 8) instead of re-creating the ref. Alternatively delete the orphan branch on PR-open failure and start clean.
- **`POST /pulls` returns 422 "No commits between base and head"** → a no-op submission (e.g. an update that produced an empty diff). Surface as a user-facing **"No changes detected"** (frontend error state), not a 500.
- **`POST /pulls` returns 422 (other GitHub validation)** → surface GitHub's message; common cause is a branch with no diff or an existing PR for the head.
- **PR opened but the notification/redirect email fails** → the contributor must never be left stranded. **Always return the PR `number` + `html_url` synchronously** in the `/api/submit` (MVP) or `/api/verify` (Phase 2) response and render it in frontend state 5, *independent of* email delivery. "We'll email you when it's merged" is best-effort only.
- **Token mint / `merge-upstream` / blob / tree / commit failures** → no ref or PR exists yet; safe to fail the request and let the client retry. Log the failing `stage` (§6).

### 1.9 Serverless endpoint shape

Runs on **Cloudflare Workers** (lowest-ops fit; the rest of the project is static GitHub Pages + S3/CloudFront). Secrets (`GH_APP_ID`, `GH_APP_PRIVATE_KEY`, magic-link signing key, email-provider key) live in Worker secrets; KV / a Durable Object holds rate-limit and pending-submission state. CORS allows the staging origin (`https://wienke.github.io`) and the production site origin.

Routes (JSON unless noted; **canonical request contract** in §1.10):

- `POST /api/identity/start` *(Phase 2)* — `{ email }` → emails a magic link, returns a generic `{ ok: true }`.
- `GET /api/verify?token=…` *(Phase 2)* — validates the single-use token, marks the email verified, then runs the fork/branch/commit/PR sequence and **redirects to the opened PR** (or a success page carrying the PR URL).
- `POST /api/submit` — the single swap point. **MVP:** opens the PR directly. **Phase 2:** persists a pending submission and emails the link (PR opened only at `/api/verify`).
- `GET /api/submit/{submissionId}` — poll for status (used by the email-sent state to advance the same tab).

**Server-side validation — scoped honestly.** A Cloudflare Worker **cannot reproduce the full `validate.js` gate**: `validate.js` runs codec examples by spawning the Go binary `bin/runscript` (`child_process.spawn`) and uses Node libs (`image-size`, `read-chunk`, `image-type`, `fs`) — none of which exist in the Workers V8 isolate. The Worker can do, at most: **Ajv schema validation** (`lib/schema-validators.gen.js`) + **payload size caps** + a **PNG signature/dimension re-check**. It **cannot** reproduce codec structural-equality, the cross-file **name-uniqueness** check (`validate.js:302`, needs the whole repo), the **vendor-name-as-standalone-word** check (`validate.js:294-298`), or the Go **image-decode / extension-match** (`validate.js:168-177`). Those remain **CI-only** — which is fine, because **CI is the real gate and nothing auto-merges**. Do **not** claim server-side re-validation makes a CI failure impossible.

**Prettier formatting.** `validate.yml` runs `npx prettier --check schema.json "vendor/**/*.yaml" "bin/**/*.js"` as a hard gate. Note the glob: it covers `schema.json` + `vendor/**/*.yaml` + `bin/**/*.js` only — **contributed codec `.js` under `vendor/` is NOT format-checked**, so only the **YAML** bodies must be Prettier-clean. Output must be **byte-identical** to whatever `npx prettier` resolves in CI; `package.json` declares `prettier ^2.8.8` (a caret range) and CI pins nothing, so a hardcoded server-side `2.8.8` could drift from a newer 2.x CI resolves. **Recommendation:** pin CI to an exact Prettier version *and* use the same exact version wherever formatting runs. Prettier 2.x **bundles YAML support in core** (no separate plugin needed); the real risk is **Workers CPU-time / bundle-size limits**, which is unproven — so prefer to **format the YAML in the browser (wizard) at emit time** (deterministic, no isolate constraints) or in a non-Workers step, rather than asserting an "authoritative server-side Prettier." If formatting stays client-side, the Worker should at least *verify* (not silently re-emit) the bodies.

**Fallback preserved.** The swap at `submit.js:247` / `update.js:729` becomes: "POST to the Worker; on success show the PR-link success state; on failure (or by user choice, or when no backend is configured) call `renderChecklist(...)` as today." `checklist.js` is unchanged and remains the no-backend fallback.

### 1.10 Canonical request contract (resolves the inter-section inconsistency)

There is **one** wire format: **`multipart/form-data`** (the PNG is binary; base64-in-JSON inflates it ~33% and the wizard already holds the `File` via the new `getFile()` accessor). JSON+base64 is *not* used.

```
POST {backendBase}/api/submit            Content-Type: multipart/form-data

  payload = JSON string:
    {
      "phase": "mvp" | "verify",                 // MVP: open PR now; verify: persist+email
      "wizardKind": "submit" | "update",
      "repo":   cfg.repo,        // "TheThingsNetwork/lorawan-devices"  (gh.js:5-8)
      "base":   cfg.branch,      // "master" — intended PR base
      "vendorId": "...", "modelId": "...",        // branch naming
      "prTitle": "...", "prBody": "...",
      "files": [
        { "path": "vendor/<id>/<model>.yaml", "kind": "new"|"edit",
          "body": "<full final file text>",
          "oldText": "...", "reformatted": false, "validateKind": "device" }
        // binary entries: { "path": "vendor/<id>/<model>.png", "kind": "binary", "body": null }
      ]
    }
  photo = <binary File>     // name="photo"; filename "<model>.png"; matched to files[] by path
  email = <contributor email>          // MVP & Phase 2
  name  = <contributor name>           // MVP & Phase 2
  cla   = "true"                       // consent checkbox (semantics differ by phase — §4)
  turnstileToken = <Turnstile token>   // MVP & Phase 2 (gates /api/submit)
  token = <magic-link token>           // Phase 2 only, present on the verifying call
```

`files` is sent **verbatim** as built by `allFiles()` (`submit.js:143-163`) / `build()` (`update.js:475-657`), **after** the §1.5 index-merge fix makes every `body` a full file. The validation/diff summaries computed client-side (`renderValidation()` `submit.js:167-186`; `renderDiffs()` `update.js:696-708`; the Web Worker codec run) ride along only as **informational PR-body content** — not as a security boundary; CI is the gate.

**Flow ordering by phase** (the sequence diagram in §1.11 shows the MVP one-shot path):
- **MVP:** `/api/submit` verifies Turnstile → caps/validates → **opens the PR directly** → returns `{ pr }`. No `/api/verify`.
- **Phase 2:** `/api/submit` verifies Turnstile → caps/validates → **persists pending + emails link** → returns `{ status: "email_sent", submissionId }`. The PR is opened only when the contributor hits `/api/verify`.

**Response (success):** `200 { "ok": true, "pr": { "number": 1234, "url": "https://github.com/TheThingsNetwork/lorawan-devices/pull/1234" }, "updated": false }`.
**Errors:** `400` malformed / index-edit without `oldText`; `401` bad/expired token; `409` base drift (firmware-bearing file); `413` body over the Cloudflare limit; `422` GitHub validation (surface message; map "No commits between" → "No changes detected"); `429` rate-limited (with `Retry-After`); `502` GitHub upstream error.

### 1.11 Sequence diagram (MVP, Option B)

```
Contributor browser (wizard)        Cloudflare Worker (bot)            GitHub REST API
        |                                   |                                |
  finish() @ submit.js:247                  |                                |
  multipart POST /api/submit                |                                |
   {payload(files w/ merged index+oldText), |                                |
    photo, email, name, cla, turnstileToken}|                                |
        |  ------------------------------->  |                                |
        |                       verify Turnstile (siteverify, hostname+IP)    |
        |                       rate-limit + size caps + Ajv + PNG re-check   |
        |                       reject index edit missing oldText (400)       |
        |                       UPDATE: oldText vs current blob; 409 on drift |
        |                       mint App JWT (RS256) ; POST /app/installations/{id}/access_tokens
        |                                   |   (body: repos+permissions down-scope) --> 201 ghs_… (1h)
        |                       [Opt B] POST /repos/{fork}/merge-upstream {branch:master} (409 -> hard reset)
        |                       GET pulls?head=fork:wizard/<v>/<m>-<rand> + GET ref (resume/orphan)
        |                       GET git/ref/heads/master --------------------->|--> base commit sha
        |                       GET git/commits/{sha} ----------------------- >|--> base_tree sha
        |                       POST git/blobs (utf-8) xN text files --------->|--> blob shas
        |                       POST git/blobs (base64) x1 PNG --------------->|--> png blob sha
        |                       POST git/trees {base_tree, [entries]} -------->|--> new tree sha
        |                       POST git/commits {author=contributor,          |
        |                          committer=bot, msg+Signed-off-by} --------->|--> commit sha
        |                       POST git/refs wizard/... (or PATCH+force) ----->|--> branch
        |                       POST {upstream}/pulls {title,body+attrib,head,base:master} -->| PR #1234
        |                       (optional) POST issues/1234/labels ----------->|
        |  <-- 200 {pr:{number,url}, updated:false}  (returned even if email later fails)     |
  swap DOM to "PR #1234 opened" success state                                 |
        |                                   |              (push event) CI validate.yml runs* :
        |                                   |              make validate + prettier --check (YAML)
        |                                   |              CODEOWNERS review @Jaime-Trinidad
        |                                   |              human merges (off master until approved)
        |
  * Option B public-repo caveat: first fork PRs need a maintainer "Approve and run".
  On non-2xx / unreachable / user opt-out: fall back to renderChecklist(root.querySelector('[data-checklist]'),
  cfg, files, {prTitle, prBody}) exactly as today. GitHub stays the single source of truth; nothing auto-merges.
```

---

## 2. Identity & anti-abuse

We are **not** doing authentication in the security sense; we are doing **attributable identity** — binding a submission to an email so the PR records claimed authorship, CLA consent is captured against a real mailbox (Phase 2), and abuse can be traced/rate-limited per identity. The **trust decision still happens at human review.** The email proof raises the cost of anonymous spam and gives `@Jaime-Trinidad` a real contact; it is a spam/attribution filter in front of an already-safe pipeline, **not** the thing standing between an attacker and `master`.

### 2.1 What we capture and where it goes

| Field | Source in wizard | Required | Recorded on |
|---|---|---|---|
| `email` | net-new identity field (§3) | yes | commit `author` + PR attribution block + audit record; **never** in committed YAML |
| `name` | net-new identity field | yes | commit `author` + PR attribution block |
| `company` / vendor | `f.get('vendorName')` (submit) / `state.vendorId` (update) | yes (submit) | PR attribution block; vendor `email` may also land in `vendor/index.yaml` via the merged `vendorIndexSnippet()` (`submit.js:139`) |
| CLA consent | net-new checkbox → johanstokking gist (§4) | yes | **Phase 2 only:** PR block + consent record; **MVP:** recorded as *unverified, self-asserted* (see §2.6) |
| client metadata | request headers at the Worker | n/a | audit record only (IP, UA, Turnstile outcome, timestamp) — **never** committed |

### 2.2 Magic-link flow (Phase 2)

**Act-after-verify** is the core anti-abuse property: **no PR is created by an unverified email.** `POST /api/submit` verifies Turnstile, applies caps/validation, **persists the submission as `pending`**, and emails a single-use link. `GET /api/verify?token=…` validates the token, marks the email verified, and **only then** performs the fork/branch/commit/PR sequence, returning the PR URL synchronously (§1.8). Spam that never clicks the link costs an email round-trip and never reaches the repo.

**Token store — opaque random token + KV (recommended).** Generate a 256-bit random token (`crypto.getRandomValues`, base64url), store `KV[token] = { submissionId, email, expiresAt }` with a 15-minute TTL, and store the pending payload at `KV[submissionId]` with a 24 h TTL. Verification = atomic **read-and-delete** of `KV[token]` (delete-on-read = single-use). A stateless JWT does *not* remove the store (you still need a consumed-`jti` set for replay defense *and* somewhere to hold the multi-hundred-KB payload), so opaque-token + KV is simpler and strictly more correct. KV is eventually consistent; for strict single-use under concurrent clicks use a **Durable Object** keyed by token, or accept that a double-click within the propagation window could open two PRs (cheap to dedupe by `submissionId`). Email via a transactional provider (Resend / Postmark / SES); the link is `https://<host>/api/verify?token=…`, plain text, names the device, states the 15-minute single-use expiry, and **never** carries file bodies.

### 2.3 Turnstile placement

Use **Cloudflare Turnstile** (free, privacy-preserving, native to the Worker host; hCaptcha is the drop-in alternative). Render the widget on the **final review/identity step** (the panel shown when `onShow(i)` fires for the last step — `submit.js:233` / `update.js:718`), next to the email/name/CLA fields, so the token is fresh (~300 s) at `finish()`. The callback writes the token into a field read at `finish()` and sent as `turnstileToken`. The Worker verifies via `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` with `{ secret, response, remoteip }`, rejecting unless `success === true`, and checks the response `hostname` matches the wizard origin to stop cross-site token replay. Turnstile gates **`/api/submit` only**; `/api/verify` is gated by token possession.

### 2.4 Rate limits (concrete) — and what actually has teeth in the MVP

Enforced at the Worker via KV / Durable Object counters; reject with `429` (surfaced in the repurposed panel).

| Dimension | Limit | Window | Rationale |
|---|---|---|---|
| per **email** — verified PRs | 5 PRs | rolling 24 h | a real vendor rarely submits >5 devices/day |
| per **email** — submit attempts (pre-verify) | 10 | rolling 1 h | caps verification-email spam to one mailbox |
| per **IP** (`CF-Connecting-IP`) — submit attempts | 20 | rolling 1 h | blunts scripted floods from one host |
| per **IP** — verified PRs | 10 PRs | rolling 24 h | shared-NAT tolerance, bounded |
| per **device path** `vendor/<id>/<model>` | 3 PRs | rolling 24 h | stops re-submission loops on one device |
| **global** — bot-opened PRs | 50 PRs | rolling 24 h | circuit breaker — see soft-control note below |

Also cap payload size: reject `/api/submit` bodies over **2 MB total** and any single text file over **256 KB** (real device YAML is single-digit KB; codec JS rarely exceeds tens of KB). The image is separately bounded by the client `≤2000×2000` PNG check; the Worker re-checks PNG magic + dimensions (it cannot Go-decode — §1.9).

> **Honest MVP caveat.** With **no magic-link**, **email is unverified** and the **device path is attacker-chosen**, so the per-email and per-device limits are **decorative** — a spammer types a fresh fake email and a novel slug per request and evades both. In the MVP only **per-IP** (evadable via proxies/botnets) and the **global breaker** have real teeth. Two consequences:
> - **Replace the hard global pause with a soft control.** A hard "pause the bot at 50/24 h" is a self-inflicted DoS: one attacker tripping it blocks **all** legitimate contributors for the day. Instead **throttle/queue + alert** above the threshold (or auto-close suspected-junk PRs rather than refusing service) so one attacker cannot deny service to everyone.
> - This is a strong argument for treating **magic-link verification as a Phase-1 requirement rather than Phase-2** (see §2.6 / §8), because the whole per-email/per-device table only means something once identity is verified.

### 2.5 Threat model

| Threat | Vector | Mitigation |
|---|---|---|
| **Spam PRs** | scripted floods | Turnstile on `/api/submit`; (Phase 2) act-after-verify; per-IP limit + soft global control; ultimately bounded by human review (nothing merges) |
| **Malicious codec JS** | decoder with exploit / infinite loop | Codec **never runs on the server** (no Go runtime / `child_process` in the Worker). CI executes it in the `bin/runscript` Go sandbox only after a human opens the PR; the wizard runs it only in the contributor's own sandboxed Web Worker. The Worker treats codec JS as inert text. CI structural-equality (`lodash.isequal`) + reviewer is the gate. |
| **Oversized payloads** | huge files | 2 MB total / 256 KB per-file caps + image dimension/signature re-check; reject before persisting. Removes the old 7000-char ceiling safely. |
| **Replay** | reused link / Turnstile token | Single-use token via KV delete-on-read (or Durable Object); 15-min TTL; Turnstile verified once, bound to `hostname`+`remoteip`; dedupe duplicate PRs by `submissionId`. |
| **Token theft** | intercepted magic link | Short TTL, single-use, grants only "open this one pre-validated PR" — not account access. Worst case: a PR opened slightly early, still reviewed. HTTPS only. |
| **Email enumeration** | probing known emails | `/api/submit` returns an identical generic "check your email"; `/api/verify` returns generic "link expired or already used." No oracle. |
| **CLA bypass** | content from an un-agreed party | Phase 2: verified, email-bound consent recorded in the PR + audit store. **MVP: no CLA attestation is emitted** (§2.6 / §4). Bot never merges; missing/forged CLA is caught at review. |
| **Forged attribution** | fake `name`/`company` | Email is the only *verified* field (Phase 2); name/company are self-asserted and labelled as such. |
| **Secret leakage** | App key / signing secret | Per-request, short-lived (≈1 h) **down-scoped** installation token (not the private key); private key + Turnstile + email keys only in Worker secrets; least-privilege App (Contents+PR write, no admin/merge). |
| **`master` pollution** | auto-push to release branch | Bot only does fork/branch → PR against `cfg.branch` (base `master`). Never pushes to master, never self-merges; `release.yml` fires only on master push (MEMORY: no production push without approval). |

### 2.6 MVP without magic-link — and the CLA contradiction it must NOT create

A first cut may **omit verification** and rely on the cheaper controls: **Turnstile** + server-side siteverify (stops scripted floods, the dominant vector); **email/name/company in-form**; the **rate-limit table** (per-IP + global soft control are load-bearing); server-side **Ajv + size + PNG re-check** before opening the PR. `/api/submit` opens the PR directly — safe **only because** human review + CI gate merges.

> **Hard rule (resolves the §2↔§4 contradiction).** In the unverified MVP the bot **MUST NOT emit any CLA-acceptance trailer or claim CLA capture.** A `CLA-Accepted-By: <email>` line backed by an *unverified* mailbox is a **forgeable, legally meaningless attestation** — anyone can type `victim@example.com`, tick the box, and the bot produces a record the victim never agreed to. For an Apache-2.0 repo whose **only** contributor agreement is this CLA (`README.md:62`, no CLA-bot, enforced socially by the reviewer), that is **worse than the status quo** (where the human PR author is understood to have signed). So in the MVP: record at most **"CLA checkbox ticked — UNVERIFIED, self-asserted"** and make the reviewer aware the CLA is **not yet defensibly attributable.** Either (a) gate any real CLA trailer on the magic-link verification being live, or (b) get explicit sign-off from **@johanstokking** (CODEOWNER of `/LICENSE`) that bot-opened PRs are acceptable *without* verified CLA attribution before Phase 1 ships. This is exactly why moving magic-link earlier is attractive.

**When to add magic-link:** when (a) PR spam survives Turnstile + per-IP limits at a nuisance rate; (b) you need **defensible** CLA consent (verified mailbox) — the dominant reason here; or (c) you want the per-email rate limits to mean anything. The architecture is forward-compatible: the same `/api/submit` payload switches from "open now" to "persist + email," `/api/verify` is added, and the only wizard change is success-panel copy ("check your email" vs "PR opened").

---

## 3. Frontend integration

No data-flow restructuring: at both `finish()` call sites the complete `files` array, `prTitle`, `prBody`, and `cfg` already exist in scope. The backend path needs **one new module, two thin wrappers, and one accessor**, and degrades losslessly to today's manual checklist.

### 3.1 One new module, zero churn in `checklist.js`

`checklist.js` stays exactly as-is (the no-backend fallback). Add a sibling `website/src/js/wizard/submit-backend.js` exporting `submitViaBackend(root, cfg, files, meta, opts)` (`meta = { prTitle, prBody }`, `opts = { photoBytes, vendorId, modelId, wizardKind }`). It owns the entire backend UI state machine and, on **any** failure, calls the existing `renderChecklist(...)` so degradation is automatic.

The two call sites (`submit.js:247`, `update.js:729`) change from a bare `renderChecklist(...)` to a small branch:

```js
import { submitViaBackend } from './wizard/submit-backend'
import { backendAvailable } from './lib/backend' // new — see §3.5

// inside finish():
const meta = { prTitle, prBody }   // strings already built at submit.js:248-254 / update.js:730-731
const checklistRoot = root.querySelector('[data-checklist]')
if (backendAvailable(root)) {
  submitViaBackend(root, cfg, files, meta, {
    photoBytes: photo.getFile(),          // new accessor (§1.3)
    vendorId: v, modelId: m,              // submit.js:245-246 / update state.vendorId,state.modelId
    wizardKind: 'submit',                 // or 'update'
  }).catch(() => renderChecklist(checklistRoot, cfg, files, meta))
} else {
  renderChecklist(checklistRoot, cfg, files, meta)
}
```

`submitViaBackend` renders into a **new** container `[data-backend-panel]` (added to the success-panel markup in `website/layouts/submit/list.html` and `website/layouts/update/list.html`) and leaves `[data-checklist]` empty unless it falls back. The existing `wizard.hidden = true; success.hidden = false` swap (`submit.js:257-258` / `update.js:733-734`) and the `[data-download]` handler (`submit.js:261-270` / `update.js:737-748`) are unchanged — local download stays available as a belt-and-braces escape hatch in every state.

### 3.2 Submit-wizard index merge (frontend half of §1.5)

Before the POST, the **submit** wizard must produce **full, merged** index bodies, not fragments. In `finish()` (or `allFiles()`), `fetchRaw(cfg, 'vendor/index.yaml')` and `fetchRaw(cfg, 'vendor/<v>/index.yaml')` (using the existing `gh.js:27-31` helper), splice the new vendor / `- <model>` entry into the correct alphabetical/list position, and replace the fragment `body` with the **full merged file** plus `oldText` = the fetched source. The update wizard already fetches at load, so its bodies are already full files. This makes every `body` in the POST a true full-file replacement — the precondition for the backend's overwrite model and the fix for the catalog-corruption bug.

### 3.3 The request

**One `multipart/form-data` POST** to `POST /api/submit` (canonical contract, §1.10): the PNG is binary (base64 inflates ~33%), `FormData` attaches `photo.getFile()` directly with no transcoding, and the text bodies stay human-inspectable. `files` is sent **verbatim** (after the §3.2 merge) including `kind`, `note`, and update-only `oldText`/`reformatted`/`validateKind`. Binary entries keep `body:null` and are matched to the `photo` part by `path`. Client-side validation/diff results are passed only as informational PR content; CI is the gate.

### 3.4 Identity / consent sub-panel (net-new UI)

There is no contributor identity in the wizard today (`submit.js:139`'s `vendorEmail` is written into `vendor/index.yaml`, not used for auth). Render the identity step as `submitViaBackend`'s **first state** — **not** a new wizard step, so it does not perturb `initSteps`/`panelsCount` (`submit.js:228` / `update.js:711-712`) or the `onShow` review trigger.

This is a **CLA, not a DCO** (README:62 links the johanstokking CLA gist; no `Signed-off-by` is required by the repo):

- Email input, `type="email"`, required. Helper: *"We send a one-time link to confirm it's you, then open the pull request on your behalf. No GitHub account needed."*
- Consent checkbox, required:
  > ☐ I have read and agree to the [Contributor License Agreement](https://gist.github.com/johanstokking/58081d646d6dd4f93b3d85cd5c62377c), and I am authorized to license this device data, codec, and image under Apache-2.0.

  Link `target="_blank" rel="noopener"`. Submit is disabled until the email validates (`[^@]+@[^@]+\.[^@]+`) and the box is checked.
- **Public-and-permanent disclosure (required copy):** *"Your name and email will appear publicly and permanently in the commit and pull request on GitHub, as is standard for open-source contributions."* (See §4.7.)

In the **MVP** the consent is recorded as **unverified/self-asserted** (no CLA trailer emitted — §2.6); in **Phase 2** the consent becomes valid only after the email is verified.

### 3.5 UI states (rendered into `[data-backend-panel]`)

Reuse design-system classes (`.btn`, `.btn-secondary`, `.cl-item`, `.ck`) for visual parity with `checklist.js`.

1. **idle / consent** — the identity + CLA form (§3.4). Primary: **"Submit — we open the PR for you."** Always-visible secondary: **"Prefer to do it on GitHub yourself? Use the manual checklist"** → `renderChecklist(checklistRoot, …)` (the explicit, non-error path to the fallback for GitHub-native users).
2. **submitting** — spinner, *"Uploading your files…"*; buttons disabled. (MVP: proceeds straight to PR open. Phase 2: backend persists pending + emails the link.)
3. **email-sent** *(Phase 2)* — *"Check your inbox — we sent a confirmation link to **{email}**. Open it to publish your contribution. You can close this tab; the link finishes the job."* **"Resend link"** (rate-limited → on 429 disable for 30 s) and **"Use a different email"** (→ state 1). If the tab stays open, poll `GET /api/submit/{submissionId}` every 3 s (max ~2 min).
4. **verifying** *(Phase 2)* — brief spinner *"Confirming and opening your pull request…"* shown by the `/verify` landing page after the token call.
5. **pr-opened** (success) — green check, *"Done! Your changes are in pull request #{number}."*, primary **"View pull request ↗"** → `prUrl` (`target="_blank" rel="noopener"`), plus *"A reviewer (the `/vendor` CODEOWNER) will check it and merge."* The PR number/URL is shown **regardless of email delivery** (§1.8). Also list the committed files (read-only `.cl-item`, no deep links).
6. **error / retry** — red banner with the backend's message (e.g. *"No changes detected"* for 422 "no commits between," or *"This device changed upstream — please reload and re-apply your edits"* for a 409 firmware-drift block). Buttons: **"Try again"** (re-POST) and a prominent **"Open it on GitHub instead"** → full `renderChecklist(...)` fallback. Non-retryable 4xx goes straight to the checklist with a one-line note.

### 3.6 Graceful degradation

- **Pre-flight `backendAvailable(root)`** (new `website/src/js/lib/backend.js`): read the backend base URL from `root.dataset.submitApi`, set by the Hugo template (mirrors how `ghConfig` reads `data-gh-repo`/`data-gh-branch`, `gh.js:5-8`). If absent/empty (e.g. on the staging build where we may not wire a backend), return `false` → the classic checklist renders with **zero** behavioral change. This keeps the noindex staging site fully self-contained (MEMORY-compliant).
- **Runtime catch:** `.catch(() => renderChecklist(...))` on the `submitViaBackend` promise guarantees any network failure, timeout, non-2xx, or CORS error drops the user into the identical manual checklist, with **Download files** still wired. Wrap the first POST in an `AbortController` (~15 s) so a hung backend degrades quickly. An optional `fetch HEAD {backendBase}/health` in `backendAvailable` is non-essential given the `.catch`.

Net effect: the manual checklist is never removed and is reachable three ways — backend not configured, user opts out in state 1, or any backend error — so GitHub stays the single source of truth and a no-backend deployment behaves exactly as the current `redesign` branch.

### 3.7 Files referenced / to change

New `website/src/js/wizard/submit-backend.js` and `website/src/js/lib/backend.js`; one-line `getFile` accessor in `website/src/js/wizard/photo-check.js:56-60`; submit-wizard index-merge (`fetchRaw` + splice) in `website/src/js/submit.js` `finish()`/`allFiles()`; branch the two `finish()` call sites at `website/src/js/submit.js:247` and `website/src/js/update.js:729`; add `[data-backend-panel]` + `data-submit-api` to `website/layouts/submit/list.html` and `website/layouts/update/list.html`. `website/src/js/wizard/checklist.js` and `website/src/js/lib/gh.js` are unchanged (checklist becomes the fallback only).

---

## 4. Attribution & licensing

### 4.1 The core problem: the bot is not the author

A PR opened with an installation token would otherwise record git authorship as the bot (`lorawan-devices-contributor-bot[bot] <…@users.noreply.github.com>`). That is wrong on three counts: it misattributes the intellectual contribution; it hides the human from `@Jaime-Trinidad` (the `/vendor` CODEOWNER who merges); and it breaks the CLA chain of custody, because today the human PR author is the party understood to have agreed to the CLA. The fix is the standard "machine writes, human authored" pattern: **split the git `author` and `committer`.**

### 4.2 Mechanism: `author` = verified contributor, `committer` = bot

`POST /repos/{owner}/{repo}/git/commits` accepts independent `author` and `committer` objects (`name` + `email` required, `date` optional) — the right path for the multi-file changeset. (The Contents API also accepts both but is one-file-per-call; prefer Git Data.) Set:
- `author` = the **verified contributor** (email proven via the Phase-2 magic link; name from the identity step);
- `committer` = the **bot** (the App's identity).

GitHub then renders the commit as **authored by the contributor, committed by the bot**:

```
Author:    Jane Engineer <jane.engineer@acme-iot.example>
Commit:    lorawan-devices-contributor-bot[bot] <NNNNNN+lorawan-devices-contributor-bot[bot]@users.noreply.github.com>

    Add Acme Corp ACME-100 (#1018)
```

**Verified badge:** a bot/API commit is auto-**"Verified"** only when it carries **no custom author, no custom committer, and no custom signature.** Because this flow deliberately sets a custom author *and* committer, the commit will be **Unverified** — expected and acceptable (`validate.yml` checks no signatures). A matching author email **does not** by itself produce a Verified badge; only a cryptographic GPG/SSH/S-MIME signature (or a no-custom-fields web/API commit) does. For the common account-less corporate contributor, use the real email as the author and rely on the commit trailers + the consent record (§4.5) as authoritative attribution rather than on GitHub account linkage.

### 4.3 Does THIS repo require a CLA or DCO? — CLA yes, DCO no

- **CLA required.** `README.md:62`: *"Contributors are required to sign the [Contributor License Agreement](https://gist.github.com/johanstokking/58081d646d6dd4f93b3d85cd5c62377c)."* This is the **only** contributor-agreement requirement.
- **No DCO.** No `Signed-off-by` requirement: the PR template (`.github/PULL_REQUEST_TEMPLATE.md`) does not ask for sign-off, there is no DCO/CLA-bot config in `.github/`, and a repo-wide grep matches only `README.md`.
- **Enforced socially, not by CI.** `validate.yml` checks schema/codec/image/format only; the reviewer is the human who ensures CLA coverage.

**Implication:** the bot must **capture CLA agreement explicitly and durably** and surface it to the reviewer — never quietly open PRs that bypass it.

1. Mandatory consent checkbox gating `finish()` (copy in §3.4), linking the exact gist.
2. **Consent is valid only once the email is verified** (Phase 2 magic link). Bind the two; persist the consent record (§4.5). The gist has no version string, so **snapshot its commit SHA / content hash at agreement time** so "which CLA they agreed to" is unambiguous.
3. Surface it in the PR body the bot POSTs — append to the wizard's `prBody` (`submit.js:249-254` / `update.js:731`):
   ```markdown
   ---
   Contributed via the LoRaWAN Device Wizard on behalf of:
   **Jane Engineer** <jane.engineer@acme-iot.example> (email verified)
   CLA agreed: 2026-06-15T10:32:11Z · CLA revision gist@<sha> · consent id: cns_01J…
   ```

> **MVP (no verification):** do **not** emit the "(email verified)" / "CLA agreed" block. Record at most *"CLA checkbox ticked — UNVERIFIED, self-asserted email"* and flag to the reviewer that the CLA is not yet defensibly attributable. See §2.6 — this resolves the contradiction between the anti-abuse MVP and this section. Get @johanstokking's sign-off before Phase 1 if CLA capture must be defensible from day one.

### 4.4 Commit trailers

Trailers go in the commit message body, RFC-822 `Key: Value`, after a blank line. Build `message` = `prTitle` + `\n\n` + short body + trailers.

**Submit** (subject `Add ${vendorName()} ${f.get('name')}`, `submit.js:248`):
```
Add Acme Corp ACME-100 (#1018)

New device contributed via the LoRaWAN Device Wizard.

Signed-off-by: Jane Engineer <jane.engineer@acme-iot.example>
```
**Update** (subject `Update ${vendorName} ${f.get('name')||state.modelId}`, `update.js:730`):
```
Update Acme Corp ACME-100 (#1018)

- Added firmware version 1.2.0 (EU868 profile)
- Updated product photo

Signed-off-by: Jane Engineer <jane.engineer@acme-iot.example>
```

- **`Signed-off-by:`** — optional belt-and-suspenders. This repo does **not** require DCO, but emitting a sign-off from the **verified** email makes the attribution self-describing inside `git log` (survives PR-body edits) and future-proofs a possible DCO bot. Derive it only from the verified identity; never present it as a substitute for the CLA (they certify different things). **Only emit once the magic link is confirmed.**
- **`Co-authored-by:`** — GitHub credits this person on the contributions graph *in addition* to the author; must be the **last** trailer(s), one per line, format `Co-authored-by: Name <email>`. **Drop it in the recommended default** (`author` = the contributor already) to avoid double-listing; use it only if you ever decide all bot commits should be uniformly bot-authored.
- **Never fabricate** either trailer for an unverified email — the verified email is the single source for all identity slots.

**Recommended default:** `author` = verified contributor, `committer` = bot, a `Signed-off-by` from the verified email, **no** `Co-authored-by`, and the CLA block in the PR body regardless (the CLA — not DCO — is the actual requirement).

### 4.5 Consent record (persisted before the PR)

One immutable record per submission, written **before** opening the PR, keyed by a `consent_id` that also appears in the PR body:

```json
{
  "consent_id": "cns_01J8Z…",
  "verified_email": "jane.engineer@acme-iot.example",
  "display_name": "Jane Engineer",
  "email_verified_at": "2026-06-15T10:30:02Z",
  "magic_link_token_hash": "sha256:…",
  "cla_agreed": true,
  "cla_revision": "gist:johanstokking/58081d…@<sha>",
  "cla_agreed_at": "2026-06-15T10:32:11Z",
  "ip": "203.0.113.7",
  "user_agent": "Mozilla/5.0 …",
  "wizard": "submit",
  "pr_url": "https://github.com/TheThingsNetwork/lorawan-devices/pull/NNNN",
  "commit_sha": "a1b2c3…"
}
```

Store the magic-link token **hashed** (never plaintext). Write the record **before** the PR POST, then patch in `pr_url`/`commit_sha` after, so a crash mid-flow never yields a PR with no consent record. The public `consent_id` lets a maintainer resolve a merged commit back to a verifiable record without exposing the store.

### 4.6 Preserving review / attribution norms

- The bot opens a **normal PR against `cfg.branch` (default `master`)** — never pushes to `master`, never self-merges. CODEOWNERS still routes `/vendor` to `@Jaime-Trinidad`; the App token has no merge/branch-protection-bypass ability.
- The PR body keeps the `.github/PULL_REQUEST_TEMPLATE.md` structure (Summary / Changes / Checklist for Reviewers — profileIDs ≠ vendorID, device listed in `index.yaml`, firmware not changed, ≥1 transparent image); the attribution/CLA block is **appended**, not substituted.
- Because the author is the human, the contributions graph and `git blame` credit the engineer, preserving the norm that the device-maker — not "the bot" — contributed the device.
- Add a label (e.g. `submitted/via-wizard`) and a one-line comment naming the verified contributor + `consent_id`, replacing the implicit "the PR author signed the CLA" assumption.

### 4.7 Privacy

The verified email is personal data ending up in three places:

- **Public, forever, in git history** (commit author / optional `Signed-off-by` / PR body). Irreversible and normal for OSS, but it must be **informed and consented** — hence the up-front disclosure copy in §3.4. For contributors who *do* have a GitHub account and want to hide their address, offer the `ID+username@users.noreply.github.com` pattern (public commit) while keeping the *verified real* email only in the private store. **The target audience is account-less corporate engineers who cannot use a noreply alias**, so the up-front "public and permanent" gate is the key control; alternatively, offer to place a **role/alias address** (e.g. `firmware@acme-iot.example`) in the public commit while keeping the personal verified email private.
- **Private, in the consent store.** Data-minimization: store only what CLA audit needs. **Retention:** purge **IP / User-Agent at 30–90 days**; retain the **consent fact** (email, name, timestamps, CLA revision) for the CLA-audit lifetime. Access-controlled; never exposed by the public static site.
- **In transit / tokens.** Single-use, short-TTL, stored hashed; the verification email carries no file bodies.
- **Legal basis & processors.** TTN is EU-rooted (The Things Network Foundation / The Things Industries B.V.) — treat under **GDPR**: lawful basis is explicit consent. The third-party **email sender** (Resend/Postmark/SES) and **Cloudflare KV** become **processors of EU personal data — each needs a DPA**. Provide an **erasure runbook** that acknowledges the **public git attribution cannot be rewritten** once merged (so the up-front disclosure is the real control); erasure honors the private store (IP/UA, contact record), not the on-chain git attribution.

---

## 5. Ops, cost & ownership

### 5.1 Hosting

The endpoint is small: receive the multipart POST, mint a down-scoped installation token, build a branch + commit via the REST API, open a PR; later, hold a little magic-link state. Needs outbound HTTPS to `api.github.com`, ~3 secrets, RS256 JWT signing, and (Phase 2) token state.

| Option | Fit | Notes |
|---|---|---|
| **Cloudflare Workers** (recommended) | Best | Same vendor as Turnstile; fast cold starts; `wrangler secret put`; KV/D1/Durable Objects for token + rate state. **RS256 signing must use WebCrypto** (`crypto.subtle.importKey`/`sign`), not a Node `jsonwebtoken` import — use a Workers-compatible path (e.g. `@octokit/auth-app` with WebCrypto) or sign the JWT manually. |
| **Cloudflare Pages Functions** | Good | Same runtime, but our site deploys via **GitHub Pages** (`pages.yml` → `gh-pages`), not Cloudflare Pages; colocating would mean moving/splitting site hosting. Not worth it for one endpoint. |
| **AWS Lambda + Function URL** | Workable | Node 22 matches CI; `jsonwebtoken` works natively; Secrets Manager. More moving parts (IAM, log group, separate console). Pick only if TTN mandates AWS. |

**Recommendation: Cloudflare Workers**, one Worker (`lorawan-devices-submit`), routed at e.g. `submit.devices.thethingsnetwork.org` (or a `*.workers.dev` URL for MVP). The wizard POSTs there; `renderChecklist` stays the fallback when the endpoint attribute is unset or the call errors.

> **Cross-section note on Workers limits.** Two backend tasks are *not* assumed to run cleanly in the V8 isolate: **(1) authoritative Prettier** (CPU-time/bundle limits — §1.9; prefer formatting YAML in the browser) and **(2) full image decode** (no Go runtime / native image libs — only PNG signature + dimension parsing is feasible, or bundle a WASM decoder; type/extension/decodability stay CI-only). Plan around these rather than assuming parity with `validate.js`.

### 5.2 Cost

A contribution endpoint for corporate device makers — tens to low-hundreds of submissions/month plus cheap reads. **Cloudflare Workers free tier = 100,000 requests/day**; paid = **$5/mo for 10M req/mo**, then $0.30/M. We sit inside the free tier; take the $5 plan only to lift CPU caps or add D1/Durable Objects for magic-link state. **Turnstile is free, unlimited challenges.** GitHub adds nothing. **Net: $0/mo for MVP, ~$5/mo once we want generous limits + KV/D1.**

GitHub-side **primary** capacity is a non-issue (5,000 req/hr floor), but per §1.4 the **secondary content-creation limit (80/min, 500/hr, 900 points/min, 100 concurrent)** is the real ceiling — design the create sequence and retries around it with `Retry-After` backoff.

### 5.3 Secrets

All as Cloudflare Worker secrets (`wrangler secret put`, encrypted, never in `wrangler.toml` or the repo):

1. **`GH_APP_PRIVATE_KEY`** — RS256 PEM, the crown jewel. Rotate via App settings → "Generate a private key" (multiple keys coexist → add-new-then-remove-old, zero downtime). Pair with **`GH_APP_ID`** and **`GH_INSTALLATION_ID`** (vars/secrets, not hardcoded).
2. **`TURNSTILE_SECRET_KEY`** — server-side siteverify key; the public **site key** lives in the wizard HTML (`data-` attribute).
3. **`MAGIC_LINK_SIGNING_SECRET`** *(Phase 2)* — HMAC secret, plus `RESEND_API_KEY` / `POSTMARK_TOKEN` for the sender. Not needed for MVP.

**Principle:** mint **short-lived, down-scoped installation tokens per request** (§1.1), never store a long-lived token, so a leak is time-boxed to ~1 h and limited to the one repo with contents+pull_requests write.

### 5.4 Observability

The endpoint is the first place in the system that *acts* (opens PRs), so it must be auditable. Log structured JSON (one line per request) to `console.log`, live via `wrangler tail`, retained via Workers Logs / Logpush to R2. Events:

- **`pr_opened`** — `{ event, vendor, model, kind, prNumber, prUrl, branch, baseSha, fileCount, contributorEmailHash, ts }`. **Hash the email** (no raw PII in logs). Log `baseSha` so a stale-base failure is diagnosable.
- **`submit_failed`** — `{ event, stage: 'token'|'merge-upstream'|'branch'|'commit'|'pr'|'validate', githubStatus, message, vendor, model, ts }`. The `stage` field matters because the sequence is multi-step (a 422 on the PR call usually means the branch has no diff or already has a PR).
- **`abuse_blocked`** — `{ event, reason: 'turnstile_fail'|'rate_limit'|'oversize'|'bad_path'|'index_edit_no_oldtext', ip, ts }`. Mirror `bin/validate.js`'s **lowercase-path** rule server-side and reject before committing; reject index `kind:'edit'` lacking `oldText` (§1.5).
- **`stale_base`** — when an update `edit`'s `oldText` mismatches the current blob (→ 409 for the firmware-bearing device YAML, §1.6).

Add lightweight metrics (Workers Analytics Engine, free, or counting log lines): submissions/day, success rate, p95 latency, abuse blocks/day. Alert via a Logpush filter → Slack webhook on `submit_failed` spikes or the global soft-control threshold (§2.4). `wrangler tail` + the bot's PR list suffice at MVP.

### 5.5 Org-level ownership (the critical-path blocker — same as Phase 2)

This requires a **TheThingsNetwork org admin**, not a repo contributor — the *identical* gate that motivated the bot reframe. An org admin must:

1. **Register the GitHub App** under TheThingsNetwork (Settings → Developer settings → GitHub Apps → New): **Contents R/W** + **Pull requests R/W** only (no webhook for MVP). Generate the private key (→ `GH_APP_PRIVATE_KEY`); record the App ID. *(Registering an org App is org-admin-only — the same approval wall that killed contributor OAuth.)*
2. **Install the App on the single repo** `TheThingsNetwork/lorawan-devices` (not org-wide). Record the installation ID. *(Option A only; Option B installs on the bot fork instead.)*
3. **Provision/own the Cloudflare account** hosting the Worker; hold the secrets. Decide TTN- vs TTI-owned.
4. **Decide bot identity & CLA stance** — the bot's display name, and confirmation from **@johanstokking** (CODEOWNER of `/.github`, `/LICENSE`) that a magic-link-captured email is an acceptable CLA-attribution mechanism for bot-authored PRs (and the MVP question of whether *unverified* email is acceptable at all — §2.6/§4.3).

**Until 1–3 are done by a TTN admin, no production go-live is possible** — raise this with the org early, in parallel with engineering. Engineering can build/test the entire flow against a **fork** (`wienke/lorawan-devices`) with a personal App install, needing **no** TTN-admin involvement and staying off the upstream/`master` path.

---

## 6. Phased rollout

**Phase 0 — Backend against a fork (no org dependency, no production risk).**
Stand up the Worker pointed at a fork via the existing `cfg`/push-target knob (`ghConfig` reads `data-gh-repo`/`data-gh-branch`, `gh.js:5-8`). Land the **photo accessor** (`getFile`) and the **submit-wizard index-merge** (§3.2 — the data-loss fix), then branch the two call sites (`submit.js:247`, `update.js:729`) so that when `data-submit-api` is present they POST the multipart payload; otherwise fall through to `renderChecklist` unchanged.
*Exit criteria:* a submit run **and** an update run each open a real PR on the fork; **a new-vendor submit and an existing-vendor submit each leave `vendor/index.yaml` and `vendor/<v>/index.yaml` fully intact** (the merged index is correct — explicitly verify the catalog is not truncated); the PR passes the fork's `validate.yml` (Ajv, codec execution, image checks) **and** `prettier --check` (YAML) with no manual edits; the photo lands as real binary; **fork-PR CI actually runs** (confirm the public-repo approval behavior — §1.2); the manual checklist still works when the endpoint attribute is unset.

**Phase 1 — MVP on TTN (after org steps 1–3), abuse-gated, GitHub still single source of truth.**
Point the production wizard's `data-submit-api` at the real Worker; App installed (Option A on `TheThingsNetwork/lorawan-devices`, or Option B fork); Turnstile on the final step + server-side siteverify; per-IP rate limit + **soft** global control + payload caps; `pr_opened`/`submit_failed`/`abuse_blocked` logging. **No CLA trailer** — email is collected as a self-asserted, **unverified** field with a visible "by submitting you agree to the CLA" line and a reviewer-facing "unverified" flag (§2.6/§4.3). PRs land for `@Jaime-Trinidad` to review and merge; nothing auto-merges.
*Exit criteria:* a contributor with **no GitHub login** completes submit and update end-to-end; the bot PR passes CI clean; the PR is reviewed and merged by a human; abuse controls demonstrably block a scripted flood in a test **without** the global control denying service to legitimate users; ops see every opened PR in logs; **@johanstokking has signed off** that an unverified-CLA MVP is acceptable *or* magic-link (Phase 2) is pulled forward to gate go-live.

**Phase 2 — Magic-link identity.**
Add the email-verification step ahead of the `finish()` POST. Flow: wizard collects email → Worker emails a single-use, short-TTL token (KV/D1 holds the nonce + pending payload) → contributor confirms at `/api/verify` → the bot creates the branch/commit (author = verified contributor) and opens the PR, returning the URL synchronously. Bind rate limits to verified email; emit the `Signed-off-by` + CLA block (§4); write the consent record before the PR.
*Exit criteria:* a PR cannot be opened without a verified email; the verified email is the CLA-attributed party in the commit author + PR body; replay of a used/expired token is rejected and logged; @johanstokking confirms this satisfies CLA capture.

**Phase 3 — Polish.**
Firmware/base-drift handling hardened end-to-end (per-file `oldText` vs current blob → 409 "reload" for the firmware-bearing YAML, surfaced clearly in the UI — §1.6); de-dup (detect an open PR for the same vendor/model and offer to update it — §1.7); richer in-wizard status; optional Slack/Airtable notification on `pr_opened`.
*Exit criteria:* stale-base / firmware-regression submissions produce a clear user-facing message rather than a silent overwrite or a 422; submitting twice for the same device is handled gracefully; operators get a per-PR notification.

### 6.1 Coexistence with staging-only / no-production-without-approval

- **Phase 0 targets a fork** — no PR, branch, or commit touches `TheThingsNetwork/lorawan-devices`; zero production surface; no org-admin needed to start building.
- The bot **opens PRs only — never pushes to `master`, never self-merges.** Merge stays a human CODEOWNER action (`@Jaime-Trinidad` for `/vendor`). So even in Phase 1+, opening a PR does **not** trigger `release.yml` (which fires only on push-to-`master`, post-merge). PRs do trigger `validate.yml` — the desired gate.
- **Flipping the production wizard's `data-submit-api` to the real TTN Worker, removing the staging `noindex`, and registering/installing the App on the upstream repo are explicit production go-live actions requiring user approval** under the MEMORY rule — they belong at the Phase 0→1 boundary and must not be done implicitly. The staging redesign site keeps its endpoint **unset** (manual checklist only) until that approval, so staging exercises the UI without any bot touching upstream.

---

## 7. Open questions / decisions for the org

1. **Branch strategy — Option A or B?** Same-repo branch (needs the org to install the App upstream with Contents write; **no fork-PR CI approval gate**) vs bot-owned fork (zero upstream grant, but first fork PRs need a maintainer "Approve and run," plus fork-sync/collision handling). Decide before Phase 1. *Recommendation: develop on B, ship A in production if maintainers will install upstream.*
2. **MVP CLA stance (@johanstokking).** Is a bot-opened PR acceptable with an **unverified, self-asserted** email and **no** CLA attestation in Phase 1, or must magic-link verification gate go-live? (Resolves whether Phase 2 is pulled forward.)
3. **Cloudflare account ownership** — TTN-owned vs TTI-owned; who holds `GH_APP_PRIVATE_KEY`.
4. **Bot identity** — display name / email for the App (the `committer` and `[bot]` login).
5. **Public-email policy for account-less contributors** — accept "real email is public & permanent" with up-front disclosure (default), or offer a role/alias address in the public commit while keeping the verified personal email private?
6. **Data retention & DPA** — confirm IP/UA retention (30–90 days) and consent-fact lifetime; sign DPAs with the chosen email provider and (if applicable) Cloudflare KV for EU personal data.
7. **Prettier pinning** — pin CI to an exact Prettier version (currently `^2.8.8`) so wherever formatting runs (browser or server) the output is byte-identical to the `--check` gate.
8. **Firmware-drift policy** — confirm the hard-409-reload on a drifted firmware-bearing device YAML (§1.6) is the desired UX vs the riskier "proceed and note."
9. **Labels** — verify empirically (via `X-Accepted-GitHub-Permissions`) whether PR labeling works with Pull-requests write alone before deciding whether to request Issues write.

---

### Items to confirm empirically before production (all VERIFIED-correct in design review unless noted)

The GitHub App model, the Git Data multi-file-commit-with-base64-PNG sequence, the author/committer split, `merge-upstream {branch:master}`, the `git/ref/heads/{branch}` read path, the `pulls?head=user:branch` filter, the ~1 h token expiry with body-scoped permissions, the Turnstile `siteverify` endpoint/shape/~300 s token, the 100 MB Cloudflare body limit, gist-revision-by-SHA, and the `ID+USERNAME@users.noreply.github.com` format are all confirmed against current docs, as are the code hook points (`submit.js:247`, `update.js:729`, the `photo-check.js` `getFile` accessor, the `gh.js` 7000-char ceiling, `.prettierrc`, the `validate.yml` format gate). **Still to confirm by testing:** (a) **fork-PR CI approval** behavior on the public repo (§1.2); (b) **PR labeling** with Pull-requests-write only (§1.1); (c) **Prettier + Workers** feasibility, or commit to browser-side formatting (§1.9); (d) the exact **secondary-rate-limit** points/quotas under load (§1.4).