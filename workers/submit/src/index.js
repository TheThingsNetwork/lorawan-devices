// lorawan-devices submit worker
// ------------------------------------------------------------------
// Receives the wizard's generated files (multipart POST), authenticates to
// GitHub as a GitHub App (installation token, server-to-server — the
// contributor never logs in), builds one atomic commit via the Git Data API
// (text files + the binary PNG), and opens a pull request on the
// contributor's behalf. The commit author is the verified* contributor; the
// committer is the bot.
//
// "Develop on B, ship A" is a single env flip:
//   - Option B (fork):  PUSH_REPO = "ttn-device-bot/lorawan-devices"
//                       UPSTREAM_REPO = "TheThingsNetwork/lorawan-devices"
//     → sync the fork (merge-upstream), push the branch to the fork, open a
//       cross-fork PR into upstream:master.
//   - Option A (in-repo): PUSH_REPO = UPSTREAM_REPO = "TheThingsNetwork/lorawan-devices"
//     → push the branch directly to upstream, open a same-repo PR.
//
// MVP scope (no magic-link): email is self-asserted. Nothing auto-merges; CI
// (validate.yml) + the /vendor CODEOWNER are the real gate. See README.md for
// the magic-link phase and the security model.
//
// * In the MVP the email is NOT verified; per the proposal the MVP must not
//   emit a CLA-acceptance trailer. We therefore set the commit author to the
//   self-asserted name/email but DO NOT write a "CLA-Accepted-By" trailer
//   until magic-link verification is live (see buildCommitMessage).

const UA = 'lorawan-devices-submit-worker'
const GH = 'https://api.github.com'
const API_VERSION = '2022-11-28'

const MAX_TOTAL_BYTES = 2 * 1024 * 1024 // 2 MB request ceiling
const MAX_TEXT_BYTES = 256 * 1024 // per text file
const MAX_PNG_DIM = 2000

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const cors = corsHeaders(origin, env)

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

    const url = new URL(request.url)
    if (request.method === 'POST' && url.pathname === '/api/submit') {
      try {
        const result = await handleSubmit(request, env)
        return json(result, 200, cors)
      } catch (e) {
        const status = e.status || 500
        // Don't leak internals; e.public is the contributor-facing message.
        return json({ message: e.public || 'Internal error while opening the pull request.' }, status, cors)
      }
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ ok: true, pushRepo: env.PUSH_REPO, upstream: env.UPSTREAM_REPO }, 200, cors)
    }

    return json({ message: 'Not found' }, 404, cors)
  },
}

/* ----------------------------- request handling ---------------------------- */

