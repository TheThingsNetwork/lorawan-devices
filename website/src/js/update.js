// Update-a-device wizard: prefilled from the raw vendor YAML on GitHub
// (the source of truth, not the last site build), edited through the same
// step UI as the submit flow, and emitted as comment-preserving patches
// with a per-file diff and a GitHub submission checklist.
// Loaded only on /update/.

import { initSteps, pillGroups, fields } from './wizard/core'
import { createCodecTester } from './wizard/codec-tester'
import { createPhotoCheck } from './wizard/photo-check'
import { examplesYAMLLines, validateYAMLText } from './wizard/yaml-gen'
import { renderChecklist } from './wizard/checklist'
import { submitViaBackend } from './wizard/submit-backend'
import { renderCliPanel } from './wizard/cli-script'
import { createPatcher } from './lib/yaml-splice'
import { diffLines, toHunks } from './lib/diff'
import { ghConfig, fetchRaw, rawURL } from './lib/gh'
import { backendBase } from './lib/backend'
import { deepEqual } from './lib/deep-equal'

const ALL_PLANS = ['EU863-870', 'US902-928', 'AU915-928', 'AS923', 'AS923-2', 'AS923-3', 'AS923-4', 'KR920-923', 'IN865-867', 'RU864-870', 'CN470-510', 'CN779-787', 'EU433']
const MAC_VERSIONS = ['1.0', '1.0.1', '1.0.2', '1.0.3', '1.0.4', '1.1']
const REG_PARAMS = ['TS001-1.0', 'TS001-1.0.1', 'RP001-1.0.2', 'RP001-1.0.2-RevB', 'RP001-1.0.3-RevA', 'RP001-1.1-RevA', 'RP001-1.1-RevB', 'RP002-1.0.0', 'RP002-1.0.1', 'RP002-1.0.2', 'RP002-1.0.3', 'RP002-1.0.4']

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
const num = (v) => (v === '' || v == null ? null : parseFloat(v))

