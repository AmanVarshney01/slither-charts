import {
  Children,
  isValidElement,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react"
import {
  PolarContext,
  usePolar,
  type ChartConfig,
  type PolarCtx,
  type Row,
  type Slice,
} from "./chart-context"
import { arcPath, clamp, drawSnake, easeOutCubic } from "./snake-paint"
import { isSpecies, skinOf, type Species } from "./species"
import { useDimensions, useReducedMotion, useSnakeCanvas } from "./use-chart"

const TAU = Math.PI * 2
const START = -Math.PI / 2 // noon, like a clock made of snakes

const CAST: Species[] = ["garter", "python", "coral", "viper", "mamba", "boa"]

/** Style marker for the ring. `wobble` is how much the circle breathes. */
export function Ouroboros(_props: { wobble?: number }) {
  return null
}
Ouroboros.layer = "series" as const

export type OuroborosChartProps = {
  data: Row[]
  config: ChartConfig
  /** Which field is the value. */
  dataKey: string
  /** Which field names the slice. */
  nameKey: string
  /** Ring thickness as a fraction of the radius. */
  thickness?: number
  className?: string
  children?: ReactNode
}

function OuroborosCanvas({ wobble }: { wobble: number }) {
  const p = usePolar()
  const canvasRef = useSnakeCanvas(p.width, p.height, p.frozen, (ctx, t) => {
    const { slices, cx, cy, r, thickness } = p
    const width = clamp(thickness * 0.5, 7, 15)
    const gapA = Math.max(16, width * 2.4) / r

    slices.forEach((s, i) => {
      const span = s.a1 - s.a0
      const a0 = s.a0 + Math.min(gapA / 2, span * 0.2)
      const a1 = s.a1 - Math.min(gapA / 2, span * 0.2)
      if (a1 <= a0) return
      const reveal = easeOutCubic(clamp((t - 0.2 - i * 0.18) / 1.2, 0, 1))
      if (reveal <= 0) return
      const hovered = p.hoverSlice === i || p.hoveredKey === s.name
      const dimmed =
        (p.hoverSlice != null && p.hoverSlice !== i) ||
        (p.hoveredKey != null && p.hoveredKey !== s.name)
      const rr = r + (hovered ? 5 : 0)
      const path = arcPath(cx, cy, rr, a0, a1, wobble, p.frozen ? 0 : t, i)
      drawSnake(ctx, path, {
        skin: skinOf(s.species),
        width: Math.min(width, span * rr * 0.3),
        time: t,
        seed: i * 0.53 + 0.11,
        reveal,
        hover: hovered ? 1 : 0,
        dim: dimmed ? 1 : 0,
        headScale: 0.85,
        noWave: true,
        frozen: p.frozen,
      })
    })
  })

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: p.width, height: p.height }}
      aria-hidden
    />
  )
}

/** Pie chart as a ring of snakes, each politely biting the next one's tail.
 * The oldest data visualization: a circle that eats itself. */
export function OuroborosChart({
  data,
  config,
  dataKey,
  nameKey,
  thickness = 0.32,
  className,
  children,
}: OuroborosChartProps) {
  const { ref, size } = useDimensions<HTMLDivElement>()
  const frozen = useReducedMotion()
  const [hoverSlice, setHoverSlice] = useState<number | null>(null)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })

  let wobble = 1.6
  const dom: ReactNode[] = []
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    const type = child.type as ComponentType & { layer?: string }
    const props = child.props as Record<string, unknown>
    if (type.layer === "series") {
      if (typeof props.wobble === "number") wobble = props.wobble
      return
    }
    dom.push(child)
  })

  const ctx: PolarCtx = useMemo(() => {
    const values = data.map((row) => {
      const v = row[dataKey]
      return typeof v === "number" && v > 0 ? v : 0
    })
    const total = values.reduce((a, b) => a + b, 0) || 1
    let a = START
    const slices: Slice[] = data.map((row, i) => {
      const name = String(row[nameKey] ?? i)
      const frac = values[i]! / total
      const a0 = a
      a += frac * TAU
      const cfg = config[name]
      return {
        name,
        value: values[i]!,
        frac,
        a0,
        a1: a,
        species:
          cfg && isSpecies(cfg.species) ? cfg.species : CAST[i % CAST.length]!,
        label: cfg?.label ?? name,
      }
    })
    // Leave headroom for the legend row and for hovered snakes lifting.
    const rOuter = Math.max(10, (Math.min(size.width, size.height) - 46) / 2 - 14)
    const th = Math.max(8, rOuter * thickness)
    return {
      slices,
      total,
      cx: size.width / 2,
      cy: size.height / 2 + 18,
      r: rOuter - th / 2,
      thickness: th,
      width: size.width,
      height: size.height,
      hoverSlice,
      setHoverSlice,
      hoveredKey,
      setHoveredKey,
      cursor,
      frozen,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    config,
    dataKey,
    nameKey,
    thickness,
    size.width,
    size.height,
    hoverSlice,
    hoveredKey,
    cursor,
    frozen,
  ])

  const onMove = (clientX: number, clientY: number) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    setCursor({ x, y })
    const dx = x - ctx.cx
    const dy = y - ctx.cy
    const dist = Math.hypot(dx, dy)
    if (dist < ctx.r - ctx.thickness || dist > ctx.r + ctx.thickness) {
      setHoverSlice(null)
      return
    }
    let ang = Math.atan2(dy, dx)
    while (ang < START) ang += TAU
    const i = ctx.slices.findIndex((s) => ang >= s.a0 && ang < s.a1)
    setHoverSlice(i === -1 ? null : i)
  }

  const ready = size.width > 0 && size.height > 0

  return (
    <PolarContext.Provider value={ctx}>
      <div
        ref={ref}
        className={className}
        style={{ position: "relative", width: "100%", height: "100%" }}
        onPointerMove={(e) => onMove(e.clientX, e.clientY)}
        onPointerLeave={() => setHoverSlice(null)}
        role="img"
        aria-label={`Ring chart with ${data.length} snakes`}
      >
        {ready && <OuroborosCanvas wobble={wobble} />}
        {ready && dom}
      </div>
    </PolarContext.Provider>
  )
}
