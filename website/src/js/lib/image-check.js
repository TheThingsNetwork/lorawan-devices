// Client-side device photo validation. Nothing is uploaded anywhere, the
// file is inspected locally and the verdicts mirror the repository rules
// (PNG, at most 2000×2000) plus the submission guidelines (transparent
// background, reasonable resolution).

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

const readMagic = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(new Uint8Array(reader.result))
    reader.onerror = () => resolve(null)
    reader.readAsArrayBuffer(file.slice(0, 8))
  })

const loadImage = (url) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })

// Sample the alpha channel on a downscaled copy: the background is
// considered transparent when the outer edge is mostly alpha-0.
const alphaStats = (img) => {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, size, size)
  let data
  try {
    data = ctx.getImageData(0, 0, size, size).data
  } catch (e) {
    return null
  }
  let edgeTransparent = 0
  let edgeTotal = 0
  let anyTransparent = false
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const alpha = data[(y * size + x) * 4 + 3]
      if (alpha < 8) anyTransparent = true
      const onEdge = x < 4 || y < 4 || x >= size - 4 || y >= size - 4
      if (onEdge) {
        edgeTotal++
        if (alpha < 8) edgeTransparent++
      }
    }
  }
  return { edgeRatio: edgeTransparent / edgeTotal, anyTransparent }
}

export const checkPhoto = async (file) => {
  const checks = []
  const add = (status, label, detail) => checks.push({ status, label, detail })

  const magic = await readMagic(file)
  const isPng = magic && PNG_MAGIC.every((b, i) => magic[i] === b)
  add(isPng ? 'pass' : 'fail', 'PNG format', isPng ? 'valid PNG signature' : 'file is not a PNG, repository images must be PNG')

  let url = null
  let width = 0
  let height = 0
  if (isPng) {
    url = URL.createObjectURL(file)
    const img = await loadImage(url)
    if (!img) {
      add('fail', 'Decodable image', 'the file could not be decoded')
    } else {
      width = img.naturalWidth
      height = img.naturalHeight
      const sizeOK = width <= 2000 && height <= 2000
      add(sizeOK ? 'pass' : 'fail', 'Maximum 2000 × 2000 px', `${width} × ${height} px`)
      add(
        Math.min(width, height) >= 600 ? 'pass' : 'warn',
        'Resolution',
        Math.min(width, height) >= 600 ? `${width} × ${height} px` : `${width} × ${height} px, at least ~800 px recommended for crisp listings`,
      )
      const alpha = alphaStats(img)
      if (!alpha) {
        add('warn', 'Transparent background', 'could not inspect pixels in this browser')
      } else if (alpha.edgeRatio > 0.55) {
        add('pass', 'Transparent background', 'image edges are transparent')
      } else if (alpha.anyTransparent) {
        add('warn', 'Transparent background', 'has transparency, but the edges look filled, make sure the background is removed')
      } else {
        add('fail', 'Transparent background', 'no transparent pixels found, submissions must have a transparent background')
      }
    }
  }

  const ok = checks.every((c) => c.status !== 'fail')
  return { ok, checks, width, height, url }
}
