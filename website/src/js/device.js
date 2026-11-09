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

  // Offer every example of the first codec-carrying plan as payload source.
  const plan = plansWithCodec[0]
  const examples = plan ? examplesFor(plan) : []
  examples.forEach((ex, i) => {
    const o = document.createElement('option')
    o.value = String(i)
    o.textContent = (ex.description || 'Example ' + (i + 1)) + ' (rotating metadata)'
    payloadSel.appendChild(o)
  })

  /* ---- Terminal script (curl), runs on the user's machine, no CORS ---- */

  const scriptEl = $('[data-em-script]', modal)
  const intervalLabel = $('[data-em-script-interval]', modal)

  const copyText = async (text, btn) => {
    try {
      await navigator.clipboard.writeText(text)
      const old = btn.textContent
      btn.textContent = 'Copied ✓'
      setTimeout(() => (btn.textContent = old), 1500)
    } catch (e) {
      window.prompt('Copy the script:', text)
    }
  }

  const scriptEndpoint = () => {
    const v = (endpoint.value || '').trim()
    return /^https?:\/\/.+/.test(v) ? v : 'https://your-endpoint.example/uplink'
  }

  const scriptEnvelope = () => {
    const i = payloadSel.value ? parseInt(payloadSel.value, 10) : 0
    const ex = examples[i] || examples[0]
    if (!ex) return null
    return buildEnvelope({
      modelID: device.modelid,
      bytes: ex.input.bytes,
      fPort: ex.input.fPort != null ? ex.input.fPort : 1,
      decoded: ex.output && ex.output.data,
      plan,
    })
  }

  const curlScript = () => {
    const env = scriptEnvelope()
    if (!env) return '# This device has no codec examples to emulate.'
    return [
      "curl -sS -X POST '" + scriptEndpoint() + "' \\",
      "  -H 'Content-Type: application/json' \\",
      "  --data @- <<'UPLINK_JSON'",
      JSON.stringify(env, null, 2),
      'UPLINK_JSON',
    ].join('\n')
  }

  const loopScript = () => {
    const env = scriptEnvelope()
    if (!env) return '# This device has no codec examples to emulate.'
    const json = JSON.stringify(env, null, 2).replace(/("f_cnt":\s*)\d+/, '$1__FCNT__')
    const secs = Math.max(5, parseInt(intervalSel.value, 10) || 10)
    return [
      '#!/usr/bin/env bash',
      '# Emulate ' + (device.name || device.modelid) + ', sends one uplink every ' + secs + 's.',
      '# Runs on your machine, so it reaches ANY endpoint with no browser/CORS limits.',
      '# Stop with Ctrl-C.',
      'set -u',
      '',
      "ENDPOINT='" + scriptEndpoint() + "'",
      '',
      "BODY=$(cat <<'UPLINK_JSON'",
      json,
      'UPLINK_JSON',
      ')',
      '',
      'f_cnt=$((RANDOM % 400))',
      'while true; do',
      '  printf \'%s\' "${BODY//__FCNT__/$f_cnt}" \\',
      '    | curl -sS -X POST "$ENDPOINT" \\',
      "        -H 'Content-Type: application/json' \\",
      '        --data @- \\',
      '        -o /dev/null -w "$(date +%H:%M:%S)  HTTP %{http_code}  (f_cnt=$f_cnt)\\n" \\',
      '    || echo "$(date +%H:%M:%S)  request failed, is the endpoint reachable?"',
      '  f_cnt=$((f_cnt + 1))',
      '  sleep ' + secs,
      'done',
    ].join('\n')
  }

  const updateScript = () => {
    if (scriptEl) scriptEl.textContent = loopScript()
    if (intervalLabel) intervalLabel.textContent = String(Math.max(5, parseInt(intervalSel.value, 10) || 10))
  }
  endpoint.addEventListener('input', updateScript)
  intervalSel.addEventListener('change', updateScript)
  payloadSel.addEventListener('change', updateScript)
  updateScript()

  const copyCurlBtn = $('[data-em-copy-curl]', modal)
  const copyScriptBtn = $('[data-em-copy-script]', modal)
  if (copyCurlBtn) copyCurlBtn.addEventListener('click', () => copyText(curlScript(), copyCurlBtn))
  if (copyScriptBtn) copyScriptBtn.addEventListener('click', () => copyText(loopScript(), copyScriptBtn))

  const close = () => {
    modal.hidden = true
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

/* ------------------------------ Boot -------------------------------- */

const init = () => {
  initTabs()
  initDecoder()
  initCodecSource()
  initEmulator()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
