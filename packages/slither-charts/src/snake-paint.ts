// The snake painter. Give it any polyline (a data path, a bar spine, an arc)
// and it lays a living snake along it: traveling-wave slither, tapered ribbon
// body, species skin pattern, head with eyes, blink, and a flicking forked
// tongue. Everything is canvas 2D — one Path2D ribbon per snake per frame.

import type { Skin } from "./species"

export type Pt = { x: number; y: number }

export type SnakeOpts = {
  skin: Skin
  /** Max body width in px. */
  width: number
  /** Seconds since the chart hatched. */
  time: number
  /** Per-snake phase/behavior offset so a den of snakes doesn't sync up. */
  seed: number
  /** 0..1 entrance — the snake has slithered along this fraction of the path.
   * Head rides the frontier; body streams out behind it. */
  reveal: number
  /** 0..1 — hover lift: livelier wave, faster tongue. */
  hover?: number
  /** 0..1 — dim (some other snake is being admired). */
  dim?: number
  /** Slither amplitude in px. Defaults to a data-honest wobble. */
  wiggleAmp?: number
  /** Slither wavelength in px. */
  wiggleLen?: number
  /** 0..1 cobra hood flare behind the head. */
  hood?: number
  headScale?: number
  /** Freeze all motion (prefers-reduced-motion). */
  frozen?: boolean
  /** Skip the wave entirely — the path already is the pose (ouroboros). */
  noWave?: boolean
}

const TAU = Math.PI * 2

export const clamp = (v: number, a: number, b: number) =>
  v < a ? a : v > b ? b : v
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a || 1), 0, 1)
  return t * t * (3 - 2 * t)
}
export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

/** Resample a polyline to ~even arc-length steps. Returns [pts, totalLength]. */
export function resample(path: Pt[], step: number): [Pt[], number] {
  if (path.length < 2) return [path.slice(), 0]
  let total = 0
  const segLen: number[] = []
  for (let i = 1; i < path.length; i++) {
    const l = Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y)
    segLen.push(l)
    total += l
  }
  if (total === 0) return [[path[0]], 0]
  const n = Math.max(2, Math.round(total / step) + 1)
  const out: Pt[] = []
  let seg = 0
  let segStart = 0
  for (let k = 0; k < n; k++) {
    const target = (total * k) / (n - 1)
    while (seg < segLen.length - 1 && segStart + segLen[seg] < target) {
      segStart += segLen[seg]
      seg++
    }
    const t = segLen[seg] ? (target - segStart) / segLen[seg] : 0
    const a = path[seg]
    const b = path[seg + 1]
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
  }
  return [out, total]
}

type Frame = {
  pts: Pt[] // wave-offset centerline
  nx: number[] // normals
  ny: number[]
  w: number[] // half-widths
  len: number
}

/** In-place box smoothing, endpoints pinned. Rounds off data corners so the
 * ribbon doesn't kink at sharp bends. */
function smoothPath(pts: Pt[], passes: number) {
  for (let p = 0; p < passes; p++) {
    let px = pts[0].x
    let py = pts[0].y
    for (let i = 1; i < pts.length - 1; i++) {
      const cx = pts[i].x
      const cy = pts[i].y
      pts[i] = {
        x: (px + cx * 2 + pts[i + 1].x) / 4,
        y: (py + cy * 2 + pts[i + 1].y) / 4,
      }
      px = cx
      py = cy
    }
  }
}

/** Build the posed body: cut to the revealed frontier, apply the traveling
 * wave, recompute normals, assign the tapered width profile. */
