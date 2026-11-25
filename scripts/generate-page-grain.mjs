// Writes the grain of the page's own background: src/assets/grain-page.png.
//
// The same mold grain as the app's (scripts/generate-grain.mjs in the MiniMail repository: same height field, same
// light), only stronger: past the top of the VDI 3400 scale (Ref 36), about twice the strength of Ref 33. Only the page
// behind everything uses it; the plates and cards keep the app's grain (Ref 18), copied by `npm run sync-ui`.
//
//   node scripts/generate-page-grain.mjs
//
// The output is deterministic (fixed seed).

import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { deflateSync } from "node:zlib"

const N = 384
const LIGHT_FROM_DEGREES = 320 // the light dial at 315°, rounded to 10° as the study did
/** How strong the grain is, and the most opaque a speck gets. The app's grain is 0.0475 and 0.09. */
const GAIN = 0.18
const MAX_ALPHA = 0.18
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "assets")

/** Highlight and shadow tones of the light theme, the only one the site has. */
const TONES = { lite: [255, 255, 255], shade: [72, 64, 55] }

function boxBlur(src, r) {
  const tmp = new Float32Array(N * N)
  const out = new Float32Array(N * N)
  const w = 2 * r + 1
  for (let y = 0; y < N; y++) {
    const row = y * N
    let sum = 0
    for (let k = -r; k <= r; k++) sum += src[row + ((k + N) % N)]
    for (let x = 0; x < N; x++) {
      tmp[row + x] = sum / w
      sum += src[row + ((x + r + 1) % N)] - src[row + ((x - r + N) % N)]
    }
  }
  for (let x = 0; x < N; x++) {
    let sum = 0
    for (let k = -r; k <= r; k++) sum += tmp[((k + N) % N) * N + x]
    for (let y = 0; y < N; y++) {
      out[y * N + x] = sum / w
      sum += tmp[((y + r + 1) % N) * N + x] - tmp[((y - r + N) % N) * N + x]
    }
  }
  return out
}

function normalize(a) {
  let mean = 0
  let variance = 0
  for (let i = 0; i < a.length; i++) mean += a[i]
  mean /= a.length
  for (let i = 0; i < a.length; i++) variance += (a[i] - mean) ** 2
  const sd = Math.sqrt(variance / a.length) || 1
  for (let i = 0; i < a.length; i++) a[i] = (a[i] - mean) / sd
  return a
}

function heightField() {
  let seed = 20261122
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const a = new Float32Array(N * N)
  const b = new Float32Array(N * N)
  for (let i = 0; i < N * N; i++) {
    a[i] = rnd()
    b[i] = rnd()
  }
  const fine = normalize(boxBlur(a, 1))
  const peel = normalize(boxBlur(boxBlur(boxBlur(b, 5), 5), 5))
  const h = new Float32Array(N * N)
  for (let i = 0; i < N * N; i++) h[i] = fine[i] + peel[i] * 0.12
  const gx = new Float32Array(N * N)
  const gy = new Float32Array(N * N)
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = y * N + x
      gx[i] = (h[y * N + ((x + 1) % N)] - h[y * N + ((x - 1 + N) % N)]) * 0.5
      gy[i] = (h[((y + 1) % N) * N + x] - h[((y - 1 + N) % N) * N + x]) * 0.5
    }
  }
  return { gx, gy }
}

function pixels(field, { lite, shade }) {
  // Bearing 0 is light from the top, clockwise; (sx, sy) points toward the light.
  const bearing = (LIGHT_FROM_DEGREES * Math.PI) / 180
  const sx = Math.sin(bearing)
  const sy = -Math.cos(bearing)
  const elevation = (40 * Math.PI) / 180
  const lx = sx * Math.cos(elevation)
  const ly = sy * Math.cos(elevation)
  const lz = Math.sin(elevation)
  const bump = 0.9
  const data = Buffer.alloc(N * N * 4)
  for (let i = 0; i < N * N; i++) {
    const nx = -field.gx[i] * bump
    const ny = -field.gy[i] * bump
    const lit = (nx * lx + ny * ly + lz) / Math.sqrt(nx * nx + ny * ny + 1) - lz
    const colour = lit > 0 ? lite : shade
    const j = i * 4
    data[j] = colour[0]
    data[j + 1] = colour[1]
    data[j + 2] = colour[2]
    data[j + 3] = Math.round(Math.min(MAX_ALPHA, Math.abs(lit) * GAIN) * 255)
  }
  return data
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, body) {
  const head = Buffer.alloc(8)
  head.writeUInt32BE(body.length, 0)
  head.write(type, 4, "ascii")
  const tail = Buffer.alloc(4)
  tail.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), body])), 0)
  return Buffer.concat([head, body, tail])
}
function png(rgba) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(N, 0)
  header.writeUInt32BE(N, 4)
  header[8] = 8 // bit depth
  header[9] = 6 // RGBA
  const rows = Buffer.alloc(N * (N * 4 + 1))
  for (let y = 0; y < N; y++) rgba.copy(rows, y * (N * 4 + 1) + 1, y * N * 4, (y + 1) * N * 4)
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(rows, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

mkdirSync(OUT, { recursive: true })
const file = join(OUT, "grain-page.png")
writeFileSync(file, png(pixels(heightField(), TONES)))
console.log("wrote", file)
