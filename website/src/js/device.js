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

// Device detail page: tabs, live decoder playground, The Things Stack
// envelope preview, codec source viewer, device emulator and battery
// life estimator. Reads the device model from window.config.device.

import { runDecoder, parseHex, toHex } from './lib/codec-runner'
import { colorize } from './lib/colorize'
import { buildEnvelope, topicFor } from './lib/tts-envelope'
import { estimateBatteryYears } from './lib/airtime'

const device = (window.config || {}).device || {}

const $ = (sel, el) => (el || document).querySelector(sel)
const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel))

/* ------------------------------- Tabs ------------------------------- */

const initTabs = () => {
  const nav = $('[data-tabs]')
  if (!nav) return
  const links = $$('a', nav)
  const panels = $$('.tab-panel')

  const activate = (id, push) => {
    const target = panels.some((p) => p.id === id) ? id : panels[0]?.id
    links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + target))
    panels.forEach((p) => (p.hidden = p.id !== target))
    if (push) history.replaceState(null, '', '#' + target)
    document.dispatchEvent(new CustomEvent('tabshown', { detail: target }))
  }

  links.forEach((l) => {
    l.addEventListener('click', (e) => {
      e.preventDefault()
      activate(l.getAttribute('href').slice(1), true)
      nav.scrollIntoView({ block: 'nearest' })
    })
  })

  activate(location.hash.slice(1) || panels[0]?.id, false)
}

/* ------------------------- Codec plumbing --------------------------- */

// Hugo lowercases front-matter map keys, so codec sections arrive as
// `uplinkdecoder`/`filename` (keys nested inside arrays keep their case).
const codecs = device.codecs || {}
const uplinkDecoderOf = (plan) => (codecs[plan] || {}).uplinkdecoder || (codecs[plan] || {}).uplinkDecoder
const plansWithCodec = Object.keys(codecs).filter((p) => uplinkDecoderOf(p))

const codecSources = {}
const fetchCodecSource = async (fileName) => {
  if (codecSources[fileName] !== undefined) return codecSources[fileName]
  try {
    const res = await fetch('codecs/' + fileName.split('/').pop())
    codecSources[fileName] = res.ok ? await res.text() : null
  } catch (e) {
    codecSources[fileName] = null
  }
  return codecSources[fileName]
}

const examplesFor = (plan) => {
  const dec = uplinkDecoderOf(plan) || {}
  return (dec.examples || []).filter((ex) => ex.input && Array.isArray(ex.input.bytes))
}

/* --------------------------- Decoder tab ----------------------------- */

const initDecoder = () => {
  const root = $('[data-decoder]')
  if (!root || plansWithCodec.length === 0) return

  const planSel = $('[data-plan]', root)
  const exampleSel = $('[data-example]', root)
  const fportInput = $('[data-fport]', root)
  const hexInput = $('[data-hex]', root)
  const output = $('[data-output]', root)
  const status = $('[data-status]', root)
  const decodeBtn = $('[data-decode]', root)
  const envelopePre = $('[data-envelope]')
  const topicEl = $('[data-topic]')

  plansWithCodec.forEach((p) => {
    const o = document.createElement('option')
    o.value = p
    o.textContent = p.toUpperCase()
    planSel.appendChild(o)
  })

  const syncExamples = () => {
    exampleSel.innerHTML = ''
    examplesFor(planSel.value).forEach((ex, i) => {
      const o = document.createElement('option')
      o.value = String(i)
      o.textContent = ex.description || 'Example ' + (i + 1)
      exampleSel.appendChild(o)
    })
    loadExample(0)
  }

  const loadExample = (i) => {
    const ex = examplesFor(planSel.value)[i]
    if (!ex) return
    hexInput.value = toHex(ex.input.bytes)
    fportInput.value = ex.input.fPort != null ? ex.input.fPort : 1
    decode()
  }

  const setStatus = (ok, msg) => {
    status.className = ok ? 'status-valid' : 'status-error'
    status.textContent = msg
  }

  const decode = async () => {
    const bytes = parseHex(hexInput.value)
    if (!bytes || !bytes.length) {
      setStatus(false, '● INVALID HEX')
      output.innerHTML = colorize('// enter a hex payload, e.g. 01 7F 02 18')
      return
    }
    const fPort = parseInt(fportInput.value, 10) || 1
    const dec = uplinkDecoderOf(planSel.value) || {}
    const fileName = dec.filename || dec.fileName
    const source = fileName && (await fetchCodecSource(fileName))
    if (!source) {
      setStatus(false, '● CODEC UNAVAILABLE')
      return
    }
    setStatus(true, '● DECODING…')
    const res = await runDecoder(source, bytes, fPort)
    let decoded
    if (res.ok && res.result && !((res.result.errors || []).length)) {
      decoded = res.result.data !== undefined ? res.result.data : res.result
      setStatus(true, '● VALID')
      output.innerHTML = colorize(JSON.stringify(res.result, null, 2))
    } else {
      const err = res.error || (res.result && res.result.errors || []).join('; ') || 'decode failed'
      setStatus(false, '● ERROR')
      output.innerHTML = colorize(JSON.stringify(res.ok ? res.result : { error: err }, null, 2))
    }

    if (envelopePre) {
      const env = buildEnvelope({
        modelID: device.modelid,
        bytes,
        fPort,
        decoded,
        plan: planSel.value,
      })
      envelopePre.innerHTML = colorize(JSON.stringify(env, null, 2))
    }
    if (topicEl) topicEl.textContent = topicFor(device.modelid)
  }

  planSel.addEventListener('change', syncExamples)
  exampleSel.addEventListener('change', () => loadExample(parseInt(exampleSel.value, 10)))
  decodeBtn.addEventListener('click', decode)
  const randomBtn = $('[data-random]', root)
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const n = examplesFor(planSel.value).length
      if (n) {
        const i = Math.floor(Math.random() * n)
        exampleSel.value = String(i)
        loadExample(i)
      }
    })
  }

  syncExamples()
}

