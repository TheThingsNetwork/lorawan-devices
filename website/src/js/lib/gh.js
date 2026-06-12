// GitHub URL helpers for the no-backend submission flow. The web editor
// handles fork, branch and pull request creation for contributors without
// push access; we just deep-link into it.

export const ghConfig = (el) => ({
  repo: (el && el.dataset.ghRepo) || 'TheThingsNetwork/lorawan-devices',
  branch: (el && el.dataset.ghBranch) || 'master',
})

export const rawURL = (cfg, path) => `https://raw.githubusercontent.com/${cfg.repo}/${cfg.branch}/${path}`

export const editURL = (cfg, path) => `https://github.com/${cfg.repo}/edit/${cfg.branch}/${path}`

// /new supports prefilling the editor through ?filename=&value= — but only
// within sane URL limits, so large files fall back to filename-only.
export const newFileURL = (cfg, path, value) => {
  const base = `https://github.com/${cfg.repo}/new/${cfg.branch}/${path.split('/').slice(0, -1).join('/')}?filename=${encodeURIComponent(path.split('/').pop())}`
  if (value != null) {
    const full = `${base}&value=${encodeURIComponent(value)}`
    if (full.length <= 7000) return full
  }
  return base
}

export const uploadURL = (cfg, dir) => `https://github.com/${cfg.repo}/upload/${cfg.branch}/${dir}`

export const fetchRaw = async (cfg, path) => {
  const res = await fetch(rawURL(cfg, path))
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
  return res.text()
}
