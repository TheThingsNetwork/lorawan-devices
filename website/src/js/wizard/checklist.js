// Submission checklist: turns a list of generated/changed files into
// concrete GitHub web-flow actions (copy contents, open the editor, upload
// binaries) so a contributor lands in one pull request without local git.

import { editURL, newFileURL, uploadURL } from '../lib/gh'

const copyText = async (text, btn) => {
  try {
    await navigator.clipboard.writeText(text)
    const old = btn.textContent
    btn.textContent = 'Copied ✓'
    setTimeout(() => (btn.textContent = old), 1500)
  } catch (e) {
    window.prompt('Copy the file contents:', text)
  }
}

// files: [{ path, body, kind: 'new' | 'edit' | 'binary', note }]
export const renderChecklist = (root, cfg, files, { prTitle, prBody } = {}) => {
  root.innerHTML = ''
  const frag = document.createDocumentFragment()

  files.forEach((file, i) => {
    const item = document.createElement('div')
    item.className = 'cl-item'
    const action =
      file.kind === 'binary'
        ? `<a class="btn btn-secondary btn-sm" target="_blank" rel="noopener" href="${uploadURL(cfg, file.path.split('/').slice(0, -1).join('/'))}">Upload on GitHub ↗</a>`
        : file.kind === 'edit'
          ? `<a class="btn btn-secondary btn-sm" target="_blank" rel="noopener" href="${editURL(cfg, file.path)}">Open current file ↗</a>`
          : `<a class="btn btn-secondary btn-sm" target="_blank" rel="noopener" href="${newFileURL(cfg, file.path, file.body)}">Create on GitHub ↗</a>`
    item.innerHTML = `
      <span class="cl-num">${i + 1}</span>
      <div class="cl-main">
        <code class="cl-path"></code>
        <span class="cl-note"></span>
      </div>
      <div class="cl-actions">
        ${file.body != null ? '<button class="btn btn-secondary btn-sm" data-copy>Copy contents</button>' : ''}
        ${action}
      </div>`
    item.querySelector('.cl-path').textContent = file.path
    item.querySelector('.cl-note').textContent =
      file.note || (file.kind === 'edit' ? 'replace the file contents with your copied version' : file.kind === 'binary' ? 'drag the image into the upload page' : 'paste if the editor opens empty')
    const copyBtn = item.querySelector('[data-copy]')
    if (copyBtn) copyBtn.addEventListener('click', () => copyText(file.body, copyBtn))
    frag.appendChild(item)
  })

  if (prTitle) {
    const pr = document.createElement('div')
    pr.className = 'cl-item'
    pr.innerHTML = `
      <span class="cl-num">${files.length + 1}</span>
      <div class="cl-main">
        <code class="cl-path">Open the pull request</code>
        <span class="cl-note">use this title and description so reviewers see what changed</span>
        <pre class="code cl-pr" data-pr></pre>
      </div>
      <div class="cl-actions"><button class="btn btn-secondary btn-sm" data-copy-pr>Copy PR text</button></div>`
    pr.querySelector('[data-pr]').textContent = `${prTitle}\n\n${prBody || ''}`.trim()
    pr.querySelector('[data-copy-pr]').addEventListener('click', (e) => copyText(`${prTitle}\n\n${prBody || ''}`.trim(), e.target))
    frag.appendChild(pr)
  }

  root.appendChild(frag)
}
