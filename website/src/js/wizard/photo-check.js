// Photo step wiring: run local checks on a chosen file and render verdicts
// plus a preview on light/dark backgrounds.

import { checkPhoto } from '../lib/image-check'

const ICONS = {
  pass: '✓',
  warn: '!',
  fail: '✕',
}

export const createPhotoCheck = (root, { targetName } = {}) => {
  const input = root.querySelector('[data-photo-input]')
  const list = root.querySelector('[data-photo-checks]')
  const previews = root.querySelector('[data-photo-previews]')
  const nameEl = root.querySelector('[data-photo-name]')

  let state = { file: null, ok: true, url: null }

  const render = (result, file) => {
    list.innerHTML = ''
    result.checks.forEach((c) => {
      const li = document.createElement('li')
      li.className = 'ck ' + c.status
      li.innerHTML = `<span class="ck-ico"></span><span class="ck-label"></span><span class="ck-detail"></span>`
      li.querySelector('.ck-ico').textContent = ICONS[c.status]
      li.querySelector('.ck-label').textContent = c.label
      li.querySelector('.ck-detail').textContent = c.detail
      list.appendChild(li)
    })
    list.hidden = false
    if (result.url) {
      previews.hidden = false
      previews.querySelectorAll('img').forEach((img) => (img.src = result.url))
    } else {
      previews.hidden = true
    }
    if (nameEl && targetName) {
      nameEl.hidden = false
      const wrong = file.name !== targetName()
      nameEl.innerHTML = wrong
        ? `Save it as <code>${targetName()}</code> in the vendor folder (currently <code>${file.name.replace(/</g, '&lt;')}</code>).`
        : `File name matches <code>${targetName()}</code>.`
    }
  }

  input.addEventListener('change', async () => {
    const file = input.files && input.files[0]
    if (!file) return
    if (state.url) URL.revokeObjectURL(state.url)
    const result = await checkPhoto(file)
    state = { file, ok: result.ok, url: result.url }
    render(result, file)
  })

  return {
    hasFile: () => !!state.file,
    isOK: () => state.ok,
    fileName: () => (state.file ? state.file.name : null),
    // The raw, client-validated File — needed by the backend submit path to
    // send the PNG bytes; the no-backend checklist never reads it.
    getFile: () => state.file,
  }
}
