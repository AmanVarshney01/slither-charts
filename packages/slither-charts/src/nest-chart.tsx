import { useMemo, useState } from "react"
import type { ChartConfig, Row } from "./chart-context"
import { linearScale } from "./scales"
import { clamp, drawSnake, easeOutCubic, spiralPath } from "./snake-paint"
import { isSpecies, skinOf, type Species } from "./species"
import { useDimensions, useReducedMotion, useSnakeCanvas } from "./use-chart"

const CAST: Species[] = ["grass", "boa", "coral", "viper", "krait", "python"]

export type NestChartProps = {
  data: Row[]
  /** Keyed by the values of `groupKey`; picks each group's species. */
  config?: ChartConfig
  /** Numeric field → horizontal position. */
  xKey: string
  /** Numeric field → vertical position. */
  yKey: string
  /** Optional field naming each point's group (series). */
  groupKey?: string
  /** Optional numeric field → coil size (a bubble chart, but fed). */
  sizeKey?: string
  species?: Species
  className?: string
  xLabel?: string
  yLabel?: string
}

type Coil = {
  x: number
  y: number
  r: number
  species: Species
  label: string
  row: Row
}

const MARGIN = { top: 16, right: 18, bottom: 30, left: 40 }

const axisText = {
  fill: "var(--sc-axis, #97a68f)",
  fontFamily: "var(--sc-mono, ui-monospace, monospace)",
  fontSize: 10,
} as const

/** Scatter plot. Every point is a hatchling coiled up at its coordinates —
 * tail at the center, head resting on the rim. Hover a nest to wake one. */
