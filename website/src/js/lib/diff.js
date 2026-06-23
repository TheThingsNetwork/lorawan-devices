// Minimal line diff (Myers greedy O(ND)) for the update-flow review step.
// Returns a list of {type: 'eq'|'del'|'add', line} entries.

const myers = (a, b) => {
  const N = a.length
  const M = b.length
  const MAX = N + M
  if (MAX === 0) return []
  const offset = MAX
  let v = new Array(2 * MAX + 1).fill(0)
  const trace = []
  for (let d = 0; d <= MAX; d++) {
    trace.push(v.slice())
    for (let k = -d; k <= d; k += 2) {
      let x
      if (k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1])) {
        x = v[offset + k + 1]
      } else {
        x = v[offset + k - 1] + 1
      }
      let y = x - k
      while (x < N && y < M && a[x] === b[y]) {
        x++
        y++
      }
      v[offset + k] = x
      if (x >= N && y >= M) {
        return backtrack(trace, a, b, d, offset)
      }
    }
  }
  return null
}

const backtrack = (trace, a, b, d, offset) => {
  const ops = []
  let x = a.length
  let y = b.length
  for (; d > 0; d--) {
    const v = trace[d]
    const k = x - y
    let prevK
    if (k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1])) {
      prevK = k + 1
    } else {
      prevK = k - 1
    }
    const prevX = v[offset + prevK]
    const prevY = prevX - prevK
    while (x > prevX && y > prevY) {
      ops.push({ type: 'eq', line: a[x - 1] })
      x--
      y--
    }
    if (x === prevX) {
      ops.push({ type: 'add', line: b[y - 1] })
      y--
    } else {
      ops.push({ type: 'del', line: a[x - 1] })
      x--
    }
  }
  while (x > 0 && y > 0) {
    ops.push({ type: 'eq', line: a[x - 1] })
    x--
    y--
  }
  while (y > 0) {
    ops.push({ type: 'add', line: b[y - 1] })
    y--
  }
  while (x > 0) {
    ops.push({ type: 'del', line: a[x - 1] })
    x--
  }
  return ops.reverse()
}

export const diffLines = (oldText, newText) => {
  const a = oldText.split('\n')
  const b = newText.split('\n')
  // Trim the common prefix/suffix first so Myers only sees the changed core.
  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start++
  let endA = a.length
  let endB = b.length
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--
    endB--
  }
  const core = myers(a.slice(start, endA), b.slice(start, endB)) || [
    ...a.slice(start, endA).map((line) => ({ type: 'del', line })),
    ...b.slice(start, endB).map((line) => ({ type: 'add', line })),
  ]
  return [
    ...a.slice(0, start).map((line) => ({ type: 'eq', line })),
    ...core,
    ...a.slice(endA).map((line) => ({ type: 'eq', line })),
  ]
}

// Collapse unchanged runs to ±context lines, producing display rows including
// {type:'skip', count} separators, the familiar unified-diff shape.
export const toHunks = (ops, context = 3) => {
  const rows = []
  let i = 0
  while (i < ops.length) {
    if (ops[i].type !== 'eq') {
      rows.push(ops[i])
      i++
      continue
    }
    let j = i
    while (j < ops.length && ops[j].type === 'eq') j++
    const runLen = j - i
    const head = i === 0 ? 0 : context
    const tail = j === ops.length ? 0 : context
    if (runLen > head + tail + 1) {
      for (let k = i; k < i + head; k++) rows.push(ops[k])
      rows.push({ type: 'skip', count: runLen - head - tail })
      for (let k = j - tail; k < j; k++) rows.push(ops[k])
    } else {
      for (let k = i; k < j; k++) rows.push(ops[k])
    }
    i = j
  }
  return rows
}

export const changedLineCount = (ops) => ops.filter((o) => o.type !== 'eq').length
