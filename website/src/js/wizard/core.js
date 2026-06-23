// Shared wizard plumbing for the submit and update flows: step navigation,
// pill groups (multi and single select) and form field access. The DOM
// contract matches layouts/submit/list.html and layouts/update/list.html.

export const slugify = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const yamlStr = (s) => "'" + String(s).replace(/'/g, "''") + "'"

export const fields = (root) => ({
  get: (name) => {
    const el = root.querySelector(`[data-f="${name}"]`)
    return el ? el.value.trim() : ''
  },
  set: (name, value) => {
    const el = root.querySelector(`[data-f="${name}"]`)
    if (el) el.value = value == null ? '' : String(value)
  },
})

// Pill groups: [data-pills="key"] toggles a set, [data-pills-single="key"]
// behaves like a radio group. State is seeded from the markup's .active
// classes and can be replaced programmatically (for prefill) with set().
export const pillGroups = (root) => {
  const multi = {}
  const single = {}

  root.querySelectorAll('[data-pills]').forEach((group) => {
    const key = group.dataset.pills
    multi[key] = Array.from(group.querySelectorAll('.filter-pill.active')).map((p) => p.getAttribute('value'))
    group.querySelectorAll('.filter-pill').forEach((pill) =>
      pill.addEventListener('click', () => {
        if (pill.disabled) return
        const v = pill.getAttribute('value')
        const set = new Set(multi[key])
        set.has(v) ? set.delete(v) : set.add(v)
        multi[key] = [...set]
        pill.classList.toggle('active')
      }),
    )
  })

  root.querySelectorAll('[data-pills-single]').forEach((group) => {
    const key = group.dataset.pillsSingle
    const active = group.querySelector('.filter-pill.active')
    single[key] = active ? active.getAttribute('value') : null
    group.querySelectorAll('.filter-pill').forEach((pill) =>
      pill.addEventListener('click', () => {
        single[key] = pill.getAttribute('value')
        group.querySelectorAll('.filter-pill').forEach((x) => x.classList.toggle('active', x === pill))
      }),
    )
  })

  return {
    multi,
    single,
    set: (key, values) => {
      const group = root.querySelector(`[data-pills="${key}"]`)
      if (!group) return
      multi[key] = [...values]
      group.querySelectorAll('.filter-pill').forEach((p) => p.classList.toggle('active', values.includes(p.getAttribute('value'))))
    },
    setSingle: (key, value) => {
      const group = root.querySelector(`[data-pills-single="${key}"]`)
      if (!group) return
      single[key] = value
      group.querySelectorAll('.filter-pill').forEach((p) => p.classList.toggle('active', p.getAttribute('value') === value))
    },
  }
}

export const initSteps = ({ root, validate, onShow, onFinish, finishLabel }) => {
  const panels = Array.from(root.querySelectorAll('[data-step-panel]'))
  const stepBtns = Array.from(root.querySelectorAll('[data-step-btn]'))
  const prevBtn = root.querySelector('[data-prev]')
  const nextBtn = root.querySelector('[data-next]')

  let step = 0

  const show = (i) => {
    step = i
    panels.forEach((p) => (p.hidden = +p.dataset.stepPanel !== i))
    stepBtns.forEach((b) => {
      const n = +b.dataset.stepBtn
      b.classList.toggle('active', n === i)
      b.classList.toggle('done', n < i)
      b.disabled = n > i
    })
    prevBtn.disabled = i === 0
    nextBtn.textContent = i === panels.length - 1 ? finishLabel : 'Continue'
    if (onShow) onShow(i)
  }

  stepBtns.forEach((b) =>
    b.addEventListener('click', () => {
      const n = +b.dataset.stepBtn
      if (n <= step) show(n)
    }),
  )
  prevBtn.addEventListener('click', () => show(Math.max(0, step - 1)))
  nextBtn.addEventListener('click', () => {
    if (validate && !validate(step)) return
    if (step === panels.length - 1) {
      onFinish()
    } else {
      show(step + 1)
    }
  })

  show(0)
  return { show, current: () => step }
}
