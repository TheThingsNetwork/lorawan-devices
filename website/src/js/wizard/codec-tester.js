// Codec editor + example runner step. Examples live in an editable table;
// "Run examples" executes the decoder in the existing Web Worker sandbox and
// compares the result against the expected output exactly like CI does
// (structural equality on the full output object).

import { runDecoder, parseHex, toHex } from '../lib/codec-runner'
import { deepEqual } from '../lib/deep-equal'

const EXPECTED_PLACEHOLDER = '{"data": {"TEMP": 21.5}}'

export const createCodecTester = (root) => {
  const tbody = root.querySelector('[data-ex-rows]')
  const addBtn = root.querySelector('[data-ex-add]')
  const runBtn = root.querySelector('[data-ex-run]')
  const statusEl = root.querySelector('[data-ex-status]')
  const sourceEl = root.querySelector('[data-codec-editor]')

  const rowEls = () => Array.from(tbody.querySelectorAll('tr[data-ex-row]'))

  const addRow = (ex) => {
    const tr = document.createElement('tr')
    tr.setAttribute('data-ex-row', '')
    tr.innerHTML = `
      <td><input data-ex-desc placeholder="Regular uplink" /></td>
      <td><input data-ex-fport type="number" min="1" max="255" value="1" /></td>
      <td><input data-ex-hex class="mono" placeholder="0B 88 01 00" /></td>
      <td><textarea data-ex-expected class="mono" rows="2" placeholder='${EXPECTED_PLACEHOLDER}'></textarea></td>
      <td class="ex-actions">
        <span class="ex-result" data-ex-result></span>
        <button class="btn btn-secondary btn-sm" data-ex-use hidden title="Copy the decoder's actual output into the expected column">Use actual</button>
        <button class="ex-remove" data-ex-remove aria-label="Remove example">×</button>
      </td>`
    if (ex) {
      tr.querySelector('[data-ex-desc]').value = ex.description || ''
      tr.querySelector('[data-ex-fport]').value = ex.input && ex.input.fPort != null ? ex.input.fPort : 1
      tr.querySelector('[data-ex-hex]').value = ex.input && ex.input.bytes ? toHex(ex.input.bytes) : ''
      tr.querySelector('[data-ex-expected]').value = ex.output !== undefined ? JSON.stringify(ex.output) : ''
    }
    tr.querySelector('[data-ex-remove]').addEventListener('click', () => {
      tr.remove()
      setStatus('', '')
    })
    tr.querySelector('[data-ex-use]').addEventListener('click', () => {
      if (tr._actual !== undefined) {
        tr.querySelector('[data-ex-expected]').value = JSON.stringify(tr._actual)
        markRow(tr, 'pass', 'PASS')
        refreshSummary()
      }
    })
    tbody.appendChild(tr)
    return tr
  }

  const readRow = (tr) => {
    const description = tr.querySelector('[data-ex-desc]').value.trim()
    const fPort = parseInt(tr.querySelector('[data-ex-fport]').value, 10) || 1
    const bytes = parseHex(tr.querySelector('[data-ex-hex]').value)
    const expectedText = tr.querySelector('[data-ex-expected]').value.trim()
    return { description, fPort, bytes, expectedText }
  }

  const markRow = (tr, kind, label) => {
    const el = tr.querySelector('[data-ex-result]')
    el.className = 'ex-result ' + (kind || '')
    el.textContent = label || ''
    tr.querySelector('[data-ex-use]').hidden = !(kind === 'fail' && tr._actual !== undefined)
  }

  const setStatus = (kind, msg) => {
    statusEl.className = 'ex-status ' + (kind || '')
    statusEl.textContent = msg
  }

  const refreshSummary = () => {
    const rows = rowEls()
    const passed = rows.filter((tr) => tr.querySelector('[data-ex-result]').classList.contains('pass')).length
    if (rows.length) setStatus(passed === rows.length ? 'pass' : '', `${passed}/${rows.length} examples passing`)
  }

  const runAll = async () => {
    const source = sourceEl.value
    const rows = rowEls()
    if (!source.trim() || !rows.length) {
      setStatus('fail', rows.length ? 'add the codec source first' : 'add at least one example')
      return false
    }
    setStatus('', 'running…')
    let allPass = true
    for (const tr of rows) {
      const { bytes, fPort, expectedText } = readRow(tr)
      tr._actual = undefined
      if (!bytes || !bytes.length) {
        markRow(tr, 'fail', 'BAD HEX')
        allPass = false
        continue
      }
      let expected
      try {
        expected = JSON.parse(expectedText)
      } catch (e) {
        expected = undefined
      }
      const res = await runDecoder(source, bytes, fPort)
      if (!res.ok) {
        markRow(tr, 'fail', 'ERROR')
        tr.querySelector('[data-ex-result]').title = res.error || 'decoder crashed'
        allPass = false
        continue
      }
      tr._actual = res.result
      if (expected === undefined) {
        markRow(tr, 'fail', 'NO EXPECTED')
        tr.querySelector('[data-ex-result]').title = 'expected output is not valid JSON — click “Use actual” to adopt the decoder output'
        allPass = false
      } else if (deepEqual(res.result, expected)) {
        markRow(tr, 'pass', 'PASS')
      } else {
        markRow(tr, 'fail', 'MISMATCH')
        tr.querySelector('[data-ex-result]').title = 'actual: ' + JSON.stringify(res.result)
        allPass = false
      }
    }
    refreshSummary()
    return allPass
  }

  addBtn.addEventListener('click', () => addRow())
  runBtn.addEventListener('click', runAll)

  return {
    setSource: (text) => {
      sourceEl.value = text || ''
    },
    getSource: () => sourceEl.value,
    setExamples: (list) => {
      tbody.innerHTML = ''
      ;(list || []).forEach((ex) => addRow(ex))
      if (!list || !list.length) addRow()
      setStatus('', '')
    },
    // Examples in codec-YAML shape; rows without payload bytes are skipped.
    getExamples: () => {
      const out = []
      for (const tr of rowEls()) {
        const { description, fPort, bytes, expectedText } = readRow(tr)
        if (!bytes || !bytes.length) continue
        let output
        try {
          output = JSON.parse(expectedText)
        } catch (e) {
          output = { data: {} }
        }
        out.push({ description: description || 'Example uplink', input: { fPort, bytes }, output })
      }
      return out
    },
    runAll,
  }
}
