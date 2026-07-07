// Browse-page enhancement: client-side filtering, faceted counts, search,
// sort and tile/list view over the server-rendered device cards. Without
// JavaScript the full grid stays visible and every link keeps working.

const FACETS = [
  { key: 'sensors', attr: 'sensors', multi: true },
  { key: 'plans', attr: 'plans', multi: true },
  { key: 'classes', attr: 'classes', multi: true },
  { key: 'ip', attr: 'ip', multi: true },
  { key: 'flags', attr: null, multi: true },
]

const parseState = () => {
  const p = new URLSearchParams(location.search)
  const state = { q: p.get('q') || '', sort: p.get('sort') || 'name', view: p.get('view') || 'grid' }
  FACETS.forEach((f) => {
    state[f.key] = (p.get(f.key) || '').split(',').filter(Boolean)
  })
  return state
}

const writeState = (state) => {
  const p = new URLSearchParams()
  if (state.q) p.set('q', state.q)
  if (state.sort !== 'name') p.set('sort', state.sort)
  if (state.view !== 'grid') p.set('view', state.view)
  FACETS.forEach((f) => {
    if (state[f.key].length) p.set(f.key, state[f.key].join(','))
  })
  const qs = p.toString()
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname)
}

const deviceModel = (card) => {
  const d = card.dataset
  return {
    el: card,
    name: d.name || '',
    vendor: d.vendor || '',
    text: (card.textContent || '').toLowerCase(),
    sensors: (d.sensors || '').split('|').filter(Boolean),
    plans: (d.plans || '').split('|').filter(Boolean),
    classes: (d.classes || '').split('|').filter(Boolean),
    ip: d.ip ? [d.ip] : [],
    flags: [d.cert === '1' && 'certified', d.codec === '1' && 'codec'].filter(Boolean),
    row: null,
  }
}

const matches = (m, state, skipKey) => {
  if (state.q && !m.text.includes(state.q.toLowerCase())) return false
  for (const f of FACETS) {
    if (f.key === skipKey) continue
    const active = state[f.key]
    if (!active.length) continue
    const have = m[f.key]
    if (!active.some((v) => have.includes(v))) return false
  }
  return true
}

const buildRow = (m) => {
  const card = m.el
  const img = card.querySelector('.d-thumb img')
  const row = document.createElement('a')
  row.className = 'device-row'
  row.href = card.href

  const thumb = document.createElement('div')
  thumb.className = 'dr-thumb'
  if (img) {
    const i = document.createElement('img')
    i.src = img.currentSrc || img.src
    i.alt = ''
    i.loading = 'lazy'
    thumb.appendChild(i)
  }

  const main = document.createElement('div')
  main.className = 'dr-main'
  const title = document.createElement('div')
  title.className = 'dr-title'
  const vendor = document.createElement('span')
  vendor.className = 'd-vendor'
  vendor.textContent = card.querySelector('.d-vendor')?.textContent || ''
  title.appendChild(vendor)
  if (m.flags.includes('certified')) {
    const cert = document.createElement('span')
    cert.className = 'tag cert'
    cert.textContent = '✓ Certified'
    title.appendChild(cert)
  }
  const h3 = document.createElement('h3')
  h3.textContent = card.querySelector('h3')?.textContent || ''
  const p = document.createElement('p')
  p.textContent = card.querySelector('p')?.textContent || ''
  main.append(title, h3, p)

  const col = (label, value, mod) => {
    const c = document.createElement('div')
    c.className = 'dr-col dr-col--' + mod
    const l = document.createElement('span')
    l.className = 'dr-lab'
    l.textContent = label
    const v = document.createElement('span')
    v.className = 'dr-val'
    v.textContent = value || '—'
    c.append(l, v)
    return c
  }

  const plans = m.plans.slice(0, 2).join(', ') + (m.plans.length > 2 ? ` +${m.plans.length - 2}` : '')
  const sensors = m.sensors.slice(0, 2).join(', ') + (m.sensors.length > 2 ? ` +${m.sensors.length - 2}` : '')

  const chev = document.createElement('div')
  chev.className = 'dr-chev'
  chev.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>'

  row.append(
    thumb,
    main,
    col('Class', m.classes.join(' / '), 'class'),
    col('Sensors', m.sensors.length ? sensors : '—', 'sensors'),
    col('Regions', plans, 'regions'),
    chev,
  )
  return row
}

