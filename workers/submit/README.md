# lorawan-devices submit worker

A small Cloudflare Worker that lets device makers contribute through the
website wizards **without logging into GitHub**. The wizard POSTs the
generated files; this Worker authenticates to GitHub as a **GitHub App**
(server-to-server), builds one commit (text files + the product PNG) via the
Git Data API, and **opens a pull request on the contributor's behalf**. The
contributor only provides a name + email and accepts the CLA.

Nothing auto-merges. CI (`validate.yml`) and the `/vendor` CODEOWNER are the
real gate — this Worker just removes the manual fork/branch/PR clicks. If the
Worker is unreachable or not configured, the wizard falls back to the existing
manual GitHub checklist with no behavioural change.

Full design rationale: [`doc/issue-1018-low-touch-contributions-proposal.md`](../../doc/issue-1018-low-touch-contributions-proposal.md).

## "Develop on B, ship A"

The push target is configurable so you can build and test against a fork and
later ship in-repo with a one-line change:

| | `PUSH_REPO` | `UPSTREAM_REPO` | Behaviour |
|---|---|---|---|
| **Option B** (dev/staging) | `ttn-device-bot/lorawan-devices` | `TheThingsNetwork/lorawan-devices` | sync fork → push branch to fork → cross-fork PR into upstream |
| **Option A** (production) | `TheThingsNetwork/lorawan-devices` | `TheThingsNetwork/lorawan-devices` | push branch to upstream → in-repo PR |

> ⚠️ Verify **before** committing to Option B: on a public repo, the **first**
> PRs from a new fork do **not** auto-run workflows — a maintainer must click
> "Approve and run". If CI doesn't run, "CI is the safety net" doesn't hold.
> Option A has no such gate.

## One-time setup

### 1. Register the GitHub App

GitHub → Settings → Developer settings → **GitHub Apps → New**.

- **Repository permissions** (everything else "No access"):
  - **Contents:** Read & write
  - **Pull requests:** Read & write
  - (Metadata: Read-only is force-enabled.)
- Webhook: not needed for the MVP — uncheck "Active".
- Generate a **private key** (downloads a PKCS#1 `.pem`) and note the **App ID**.
- **Install** the App on the push repo (the fork for Option B, or upstream for
  Option A) and note the **Installation ID** (in the install URL).

For development you can register the App under your own account and install it
on your `lorawan-devices` fork — no org admin required. Production (installing
on `TheThingsNetwork/lorawan-devices`) needs a TTN org admin.

### 2. Convert the private key to PKCS#8

WebCrypto (the Workers runtime) needs PKCS#8, but GitHub issues PKCS#1:

```sh
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt \
  -in your-app.private-key.pem -out app.pkcs8.pem
```

### 3. Configure and set secrets

Edit `wrangler.toml` vars (`PUSH_REPO`, `UPSTREAM_REPO`, `ALLOWED_ORIGINS`,
`BOT_*`, `GH_INSTALLATION_ID`). Then set the secrets:

```sh
wrangler secret put GH_APP_ID            # the numeric App ID
wrangler secret put GH_APP_PRIVATE_KEY   # paste the PKCS#8 PEM contents
# optional, enables the Turnstile gate:
wrangler secret put TURNSTILE_SECRET
```

Optional rate limiting:

```sh
wrangler kv:namespace create RL          # then add the binding in wrangler.toml
```

### 4. Deploy and wire the site

```sh
npm install
npm run deploy        # prints the worker URL, e.g. https://lorawan-devices-submit.<you>.workers.dev
```

Point the wizards at it by setting the Hugo site param (e.g. in
`website/config/staging/config.toml` or the relevant environment):

```toml
[params]
  submitApi = "https://lorawan-devices-submit.<you>.workers.dev"
  # turnstileKey = "0x..."   # public Turnstile site key, if using Turnstile
```

The templates already read `.Site.Params.submitApi` /
`.Site.Params.turnstileKey` into `data-submit-api` / `data-turnstile-key` on
the wizard root. Leave `submitApi` unset to keep the manual-checklist-only
behaviour (the default for the noindex staging build until you opt in).

## Local development

```sh
npm install
# put dev secrets in .dev.vars (gitignored), then:
npm run dev
```

`.dev.vars` example:

```
GH_APP_ID=123456
GH_APP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GH_INSTALLATION_ID=12345678
```

`GET /health` returns the configured push/upstream repos without touching GitHub.

## Request contract

`POST /api/submit`, `multipart/form-data`:

- `payload` — JSON: `{ phase, wizardKind, repo, base, vendorId, modelId, prTitle, prBody, files: [{ path, kind, body, oldText, reformatted, validateKind, note }] }`
- `photo` — the binary PNG (for the `kind:"binary"` entry)
- `name`, `email`, `cla` — contributor identity + consent
- `turnstileToken` — when Turnstile is enabled

Success: `200 { ok:true, pr:{ number, url } }`. Errors carry a contributor-safe
`message`: `400` malformed / fragment index edit, `409` base drift, `413` too
large, `422` no changes, `429` rate-limited, `502` GitHub upstream error.

## What the Worker validates (and what it can't)

Enforced here (security boundary): path safety (under `vendor/`, no traversal),
size caps (2 MB total, 256 KB/file), PNG signature + dimensions, refusal to
overwrite an `index.yaml` with a fragment (no `oldText`), and a base-drift /
firmware-immutability 409 on stale device-file edits.

**Not** reproduced here (V8 isolate has no Go runtime / native image libs):
codec execution + structural-equality, cross-file name-uniqueness, full image
decode, and authoritative Prettier. Those stay **CI-only** — which is fine,
because CI is the real gate and nothing auto-merges. Don't claim server-side
re-validation makes a CI failure impossible.

## Roadmap (from the proposal)

- **MVP (this scaffold):** Turnstile + per-IP/soft-global rate limits; email
  **self-asserted** → **no CLA-acceptance trailer** is written (an unverified
  email would be a forgeable attestation). Author = contributor, committer =
  bot, `Signed-off-by` from the contributor.
- **Phase 2 — magic-link:** `/api/submit` persists a pending submission + emails
  a single-use link; `/api/verify` opens the PR only after the email is
  verified. Then bind rate limits to the verified email and emit the verified
  CLA trailer (see `buildCommitMessage`). Needs a KV/Durable Object store and a
  transactional email provider.