/* ------------------------ Codec source view -------------------------- */

const initCodecSource = () => {
  const pre = $('[data-codec-source]')
  if (!pre) return
  const fileName = pre.dataset.codecSource
  let loaded = false
  const load = async () => {
    if (loaded) return
    loaded = true
    const source = await fetchCodecSource(fileName)
    if (!source) {
      pre.textContent = '// codec source could not be loaded'
      return
    }
    // Highlighting very large codecs is slow; show them plain.
    pre.innerHTML = source.length < 60000 ? colorize(source) : ''
    if (!pre.innerHTML) pre.textContent = source
  }
  document.addEventListener('tabshown', (e) => {
    if (e.detail === 'payload-codec') load()
  })
  if (!$('[data-tabs]') || location.hash === '#payload-codec') load()
}

/* ---------------------------- Emulator ------------------------------ */

const initEmulator = () => {
  const modal = $('[data-emulator]')
  const openBtn = $('[data-emulator-open]')
  if (!modal || !openBtn) return

  const endpoint = $('[data-em-endpoint]', modal)
  const intervalSel = $('[data-em-interval]', modal)
  const payloadSel = $('[data-em-payload]', modal)
  const log = $('[data-em-log]', modal)
  const statusEl = $('[data-em-status]', modal)
  const startBtn = $('[data-em-start]', modal)

  // Offer every example of the first codec-carrying plan as payload source.
  const plan = plansWithCodec[0]
  const examples = plan ? examplesFor(plan) : []
  examples.forEach((ex, i) => {
    const o = document.createElement('option')
    o.value = String(i)
    o.textContent = (ex.description || 'Example ' + (i + 1)) + ' (rotating metadata)'
    payloadSel.appendChild(o)
  })

  let timer = null
  let fCnt = Math.floor(Math.random() * 400)
  let corsHintShown = false

  const line = (t, msg, ok) => {
    const empty = $('.em-log-empty', log)
    if (empty) empty.remove()
    const el = document.createElement('div')
    el.className = 'em-log-line'
    el.innerHTML = `<span class="em-log-t">${t}</span><span class="em-log-msg"></span><span class="${ok ? 'em-log-ok' : 'em-log-err'}"></span>`
    el.children[1].textContent = msg
    el.children[2].textContent = ok ? ok : 'ERR'
    log.appendChild(el)
    while (log.children.length > 60) log.removeChild(log.firstChild)
    log.scrollTop = log.scrollHeight
  }

  const tick = async () => {
    const i = payloadSel.value ? parseInt(payloadSel.value, 10) : 0
    const ex = examples[i] || examples[0]
    if (!ex) return
    fCnt++
    const bytes = ex.input.bytes
    const env = buildEnvelope({
      modelID: device.modelid,
      bytes,
      fPort: ex.input.fPort != null ? ex.input.fPort : 1,
      decoded: ex.output && ex.output.data,
      plan,
      fCnt,
      rssi: -(88 + Math.floor(Math.random() * 22)),
      snr: Math.round((4 + Math.random() * 6) * 100) / 100,
    })
    const t = new Date().toLocaleTimeString('en-GB')
    const msg = `POST /up · f_cnt ${fCnt} · ${bytes.length} bytes · ${ex.description || 'uplink'}`
    try {
      const res = await fetch(endpoint.value, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(env),
      })
      line(t, msg, String(res.status))
    } catch (err) {
      line(t, msg, null)
      if (!corsHintShown) {
        corsHintShown = true
        line(t, 'Request blocked — the endpoint must be reachable and allow CORS (Access-Control-Allow-Origin).', null)
      }
    }
  }

  const setRunning = (on) => {
    endpoint.disabled = on
    intervalSel.disabled = on
    payloadSel.disabled = on
    statusEl.className = 'em-status' + (on ? ' on' : '')
    statusEl.innerHTML = on ? '<span class="em-dot"></span> Running' : 'Idle'
    startBtn.textContent = on ? 'Stop emulator' : 'Start emulator'
    startBtn.classList.toggle('btn-danger', on)
    startBtn.style.background = on ? 'var(--error-500)' : ''
    startBtn.style.borderColor = on ? 'var(--error-500)' : ''
  }

  startBtn.addEventListener('click', () => {
    if (timer) {
      clearInterval(timer)
      timer = null
      setRunning(false)
      return
    }
    if (!/^https?:\/\/.+/.test(endpoint.value)) {
      endpoint.focus()
      return
    }
    setRunning(true)
    tick()
    timer = setInterval(tick, Math.max(5, parseInt(intervalSel.value, 10)) * 1000)
  })

  const close = () => {
    modal.hidden = true
    if (timer) {
      clearInterval(timer)
      timer = null
      setRunning(false)
    }
  }

  openBtn.addEventListener('click', () => (modal.hidden = false))
  $('[data-em-close]', modal).addEventListener('click', close)
  $('[data-em-cancel]', modal).addEventListener('click', close)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close()
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) close()
  })
}

