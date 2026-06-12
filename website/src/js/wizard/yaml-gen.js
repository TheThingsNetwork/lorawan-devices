// YAML generation and schema validation shared by the submit and update
// wizards. New files are generated as commented, schema-shaped text; the
// examples block is also used by the update flow to splice edited examples
// into an existing codec YAML.

import { parse as parseYAML, stringify as stringifyYAML } from 'yaml'
import validators from '../lib/schema-validators.gen.js'
import { yamlStr } from './core'

const hex = (b) => '0x' + b.toString(16).toUpperCase().padStart(2, '0')

// Render codec examples as YAML lines (no base indentation). The output
// object is arbitrary JSON, so that part is stringified properly.
export const examplesYAMLLines = (examples) => {
  const lines = []
  examples.forEach((ex) => {
    lines.push(`- description: ${yamlStr(ex.description)}`)
    lines.push('  input:')
    lines.push(`    fPort: ${ex.input.fPort}`)
    lines.push(`    bytes: [${ex.input.bytes.map(hex).join(', ')}]`)
    lines.push('  output:')
    stringifyYAML(ex.output, { lineWidth: 0 })
      .trimEnd()
      .split('\n')
      .forEach((l) => lines.push('    ' + l))
  })
  return lines
}

export const codecYAML = (model, examples) => {
  const lines = [`uplinkDecoder:`, `  fileName: ${model}.js`, '  examples:']
  examplesYAMLLines(examples).forEach((l) => lines.push('    ' + l))
  return lines.join('\n') + '\n'
}

export const codecJSStub = () =>
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

// ---------------------------------------------------------------- validation

const KIND_VALIDATORS = {
  device: validators.validateEndDevice,
  profile: validators.validateEndDeviceProfile,
  codec: validators.validateEndDevicePayloadCodec,
  vendorIndex: validators.validateVendorIndex,
}

// Validate YAML text against a schema fragment. Returns a list of
// human-readable problems; empty list means the file is valid.
export const validateYAMLText = (kind, text) => {
  const fn = KIND_VALIDATORS[kind]
  if (!fn) return []
  let data
  try {
    data = parseYAML(text)
  } catch (e) {
    return ['not parseable as YAML: ' + (e.message || e)]
  }
  if (fn(data)) return []
  const seen = new Set()
  const problems = []
  ;(fn.errors || []).forEach((err) => {
    const where = err.instancePath ? err.instancePath.replace(/^\//, '').replace(/\//g, '.') : 'file'
    let msg = err.message
    if (err.keyword === 'enum' && err.params && err.params.allowedValues && err.params.allowedValues.length <= 8) {
      msg += ` (${err.params.allowedValues.join(', ')})`
    }
    const line = `${where}: ${msg}`
    if (!seen.has(line)) {
      seen.add(line)
      problems.push(line)
    }
  })
  return problems
}
