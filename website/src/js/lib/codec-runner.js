// Runs a device payload codec inside a Web Worker so vendor code never
// touches the page. Supports both the TTS codec API (decodeUplink) and
// the legacy Decoder(bytes, port) convention.

const WORKER_SOURCE = `
self.onmessage = function (e) {
  var d = e.data
  try {
    ;(0, eval)(d.source)
    var out
    if (typeof decodeUplink === 'function') {
      out = decodeUplink({ bytes: d.bytes, fPort: d.fPort, recvTime: d.recvTime })
    } else if (typeof Decoder === 'function') {
      out = { data: Decoder(d.bytes, d.fPort) }
    } else {
      throw new Error('codec defines neither decodeUplink() nor Decoder()')
    }
    self.postMessage({ ok: true, result: out })
  } catch (err) {
    self.postMessage({ ok: false, error: String((err && err.message) || err) })
  }
}
`

const workerURL = URL.createObjectURL(
  new Blob([WORKER_SOURCE], { type: 'text/javascript' }),
)

export const runDecoder = (source, bytes, fPort, timeoutMs = 3000) =>
  new Promise((resolve) => {
    let worker
    try {
      worker = new Worker(workerURL)
    } catch (err) {
      resolve({ ok: false, error: 'failed to start codec sandbox: ' + err })
      return
    }
    const timer = setTimeout(() => {
      worker.terminate()
      resolve({ ok: false, error: 'codec timed out after ' + timeoutMs + ' ms' })
    }, timeoutMs)
    worker.onmessage = (e) => {
      clearTimeout(timer)
      worker.terminate()
      resolve(e.data)
    }
    worker.onerror = (e) => {
      clearTimeout(timer)
      worker.terminate()
      resolve({ ok: false, error: e.message || 'codec crashed' })
    }
    worker.postMessage({
      source,
      bytes,
      fPort,
      recvTime: new Date().toISOString(),
    })
  })

export const parseHex = (text) => {
  const clean = (text || '').replace(/0x/gi, ' ').replace(/[^0-9a-f]/gi, '')
  if (!clean || clean.length % 2 !== 0) return null
  const bytes = []
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(parseInt(clean.slice(i, i + 2), 16))
  }
  return bytes
}

export const toHex = (bytes) =>
  bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')
