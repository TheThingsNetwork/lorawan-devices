// Generates a self-contained shell script that opens the contributor's pull
// request via the GitHub CLI (`gh`), no backend, no repo clone. It forks the
// repo, builds one commit through the Git Data API (text files + the base64
// PNG), and opens the PR. Two ways to use the same artifact:
//   1. run it yourself (engineers), or
//   2. email it to the maintainers, who run it for you (non-technical users).
//
// All contributor data (file bodies, title, PR body) is fed through
// single-quoted heredocs, so it can never break the shell, even with
// apostrophes, $ or backticks in a payload. Only computed git SHAs are
// interpolated at runtime.

const BLOB = '__LDR_BLOB__'
const TREE = '__LDR_TREE__'
const MSG = '__LDR_MSG__'
const BODY = '__LDR_BODY__'

const heredocAssign = (name, delim, content, expand) =>
  `${name}=$(cat <<${expand ? delim : `'${delim}'`}\n${content}\n${delim}\n)`

// Build the bash script. `files` must already be full files (the submit flow
// merges the index fragments first); `photoBase64` is the raw base64 PNG (no
// data: prefix) or null.
export const buildScript = ({ cfg, files, meta, identity = {}, photoBase64 = null, wizardKind = 'submit', branchSlug = 'device' }) => {
  const upstream = cfg.repo || 'TheThingsNetwork/lorawan-devices'
  const base = cfg.branch || 'master'
  const textFiles = files.filter((f) => f.body != null)
  const binFile = files.find((f) => f.kind === 'binary')

  const name = (identity.name || '').trim()
  const email = (identity.email || '').trim()
  const coAuthor = name && email ? `\n\nCo-authored-by: ${name} <${email}>` : ''

  const commitMessage = (meta.prTitle || 'Add device') + coAuthor
  const prBody =
    (meta.prBody || '') +
    '\n\n---\n' +
    (name ? `Contributed by ${name}${email ? ` <${email}>` : ''} via the LoRaWAN Device Wizard.` : 'Opened via the LoRaWAN Device Wizard.')

  const L = []
  L.push('#!/usr/bin/env bash')
  L.push('#')
  L.push(`# ${wizardKind === 'update' ? 'Update' : 'Add'} a device on ${upstream}, opens a pull request for you.`)
  L.push('# REVIEW BEFORE RUNNING. This script only:')
  L.push(`#   • forks ${upstream} to your GitHub account,`)
  L.push('#   • commits the files below (under vendor/ only), and')
  L.push('#   • opens a pull request. It never merges anything.')
  L.push('#')
  L.push('# Need the GitHub CLI?  https://cli.github.com   then run:  gh auth login')
  L.push('#')
  L.push('set -euo pipefail')
  L.push('')
  L.push(`UPSTREAM='${upstream}'`)
  L.push(`BASE='${base}'`)
  L.push(`BRANCH="wizard/${branchSlug}-$RANDOM"`)
  L.push('')
  L.push('command -v gh >/dev/null 2>&1 || { echo "GitHub CLI (gh) is required: https://cli.github.com"; exit 1; }')
  L.push('gh auth status >/dev/null 2>&1 || { echo "Sign in to GitHub first:  gh auth login"; exit 1; }')
  L.push('')
  L.push('ME=$(gh api user --jq .login)')
  L.push('FORK="$ME/$(basename "$UPSTREAM")"')
  L.push('echo "→ Forking $UPSTREAM to $FORK (if needed)…"')
  L.push('gh repo fork "$UPSTREAM" --clone=false >/dev/null 2>&1 || true')
  L.push('for _ in $(seq 1 30); do gh api "repos/$FORK" >/dev/null 2>&1 && break; sleep 2; done')
  L.push('gh api -X POST "repos/$FORK/merge-upstream" -f branch="$BASE" >/dev/null 2>&1 || true')
  L.push('')
  L.push('echo "→ Reading $BASE…"')
  L.push('BASE_SHA=$(gh api "repos/$FORK/git/ref/heads/$BASE" --jq .object.sha)')
  L.push('BASE_TREE=$(gh api "repos/$FORK/git/commits/$BASE_SHA" --jq .tree.sha)')
  L.push('')
  L.push('echo "→ Uploading files…"')

  const treeEntries = []
  textFiles.forEach((f, i) => {
    const v = `SHA_${i}`
    L.push(`${v}=$(gh api -X POST "repos/$FORK/git/blobs" -f encoding=utf-8 -F content=@- --jq .sha <<'${BLOB}'`)
    L.push(f.body.replace(/\n$/, ''))
    L.push(BLOB)
    L.push(')')
    treeEntries.push(`  {"path": ${JSON.stringify(f.path)}, "mode": "100644", "type": "blob", "sha": "$${v}"}`)
  })
  if (binFile && photoBase64) {
    L.push(`SHA_IMG=$(gh api -X POST "repos/$FORK/git/blobs" -f encoding=base64 -F content=@- --jq .sha <<'${BLOB}'`)
    L.push(photoBase64)
    L.push(BLOB)
    L.push(')')
    treeEntries.push(`  {"path": ${JSON.stringify(binFile.path)}, "mode": "100644", "type": "blob", "sha": "$SHA_IMG"}`)
  }

  L.push('')
  L.push('echo "→ Building commit…"')
  L.push(`TREE_SHA=$(gh api -X POST "repos/$FORK/git/trees" --input - --jq .sha <<${TREE}`)
  L.push('{')
  L.push('  "base_tree": "$BASE_TREE",')
  L.push('  "tree": [')
  L.push(treeEntries.join(',\n'))
  L.push('  ]')
  L.push('}')
  L.push(TREE)
  L.push(')')
  L.push('')
  L.push(heredocAssign('MESSAGE', MSG, commitMessage, false))
  L.push('COMMIT_SHA=$(gh api -X POST "repos/$FORK/git/commits" -f message="$MESSAGE" -f tree="$TREE_SHA" -f "parents[]=$BASE_SHA" --jq .sha)')
  L.push('gh api -X POST "repos/$FORK/git/refs" -f ref="refs/heads/$BRANCH" -f sha="$COMMIT_SHA" >/dev/null')
  L.push('')
  L.push('echo "→ Opening the pull request…"')
  L.push(heredocAssign('TITLE', '__LDR_TITLE__', meta.prTitle || 'Add device', false))
  L.push(heredocAssign('PR_BODY', BODY, prBody, false))
  L.push('gh pr create --repo "$UPSTREAM" --base "$BASE" --head "$ME:$BRANCH" --title "$TITLE" --body "$PR_BODY"')
  if (binFile && !photoBase64) {
    L.push('')
    L.push(`echo "⚠ No product photo was embedded, please add ${binFile.path} to the pull request."`)
  }
  return L.join('\n') + '\n'
}

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result).split(',')[1] || '')
    r.onerror = reject
    r.readAsDataURL(file)
  })

