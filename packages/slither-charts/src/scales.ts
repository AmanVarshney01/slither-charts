// Tiny scale helpers — the whole "engine" is a linear scale, nice ticks and a
// band scale. No d3. Snakes don't need d3.

export type LinearScale = {
  (v: number): number
  domain: [number, number]
  range: [number, number]
  ticks: number[]
}

const NICE_STEPS = [1, 2, 2.5, 5, 10]

export function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) {
    max = min === 0 ? 1 : min * 1.1
    min = min === 0 ? 0 : min * 0.9
  }
  const span = max - min
  const rawStep = span / Math.max(1, count)
  const mag = 10 ** Math.floor(Math.log10(rawStep))
  const norm = rawStep / mag
  const step = (NICE_STEPS.find((s) => norm <= s) ?? 10) * mag
  const start = Math.ceil(min / step) * step
  const ticks: number[] = []
  for (let v = start; v <= max + step * 1e-6; v += step) {
    ticks.push(Math.abs(v) < step * 1e-9 ? 0 : +v.toPrecision(12))
  }
  return ticks
}

export function linearScale(
  domain: [number, number],
  range: [number, number],
  tickCount = 5
): LinearScale {
  const [d0, d1] = domain
  const [r0, r1] = range
  const span = d1 - d0 || 1
  const fn = ((v: number) => r0 + ((v - d0) / span) * (r1 - r0)) as LinearScale
  fn.domain = domain
  fn.range = range
  fn.ticks = niceTicks(d0, d1, tickCount)
  return fn
}

/** Extent of every numeric series key across the rows, zero-floored so bars
 * and snakes always rise from the ground. */
export function seriesExtent(
  data: Record<string, unknown>[],
  keys: string[]
): [number, number] {
  let min = 0
  let max = -Infinity
  for (const row of data) {
    for (const k of keys) {
      const v = row[k]
      if (typeof v !== "number" || Number.isNaN(v)) continue
      if (v < min) min = v
      if (v > max) max = v
    }
  }
  if (max === -Infinity) max = 1
  // Headroom so heads and tongues don't clip the chart top.
  return [min, max * 1.12]
}

export type BandScale = {
  center(i: number): number
  bandwidth: number
  step: number
}

export function bandScale(
  count: number,
  range: [number, number],
  paddingOuter = 0.35,
  paddingInner = 0.35
): BandScale {
  const [r0, r1] = range
  const n = Math.max(1, count)
  const step = (r1 - r0) / (n - paddingInner + paddingOuter * 2)
  const bandwidth = step * (1 - paddingInner)
  const start = r0 + step * paddingOuter
  return {
    center: (i) => start + step * i + bandwidth / 2,
    bandwidth,
    step,
  }
}

/** Evenly spread points across the range (line charts: one vertebra per row). */
export function pointScale(count: number, range: [number, number]) {
  const [r0, r1] = range
  const n = Math.max(1, count - 1)
  return (i: number) => r0 + ((r1 - r0) * i) / n
}
