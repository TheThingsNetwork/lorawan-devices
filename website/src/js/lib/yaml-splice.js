// Comment-preserving YAML patching for the update-a-device flow.
//
// Re-emitting a parsed document rewrites formatting across the whole file
// (about a third of the vendor files round-trip noisily), which would bury
// a one-line change in a wall of diff. Instead we splice replacement text
// into the original source using the parser's node ranges, so untouched
// lines — including comments — stay byte-identical.
//
// Every patcher records its operations; apply() splices them, re-parses the
// result and compares it against the same operations replayed on the parsed
// document. If anything disagrees, the document re-emit is returned instead
// (correct, just less pretty) and `reformatted` is set.

import { parseDocument, stringify, isMap, isSeq } from 'yaml'

const INDENT_STEP = 2

const scalarYAML = (value) => stringify(value, { lineWidth: 0 }).trimEnd()

// Indentation column of the line that `offset` sits on.
const lineIndent = (text, offset) => {
  const lineStart = text.lastIndexOf('\n', offset - 1) + 1
  let i = lineStart
  while (text[i] === ' ') i++
  return { lineStart, indent: i - lineStart }
}

const startOfLine = (text, offset) => text.lastIndexOf('\n', offset - 1) + 1

const endOfLine = (text, offset) => {
  const nl = text.indexOf('\n', offset)
  return nl === -1 ? text.length : nl + 1
}

export const createPatcher = (text) => {
  const doc = parseDocument(text)
  const ops = []

  const node = (path) => doc.getIn(path, true)
  const parentMap = (path) => (path.length ? doc.getIn(path.slice(0, -1), true) : doc.contents)
  const pairOf = (path) => {
    const map = parentMap(path)
    if (!isMap(map)) return null
    const key = path[path.length - 1]
    return map.items.find((p) => p.key && p.key.value === key) || null
  }

  // Set a (possibly nested) value. Existing scalars are replaced in place;
  // missing keys are appended to their parent block mapping.
  const set = (path, value) => ops.push({ kind: 'set', path, value })
  // Remove a mapping entry entirely.
  const remove = (path) => ops.push({ kind: 'remove', path })
  // Replace a whole node (seq/map) with pre-rendered YAML lines. The lines
  // are re-indented to the node's source position.
  const replaceBlock = (path, blockLines) => ops.push({ kind: 'block', path, blockLines })

  const hasEdits = () => ops.length > 0

  const spliceEdits = () => {
    const edits = []
    for (const op of ops) {
      if (op.kind === 'set') {
        const n = node(op.path)
        if (n && n.range && !isMap(n) && !isSeq(n)) {
          edits.push({ start: n.range[0], end: n.range[1], text: scalarYAML(op.value) })
        } else if (!n) {
          const parent = parentMap(op.path)
          const key = op.path[op.path.length - 1]
          if (isSeq(parent) && key === parent.items.length && parent.items.length) {
            // Append an item to a block sequence.
            const last = parent.items[parent.items.length - 1]
            const lastEnd = last.range ? last.range[2] : null
            if (lastEnd == null) throw new Error('cannot locate end of sequence ' + op.path.join('.'))
            const insertAt = endOfLine(text, lastEnd - 1)
            const itemStart = startOfLine(text, last.range[0])
            const dash = text.indexOf('-', itemStart)
            const indent = dash - itemStart
            const rendered = scalarYAML(op.value).split('\n')
            const block =
              rendered
                .map((l, i) => (i === 0 ? `${' '.repeat(indent)}- ${l}` : `${' '.repeat(indent + INDENT_STEP)}${l}`))
                .join('\n') + '\n'
            edits.push({ start: insertAt, end: insertAt, text: block })
            continue
          }
          if (!isMap(parent) || !parent.items.length) throw new Error('no parent mapping for ' + op.path.join('.'))
          const last = parent.items[parent.items.length - 1]
          const lastEnd = (last.value && last.value.range ? last.value.range[2] : last.key.range[2])
          const insertAt = endOfLine(text, lastEnd - 1)
          const { indent } = lineIndent(text, last.key.range[0])
          const rendered = scalarYAML(op.value)
          const block = rendered.includes('\n')
            ? `${' '.repeat(indent)}${key}:\n` +
              rendered
                .split('\n')
                .map((l) => ' '.repeat(indent + INDENT_STEP) + l)
                .join('\n') +
              '\n'
            : `${' '.repeat(indent)}${key}: ${rendered}\n`
          edits.push({ start: insertAt, end: insertAt, text: block })
        } else {
          throw new Error('cannot set collection in place at ' + op.path.join('.'))
        }
      } else if (op.kind === 'remove') {
        const pair = pairOf(op.path)
        if (!pair) continue
        const start = startOfLine(text, pair.key.range[0])
        const valueEnd = pair.value && pair.value.range ? pair.value.range[2] : pair.key.range[2]
        edits.push({ start, end: endOfLine(text, valueEnd - 1), text: '' })
      } else if (op.kind === 'block') {
        const n = node(op.path)
        if (!n || !n.range) throw new Error('no node to replace at ' + op.path.join('.'))
        const { indent } = lineIndent(text, n.range[0])
        const block = op.blockLines.map((l) => (l ? ' '.repeat(indent) + l : l)).join('\n')
        // Node ranges start at the value (after the first line's indent) and
        // include the trailing newline; re-create both.
        edits.push({ start: n.range[0], end: n.range[2], text: block.trimStart() + '\n' })
      }
    }
    edits.sort((a, b) => b.start - a.start)
    let prev = Infinity
    let out = text
    for (const e of edits) {
      if (e.end > prev) throw new Error('overlapping edits')
      prev = e.start
      out = out.slice(0, e.start) + e.text + out.slice(e.end)
    }
    return out
  }

  const replayOnDoc = () => {
    for (const op of ops) {
      if (op.kind === 'set') doc.setIn(op.path, op.value)
      else if (op.kind === 'remove') doc.deleteIn(op.path)
      else if (op.kind === 'block') doc.setIn(op.path, parseDocument(op.blockLines.join('\n')).contents)
    }
    return doc.toString({ lineWidth: 0 })
  }

  const apply = () => {
    if (!ops.length) return { text, changed: false, reformatted: false }
    let spliced = null
    try {
      spliced = spliceEdits()
    } catch (e) {
      spliced = null
    }
    const reference = replayOnDoc()
    if (spliced !== null) {
      try {
        const a = parseDocument(spliced)
        const b = parseDocument(reference)
        if (!a.errors.length && JSON.stringify(a.toJS()) === JSON.stringify(b.toJS())) {
          return { text: spliced, changed: spliced !== text, reformatted: false }
        }
      } catch (e) {
        /* fall through to reference */
      }
    }
    return { text: reference, changed: reference !== text, reformatted: true }
  }

  return { doc, set, remove, replaceBlock, hasEdits, apply }
}
