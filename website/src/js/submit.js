// Submit-a-device wizard: guided steps that end in schema-validated YAML
// files plus a GitHub submission checklist for a pull request to
// TheThingsNetwork/lorawan-devices. Loaded only on /submit/.

import { initSteps, pillGroups, fields, slugify, yamlStr } from './wizard/core'
import { createCodecTester } from './wizard/codec-tester'
import { createPhotoCheck } from './wizard/photo-check'
import { codecYAML, codecJSStub, validateYAMLText } from './wizard/yaml-gen'
import { renderChecklist } from './wizard/checklist'
import { ghConfig } from './lib/gh'

const initSubmit = (root) => {
  const f = fields(root)
  const pills = pillGroups(root)
  const success = root.querySelector('[data-success]')
  const wizard = root.querySelector('.submit-layout')
  const cfg = ghConfig(root)

  let vendorMode = 'existing'
  let codecMode = 'yes'

  const model = () => slugify(f.get('model') || f.get('name'))
  const vendorSlug = () => (vendorMode === 'existing' ? f.get('vendor') : slugify(f.get('vendorSlug') || f.get('vendorName')))

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
      root.querySelector('[data-codec-body]').hidden = codecMode !== 'yes'
    }),
  )

  const powerSel = root.querySelector('[data-f="power"]')
  if (powerSel) {
    powerSel.addEventListener('change', () => {
      const battery = powerSel.value === 'battery'
      root.querySelectorAll('[data-battery-fields], [data-battery-fields2]').forEach((el) => (el.hidden = !battery))
    })
  }

  /* --------------------------- Codec & photo ------------------------- */

  const tester = createCodecTester(root.querySelector('[data-codec-tester]'))
  tester.setSource(codecJSStub())
  tester.setExamples([])

  const photo = createPhotoCheck(root.querySelector('[data-photo]'), {
    targetName: () => `${model()}.png`,
  })

  /* ------------------------- YAML generation ------------------------- */

  const deviceYAML = () => {
    const m = model()
    const lines = []
    lines.push(`name: ${yamlStr(f.get('name'))}`)
    lines.push(`description: ${yamlStr(f.get('desc'))}`)
    lines.push('hardwareVersions:')
    lines.push("  - version: '1.0'")
    lines.push('    numeric: 1')
    lines.push('firmwareVersions:')
    lines.push("  - version: '1.0'")
    lines.push('    numeric: 1')
    lines.push('    hardwareVersions:')
    lines.push("      - '1.0'")
    lines.push('    profiles:')
    pills.multi.plans.forEach((plan) => {
      lines.push(`      ${plan}:`)
      lines.push(`        id: ${m}-profile`)
      lines.push('        lorawanCertified: false')
      if (codecMode === 'yes') lines.push(`        codec: ${m}-codec`)
    })
    if (pills.multi.sensors.length) {
      lines.push('sensors:')
      pills.multi.sensors.forEach((s) => lines.push(`  - ${s}`))
    }
    if (f.get('width') || f.get('height') || f.get('length')) {
      lines.push('dimensions:')
      if (f.get('width')) lines.push(`  width: ${f.get('width')}`)
      if (f.get('length')) lines.push(`  length: ${f.get('length')}`)
      if (f.get('height')) lines.push(`  height: ${f.get('height')}`)
    }
    if (f.get('weight')) lines.push(`weight: ${f.get('weight')}`)
    if (powerSel && powerSel.value === 'battery' && (f.get('batteryType') || pills.single.batteryReplaceable)) {
      lines.push('battery:')
      lines.push(`  replaceable: ${pills.single.batteryReplaceable}`)
      if (f.get('batteryType')) lines.push(`  type: ${yamlStr(f.get('batteryType'))}`)
    }
    if (f.get('tempMin') && f.get('tempMax')) {
      lines.push('operatingConditions:')
      lines.push('  temperature:')
      lines.push(`    min: ${f.get('tempMin')}`)
      lines.push(`    max: ${f.get('tempMax')}`)
    }
    if (f.get('ip')) lines.push(`ipCode: ${f.get('ip')}`)
    lines.push('photos:')
    lines.push(`  main: ${m}.png`)
    if (f.get('productUrl')) lines.push(`productURL: ${f.get('productUrl')}`)
    if (f.get('datasheetUrl')) lines.push(`dataSheetURL: ${f.get('datasheetUrl')}`)
    return lines.join('\n') + '\n'
  }

  const profileYAML = () => {
    const lines = []
    lines.push(`macVersion: ${yamlStr(f.get('mac'))}`)
    lines.push(`regionalParametersVersion: ${f.get('regParams')}`)
    lines.push(`supportsJoin: ${pills.single.join === 'otaa'}`)
    if (pills.single.join === 'abp') {
      lines.push('# ABP devices must also define rx1Delay, rx2DataRateIndex, rx2Frequency,')
      lines.push('# and factoryPresetFrequencies — see the schema for details.')
    }
    lines.push(`maxEIRP: ${f.get('maxEirp') || 16}`)
    lines.push('supports32bitFCnt: true')
    lines.push(`supportsClassB: ${pills.multi.classes.includes('B')}`)
    lines.push(`supportsClassC: ${pills.multi.classes.includes('C')}`)
    return lines.join('\n') + '\n'
  }

  const indexYAML = () => `endDevices:\n  - ${model()}\n`

  const vendorIndexSnippet = () =>
    [
      '# Add to vendor/index.yaml (vendorID is assigned by the LoRa Alliance TR005 registry):',
      `  - id: ${vendorSlug()}`,
      `    name: ${yamlStr(f.get('vendorName'))}`,
      '    vendorID: 0  # request via the LoRa Alliance',
      ...(f.get('vendorSite') ? [`    website: ${f.get('vendorSite')}`] : []),
      ...(f.get('vendorEmail') ? [`    email: ${f.get('vendorEmail')}`] : []),
      '',
    ].join('\n')

  const allFiles = () => {
    const m = model()
    const v = vendorSlug()
    const files = []
    if (vendorMode === 'new')
      files.push({ path: 'vendor/index.yaml', body: vendorIndexSnippet(), kind: 'edit', note: 'append your vendor entry to the alphabetical list' })
    files.push({ path: `vendor/${v}/index.yaml`, body: indexYAML(), kind: vendorMode === 'new' ? 'new' : 'edit', note: vendorMode === 'new' ? undefined : `add “- ${m}” to the endDevices list` })
    files.push({ path: `vendor/${v}/${m}.yaml`, body: deviceYAML(), kind: 'new' })
    files.push({ path: `vendor/${v}/${m}-profile.yaml`, body: profileYAML(), kind: 'new' })
    if (codecMode === 'yes') {
      files.push({ path: `vendor/${v}/${m}-codec.yaml`, body: codecYAML(m, tester.getExamples()), kind: 'new' })
      files.push({ path: `vendor/${v}/${m}.js`, body: tester.getSource() + (tester.getSource().endsWith('\n') ? '' : '\n'), kind: 'new' })
    }
    files.push({
      path: `vendor/${v}/${m}.png`,
      body: null,
      kind: 'binary',
      note: photo.hasFile() ? `upload the photo you validated (${photo.fileName()})` : 'product photo — PNG, transparent background, max 2000 × 2000 px',
    })
    return files
  }

  /* ----------------------------- Review ------------------------------ */

  const renderValidation = () => {
    const box = root.querySelector('[data-validation]')
    if (!box) return
    const m = model()
    const results = [
      [`${m}.yaml`, validateYAMLText('device', deviceYAML())],
      [`${m}-profile.yaml`, validateYAMLText('profile', profileYAML())],
    ]
    if (codecMode === 'yes') results.push([`${m}-codec.yaml`, validateYAMLText('codec', codecYAML(m, tester.getExamples()))])
    box.innerHTML = ''
    results.forEach(([name, problems]) => {
      const div = document.createElement('div')
      div.className = 'val-row ' + (problems.length ? 'fail' : 'pass')
      div.innerHTML = `<span class="val-ico">${problems.length ? '✕' : '✓'}</span><code></code><span class="val-msg"></span>`
      div.querySelector('code').textContent = name
      div.querySelector('.val-msg').textContent = problems.length ? problems.join(' · ') : 'valid against the repository schema'
      box.appendChild(div)
    })
    return results.every(([, p]) => !p.length)
  }

  const renderReview = () => {
    const table = root.querySelector('[data-review-table]')
    if (!table) return
    const vendorName =
      vendorMode === 'existing'
        ? (root.querySelector(`[data-f="vendor"] option[value="${f.get('vendor')}"]`) || {}).textContent || f.get('vendor')
        : f.get('vendorName')
    const examples = tester.getExamples()
    const rows = [
      ['Vendor', vendorName + (vendorMode === 'new' ? ' (new)' : '')],
      ['Device', `${f.get('name')} · ${model()}`],
      ['LoRaWAN', `MAC v${f.get('mac')} · Class ${pills.multi.classes.join('/')} · ${pills.single.join.toUpperCase()}`],
      ['Frequency plans', pills.multi.plans.join(', ')],
      ['Sensors', pills.multi.sensors.join(', ') || '—'],
      ['Codec', codecMode === 'yes' ? `JavaScript decodeUplink with ${examples.length} example${examples.length === 1 ? '' : 's'}` : 'none'],
      ['Photo', photo.hasFile() ? `${photo.fileName()} checked locally` : 'not checked — required in the pull request'],
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
    renderValidation()
  }

  /* ------------------------------ Steps ------------------------------ */

  const validate = (step) => {
    if (step === 0) return vendorMode === 'existing' ? !!f.get('vendor') : !!(f.get('vendorName') && slugify(f.get('vendorSlug') || f.get('vendorName')))
    if (step === 1) return !!(f.get('name') && f.get('desc') && model())
    if (step === 2) return pills.multi.plans.length > 0
    return true
  }

  const panelsCount = root.querySelectorAll('[data-step-panel]').length
  const steps = initSteps({
    root,
    validate,
    finishLabel: '⚡ Generate submission',
    onShow: (i) => {
      if (i === panelsCount - 1) renderReview()
    },
    onFinish: () => finish(),
  })

  /* ----------------------------- Finish ------------------------------ */

  const finish = () => {
    const files = allFiles()
    const textFiles = files.filter((file) => file.body != null)
    root.querySelector('[data-yaml-preview]').textContent = textFiles.map((file) => `# ──── ${file.path} ────\n${file.body}`).join('\n')

    const m = model()
    const v = vendorSlug()
    renderChecklist(root.querySelector('[data-checklist]'), cfg, files, {
      prTitle: `Add ${vendorName()} ${f.get('name')}`,
      prBody: [
        `Adds \`${v}/${m}\` to the Device Repository, generated with the submit wizard on the website.`,
        '',
        codecMode === 'yes' ? `- payload codec with ${tester.getExamples().length} example(s), tested in the browser runner` : '- no payload codec yet',
        '- [ ] product photo included',
      ].join('\n'),
    })

    wizard.hidden = true
    success.hidden = false
    window.scrollTo(0, 0)

    root.querySelector('[data-download]').onclick = () => {
      textFiles.forEach((file) => {
        const blob = new Blob([file.body], { type: 'text/yaml' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = file.path.split('/').pop()
        a.click()
        URL.revokeObjectURL(a.href)
      })
    }
  }

  const vendorName = () =>
    vendorMode === 'existing'
      ? ((root.querySelector(`[data-f="vendor"] option[value="${f.get('vendor')}"]`) || {}).textContent || f.get('vendor')).trim()
      : f.get('vendorName')

  root.querySelector('[data-restart]').addEventListener('click', () => {
    wizard.hidden = false
    success.hidden = true
    steps.show(0)
  })
}

const init = () => {
  const root = document.querySelector('[data-submit-wizard]')
  if (root) initSubmit(root)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