export const initUpdate = (root) => {
  const cfg = ghConfig(root)
  const f = fields(root)
  const pills = pillGroups(root)
  const picker = root.querySelector('[data-upd-picker]')
  const wizard = root.querySelector('[data-upd-wizard]')
  const success = root.querySelector('[data-success]')
  const tester = createCodecTester(root.querySelector('[data-codec-tester]'))

  const state = {
    vendorId: null,
    modelId: null,
    device: null, // {path, text, js}
    profiles: new Map(), // id -> {path, text, js, missing}
    codecs: new Map(), // id -> {path, text, js}
    codecJs: new Map(), // fileName -> {path, text}
    codecEdits: new Map(), // codecId -> {source, examples}
    currentCodec: null,
    fw: [], // working copy of firmwareVersions
    newProfiles: [], // {id, copyOf}
    photo: null,
  }
  let lastBuild = null

  /* ------------------------------ Picker ------------------------------ */

  const catalog = window.updateCatalog || []
  const vendorSel = picker.querySelector('[data-upd-vendor]')
  const deviceSel = picker.querySelector('[data-upd-device]')
  const loadBtn = picker.querySelector('[data-upd-load]')
  const errBox = picker.querySelector('[data-upd-error]')

  catalog.forEach((v) => {
    const o = document.createElement('option')
    o.value = v.id
    o.textContent = v.name
    vendorSel.appendChild(o)
  })

  const syncDevices = () => {
    const v = catalog.find((x) => x.id === vendorSel.value)
    deviceSel.innerHTML = ''
    ;((v && v.devices) || []).forEach((d) => {
      const o = document.createElement('option')
      o.value = d.id
      o.textContent = d.name
      deviceSel.appendChild(o)
    })
  }
  vendorSel.addEventListener('change', syncDevices)
  syncDevices()

  loadBtn.addEventListener('click', () => load(vendorSel.value, deviceSel.value))

  /* ------------------------------ Loading ----------------------------- */

  const setLoading = (on, msg) => {
    loadBtn.disabled = on
    loadBtn.textContent = on ? 'Loading from GitHub…' : 'Load device'
    errBox.hidden = !msg
    errBox.textContent = msg || ''
  }

  const load = async (vendorId, modelId) => {
    setLoading(true)
    try {
      const devicePath = `vendor/${vendorId}/${modelId}.yaml`
      const deviceText = await fetchRaw(cfg, devicePath)
      const deviceDoc = createPatcher(deviceText).doc
      const js = deviceDoc.toJS()

      state.vendorId = vendorId
      state.modelId = modelId
      state.device = { path: devicePath, text: deviceText, js }
      state.fw = JSON.parse(JSON.stringify(js.firmwareVersions || []))
      state.profiles.clear()
      state.codecs.clear()
      state.codecJs.clear()
      state.codecEdits.clear()
      state.newProfiles = []

      const profileIds = new Set()
      const codecIds = new Set()
      ;(js.firmwareVersions || []).forEach((fw) =>
        Object.values(fw.profiles || {}).forEach((p) => {
          if (p && p.id) profileIds.add(p.id)
          if (p && p.codec) codecIds.add(p.codec)
        }),
      )

      for (const id of profileIds) {
        const path = `vendor/${vendorId}/${id}.yaml`
        try {
          const text = await fetchRaw(cfg, path)
          state.profiles.set(id, { path, text, js: createPatcher(text).doc.toJS() })
        } catch (e) {
          state.profiles.set(id, { path, text: null, js: null, missing: true })
        }
      }
      for (const id of codecIds) {
        const path = `vendor/${vendorId}/${id}.yaml`
        try {
          const text = await fetchRaw(cfg, path)
          const cjs = createPatcher(text).doc.toJS()
          state.codecs.set(id, { path, text, js: cjs })
          const fileName = cjs && cjs.uplinkDecoder && cjs.uplinkDecoder.fileName
          if (fileName && !state.codecJs.has(fileName)) {
            const jsPath = `vendor/${vendorId}/${fileName}`
            try {
              state.codecJs.set(fileName, { path: jsPath, text: await fetchRaw(cfg, jsPath) })
            } catch (e) {
              state.codecJs.set(fileName, { path: jsPath, text: '' })
            }
          }
        } catch (e) {
          /* codec yaml missing, skip */
        }
      }

      prefill()
      picker.hidden = true
      wizard.hidden = false
      const q = new URLSearchParams(location.search)
      q.set('vendor', vendorId)
      q.set('model', modelId)
      history.replaceState(null, '', `${location.pathname}?${q}`)
      window.scrollTo(0, 0)
    } catch (e) {
      setLoading(false, `Could not load ${vendorId}/${modelId} from ${cfg.repo}@${cfg.branch}: ${e.message || e}. New devices that are not on ${cfg.branch} yet can't be updated here, use the submit wizard instead.`)
      return
    }
    setLoading(false)
  }

  /* ------------------------------ Prefill ----------------------------- */

  const ensureOption = (sel, value) => {
    if (value == null || value === '') return
    if (![...sel.options].some((o) => o.value === String(value))) {
      const o = document.createElement('option')
      o.value = String(value)
      o.textContent = String(value)
      sel.appendChild(o)
    }
  }

  const ensurePill = (key, value) => {
    const group = root.querySelector(`[data-pills="${key}"]`)
    if (!group || group.querySelector(`[value="${CSS.escape(value)}"]`)) return
    const b = document.createElement('button')
    b.className = 'filter-pill'
    b.setAttribute('value', value)
    b.textContent = value
    group.appendChild(b)
    b.addEventListener('click', () => {
      const set = new Set(pills.multi[key] || [])
      set.has(value) ? set.delete(value) : set.add(value)
      pills.multi[key] = [...set]
      b.classList.toggle('active')
    })
  }

  const prefill = () => {
    const js = state.device.js
    root.querySelector('[data-upd-title]').textContent = js.name || state.modelId
    root.querySelector('[data-upd-path]').textContent = state.device.path
    root.querySelectorAll('[data-upd-vendor-name]').forEach((el) => {
      const v = catalog.find((x) => x.id === state.vendorId)
      el.textContent = v ? v.name : state.vendorId
    })

    f.set('name', js.name)
    f.set('desc', js.description)
    f.set('productUrl', js.productURL)
    f.set('datasheetUrl', js.dataSheetURL)
    ;(js.sensors || []).forEach((s) => ensurePill('sensors', s))
    pills.set('sensors', js.sensors || [])

    const dim = js.dimensions || {}
    f.set('width', dim.width)
    f.set('height', dim.height)
    f.set('length', dim.length)
    f.set('diameter', dim.diameter)
    f.set('weight', js.weight)
    const ipSel = root.querySelector('[data-f="ip"]')
    ensureOption(ipSel, js.ipCode)
    f.set('ip', js.ipCode || '')
    const powerSel = root.querySelector('[data-f="power"]')
    powerSel.value = js.battery ? 'battery' : 'mains'
    root.querySelectorAll('[data-battery-fields], [data-battery-fields2]').forEach((el) => (el.hidden = !js.battery))
    f.set('batteryType', js.battery ? js.battery.type : '')
    pills.setSingle('batteryReplaceable', js.battery && js.battery.replaceable ? 'true' : 'false')
    const temp = (js.operatingConditions || {}).temperature || {}
    f.set('tempMin', temp.min)
    f.set('tempMax', temp.max)

    renderFw()
    renderProfiles()
    initCodecStep()
    initPhotoStep()
  }

  const powerSel = root.querySelector('[data-f="power"]')
  powerSel.addEventListener('change', () => {
    const battery = powerSel.value === 'battery'
    root.querySelectorAll('[data-battery-fields], [data-battery-fields2]').forEach((el) => (el.hidden = !battery))
  })

  /* ----------------------- LoRaWAN & versions ------------------------ */

  const fwList = root.querySelector('[data-fw-list]')

  const renderFw = () => {
    fwList.innerHTML = ''
    state.fw.forEach((fw, i) => {
      const card = document.createElement('div')
      card.className = 'fw-card'
      const isNew = i >= (state.device.js.firmwareVersions || []).length
      const plans = Object.keys(fw.profiles || {})
      card.innerHTML = `
        <div class="fw-head">
          <strong>Firmware ${esc(fw.version || '?')}</strong>
          ${isNew ? '<span class="upd-badge">new</span>' : ''}
          <span class="s-hint">${plans.length} frequency plan${plans.length === 1 ? '' : 's'}</span>
        </div>
        <div class="plan-chips"></div>
        <div class="plan-add">
          <select data-add-plan></select>
          <select data-add-profile></select>
          <button class="btn btn-secondary btn-sm" data-add-btn>+ Add plan</button>
        </div>`
      const chips = card.querySelector('.plan-chips')
      plans.forEach((plan) => {
        const chip = document.createElement('span')
        chip.className = 'plan-chip'
        chip.innerHTML = `${esc(plan)} <code>${esc((fw.profiles[plan] || {}).id || '')}</code><button aria-label="Remove ${esc(plan)}" ${plans.length === 1 ? 'disabled title="A firmware version needs at least one plan"' : ''}>×</button>`
        chip.querySelector('button').addEventListener('click', () => {
          delete fw.profiles[plan]
          renderFw()
        })
        chips.appendChild(chip)
      })
      const planSel = card.querySelector('[data-add-plan]')
      ALL_PLANS.filter((p) => !plans.includes(p)).forEach((p) => {
        const o = document.createElement('option')
        o.value = p
        o.textContent = p
        planSel.appendChild(o)
      })
      const profSel = card.querySelector('[data-add-profile]')
      const profileIds = [...new Set([...state.profiles.keys(), ...state.newProfiles.map((n) => n.id)])]
      profileIds.forEach((id) => {
        const o = document.createElement('option')
        o.value = id
        o.textContent = id
        profSel.appendChild(o)
      })
      card.querySelector('[data-add-btn]').addEventListener('click', () => {
        if (!planSel.value || !profSel.value) return
        const entry = { id: profSel.value }
        const codecOfProfile = Object.values(fw.profiles || {}).find((p) => p && p.codec)
        if (codecOfProfile) entry.codec = codecOfProfile.codec
        fw.profiles = fw.profiles || {}
        fw.profiles[planSel.value] = entry
        renderFw()
      })
      fwList.appendChild(card)
    })
  }

  root.querySelector('[data-fw-add]').addEventListener('click', () => {
    const input = root.querySelector('[data-fw-version]')
    const version = input.value.trim()
    if (!version) {
      input.focus()
      return
    }
    if (state.fw.some((fw) => fw.version === version)) {
      input.value = ''
      return
    }
    const last = state.fw[state.fw.length - 1] || {}
    const maxNumeric = Math.max(0, ...state.fw.map((fw) => fw.numeric || 0))
    const next = { version, numeric: maxNumeric + 1 }
    if (last.hardwareVersions) next.hardwareVersions = JSON.parse(JSON.stringify(last.hardwareVersions))
    next.profiles = JSON.parse(JSON.stringify(last.profiles || {}))
    state.fw.push(next)
    input.value = ''
    renderFw()
  })

  /* ----------------------------- Profiles ----------------------------- */

  const profList = root.querySelector('[data-prof-list]')

  const classFields = (prefix, js) => `
    <div class="s-grid" data-class-fields="${prefix}" ${js[`supportsClass${prefix}`] ? '' : 'hidden'}>
      ${prefix === 'B' ? `
      <div class="s-field"><label>Class B timeout (s)</label><input data-p="classBTimeout" type="number" value="${js.classBTimeout != null ? js.classBTimeout : 60}" /></div>
      <div class="s-field"><label>Ping slot period (s)</label><input data-p="pingSlotPeriod" type="number" value="${js.pingSlotPeriod != null ? js.pingSlotPeriod : 128}" /></div>
      <div class="s-field"><label>Ping slot data rate index</label><input data-p="pingSlotDataRateIndex" type="number" value="${js.pingSlotDataRateIndex != null ? js.pingSlotDataRateIndex : 0}" /></div>
      <div class="s-field"><label>Ping slot frequency (MHz)</label><input data-p="pingSlotFrequency" type="number" step="0.001" value="${js.pingSlotFrequency != null ? js.pingSlotFrequency : 0}" /></div>
      ` : `
      <div class="s-field"><label>Class C timeout (s)</label><input data-p="classCTimeout" type="number" value="${js.classCTimeout != null ? js.classCTimeout : 60}" /></div>
      `}
    </div>`

  const renderProfiles = () => {
    profList.innerHTML = ''
    state.profiles.forEach((prof, id) => {
      const card = document.createElement('div')
      card.className = 'prof-card'
      card.dataset.profileId = id
      if (prof.missing) {
        card.innerHTML = `<div class="prof-head">${esc(id)}.yaml</div><p class="s-hint">Could not load this profile from GitHub, it stays unchanged.</p>`
        profList.appendChild(card)
        return
      }
      const js = prof.js
      card.innerHTML = `
        <div class="prof-head">${esc(id)}.yaml · ${js.supportsJoin ? 'OTAA' : 'ABP'}</div>
        <div class="s-grid">
          <div class="s-field"><label>MAC version</label><select data-p="macVersion"></select></div>
          <div class="s-field"><label>Regional parameters</label><select data-p="regionalParametersVersion"></select></div>
          <div class="s-field"><label>Max EIRP (dBm)</label><input data-p="maxEIRP" type="number" step="0.1" value="${js.maxEIRP != null ? js.maxEIRP : ''}" /></div>
          <div class="s-field">
            <label>Device classes</label>
            <div style="display:flex; gap:14px; align-items:center; min-height: 38px;">
              <label class="s-hint" style="display:flex;gap:5px;align-items:center;"><input type="checkbox" data-p="supportsClassB" ${js.supportsClassB ? 'checked' : ''}/> Class B</label>
              <label class="s-hint" style="display:flex;gap:5px;align-items:center;"><input type="checkbox" data-p="supportsClassC" ${js.supportsClassC ? 'checked' : ''}/> Class C</label>
            </div>
          </div>
        </div>
        ${classFields('B', js)}
        ${classFields('C', js)}`
      const macSel = card.querySelector('[data-p="macVersion"]')
      MAC_VERSIONS.forEach((v) => {
        const o = document.createElement('option')
        o.value = v
        o.textContent = v
        macSel.appendChild(o)
      })
      ensureOption(macSel, js.macVersion)
      macSel.value = String(js.macVersion || '')
      const regSel = card.querySelector('[data-p="regionalParametersVersion"]')
      REG_PARAMS.forEach((v) => {
        const o = document.createElement('option')
        o.value = v
        o.textContent = v
        regSel.appendChild(o)
      })
      ensureOption(regSel, js.regionalParametersVersion)
      regSel.value = String(js.regionalParametersVersion || '')
      card.querySelector('[data-p="supportsClassB"]').addEventListener('change', (e) => {
        card.querySelector('[data-class-fields="B"]').hidden = !e.target.checked
      })
      card.querySelector('[data-p="supportsClassC"]').addEventListener('change', (e) => {
        card.querySelector('[data-class-fields="C"]').hidden = !e.target.checked
      })
      profList.appendChild(card)
    })
  }

  /* ------------------------------ Codec ------------------------------- */

  const codecSel = root.querySelector('[data-codec-select]')
  const codecNone = root.querySelector('[data-codec-none]')
  const codecBody = root.querySelector('[data-codec-body]')

  const codecFileName = (id) => {
    const c = state.codecs.get(id)
    return c && c.js && c.js.uplinkDecoder && c.js.uplinkDecoder.fileName
  }

  const saveCodecEdits = () => {
    if (!state.currentCodec) return
    state.codecEdits.set(state.currentCodec, { source: tester.getSource(), examples: tester.getExamples() })
  }

  const showCodec = (id) => {
    state.currentCodec = id
    const edits = state.codecEdits.get(id)
    const c = state.codecs.get(id)
    const fileName = codecFileName(id)
    const jsFile = fileName && state.codecJs.get(fileName)
    tester.setSource(edits ? edits.source : (jsFile && jsFile.text) || '')
    tester.setExamples(edits ? edits.examples : (c.js.uplinkDecoder && c.js.uplinkDecoder.examples) || [])
  }

  const initCodecStep = () => {
    const ids = [...state.codecs.keys()].filter((id) => codecFileName(id))
    state.currentCodec = null
    codecSel.innerHTML = ''
    if (!ids.length) {
      codecNone.hidden = false
      codecBody.hidden = true
      return
    }
    codecNone.hidden = true
    codecBody.hidden = false
    ids.forEach((id) => {
      const o = document.createElement('option')
      o.value = id
      o.textContent = `${id}.yaml · ${codecFileName(id)}`
      codecSel.appendChild(o)
    })
    codecSel.parentElement.hidden = ids.length < 2
    codecSel.addEventListener('change', () => {
      saveCodecEdits()
      showCodec(codecSel.value)
    })
    showCodec(ids[0])
  }

  /* ------------------------------ Photo ------------------------------- */

  const photoTarget = () => {
    const js = state.device.js
    return js.photos && js.photos.main ? js.photos.main.split('/').pop() : `${state.modelId}.png`
  }

  const photo = createPhotoCheck(root.querySelector('[data-photo]'), { targetName: photoTarget })

  const initPhotoStep = () => {
    const cur = root.querySelector('[data-photo-current]')
    const js = state.device.js
    if (js.photos && js.photos.main) {
      cur.hidden = false
      cur.querySelector('img').src = rawURL(cfg, `vendor/${state.vendorId}/${js.photos.main}`)
      cur.querySelector('code').textContent = js.photos.main
    } else {
      cur.hidden = true
    }
  }

  /* --------------------------- Build changes -------------------------- */

  const setOrRemove = (p, path, newVal, oldVal, changes, label) => {
    const a = newVal === '' || newVal == null ? null : newVal
    const b = oldVal === undefined ? null : oldVal
    if (a === null && b === null) return
    if (a !== null && b !== null && String(a) === String(b)) return
    if (a === null) {
      p.remove(path)
      changes.push(`removed ${label}`)
    } else {
      p.set(path, a)
      changes.push(b === null ? `added ${label}` : `updated ${label}`)
    }
  }

  const build = () => {
    const js = state.device.js
    const changes = []
    const files = []

    /* device file */
    const p = createPatcher(state.device.text)
    setOrRemove(p, ['name'], f.get('name'), js.name, changes, 'name')
    setOrRemove(p, ['description'], f.get('desc'), js.description, changes, 'description')
    setOrRemove(p, ['productURL'], f.get('productUrl'), js.productURL, changes, 'product URL')
    setOrRemove(p, ['dataSheetURL'], f.get('datasheetUrl'), js.dataSheetURL, changes, 'datasheet URL')

    const sensors = pills.multi.sensors || []
    if (!deepEqual([...sensors].sort(), [...(js.sensors || [])].sort())) {
      if (!sensors.length) p.remove(['sensors'])
      else if (js.sensors) p.replaceBlock(['sensors'], sensors.map((s) => `- ${s}`))
      else p.set(['sensors'], sensors)
      changes.push('updated sensors')
    }

    const dims = { width: num(f.get('width')), height: num(f.get('height')), length: num(f.get('length')), diameter: num(f.get('diameter')) }
    const oldDims = js.dimensions || null
    const newDims = Object.fromEntries(Object.entries(dims).filter(([, v]) => v != null))
    if (!deepEqual(newDims, oldDims || {})) {
      if (!Object.keys(newDims).length) {
        if (oldDims) p.remove(['dimensions'])
      } else if (!oldDims) {
        p.set(['dimensions'], newDims)
      } else {
        for (const k of Object.keys(dims)) setOrRemove(p, ['dimensions', k], dims[k], oldDims[k], [], k)
      }
      changes.push('updated dimensions')
    }
    setOrRemove(p, ['weight'], num(f.get('weight')), js.weight, changes, 'weight')
    setOrRemove(p, ['ipCode'], f.get('ip'), js.ipCode, changes, 'IP rating')

    const wantBattery = powerSel.value === 'battery'
    if (!wantBattery && js.battery) {
      p.remove(['battery'])
      changes.push('removed battery info')
    } else if (wantBattery) {
      const newBat = { replaceable: pills.single.batteryReplaceable === 'true' }
      if (f.get('batteryType')) newBat.type = f.get('batteryType')
      if (!js.battery) {
        p.set(['battery'], newBat)
        changes.push('added battery info')
      } else {
        if (newBat.replaceable !== !!js.battery.replaceable) {
          p.set(['battery', 'replaceable'], newBat.replaceable)
          changes.push('updated battery')
        }
        setOrRemove(p, ['battery', 'type'], newBat.type || '', js.battery.type, changes, 'battery type')
      }
    }

    const tMin = num(f.get('tempMin'))
    const tMax = num(f.get('tempMax'))
    const oldTemp = (js.operatingConditions || {}).temperature
    if (tMin != null && tMax != null) {
      if (!oldTemp) {
        if (js.operatingConditions) p.set(['operatingConditions', 'temperature'], { min: tMin, max: tMax })
        else p.set(['operatingConditions'], { temperature: { min: tMin, max: tMax } })
        changes.push('added operating temperature')
      } else if (oldTemp.min !== tMin || oldTemp.max !== tMax) {
        if (oldTemp.min !== tMin) p.set(['operatingConditions', 'temperature', 'min'], tMin)
        if (oldTemp.max !== tMax) p.set(['operatingConditions', 'temperature', 'max'], tMax)
        changes.push('updated operating temperature')
      }
    } else if (tMin == null && tMax == null && oldTemp) {
      if (Object.keys(js.operatingConditions).length === 1) p.remove(['operatingConditions'])
      else p.remove(['operatingConditions', 'temperature'])
      changes.push('removed operating temperature')
    }

    /* firmware versions: plans added/removed + appended versions */
    const origFw = js.firmwareVersions || []
    state.fw.forEach((fw, i) => {
      if (i >= origFw.length) {
        p.set(['firmwareVersions', i], fw)
        changes.push(`added firmware version ${fw.version}`)
        return
      }
      const origPlans = origFw[i].profiles || {}
      const curPlans = fw.profiles || {}
      for (const plan of Object.keys(curPlans)) {
        if (!origPlans[plan]) {
          p.set(['firmwareVersions', i, 'profiles', plan], curPlans[plan])
          changes.push(`added ${plan} to firmware ${fw.version}`)
        }
      }
      for (const plan of Object.keys(origPlans)) {
        if (!curPlans[plan]) {
          p.remove(['firmwareVersions', i, 'profiles', plan])
          changes.push(`removed ${plan} from firmware ${fw.version}`)
        }
      }
    })

    /* photo addition (replacements keep the same file name) */
    if (photo.hasFile() && !(js.photos && js.photos.main)) {
      p.set(['photos'], { main: `${state.modelId}.png` })
      changes.push('added photo reference')
    }

    if (p.hasEdits()) {
      const r = p.apply()
      files.push({ path: state.device.path, kind: 'edit', oldText: state.device.text, body: r.text, reformatted: r.reformatted, validateKind: 'device' })
    }

    /* profile files */
    state.profiles.forEach((prof, id) => {
      if (prof.missing) return
      const card = profList.querySelector(`[data-profile-id="${CSS.escape(id)}"]`)
      if (!card) return
      const get = (name) => card.querySelector(`[data-p="${name}"]`)
      const pp = createPatcher(prof.text)
      const pjs = prof.js
      const pChanges = []
      setOrRemove(pp, ['macVersion'], get('macVersion').value, pjs.macVersion, pChanges, 'MAC version')
      setOrRemove(pp, ['regionalParametersVersion'], get('regionalParametersVersion').value, pjs.regionalParametersVersion, pChanges, 'regional parameters')
      const eirp = num(get('maxEIRP').value)
      if (eirp != null && eirp !== pjs.maxEIRP) {
        pp.set(['maxEIRP'], eirp)
        pChanges.push('max EIRP')
      }
      const classB = get('supportsClassB').checked
      if (classB !== !!pjs.supportsClassB) {
        pp.set(['supportsClassB'], classB)
        pChanges.push(`class B ${classB ? 'enabled' : 'disabled'}`)
        if (!classB) ['classBTimeout', 'pingSlotPeriod', 'pingSlotDataRateIndex', 'pingSlotFrequency'].forEach((k) => pjs[k] !== undefined && pp.remove([k]))
      }
      if (classB) {
        ;['classBTimeout', 'pingSlotPeriod', 'pingSlotDataRateIndex', 'pingSlotFrequency'].forEach((k) => {
          const v = num(get(k).value)
          if (v != null && v !== pjs[k]) pp.set([k], v)
        })
      }
      const classC = get('supportsClassC').checked
      if (classC !== !!pjs.supportsClassC) {
        pp.set(['supportsClassC'], classC)
        pChanges.push(`class C ${classC ? 'enabled' : 'disabled'}`)
        if (!classC && pjs.classCTimeout !== undefined) pp.remove(['classCTimeout'])
      }
      if (classC) {
        const v = num(get('classCTimeout').value)
        if (v != null && v !== pjs.classCTimeout) pp.set(['classCTimeout'], v)
      }
      if (pp.hasEdits()) {
        const r = pp.apply()
        files.push({ path: prof.path, kind: 'edit', oldText: prof.text, body: r.text, reformatted: r.reformatted, validateKind: 'profile' })
        changes.push(`updated ${id}.yaml${pChanges.length ? ` (${pChanges.join(', ')})` : ''}`)
      }
    })

    /* codec files */
    saveCodecEdits()
    state.codecEdits.forEach((edit, id) => {
      const c = state.codecs.get(id)
      const fileName = codecFileName(id)
      const jsFile = state.codecJs.get(fileName)
      const origExamples = (c.js.uplinkDecoder && c.js.uplinkDecoder.examples) || []
      if (!deepEqual(edit.examples, origExamples)) {
        const cp = createPatcher(c.text)
        if (origExamples.length) cp.replaceBlock(['uplinkDecoder', 'examples'], examplesYAMLLines(edit.examples))
        else cp.set(['uplinkDecoder', 'examples'], edit.examples)
        const r = cp.apply()
        files.push({ path: c.path, kind: 'edit', oldText: c.text, body: r.text, reformatted: r.reformatted, validateKind: 'codec' })
        changes.push(`updated codec examples (${origExamples.length} → ${edit.examples.length})`)
      }
      if (jsFile && edit.source !== jsFile.text) {
        files.push({ path: jsFile.path, kind: 'edit', oldText: jsFile.text, body: edit.source.endsWith('\n') ? edit.source : edit.source + '\n' })
        changes.push(`updated ${fileName}`)
      }
    })

    /* photo binary */
    if (photo.hasFile()) {
      files.push({ path: `vendor/${state.vendorId}/${photoTarget()}`, kind: 'binary', body: null, note: `upload the photo you validated (${photo.fileName()})` })
      changes.push('replaced product photo')
    }

    return { files, changes }
  }

  /* --------------------------- Review & finish ------------------------ */

  const renderDiffs = (result) => {
    const list = root.querySelector('[data-diff-list]')
    const empty = root.querySelector('[data-diff-empty]')
    list.innerHTML = ''
    const textFiles = result.files.filter((file) => file.body != null)
    empty.hidden = textFiles.length > 0 || result.files.length > 0
    textFiles.forEach((file) => {
      const ops = diffLines(file.oldText || '', file.body)
      const adds = ops.filter((o) => o.type === 'add').length
      const dels = ops.filter((o) => o.type === 'del').length
      const box = document.createElement('div')
      box.className = 'diff-file'
      box.innerHTML = `
        <div class="diff-head">
          <code></code>
          ${file.reformatted ? '<span class="diff-note">file was reformatted, review the whole diff</span>' : ''}
          <span class="diff-stat"><span class="plus">+${adds}</span><span class="minus">−${dels}</span></span>
        </div>
        <div class="diff-body"></div>`
      box.querySelector('code').textContent = file.path
      const body = box.querySelector('.diff-body')
      toHunks(ops).forEach((row) => {
        const div = document.createElement('div')
        if (row.type === 'skip') {
          div.className = 'dline skip'
          div.textContent = `··· ${row.count} unchanged lines ···`
        } else {
          div.className = 'dline ' + (row.type === 'eq' ? '' : row.type)
          div.textContent = (row.type === 'add' ? '+ ' : row.type === 'del' ? '− ' : '  ') + row.line
        }
        body.appendChild(div)
      })
      list.appendChild(box)
    })

    const valBox = root.querySelector('[data-validation]')
    valBox.innerHTML = ''
    textFiles
      .filter((file) => file.validateKind)
      .forEach((file) => {
        const problems = validateYAMLText(file.validateKind, file.body)
        const div = document.createElement('div')
        div.className = 'val-row ' + (problems.length ? 'fail' : 'pass')
        div.innerHTML = `<span class="val-ico">${problems.length ? '✕' : '✓'}</span><code></code><span class="val-msg"></span>`
        div.querySelector('code').textContent = file.path.split('/').pop()
        div.querySelector('.val-msg').textContent = problems.length ? problems.join(' · ') : 'valid against the repository schema'
        valBox.appendChild(div)
      })
  }

  const panelsCount = root.querySelectorAll('[data-step-panel]').length
  const steps = initSteps({
    root,
    validate: () => true,
    finishLabel: '⚡ Build update',
    onShow: (i) => {
      if (i === panelsCount - 1) {
        lastBuild = build()
        renderDiffs(lastBuild)
      }
    },
    onFinish: () => finish(),
  })

  const finish = () => {
    const result = lastBuild || build()
    if (!result.files.length) return
    const vendorName = (catalog.find((x) => x.id === state.vendorId) || {}).name || state.vendorId
    const meta = {
      prTitle: `Update ${vendorName} ${f.get('name') || state.modelId}`,
      prBody: ['Updates `' + state.vendorId + '/' + state.modelId + '`, edited with the update wizard on the website:', '', ...result.changes.map((c) => `- ${c}`)].join('\n'),
    }
    const checklistRoot = root.querySelector('[data-checklist]')
    const renderFallback = () => renderChecklist(checklistRoot, cfg, result.files, meta)

    const apiBase = backendBase(root)
    if (apiBase) {
      submitViaBackend({
        root,
        apiBase,
        cfg,
        meta,
        photoFile: photo.getFile(),
        vendorId: state.vendorId,
        modelId: state.modelId,
        wizardKind: 'update',
        buildFiles: async () => result.files,
        fallback: renderFallback,
      })
    } else {
      // Launch path: copy-paste CLI script (run it yourself or email it to us).
      renderCliPanel({
        root,
        cfg,
        files: result.files,
        meta,
        photoFile: photo.getFile(),
        vendorId: state.vendorId,
        modelId: state.modelId,
        wizardKind: 'update',
        submitEmail: (root.dataset.submitEmail || '').trim(),
        fallback: renderFallback,
      })
    }

    wizard.hidden = true
    success.hidden = false
    window.scrollTo(0, 0)

    root.querySelector('[data-download]').onclick = () => {
      result.files
        .filter((file) => file.body != null)
        .forEach((file) => {
          const blob = new Blob([file.body], { type: 'text/plain' })
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = file.path.split('/').pop()
          a.click()
          URL.revokeObjectURL(a.href)
        })
    }
  }

  root.querySelector('[data-restart]').addEventListener('click', () => {
    success.hidden = true
    wizard.hidden = false
    steps.show(0)
  })

  /* ------------------------------- Boot ------------------------------- */

  const params = new URLSearchParams(location.search)
  const qv = params.get('vendor')
  const qm = params.get('model')
  if (qv && qm) {
    if ([...vendorSel.options].some((o) => o.value === qv)) {
      vendorSel.value = qv
      syncDevices()
      if ([...deviceSel.options].some((o) => o.value === qm)) deviceSel.value = qm
    }
    load(qv, qm)
  }
}

const init = () => {
  const root = document.querySelector('[data-update-wizard]')
  if (root) initUpdate(root)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