function pose(path: Pt[], o: SnakeOpts): Frame | null {
  const stepPx = 3
  const [full, fullLen] = resample(path, stepPx)
  if (full.length < 2 || fullLen < 2) return null

  const reveal = clamp(o.reveal, 0.02, 1)
  const count = Math.max(2, Math.round((full.length - 1) * reveal) + 1)
  const raw = full.slice(0, count)
  smoothPath(raw, 2)
  const len = fullLen * reveal
  const ds = len / (raw.length - 1)

  const amp = o.noWave
    ? 0
    : (o.wiggleAmp ?? clamp(o.width * 0.75, 2, 7)) * (1 + (o.hover ?? 0) * 0.9)
  const lambda = o.wiggleLen ?? Math.max(46, o.width * 9)
  const omega = o.frozen ? 0 : 2.6 + (o.hover ?? 0) * 2.2
  // While slithering in, the wave travels backward under the body so the
  // snake visibly pushes itself forward.
  const travel = o.time * omega + o.seed * TAU

  // Normals of the raw path, then offset.
  const pts: Pt[] = new Array(raw.length)
  for (let i = 0; i < raw.length; i++) {
    const p0 = raw[Math.max(0, i - 1)]
    const p1 = raw[Math.min(raw.length - 1, i + 1)]
    let tx = p1.x - p0.x
    let ty = p1.y - p0.y
    const tl = Math.hypot(tx, ty) || 1
    tx /= tl
    ty /= tl
    const s = i * ds
    // Head end (s → len) straightens out: snakes lead with a steady head.
    const headCalm = 1 - smoothstep(len - Math.max(24, o.width * 4), len, s)
    // Tail tip also settles so it doesn't whip.
    const tailCalm = smoothstep(0, 14, s)
    const off =
      amp * Math.sin((s / lambda) * TAU - travel) * headCalm * tailCalm
    pts[i] = { x: raw[i].x - ty * off, y: raw[i].y + tx * off }
  }

  // The wave sharpens corners; soften the final centerline too.
  smoothPath(pts, 1)

  const nx: number[] = new Array(pts.length)
  const ny: number[] = new Array(pts.length)
  const w: number[] = new Array(pts.length)
  const ang: number[] = new Array(pts.length)
  const W = o.width
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[Math.min(pts.length - 1, i + 1)]
    const tx = p1.x - p0.x
    const ty = p1.y - p0.y
    const tl = Math.hypot(tx, ty) || 1
    nx[i] = -ty / tl
    ny[i] = tx / tl
    ang[i] = Math.atan2(ty, tx)
    const u = i / (pts.length - 1)
    // Pointy tail → full body → slight neck taper into the head.
    const body = 0.3 + 0.7 * smoothstep(0, 0.38, u)
    const tailTip = clamp(u / 0.07, 0, 1) ** 0.65
    const neck = 1 - 0.4 * smoothstep(0.92, 1, u)
    w[i] = (W / 2) * body * tailTip * neck
  }

  // Cap the half-width by the local turning radius so the ribbon never
  // folds over itself on a tight bend (no bowtie snakes).
  for (let i = 1; i < pts.length - 1; i++) {
    let da = Math.abs(ang[i + 1] - ang[i - 1])
    if (da > Math.PI) da = TAU - da
    if (da > 1e-4) {
      const radius = (2 * ds) / da
      w[i] = Math.min(w[i], radius * 0.75)
    }
  }
  // Re-smooth widths so the cap doesn't leave dents.
  for (let p = 0; p < 2; p++)
    for (let i = 1; i < w.length - 1; i++)
      w[i] = (w[i - 1] + w[i] * 2 + w[i + 1]) / 4

  return { pts, nx, ny, w, len }
}

