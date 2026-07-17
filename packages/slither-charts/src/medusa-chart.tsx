import { useMemo, useState } from "react"
import type { ChartConfig, Row } from "./chart-context"
import { niceTicks } from "./scales"
import { clamp, drawSnake, easeOutCubic, type Pt } from "./snake-paint"
import { isSpecies, skinOf, type Species } from "./species"
import { useDimensions, useReducedMotion, useSnakeCanvas } from "./use-chart"

const TAU = Math.PI * 2
const CAST: Species[] = ["garter", "python", "coral", "viper", "mamba", "boa"]

export type MedusaChartProps = {
  data: Row[]
  /** Keyed by the values of `nameKey`; picks each spoke's species. */
  config?: ChartConfig
  /** Numeric field → spoke length. */
  dataKey: string
  /** Field naming each spoke. */
  nameKey: string
  species?: Species
  className?: string
}

type Spoke = {
  name: string
  label: string
  value: number
  angle: number
  species: Species
}

/** Radial bar chart: snakes radiating from a single very judgmental center,
 * each one exactly as long as its value. Named after the only other data
 * structure known to hold this many snakes. */
export function MedusaChart({
  data,
  config = {},
  dataKey,
  nameKey,
  species,
  className,
}: MedusaChartProps) {
  const { ref, size } = useDimensions<HTMLDivElement>()
  const frozen = useReducedMotion()
  const [hovered, setHovered] = useState<number | null>(null)

  const cx = size.width / 2
  const cy = size.height / 2
  const r0 = 16 // the head-of-Medusa exclusion zone
  const maxR = Math.max(20, Math.min(size.width, size.height) / 2 - 46)

  const { spokes, vMax, rings } = useMemo(() => {
    const values = data.map((row) => {
      const v = row[dataKey]
      return typeof v === "number" && v > 0 ? v : 0
    })
    const vMax = Math.max(1, ...values) * 1.06
    const spokes: Spoke[] = data.map((row, i) => {
      const name = String(row[nameKey] ?? i)
      const cfg = config[name]
      return {
        name,
        label: cfg?.label ?? name,
        value: values[i]!,
        angle: -Math.PI / 2 + (i * TAU) / data.length,
        species:
          cfg && isSpecies(cfg.species)
            ? cfg.species
            : (species ?? CAST[i % CAST.length]!),
      }
    })
    const rings = niceTicks(0, vMax, 3).filter((t) => t > 0 && t <= vMax)
    return { spokes, vMax, rings }
  }, [data, config, dataKey, nameKey, species])

  const rOf = (v: number) => r0 + (v / vMax) * (maxR - r0)

  const canvasRef = useSnakeCanvas(size.width, size.height, frozen, (ctx, t) => {
    spokes.forEach((s, i) => {
      if (s.value <= 0) return
      const reveal = easeOutCubic(clamp((t - 0.15 - i * 0.09) / 1.2, 0, 1))
      if (reveal <= 0) return
      const rr = rOf(s.value)
      const path: Pt[] = [
        { x: cx + Math.cos(s.angle) * r0 * 0.4, y: cy + Math.sin(s.angle) * r0 * 0.4 },
        { x: cx + Math.cos(s.angle) * rr, y: cy + Math.sin(s.angle) * rr },
      ]
      const width = clamp(((TAU * maxR) / spokes.length) * 0.16, 5, 12)
      drawSnake(ctx, path, {
        skin: skinOf(s.species),
        width,
        time: t,
        seed: i * 0.47 + 0.13,
        reveal,
        hover: hovered === i ? 1 : 0,
        dim: hovered != null && hovered !== i ? 0.6 : 0,
        wiggleAmp: clamp(width * 0.55, 2, 5),
        wiggleLen: Math.max(40, rr * 0.55),
        headScale: 0.9,
        frozen,
      })
    })
  })

  const onMove = (clientX: number, clientY: number) => {
    const el = ref.current
    if (!el || spokes.length === 0) return
    const rect = el.getBoundingClientRect()
    const dx = clientX - rect.left - cx
    const dy = clientY - rect.top - cy
    if (Math.hypot(dx, dy) > maxR + 26) {
      setHovered(null)
      return
    }
    const ang = Math.atan2(dy, dx)
    let best = 0
    let bestD = Infinity
    spokes.forEach((s, i) => {
      let d = Math.abs(ang - s.angle)
      if (d > Math.PI) d = TAU - d
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    setHovered(bestD < TAU / spokes.length ? best : null)
  }

  const ready = size.width > 0 && size.height > 0
  const labelStyle = {
    fill: "var(--sc-legend, #c9d2c0)",
    fontFamily: "var(--sc-mono, ui-monospace, monospace)",
    fontSize: 11,
  } as const

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%" }}
      onPointerMove={(e) => onMove(e.clientX, e.clientY)}
      onPointerLeave={() => setHovered(null)}
      role="img"
      aria-label={`Radial chart with ${spokes.length} snakes`}
    >
      {ready && (
        <svg
          width={size.width}
          height={size.height}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
          aria-hidden
        >
          {rings.map((tk) => (
            <circle
              key={tk}
              cx={cx}
              cy={cy}
              r={rOf(tk)}
              fill="none"
              style={{ stroke: "var(--sc-grid, rgba(190,205,180,0.13))" }}
              strokeDasharray="3 5"
            />
          ))}
          {rings.length > 0 && (
            <text
              x={cx + 4}
              y={cy - rOf(rings[rings.length - 1]!) - 4}
              style={{ ...labelStyle, fontSize: 9.5, opacity: 0.6 }}
            >
              {rings[rings.length - 1]}
            </text>
          )}
          {spokes.map((s, i) => {
            const lr = maxR + 16
            const lx = cx + Math.cos(s.angle) * lr
            const ly = cy + Math.sin(s.angle) * lr
            const cos = Math.cos(s.angle)
            return (
              <text
                key={s.name}
                x={lx}
                y={ly + 4}
                textAnchor={cos > 0.35 ? "start" : cos < -0.35 ? "end" : "middle"}
                style={{
                  ...labelStyle,
                  opacity: hovered == null || hovered === i ? 1 : 0.4,
                  fontWeight: hovered === i ? 600 : 400,
                }}
              >
                {s.label}
                {hovered === i ? ` · ${s.value}` : ""}
              </text>
            )
          })}
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
    </div>
  )
}