const copyText = async (text, btn) => {
  try {
    await navigator.clipboard.writeText(text)
    const old = btn.textContent
    btn.textContent = 'Copied ✓'
    setTimeout(() => (btn.textContent = old), 1500)
  } catch (e) {
    window.prompt('Copy the script:', text)
  }
}

const download = (text, filename) => {
  const blob = new Blob([text], { type: 'text/x-shellscript' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

// Render the success step: the script + run-it / email-it actions, with the
// manual web-editor checklist kept as a secondary fallback.
//   opts: { root, cfg, files, meta, photoFile, vendorId, modelId, wizardKind,
//           submitEmail, fallback }
export const renderCliPanel = async (opts) => {
  const { root, cfg, files, meta, photoFile, vendorId, modelId, wizardKind, submitEmail, fallback } = opts
  const panel = root.querySelector('[data-cli-panel]')
  if (!panel) {
    fallback()
    return
  }
  const manualBits = [...root.querySelectorAll('[data-manual-only]')]
  manualBits.forEach((el) => (el.hidden = true))
  panel.hidden = false

  const photoBase64 = photoFile ? await fileToBase64(photoFile).catch(() => null) : null
  const branchSlug = `${vendorId || 'vendor'}/${modelId || 'device'}`.replace(/[^a-z0-9/-]+/gi, '-')
  const filename = `${wizardKind}-${(modelId || 'device')}.sh`

  let identity = { name: '', email: '' }
  const script = () => buildScript({ cfg, files, meta, identity, photoBase64, wizardKind, branchSlug })

  panel.innerHTML = `
    <div class="cli-block">
      <p class="cli-lede">Your files are validated and ready. Open the pull request one of two ways, both use the script below.</p>
      <div class="s-grid">
        <div class="s-field"><label>Your name <span class="s-hint" style="font-weight:400">(for commit credit, optional)</span></label><input data-cli-name placeholder="Jane Engineer" /></div>
        <div class="s-field"><label>Email <span class="s-hint" style="font-weight:400">(optional)</span></label><input data-cli-email type="email" placeholder="jane@acme.example" /></div>
      </div>
      <div class="cli-ways">
        <div class="cli-way">
          <h4>① Run it yourself</h4>
          <p>You have <a href="https://cli.github.com" target="_blank" rel="noopener">GitHub CLI</a>? Paste the script into a terminal (run <code>gh auth login</code> once first). It forks, commits and opens the PR, about ten seconds, no repo download.</p>
          <button class="btn btn-primary" data-cli-copy>Copy script</button>
          <button class="btn btn-secondary" data-cli-download>Download .sh</button>
        </div>
        <div class="cli-way">
          <h4>② Email it to us</h4>
          <p>Not comfortable with the terminal? Download the script and email it to the maintainers, we'll run it and open the PR for you.</p>
          <button class="btn btn-secondary" data-cli-email-btn>Email it to us</button>
        </div>
      </div>
      <pre class="code cli-script" data-cli-pre></pre>
      <p class="s-hint">Prefer GitHub's web editor? <a href="#" data-cli-manual>Use the step-by-step checklist</a> instead.</p>
    </div>`

  const pre = panel.querySelector('[data-cli-pre]')
  const nameEl = panel.querySelector('[data-cli-name]')
  const emailEl = panel.querySelector('[data-cli-email]')
  const refresh = () => {
    identity = { name: nameEl.value, email: emailEl.value }
    pre.textContent = script()
  }
  nameEl.addEventListener('input', refresh)
  emailEl.addEventListener('input', refresh)
  refresh()

  panel.querySelector('[data-cli-copy]').addEventListener('click', (e) => copyText(script(), e.target))
  panel.querySelector('[data-cli-download]').addEventListener('click', () => download(script(), filename))
  panel.querySelector('[data-cli-email-btn]').addEventListener('click', () => {
    download(script(), filename)
    const to = submitEmail || ''
    const subject = encodeURIComponent(meta.prTitle || 'Device repository submission')
    const body = encodeURIComponent(
      `Hi,\n\nPlease open this pull request for me, the script "${filename}" is attached (just downloaded; attach it to this email before sending).\n\n${meta.prTitle || ''}\n`,
    )
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`
  })
  panel.querySelector('[data-cli-manual]').addEventListener('click', (e) => {
    e.preventDefault()
    panel.hidden = true
    panel.innerHTML = ''
    manualBits.forEach((el) => (el.hidden = false))
    fallback()
  })
}