function ribbonPath(f: Frame): Path2D {
  const p = new Path2D()
  const { pts, nx, ny, w } = f
  p.moveTo(pts[0].x + nx[0] * w[0], pts[0].y + ny[0] * w[0])
  for (let i = 1; i < pts.length; i++)
    p.lineTo(pts[i].x + nx[i] * w[i], pts[i].y + ny[i] * w[i])
  for (let i = pts.length - 1; i >= 0; i--)
    p.lineTo(pts[i].x - nx[i] * w[i], pts[i].y - ny[i] * w[i])
  p.closePath()
  return p
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  f: Frame,
  skin: Skin,
  W: number
) {
  const { pts, nx, ny, w } = f
  const n = pts.length
  const ds = f.len / (n - 1)

  switch (skin.pattern) {
    case "plain":
      break
    case "stripe": {
      // Dorsal racing stripe (garter pride).
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < n; i++) ctx.lineTo(pts[i].x, pts[i].y)
      ctx.strokeStyle = skin.marking
      ctx.lineWidth = Math.max(1.4, W * 0.22)
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.stroke()
      break
    }
    case "zigzag": {
      const period = Math.max(7, W * 1.1)
      const stride = Math.max(1, Math.round(period / ds))
      ctx.beginPath()
      let flip = 1
      for (let i = 0, k = 0; i < n; i += stride, k++) {
        const j = Math.min(i, n - 1)
        const off = w[j] * 0.45 * flip
        const x = pts[j].x + nx[j] * off
        const y = pts[j].y + ny[j] * off
        if (k === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
        flip = -flip
      }
      ctx.strokeStyle = skin.marking
      ctx.lineWidth = Math.max(1.4, W * 0.24)
      ctx.lineJoin = "round"
      ctx.stroke()
      break
    }
    case "bands": {
      // Coral rule: marking / skin / marking2 / skin / …
      const bandLen = Math.max(8, W * 1.5)
      const stride = Math.max(1, Math.round(bandLen / ds))
      let which = 0
      for (let i = 0; i < n - 1; i += stride * 2) {
        const end = Math.min(i + stride, n - 1)
        ctx.beginPath()
        ctx.moveTo(pts[i].x + nx[i] * w[i], pts[i].y + ny[i] * w[i])
        for (let j = i + 1; j <= end; j++)
          ctx.lineTo(pts[j].x + nx[j] * w[j], pts[j].y + ny[j] * w[j])
        for (let j = end; j >= i; j--)
          ctx.lineTo(pts[j].x - nx[j] * w[j], pts[j].y - ny[j] * w[j])
        ctx.closePath()
        ctx.fillStyle =
          which % 2 === 0 ? skin.marking : (skin.marking2 ?? skin.marking)
        ctx.fill()
        which++
      }
      break
    }
    case "diamonds": {
      const gap = Math.max(11, W * 1.9)
      const stride = Math.max(2, Math.round(gap / ds))
      ctx.fillStyle = skin.marking
      for (let i = stride; i < n - 2; i += stride) {
        const halfL = Math.min(gap * 0.42, ds * stride * 0.42)
        const halfW = w[i] * 0.62
        const j0 = Math.max(0, i - Math.round(halfL / ds))
        const j1 = Math.min(n - 1, i + Math.round(halfL / ds))
        ctx.beginPath()
        ctx.moveTo(pts[j0].x, pts[j0].y)
        ctx.lineTo(pts[i].x + nx[i] * halfW, pts[i].y + ny[i] * halfW)
        ctx.lineTo(pts[j1].x, pts[j1].y)
        ctx.lineTo(pts[i].x - nx[i] * halfW, pts[i].y - ny[i] * halfW)
        ctx.closePath()
        ctx.fill()
      }
      break
    }
  }
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  f: Frame,
  o: SnakeOpts
) {
  const { pts } = f
  const n = pts.length
  const pe = pts[n - 1]
  const pb = pts[Math.max(0, n - 3)]
  const ang = Math.atan2(pe.y - pb.y, pe.x - pb.x)
  const scale = o.headScale ?? 1
  const W = o.width
  const hl = Math.max(7, W * 1.9) * scale // head length
  const hw = Math.max(5, W * 1.5) * scale // head width
  const t = o.frozen ? o.seed * 7 : o.time

  ctx.save()
  ctx.translate(pe.x, pe.y)
  ctx.rotate(ang)

  // Cobra hood: flared ellipse tucked behind the skull.
  if (o.hood) {
    ctx.beginPath()
    ctx.ellipse(-hl * 0.35, 0, hl * 0.95, (hw / 2) * (1.15 + o.hood * 1.15), 0, 0, TAU)
    ctx.fillStyle = o.skin.skin
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(-hl * 0.45, 0, hl * 0.42, hw * 0.4 * o.hood, 0, 0, TAU)
    ctx.fillStyle = o.skin.marking
    ctx.globalAlpha *= 0.5
    ctx.fill()
    ctx.globalAlpha /= 0.5
  }

  // Skull: a snout-forward egg.
  ctx.beginPath()
  ctx.ellipse(hl * 0.3, 0, hl * 0.72, hw / 2, 0, 0, TAU)
  ctx.fillStyle = o.skin.skin
  ctx.fill()
  ctx.strokeStyle = "rgba(0,0,0,0.28)"
  ctx.lineWidth = 1
  ctx.stroke()

  // Tongue: quick forked flick every couple of seconds, per-snake rhythm.
  const cycle = 2.1 + (o.seed % 1) * 1.6 - (o.hover ?? 0) * 0.9
  const ph = ((t + o.seed * 13.7) % cycle) / cycle
  const flick = ph < 0.16 ? Math.sin((ph / 0.16) * Math.PI) : 0
  if (flick > 0.05) {
    const snout = hl * 0.98
    const ext = hl * (0.25 + 0.55 * flick)
    ctx.beginPath()
    ctx.moveTo(snout, 0)
    ctx.lineTo(snout + ext, 0)
    ctx.moveTo(snout + ext, 0)
    ctx.lineTo(snout + ext + hl * 0.2, -hl * 0.13)
    ctx.moveTo(snout + ext, 0)
    ctx.lineTo(snout + ext + hl * 0.2, hl * 0.13)
    ctx.strokeStyle = o.skin.tongue
    ctx.lineWidth = Math.max(1, W * 0.14)
    ctx.lineCap = "round"
    ctx.stroke()
  }

  // Eyes with vertical slit pupils; occasional blink.
  const blinkPh = ((t * 0.45 + o.seed * 3.1) % 3.7) / 3.7
  const blinking = blinkPh > 0.97
  const er = Math.max(1.4, hw * 0.17)
  for (const side of [-1, 1]) {
    const ex = hl * 0.38
    const ey = side * hw * 0.3
    ctx.beginPath()
    ctx.arc(ex, ey, er, 0, TAU)
    ctx.fillStyle = blinking ? o.skin.skin : o.skin.eye
    ctx.fill()
    if (blinking) {
      ctx.strokeStyle = o.skin.pupil
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.moveTo(ex - er, ey)
      ctx.lineTo(ex + er, ey)
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.ellipse(ex, ey, er * 0.32, er * 0.85, 0, 0, TAU)
      ctx.fillStyle = o.skin.pupil
      ctx.fill()
    }
  }

  ctx.restore()
}