export function NestChart({
  data,
  config = {},
  xKey,
  yKey,
  groupKey,
  sizeKey,
  species = "grass",
  className,
  xLabel,
  yLabel,
}: NestChartProps) {
  const { ref, size } = useDimensions<HTMLDivElement>()
  const frozen = useReducedMotion()
  const [awake, setAwake] = useState<number | null>(null)

  const innerW = Math.max(0, size.width - MARGIN.left - MARGIN.right)
  const innerH = Math.max(0, size.height - MARGIN.top - MARGIN.bottom)

  const { coils, x, y } = useMemo(() => {
    const nums = (key: string) =>
      data
        .map((r) => r[key])
        .filter((v): v is number => typeof v === "number" && !Number.isNaN(v))
    const ext = (vals: number[], pad = 0.12): [number, number] => {
      if (!vals.length) return [0, 1]
      const lo = Math.min(...vals)
      const hi = Math.max(...vals)
      const span = hi - lo || 1
      return [lo - span * pad, hi + span * pad]
    }
    const x = linearScale(ext(nums(xKey)), [0, innerW], 5)
    const y = linearScale(ext(nums(yKey)), [innerH, 0], 4)
    const sizes = sizeKey ? nums(sizeKey) : []
    const sLo = sizes.length ? Math.min(...sizes) : 0
    const sHi = sizes.length ? Math.max(...sizes) : 1
    const coils: Coil[] = []
    data.forEach((row, i) => {
      const vx = row[xKey]
      const vy = row[yKey]
      if (typeof vx !== "number" || typeof vy !== "number") return
      let r = 10
      if (sizeKey && typeof row[sizeKey] === "number") {
        const t = (Number(row[sizeKey]) - sLo) / (sHi - sLo || 1)
        r = 7 + Math.sqrt(t) * 9
      }
      const group = groupKey ? String(row[groupKey] ?? i) : null
      const cfg = group ? config[group] : undefined
      coils.push({
        x: x(vx),
        y: y(vy),
        r,
        species:
          cfg && isSpecies(cfg.species)
            ? cfg.species
            : group
              ? CAST[
                  Math.abs(
                    [...group].reduce((a, ch) => a + ch.charCodeAt(0), 0)
                  ) % CAST.length
                ]!
              : species,
        label: cfg?.label ?? group ?? "",
        row,
      })
    })
    return { coils, x, y }
  }, [data, config, xKey, yKey, groupKey, sizeKey, species, innerW, innerH])

  const canvasRef = useSnakeCanvas(size.width, size.height, frozen, (ctx, t) => {
    ctx.translate(MARGIN.left, MARGIN.top)
    coils.forEach((c, i) => {
      const isAwake = awake === i
      const reveal = easeOutCubic(clamp((t - 0.1 - i * 0.05) / 1.3, 0, 1))
      if (reveal <= 0) return
      const turns = 2.4
      const path = spiralPath(
        c.x,
        c.y,
        c.r,
        turns,
        i * 2.39,
        frozen ? 0 : 0.05 + (isAwake ? 0.06 : 0),
        t
      )
      drawSnake(ctx, path, {
        skin: skinOf(c.species),
        // Coil rings should touch without overlapping: width ≈ ring spacing.
        width: clamp((c.r / turns) * 0.95, 3, 9),
        time: t,
        seed: i * 0.71,
        reveal,
        hover: isAwake ? 1 : 0,
        dim: awake != null && !isAwake ? 0.5 : 0,
        noWave: true,
        headScale: 0.9,
        frozen,
      })
    })
  })

  const onMove = (clientX: number, clientY: number) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = clientX - rect.left - MARGIN.left
    const py = clientY - rect.top - MARGIN.top
    let best: number | null = null
    let bestD = Infinity
    coils.forEach((c, i) => {
      const d = Math.hypot(c.x - px, c.y - py)
      if (d < c.r + 8 && d < bestD) {
        bestD = d
        best = i
      }
    })
    setAwake(best)
  }

  const ready = size.width > 0 && size.height > 0
  const woken = awake != null ? coils[awake] : null

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%" }}
      onPointerMove={(e) => onMove(e.clientX, e.clientY)}
      onPointerLeave={() => setAwake(null)}
      role="img"
      aria-label={`Scatter plot with ${coils.length} coiled snakes`}
    >
      {ready && (
        <svg
          width={size.width}
          height={size.height}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
          aria-hidden
        >
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {y.ticks.map((tk) => (
              <g key={`y${tk}`}>
                <line
                  x1={0}
                  x2={innerW}
                  y1={y(tk)}
                  y2={y(tk)}
                  style={{ stroke: "var(--sc-grid, rgba(190,205,180,0.13))" }}
                  strokeDasharray="3 5"
                />
                <text x={-8} y={y(tk) + 3} textAnchor="end" style={axisText}>
                  {tk}
                </text>
              </g>
            ))}
            {x.ticks.map((tk) => (
              <text
                key={`x${tk}`}
                x={x(tk)}
                y={innerH + 16}
                textAnchor="middle"
                style={axisText}
              >
                {tk}
              </text>
            ))}
            <line
              x1={0}
              x2={innerW}
              y1={innerH + 0.5}
              y2={innerH + 0.5}
              style={{ stroke: "var(--sc-axis-line, rgba(190,205,180,0.3))" }}
            />
            {xLabel && (
              <text x={innerW} y={innerH - 6} textAnchor="end" style={axisText}>
                {xLabel} →
              </text>
            )}
            {yLabel && (
              <text x={4} y={10} style={axisText}>
                ↑ {yLabel}
              </text>
            )}
          </g>
        </svg>
      )}
      {ready && (
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: size.width,
            height: size.height,
          }}
          aria-hidden
        />
      )}
      {woken && (
        <div
          style={{
            position: "absolute",
            left: clamp(MARGIN.left + woken.x + 14, 4, size.width - 130),
            top: Math.max(4, MARGIN.top + woken.y - 40),
            pointerEvents: "none",
            background: "var(--sc-tip-bg, rgba(16,22,15,0.94))",
            border: "1px solid var(--sc-tip-border, rgba(190,205,180,0.25))",
            borderRadius: 6,
            padding: "6px 9px",
            fontFamily: "var(--sc-mono, ui-monospace, monospace)",
            fontSize: 11,
            color: "var(--sc-tip-fg, #e8e4d0)",
            whiteSpace: "nowrap",
            zIndex: 3,
          }}
        >
          {woken.label && (
            <div style={{ opacity: 0.65, marginBottom: 2 }}>{woken.label}</div>
          )}
          <div>
            {xKey}: <b>{String(woken.row[xKey])}</b> · {yKey}:{" "}
            <b>{String(woken.row[yKey])}</b>
          </div>
        </div>
      )}
    </div>
  )
}
