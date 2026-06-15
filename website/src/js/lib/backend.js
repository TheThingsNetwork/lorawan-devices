// Backend discovery for the optional one-click submit flow.
//
// When a submit endpoint is configured (data-submit-api on the wizard root,
// set by the Hugo template from the `submitApi` site param), the wizard can
// POST the generated files and have a bot open the pull request. When it is
// absent or empty — e.g. the noindex staging build, or any deployment that
// has not wired a backend — every wizard falls back to the manual GitHub
// checklist with zero behavioural change.

export const backendBase = (root) => {
  const v = root && root.dataset ? root.dataset.submitApi : ''
  const trimmed = (v || '').trim().replace(/\/+$/, '')
  return trimmed || null
}

// Optional Cloudflare Turnstile site key (public). Rendered only when present.
export const turnstileKey = (root) => {
  const v = root && root.dataset ? root.dataset.turnstileKey : ''
  return (v || '').trim() || null
}