/** Lay a snake along `path`. Tail at path[0], head at the reveal frontier. */
export function drawSnake(
  ctx: CanvasRenderingContext2D,
  path: Pt[],
  o: SnakeOpts
) {
  const f = pose(path, o)
  if (!f) return

  ctx.save()
  if (o.dim) ctx.globalAlpha *= 1 - clamp(o.dim, 0, 1) * 0.72

  const body = ribbonPath(f)

  // Ground shadow keeps the snake sitting *on* the chart, not floating.
  ctx.save()
  ctx.translate(1.5, 2.5)
  ctx.fillStyle = "rgba(0,0,0,0.30)"
  ctx.fill(body)
  ctx.restore()

  ctx.fillStyle = o.skin.skin
  ctx.fill(body)

  ctx.save()
  ctx.clip(body)
  // Belly sheen along one flank.
  const { pts, nx, ny, w } = f
  ctx.beginPath()
  for (let i = 0; i < pts.length; i++) {
    const x = pts[i].x - nx[i] * w[i] * 0.5
    const y = pts[i].y - ny[i] * w[i] * 0.5
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = o.skin.belly
  ctx.globalAlpha *= 0.5
  ctx.lineWidth = Math.max(1.5, o.width * 0.3)
  ctx.lineCap = "round"
  ctx.stroke()
  ctx.globalAlpha /= 0.5

  drawPattern(ctx, f, o.skin, o.width)
  ctx.restore()

  ctx.strokeStyle = "rgba(0,0,0,0.30)"
  ctx.lineWidth = 1
  ctx.stroke(body)

  drawHead(ctx, f, o)
  ctx.restore()
}

/** Arc → polyline, for the ouroboros. Angles in radians, clockwise. */
export function arcPath(
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
  wobble = 0,
  time = 0,
  seed = 0
): Pt[] {
  const steps = Math.max(8, Math.round((Math.abs(a1 - a0) * r) / 4))
  const pts: Pt[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = a0 + (a1 - a0) * t
    const rr =
      r + (wobble ? Math.sin(t * 14 + time * 1.8 + seed * 9) * wobble : 0)
    pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr })
  }
  return pts
}
