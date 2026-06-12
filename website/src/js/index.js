// Copyright © 2021 The Things Network Foundation, The Things Industries B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Base bundle: header behavior on every page, plus the browse enhancement
// on pages that render a device grid (home, vendor pages, tag pages).

import { initBrowse } from './browse'
import { initSubmit } from './submit'

const init = () => {
  const browseRoot = document.querySelector('[data-browse]')
  const browse = browseRoot ? initBrowse(browseRoot) : null

  const submitRoot = document.querySelector('[data-submit-wizard]')
  if (submitRoot) initSubmit(submitRoot)

  // Vendors directory: simple client-side name filter.
  const vendorSearch = document.querySelector('[data-vendor-search]')
  if (vendorSearch) {
    const cards = Array.from(document.querySelectorAll('[data-vendor-name]'))
    const emptyEl = document.querySelector('[data-vendor-empty]')
    vendorSearch.addEventListener('input', () => {
      const q = vendorSearch.value.trim().toLowerCase()
      let visible = 0
      cards.forEach((c) => {
        const show = !q || c.dataset.vendorName.includes(q)
        c.hidden = !show
        if (show) visible++
      })
      if (emptyEl) emptyEl.hidden = visible !== 0
    })
  }

  // Header quick search: filters in place on browse pages, otherwise
  // jumps to the homepage with the query applied.
  const mini = document.querySelector('[data-quick-search]')
  if (mini) {
    const homeURL = mini.dataset.home || '/'
    const submit = () => {
      const q = mini.value.trim()
      if (browse) {
        browse.setQuery(q)
      } else if (q) {
        location.href = `${homeURL}?q=${encodeURIComponent(q)}`
      }
    }
    let t
    mini.addEventListener('input', () => {
      if (!browse) return
      clearTimeout(t)
      t = setTimeout(submit, 150)
    })
    mini.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit()
    })
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        mini.focus()
        mini.select()
      }
    })
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