async function handleSubmit(request, env) {
  const form = await request.formData()
  const payloadRaw = form.get('payload')
  if (typeof payloadRaw !== 'string') throw httpError(400, 'Missing payload.')

  let p
  try {
    p = JSON.parse(payloadRaw)
  } catch (e) {
    throw httpError(400, 'Malformed payload.')
  }

  const email = String(form.get('email') || '').trim()
  const name = String(form.get('name') || '').trim()
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw httpError(400, 'A name and a valid email are required.')

  // Turnstile (when configured). The MVP's real anti-abuse teeth are this +
  // per-IP rate limits; per-email limits only bite once magic-link is live.
  if (env.TURNSTILE_SECRET) {
    const token = String(form.get('turnstileToken') || '')
    await verifyTurnstile(token, request.headers.get('CF-Connecting-IP'), env)
  }

  await rateLimit(request, env, email, p)

  const files = Array.isArray(p.files) ? p.files : []
  if (!files.length) throw httpError(400, 'No files to submit.')

  // ---- server-side validation (security boundary; CI is the real gate) ----
  let total = payloadRaw.length
  for (const f of files) {
    assertSafePath(f.path)
    if (f.kind === 'binary') continue
    if (typeof f.body !== 'string') throw httpError(400, `Missing body for ${f.path}.`)
    total += f.body.length
    if (f.body.length > MAX_TEXT_BYTES) throw httpError(413, `${f.path} is too large.`)
    // Catalog-corruption guard: an index edit MUST be a full file (carry
    // oldText), never an append-fragment — committing a fragment verbatim
    // would overwrite the real index. The submit wizard now sends full files.
    if (f.kind === 'edit' && /(^|\/)index\.yaml$/.test(f.path) && !f.oldText) {
      throw httpError(400, `Refusing to overwrite ${f.path} with a partial fragment.`)
    }
  }
  if (total > MAX_TOTAL_BYTES) throw httpError(413, 'Submission is too large.')

  // Photo: read bytes, re-check PNG signature + dimensions (Workers can't do a
  // full image decode — that stays CI-only).
  const binaryEntry = files.find((f) => f.kind === 'binary')
  const photo = form.get('photo')
  let photoBytes = null
  if (binaryEntry) {
    if (!photo || typeof photo === 'string') throw httpError(400, 'Product photo is required.')
    photoBytes = new Uint8Array(await photo.arrayBuffer())
    if (photoBytes.byteLength > MAX_TOTAL_BYTES) throw httpError(413, 'Photo is too large.')
    assertPng(photoBytes)
  }

  // Mint a down-scoped installation token (repo + contents/pull_requests only).
  const token = await installationToken(env)

  const base = p.base && /^[\w.\/-]+$/.test(p.base) ? p.base.split('/').pop() : 'master'

  // Option B: bring the fork's base branch up to date with upstream first.
  if (env.PUSH_REPO !== env.UPSTREAM_REPO) {
    await gh(token, 'POST', `/repos/${env.PUSH_REPO}/merge-upstream`, { branch: base }).catch(async (e) => {
      // 409 = fork diverged; hard-reset the fork's base to the upstream tip.
      if (e.status === 409) {
        const up = await gh(token, 'GET', `/repos/${env.UPSTREAM_REPO}/git/ref/heads/${base}`)
        await gh(token, 'PATCH', `/repos/${env.PUSH_REPO}/git/refs/heads/${base}`, { sha: up.object.sha, force: true })
      } else {
        throw e
      }
    })
  }

  // Base-drift / firmware-immutability guard for UPDATE edits to the device
  // file (the one that carries the append-only firmwareVersions). validate.js
  // has no view of history, so a verbatim overwrite of a stale base could
  // silently drop a firmware version.
  for (const f of files) {
    if (f.kind === 'edit' && f.validateKind === 'device' && f.oldText) {
      const current = await getFileText(token, env.UPSTREAM_REPO, f.path, base)
      if (current != null && current !== f.oldText) {
        throw httpError(409, 'This device changed on GitHub since you loaded it — please reload and re-apply your edits.')
      }
    }
  }

  // ---- build the commit (Git Data API) ----
  const ref = await gh(token, 'GET', `/repos/${env.PUSH_REPO}/git/ref/heads/${base}`)
  const baseSha = ref.object.sha
  const baseCommit = await gh(token, 'GET', `/repos/${env.PUSH_REPO}/git/commits/${baseSha}`)

  const treeEntries = []
  for (const f of files) {
    if (f.kind === 'binary') continue
    const blob = await gh(token, 'POST', `/repos/${env.PUSH_REPO}/git/blobs`, { content: f.body, encoding: 'utf-8' })
    treeEntries.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha })
  }
  if (binaryEntry && photoBytes) {
    const blob = await gh(token, 'POST', `/repos/${env.PUSH_REPO}/git/blobs`, { content: bytesToBase64(photoBytes), encoding: 'base64' })
    treeEntries.push({ path: binaryEntry.path, mode: '100644', type: 'blob', sha: blob.sha })
  }

  const tree = await gh(token, 'POST', `/repos/${env.PUSH_REPO}/git/trees`, { base_tree: baseCommit.tree.sha, tree: treeEntries })

  const commit = await gh(token, 'POST', `/repos/${env.PUSH_REPO}/git/commits`, {
    message: buildCommitMessage(p, name, email),
    tree: tree.sha,
    parents: [baseSha],
    author: { name, email },
    committer: { name: env.BOT_NAME || 'lorawan-devices bot', email: env.BOT_EMAIL || 'bot@users.noreply.github.com' },
  })

  const branch = `wizard/${slug(p.vendorId)}/${slug(p.modelId)}-${randSuffix()}`
  await gh(token, 'POST', `/repos/${env.PUSH_REPO}/git/refs`, { ref: `refs/heads/${branch}`, sha: commit.sha })

  const pushOwner = env.PUSH_REPO.split('/')[0]
  const head = env.PUSH_REPO === env.UPSTREAM_REPO ? branch : `${pushOwner}:${branch}`

  let pr
  try {
    pr = await gh(token, 'POST', `/repos/${env.UPSTREAM_REPO}/pulls`, {
      title: p.prTitle || `Add ${p.vendorId}/${p.modelId}`,
      body: buildPrBody(p, name, email),
      head,
      base,
      maintainer_can_modify: true,
    })
  } catch (e) {
    if (e.status === 422 && /No commits between/i.test(e.detail || '')) {
      throw httpError(422, 'No changes detected — nothing to submit.')
    }
    throw e
  }

  return { ok: true, pr: { number: pr.number, url: pr.html_url } }
}