/* ------------------------ Battery estimator -------------------------- */

const guessCapacity = (type) => {
  const t = (type || '').toUpperCase()
  const cells = [
    [/ER34615|\bD\b/, 19000],
    [/ER26500|\bC\b/, 8500],
    [/ER18505/, 3800],
    [/ER14505|\bAA\b/, 2600],
    [/\bAAA\b/, 1100],
    [/CR2477/, 1000],
    [/CR2450/, 620],
    [/CR2032/, 230],
    [/CR123/, 1500],
    [/18650/, 3400],
  ]
  let base = 2400
  for (const [re, cap] of cells) {
    if (re.test(t)) {
      base = cap
      break
    }
  }
  const mult = t.match(/(\d+)\s*[X×]/)
  return base * (mult ? parseInt(mult[1], 10) : 1)
}

const initCalc = () => {
  const root = $('[data-calc]')
  if (!root) return

  const interval = $('[data-c-interval]', root)
  const payload = $('[data-c-payload]', root)
  const sf = $('[data-c-sf]', root)
  const capacity = $('[data-c-capacity]', root)
  const result = $('[data-c-result]', root)
  const sub = $('[data-c-sub]', root)

  capacity.value = guessCapacity(root.dataset.batteryType)

  const update = () => {
    $('[data-c-interval-v]', root).textContent = interval.value + ' min'
    $('[data-c-payload-v]', root).textContent = payload.value + ' bytes'
    $('[data-c-sf-v]', root).textContent = 'SF' + sf.value
    const years = estimateBatteryYears({
      capacitymAh: parseFloat(capacity.value) || 2400,
      intervalMinutes: parseInt(interval.value, 10),
      payloadBytes: parseInt(payload.value, 10),
      sf: parseInt(sf.value, 10),
    })
    result.textContent = years >= 100 ? '99+' : years.toFixed(1)
    sub.textContent = `@ ${interval.value}-min reports, SF${sf.value}, ${payload.value}-byte payload, unconfirmed uplinks`
  }

  ;[interval, payload, sf, capacity].forEach((el) => el.addEventListener('input', update))
  update()
}

/* ------------------------------ Boot -------------------------------- */

const init = () => {
  initTabs()
  initDecoder()
  initCodecSource()
  initEmulator()
  initCalc()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