export const initBrowse = (root) => {
  const grid = root.querySelector('[data-grid]')
  if (!grid) return null

  const cards = Array.from(grid.querySelectorAll('.device-card'))
  const models = cards.map(deviceModel)
  const list = root.querySelector('[data-list]')
  const countEl = root.querySelector('[data-count]')
  const emptyEl = root.querySelector('[data-empty]')
  const chipsEl = root.querySelector('[data-chips]')
  const searchInput = root.querySelector('[data-search]')
  const sortSelect = root.querySelector('[data-sort]')
  const sidebar = root.querySelector('.filter-sidebar')
  const state = parseState()
  let listBuilt = false

  const facetInputs = sidebar
    ? Array.from(sidebar.querySelectorAll('[data-facet]'))
    : []

  const labelFor = (input) =>
    input.dataset.label || input.value

  const apply = () => {
    let visible = 0
    models.forEach((m) => {
      const show = matches(m, state, null)
      m.el.hidden = !show
      if (m.row) m.row.hidden = !show
      if (show) visible++
    })
    if (countEl) countEl.innerHTML = `<strong>${visible}</strong> ${visible === 1 ? 'device' : 'devices'}`
    if (emptyEl) emptyEl.hidden = visible !== 0

    // Faceted counts: each group counts against all *other* active filters.
    facetInputs.forEach((input) => {
      const key = input.dataset.facet
      const value = input.value
      const countNode = input.closest('label')?.querySelector('.count')
      if (!countNode) return
      let n = 0
      models.forEach((m) => {
        if (matches(m, state, key) && m[key].includes(value)) n++
      })
      countNode.textContent = n
    })

    // Sync inputs and pills.
    facetInputs.forEach((input) => {
      const on = state[input.dataset.facet].includes(input.value)
      if (input.type === 'checkbox') input.checked = on
      else input.classList.toggle('active', on)
    })

    // Active chips.
    if (chipsEl) {
      chipsEl.innerHTML = ''
      const chips = []
      FACETS.forEach((f) => {
        state[f.key].forEach((v) => chips.push({ key: f.key, value: v }))
      })
      if (state.q) chips.push({ key: 'q', value: state.q, label: `“${state.q}”` })
      chipsEl.hidden = chips.length === 0
      chips.forEach((c) => {
        const chip = document.createElement('span')
        chip.className = 'active-chip'
        chip.textContent = c.label || c.value
        const x = document.createElement('button')
        x.className = 'x'
        x.setAttribute('aria-label', 'Remove filter')
        x.textContent = '✕'
        x.addEventListener('click', () => {
          if (c.key === 'q') {
            state.q = ''
            if (searchInput) searchInput.value = ''
          } else {
            state[c.key] = state[c.key].filter((v) => v !== c.value)
          }
          update()
        })
        chip.appendChild(x)
        chipsEl.appendChild(chip)
      })
      if (chips.length) {
        const clear = document.createElement('button')
        clear.className = 'clear'
        clear.textContent = 'Clear all'
        clear.addEventListener('click', () => {
          FACETS.forEach((f) => (state[f.key] = []))
          state.q = ''
          if (searchInput) searchInput.value = ''
          update()
        })
        chipsEl.appendChild(clear)
      }
    }
  }

  const sortModels = () => {
    const dir = state.sort
    const sorted = [...models].sort((a, b) =>
      dir === 'vendor'
        ? a.vendor.localeCompare(b.vendor) || a.name.localeCompare(b.name)
        : a.name.localeCompare(b.name),
    )
    sorted.forEach((m) => {
      grid.appendChild(m.el)
      if (m.row && list) list.appendChild(m.row)
    })
  }

  const applyView = () => {
    if (state.view === 'list' && list && !listBuilt) {
      models.forEach((m) => {
        m.row = buildRow(m)
        m.row.hidden = m.el.hidden
        list.appendChild(m.row)
      })
      listBuilt = true
      sortModels()
    }
    grid.hidden = state.view === 'list'
    if (list) list.hidden = state.view !== 'list'
    root.querySelectorAll('[data-view]').forEach((b) => {
      b.classList.toggle('active', b.dataset.view === state.view)
    })
  }

  const update = () => {
    apply()
    applyView()
    writeState(state)
  }

  // Bind facet inputs (checkboxes and pills).
  facetInputs.forEach((input) => {
    const toggle = () => {
      const key = input.dataset.facet
      const cur = new Set(state[key])
      cur.has(input.value) ? cur.delete(input.value) : cur.add(input.value)
      state[key] = [...cur]
      update()
    }
    if (input.type === 'checkbox') input.addEventListener('change', toggle)
    else input.addEventListener('click', toggle)
  })

  if (searchInput) {
    searchInput.value = state.q
    let t
    searchInput.addEventListener('input', () => {
      clearTimeout(t)
      t = setTimeout(() => {
        state.q = searchInput.value.trim()
        update()
      }, 120)
    })
  }

  if (sortSelect) {
    sortSelect.value = state.sort
    sortSelect.addEventListener('change', () => {
      state.sort = sortSelect.value
      sortModels()
      writeState(state)
    })
  }

  root.querySelectorAll('[data-view]').forEach((b) => {
    b.addEventListener('click', () => {
      state.view = b.dataset.view
      update()
    })
  })

  const filterToggle = root.querySelector('[data-filter-toggle]')
  if (filterToggle && sidebar) {
    filterToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open')
    })
  }

  sortModels()
  update()

  return {
    setQuery(q) {
      state.q = q
      if (searchInput) searchInput.value = q
      update()
    },
  }
}
