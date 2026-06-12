// Submit-a-device wizard: six steps that end in generated, schema-shaped
// YAML files for a pull request to TheThingsNetwork/lorawan-devices.

const slugify = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const yamlStr = (s) => "'" + String(s).replace(/'/g, "''") + "'"

export const initSubmit = (root) => {
  const panels = Array.from(root.querySelectorAll('[data-step-panel]'))
  const stepBtns = Array.from(root.querySelectorAll('[data-step-btn]'))
  const prevBtn = root.querySelector('[data-prev]')
  const nextBtn = root.querySelector('[data-next]')
  const success = root.querySelector('[data-success]')
  const wizard = root.querySelector('.submit-layout')

  let step = 0
  let vendorMode = 'existing'
  let codecMode = 'yes'
  const pills = { sensors: [], classes: ['A'], plans: ['EU863-870'] }
  const single = { join: 'otaa', batteryReplaceable: 'true' }

  const f = (name) => {
    const el = root.querySelector(`[data-f="${name}"]`)
    return el ? el.value.trim() : ''
  }

  /* ------------------------------ Steps ------------------------------ */

  const validate = () => {
    if (step === 0) return vendorMode === 'existing' ? !!f('vendor') : !!(f('vendorName') && slugify(f('vendorSlug') || f('vendorName')))
    if (step === 1) return !!(f('name') && f('desc') && slugify(f('model') || f('name')))
    if (step === 2) return pills.plans.length > 0
    return true
  }

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
    nextBtn.textContent = i === panels.length - 1 ? '⚡ Generate submission' : 'Continue'
    if (i === panels.length - 1) renderReview()
  }

  stepBtns.forEach((b) =>
    b.addEventListener('click', () => {
      const n = +b.dataset.stepBtn
      if (n <= step) show(n)
    }),
  )
  prevBtn.addEventListener('click', () => show(Math.max(0, step - 1)))
  nextBtn.addEventListener('click', () => {
    if (!validate()) return
    if (step === panels.length - 1) {
      finish()
    } else {
      show(step + 1)
    }
  })

  /* ----------------------------- Choices ----------------------------- */

  root.querySelectorAll('[data-vendor-mode]').forEach((b) =>
    b.addEventListener('click', () => {
      vendorMode = b.dataset.vendorMode
      root.querySelectorAll('[data-vendor-mode]').forEach((x) => x.classList.toggle('active', x === b))
      root.querySelector('[data-vendor-existing]').hidden = vendorMode !== 'existing'
      root.querySelector('[data-vendor-new]').hidden = vendorMode !== 'new'
    }),
  )

  root.querySelectorAll('[data-codec-mode]').forEach((b) =>
    b.addEventListener('click', () => {
      codecMode = b.dataset.codecMode
      root.querySelectorAll('[data-codec-mode]').forEach((x) => x.classList.toggle('active', x === b))
    }),
  )

  root.querySelectorAll('[data-pills]').forEach((group) => {
    const key = group.dataset.pills
    group.querySelectorAll('.filter-pill').forEach((pill) =>
      pill.addEventListener('click', () => {
        if (pill.disabled) return
        const v = pill.getAttribute('value')
        const set = new Set(pills[key] || [])
        set.has(v) ? set.delete(v) : set.add(v)
        pills[key] = [...set]
        pill.classList.toggle('active')
      }),
    )
  })

  root.querySelectorAll('[data-pills-single]').forEach((group) => {
    const key = group.dataset.pillsSingle
    group.querySelectorAll('.filter-pill').forEach((pill) =>
      pill.addEventListener('click', () => {
        single[key] = pill.getAttribute('value')
        group.querySelectorAll('.filter-pill').forEach((x) => x.classList.toggle('active', x === pill))
      }),
    )
  })

  const powerSel = root.querySelector('[data-f="power"]')
  if (powerSel) {
    powerSel.addEventListener('change', () => {
      const battery = powerSel.value === 'battery'
      root.querySelectorAll('[data-battery-fields], [data-battery-fields2]').forEach((el) => (el.hidden = !battery))
    })
  }

  /* ------------------------- YAML generation ------------------------- */

  const model = () => slugify(f('model') || f('name'))
  const vendorSlug = () => (vendorMode === 'existing' ? f('vendor') : slugify(f('vendorSlug') || f('vendorName')))

  const deviceYAML = () => {
    const m = model()
    const lines = []
    lines.push(`name: ${yamlStr(f('name'))}`)
    lines.push(`description: ${yamlStr(f('desc'))}`)
    lines.push('hardwareVersions:')
    lines.push("  - version: '1.0'")
    lines.push('    numeric: 1')
    lines.push('firmwareVersions:')
    lines.push("  - version: '1.0'")
    lines.push('    numeric: 1')
    lines.push('    hardwareVersions:')
    lines.push("      - '1.0'")
    lines.push('    profiles:')
    pills.plans.forEach((plan) => {
      lines.push(`      ${plan}:`)
      lines.push(`        id: ${m}-profile`)
      lines.push('        lorawanCertified: false')
      if (codecMode === 'yes') lines.push(`        codec: ${m}-codec`)
    })
    if (pills.sensors.length) {
      lines.push('sensors:')
      pills.sensors.forEach((s) => lines.push(`  - ${s}`))
    }
    if (f('width') || f('height') || f('length')) {
      lines.push('dimensions:')
      if (f('width')) lines.push(`  width: ${f('width')}`)
      if (f('length')) lines.push(`  length: ${f('length')}`)
      if (f('height')) lines.push(`  height: ${f('height')}`)
    }
    if (f('weight')) lines.push(`weight: ${f('weight')}`)
    if (powerSel && powerSel.value === 'battery' && (f('batteryType') || single.batteryReplaceable)) {
      lines.push('battery:')
      lines.push(`  replaceable: ${single.batteryReplaceable}`)
      if (f('batteryType')) lines.push(`  type: ${yamlStr(f('batteryType'))}`)
    }
    if (f('tempMin') && f('tempMax')) {
      lines.push('operatingConditions:')
      lines.push('  temperature:')
      lines.push(`    min: ${f('tempMin')}`)
      lines.push(`    max: ${f('tempMax')}`)
    }
    if (f('ip')) lines.push(`ipCode: ${f('ip')}`)
    lines.push('photos:')
    lines.push(`  main: ${m}.png`)
    if (f('productUrl')) lines.push(`productURL: ${f('productUrl')}`)
    if (f('datasheetUrl')) lines.push(`dataSheetURL: ${f('datasheetUrl')}`)
    return lines.join('\n') + '\n'
  }

  const profileYAML = () => {
    const lines = []
    lines.push(`macVersion: ${yamlStr(f('mac'))}`)
    lines.push(`regionalParametersVersion: ${f('regParams')}`)
    lines.push(`supportsJoin: ${single.join === 'otaa'}`)
    if (single.join === 'abp') {
      lines.push('# ABP devices must also define rx1Delay, rx2DataRateIndex, rx2Frequency,')
      lines.push('# and factoryPresetFrequencies — see the schema for details.')
    }
    lines.push(`maxEIRP: ${f('maxEirp') || 16}`)
    lines.push('supports32bitFCnt: true')
    lines.push(`supportsClassB: ${pills.classes.includes('B')}`)
    lines.push(`supportsClassC: ${pills.classes.includes('C')}`)
    return lines.join('\n') + '\n'
  }

  const codecYAML = () => {
    const m = model()
    return [
      'uplinkDecoder:',
      `  fileName: ${m}.js`,
      '  examples:',
      '    - description: Example uplink',
      '      input:',
      '        fPort: 1',
      '        bytes: [0x01, 0x02, 0x03]',
      '      output:',
      '        data: {}  # fill in the decoded fields for these bytes',
      '',
    ].join('\n')
  }

  const codecJS = () =>
    [
      'function decodeUplink(input) {',
      '  // input.bytes  — uplink payload byte array',
      '  // input.fPort  — LoRaWAN FPort',
      '  var data = {};',
      '  // TODO: decode input.bytes into data',
      '  return { data: data };',
      '}',
      '',
    ].join('\n')

  const indexYAML = () => {
    const m = model()
    return `endDevices:\n  - ${m}\n`
  }

  const vendorIndexSnippet = () =>
    [
      '# Add to vendor/index.yaml (vendorID is assigned by the LoRa Alliance TR005 registry):',
      `  - id: ${vendorSlug()}`,
      `    name: ${yamlStr(f('vendorName'))}`,
      '    vendorID: 0  # request via the LoRa Alliance',
      ...(f('vendorSite') ? [`    website: ${f('vendorSite')}`] : []),
      ...(f('vendorEmail') ? [`    email: ${f('vendorEmail')}`] : []),
      '',
    ].join('\n')

  const allFiles = () => {
    const m = model()
    const v = vendorSlug()
    const files = []
    if (vendorMode === 'new') files.push({ name: `vendor/index.yaml (snippet)`, body: vendorIndexSnippet() })
    files.push({ name: `vendor/${v}/index.yaml`, body: indexYAML() })
    files.push({ name: `vendor/${v}/${m}.yaml`, body: deviceYAML() })
    files.push({ name: `vendor/${v}/${m}-profile.yaml`, body: profileYAML() })
    if (codecMode === 'yes') {
      files.push({ name: `vendor/${v}/${m}-codec.yaml`, body: codecYAML() })
      files.push({ name: `vendor/${v}/${m}.js`, body: codecJS() })
    }
    return files
  }

  /* ----------------------------- Review ------------------------------ */

  const renderReview = () => {
    const table = root.querySelector('[data-review-table]')
    if (!table) return
    const vendorName = vendorMode === 'existing'
      ? (root.querySelector(`[data-f="vendor"] option[value="${f('vendor')}"]`) || {}).textContent || f('vendor')
      : f('vendorName')
    const rows = [
      ['Vendor', vendorName + (vendorMode === 'new' ? ' (new)' : '')],
      ['Device', `${f('name')} · ${model()}`],
      ['LoRaWAN', `MAC v${f('mac')} · Class ${pills.classes.join('/')} · ${single.join.toUpperCase()}`],
      ['Frequency plans', pills.plans.join(', ')],
      ['Sensors', pills.sensors.join(', ') || '—'],
      ['Codec', codecMode === 'yes' ? 'JavaScript decodeUplink stub included' : 'none'],
    ]
    table.innerHTML = ''
    rows.forEach(([k, v]) => {
      const tr = document.createElement('tr')
      const td1 = document.createElement('td')
      const td2 = document.createElement('td')
      td1.textContent = k
      td2.textContent = v
      tr.append(td1, td2)
      table.appendChild(tr)
    })
  }

  /* ----------------------------- Finish ------------------------------ */

  const finish = () => {
    const files = allFiles()
    const preview = files
      .map((file) => `# ──── ${file.name} ────\n${file.body}`)
      .join('\n')
    root.querySelector('[data-yaml-preview]').textContent = preview
    wizard.hidden = true
    success.hidden = false
    window.scrollTo(0, 0)

    root.querySelector('[data-download]').onclick = () => {
      files.forEach((file) => {
        const blob = new Blob([file.body], { type: 'text/yaml' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = file.name.split('/').pop().replace(' (snippet)', '.snippet.yaml')
        a.click()
        URL.revokeObjectURL(a.href)
      })
    }
  }

  root.querySelector('[data-restart]').addEventListener('click', () => {
    wizard.hidden = false
    success.hidden = true
    show(0)
  })

  show(0)
}