/* --------------------------------- GitHub ---------------------------------- */

async function gh(token, method, path, body) {
  const res = await fetch(`${GH}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': UA,
      'X-GitHub-Api-Version': API_VERSION,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  const text = await res.text()
  let data = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch (e) {
    /* non-JSON */
  }
  if (!res.ok) {
    const err = httpError(res.status === 403 || res.status === 429 ? 429 : 502, `GitHub error (${res.status}).`)
    err.status = res.status === 409 ? 409 : err.status
    err.detail = data.message || text
    throw err
  }
  return data
}

async function getFileText(token, repo, path, ref) {
  try {
    const res = await fetch(`${GH}/repos/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.raw+json', 'User-Agent': UA, 'X-GitHub-Api-Version': API_VERSION },
    })
    if (res.status === 404) return null
    if (!res.ok) return null
    return await res.text()
  } catch (e) {
    return null
  }
}

// Down-scoped installation token: limited to the push repo and only the two
// permissions, so a leak is time-boxed (~1h) and minimally capable.
async function installationToken(env) {
  const jwt = await appJWT(env.GH_APP_ID, env.GH_APP_PRIVATE_KEY)
  const res = await fetch(`${GH}/app/installations/${env.GH_INSTALLATION_ID}/access_tokens`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}`, Accept: 'application/vnd.github+json', 'User-Agent': UA, 'X-GitHub-Api-Version': API_VERSION, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repositories: [env.PUSH_REPO.split('/')[1]],
      permissions: { contents: 'write', pull_requests: 'write' },
    }),
  })
  if (!res.ok) {
    const err = httpError(502, 'Could not authenticate the submit service to GitHub.')
    err.detail = await res.text()
    throw err
  }
  return (await res.json()).token
}

/* ----------------------------- JWT (RS256/PKCS8) --------------------------- */
// GitHub App private keys are PKCS#1 by default ("BEGIN RSA PRIVATE KEY").
// WebCrypto needs PKCS#8 — convert once with:
//   openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in app.private-key.pem -out app.pkcs8.pem
// and store the PKCS#8 PEM as GH_APP_PRIVATE_KEY.

async function appJWT(appId, pem) {
  const now = Math.floor(Date.now() / 1000)
  const header = b64urlStr(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = b64urlStr(JSON.stringify({ iat: now - 60, exp: now + 540, iss: String(appId) }))
  const data = `${header}.${payload}`
  const key = await importPkcs8(pem)
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(data))
  return `${data}.${b64url(new Uint8Array(sig))}`
}

async function importPkcs8(pem) {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '')
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0))
  return crypto.subtle.importKey('pkcs8', der.buffer, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign'])
}

/* ------------------------------ commit content ----------------------------- */

function buildCommitMessage(p, name, email) {
  const subject = (p.prTitle || `Add ${p.vendorId}/${p.modelId}`).split('\n')[0]
  const lines = [subject, '', 'Contributed via the LoRaWAN Device Wizard.']
  // MVP: email is self-asserted (not verified) → no CLA trailer, but a
  // Signed-off-by from the contributor keeps authorship self-describing.
  // Once magic-link verification is live, this is the place to add the
  // verified-CLA trailer (see README).
  lines.push('', `Signed-off-by: ${name} <${email}>`)
  return lines.join('\n')
}

function buildPrBody(p, name, email) {
  const body = p.prBody || ''
  const attribution = [
    '',
    '---',
    `Contributed via the LoRaWAN Device Wizard on behalf of **${name}** <${email}>.`,
    '_Email is self-asserted (not yet verified) — reviewer please confirm CLA coverage._',
  ].join('\n')
  return body + '\n' + attribution
}

/* -------------------------------- validation ------------------------------- */

function assertSafePath(path) {
  if (typeof path !== 'string' || !path) throw httpError(400, 'Missing file path.')
  if (path.startsWith('/') || path.includes('..') || path.includes('\\')) throw httpError(400, `Unsafe path: ${path}`)
  if (!path.startsWith('vendor/')) throw httpError(400, `Paths must live under vendor/: ${path}`)
  if (path.startsWith('vendor/') && /\.github\//.test(path)) throw httpError(400, 'Disallowed path.')
}

function assertPng(bytes) {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  for (let i = 0; i < sig.length; i++) {
    if (bytes[i] !== sig[i]) throw httpError(400, 'Product photo must be a PNG.')
  }
  // IHDR width/height are big-endian uint32 at byte offsets 16 and 20.
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const w = dv.getUint32(16)
  const h = dv.getUint32(20)
  if (w === 0 || h === 0 || w > MAX_PNG_DIM || h > MAX_PNG_DIM) throw httpError(400, `Photo must be 1–${MAX_PNG_DIM}px on each side.`)
}

/* ------------------------------ Turnstile / RL ----------------------------- */

async function verifyTurnstile(token, ip, env) {
  if (!token) throw httpError(400, 'Verification challenge not completed.')
  const fd = new FormData()
  fd.append('secret', env.TURNSTILE_SECRET)
  fd.append('response', token)
  if (ip) fd.append('remoteip', ip)
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: fd })
  const data = await res.json().catch(() => ({}))
  if (!data.success) throw httpError(403, 'Verification failed — please try again.')
}

// KV-backed rate limiting. Bind a KV namespace as RL in wrangler.toml to
// enable; without it this is a no-op (fine for local dev). Per-IP + a soft
// global control are the load-bearing limits in the MVP (see README).
async function rateLimit(request, env, email, p) {
  if (!env.RL) return
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const hour = Math.floor(Date.now() / 3600000)
  const checks = [
    { key: `ip:${ip}:${hour}`, limit: 20, ttl: 3600 },
    { key: `global:${Math.floor(Date.now() / 86400000)}`, limit: 50, ttl: 86400, soft: true },
  ]
  for (const c of checks) {
    const n = parseInt((await env.RL.get(c.key)) || '0', 10)
    if (n >= c.limit && !c.soft) throw httpError(429, 'Too many submissions — please try again later.')
    if (n >= c.limit && c.soft) {
      // Soft global control: don't deny service to everyone; just log.
      console.log(JSON.stringify({ event: 'global_threshold', key: c.key, n }))
    }
    await env.RL.put(c.key, String(n + 1), { expirationTtl: c.ttl })
  }
}

/* --------------------------------- helpers --------------------------------- */

function slug(s) {
  return String(s || 'device')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'device'
}

function randSuffix() {
  const b = new Uint8Array(4)
  crypto.getRandomValues(b)
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

function bytesToBase64(bytes) {
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  return btoa(bin)
}

function b64url(bytes) {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlStr(s) {
  return b64url(new TextEncoder().encode(s))
}

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)
  const ok = allowed.length === 0 || allowed.includes(origin)
  return {
    'Access-Control-Allow-Origin': ok && origin ? origin : allowed[0] || '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...headers } })
}

function httpError(status, publicMessage) {
  const e = new Error(publicMessage)
  e.status = status
  e.public = publicMessage
  return e
}
