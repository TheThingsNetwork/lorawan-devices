// One-click submit: POST the wizard's generated files to the bot backend,
// which opens a pull request on the contributor's behalf (GitHub App, no
// contributor login). Renders its own UI into [data-backend-panel] and, on
// any failure or user opt-out, calls fallback() to drop into the manual
// GitHub checklist — so GitHub stays the single source of truth and a
// no-backend deployment behaves exactly as before.
//
// MVP scope: collects name + email + CLA consent (and a Turnstile token when
// a site key is configured) and opens the PR directly. The email is
// self-asserted in this phase; magic-link verification is a later phase and
// slots in without changing this contract (see the worker README).

import { turnstileKey } from '../lib/backend'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const CLA_URL = 'https://gist.github.com/johanstokking/58081d646d6dd4f93b3d85cd5c62377c'
const TIMEOUT_MS = 30000

// opts: { root, apiBase, cfg:{repo,branch}, meta:{prTitle,prBody}, photoFile,
//         vendorId, modelId, wizardKind:'submit'|'update',
//         buildFiles: () => Promise<files[]>, fallback: () => void }
export const submitViaBackend = (opts) => {
  const { root, apiBase, cfg, meta, photoFile, vendorId, modelId, wizardKind, buildFiles, fallback } = opts
  const panel = root.querySelector('[data-backend-panel]')
  if (!panel) {
    fallback()
    return
  }

  const manualBits = [...root.querySelectorAll('[data-manual-only]')]
  const showManual = (on) => manualBits.forEach((el) => (el.hidden = !on))

  const toManual = () => {
    panel.hidden = true
    panel.innerHTML = ''
    showManual(true)
    fallback()
  }

  showManual(false)
  panel.hidden = false
  renderConsent()

  function renderConsent() {
    const tsKey = turnstileKey(root)
    panel.innerHTML = `
      <div class="be-consent">
        <p class="be-lede">We open the pull request on <strong>${cfg.repo}</strong> for you — no GitHub account needed. Confirm who's contributing:</p>
        <div class="s-grid">
          <div class="s-field"><label>Your name</label><input data-be="name" placeholder="Jane Engineer" autocomplete="name" /></div>
          <div class="s-field"><label>Email</label><input data-be="email" type="email" placeholder="jane@acme.example" autocomplete="email" /><span class="s-hint">Recorded as the contribution author — it appears publicly and permanently in the commit, as is standard for open-source contributions.</span></div>
        </div>
        <label class="be-cla"><input type="checkbox" data-be="cla" /><span>I have read and agree to the <a href="${CLA_URL}" target="_blank" rel="noopener">Contributor License Agreement</a>, and I'm authorized to license this device data, codec and image under Apache-2.0.</span></label>
        ${tsKey ? `<div class="cf-turnstile" data-sitekey="${tsKey}"></div>` : ''}
        <div class="be-actions">
          <button class="btn btn-primary" data-be-submit disabled>⚡ Submit — we open the PR for you</button>
        </div>
        <p class="s-hint">Prefer to do it on GitHub yourself? <a href="#" data-be-manual>Use the manual checklist</a> instead.</p>
        <p class="be-error" data-be-error hidden></p>
      </div>`

    const nameEl = panel.querySelector('[data-be="name"]')
    const emailEl = panel.querySelector('[data-be="email"]')
    const claEl = panel.querySelector('[data-be="cla"]')
    const submitBtn = panel.querySelector('[data-be-submit]')

    const sync = () => {
      submitBtn.disabled = !(nameEl.value.trim() && EMAIL_RE.test(emailEl.value.trim()) && claEl.checked)
    }
    ;[nameEl, emailEl].forEach((el) => el.addEventListener('input', sync))
    claEl.addEventListener('change', sync)

    panel.querySelector('[data-be-manual]').addEventListener('click', (e) => {
      e.preventDefault()
      toManual()
    })

    if (tsKey && window.turnstile) {
      try {
        window.turnstile.render(panel.querySelector('.cf-turnstile'))
      } catch (e) {
        /* widget renders on its own once the script loads */
      }
    }

    submitBtn.addEventListener('click', () => {
      const turnstileToken = (panel.querySelector('[name="cf-turnstile-response"]') || {}).value || ''
      if (tsKey && !turnstileToken) {
        const box = panel.querySelector('[data-be-error]')
        box.hidden = false
        box.textContent = 'Please complete the verification challenge first.'
        return
      }
      submit({ name: nameEl.value.trim(), email: emailEl.value.trim(), turnstileToken })
    })
  }

  async function submit({ name, email, turnstileToken }) {
    panel.innerHTML = `<div class="be-progress"><span class="be-spinner" aria-hidden="true"></span><p>Uploading your files and opening the pull request…</p></div>`

    let files
    try {
      files = await buildFiles()
    } catch (e) {
      renderError(`Could not assemble the files from GitHub (${e.message || e}). You can still open the pull request yourself.`)
      return
    }

    const fd = new FormData()
    fd.append(
      'payload',
      JSON.stringify({
        phase: 'mvp',
        wizardKind,
        repo: cfg.repo,
        base: cfg.branch,
        vendorId,
        modelId,
        prTitle: meta.prTitle,
        prBody: meta.prBody,
        files: files.map((f) => ({
          path: f.path,
          kind: f.kind,
          body: f.body,
          oldText: f.oldText,
          reformatted: !!f.reformatted,
          validateKind: f.validateKind,
          note: f.note,
        })),
      }),
    )
    if (photoFile) fd.append('photo', photoFile, photoFile.name)
    fd.append('name', name)
    fd.append('email', email)
    fd.append('cla', 'true')
    if (turnstileToken) fd.append('turnstileToken', turnstileToken)

    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(`${apiBase}/api/submit`, { method: 'POST', body: fd, signal: ctrl.signal })
      clearTimeout(timer)
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.pr) {
        renderError(data.message || `The submit service returned an error (HTTP ${res.status}).`)
        return
      }
      renderSuccess(data.pr)
    } catch (e) {
      clearTimeout(timer)
      renderError(e.name === 'AbortError' ? 'The submit service timed out — please try again.' : `Could not reach the submit service (${e.message || e}).`)
    }
  }

  function renderSuccess(pr) {
    panel.innerHTML = `
      <div class="be-done">
        <p class="be-done-title">✓ Done — your changes are in pull request #${pr.number}.</p>
        <p class="s-hint">A maintainer (the <code>/vendor</code> code owner) reviews and merges it; nothing is published until they do.</p>
        <a class="btn btn-primary" href="${pr.url}" target="_blank" rel="noopener">View pull request ↗</a>
      </div>`
  }

  function renderError(msg) {
    panel.innerHTML = `
      <div class="be-error-state">
        <p class="be-error"></p>
        <div class="be-actions">
          <button class="btn btn-secondary" data-be-retry>Try again</button>
          <button class="btn btn-primary" data-be-manual2>Open it on GitHub instead</button>
        </div>
      </div>`
    panel.querySelector('.be-error').textContent = msg
    panel.querySelector('[data-be-retry]').addEventListener('click', renderConsent)
    panel.querySelector('[data-be-manual2]').addEventListener('click', toManual)
  }
}
