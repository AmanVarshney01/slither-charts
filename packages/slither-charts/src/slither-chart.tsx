import { useChart } from "./chart-context"
import { CartesianRoot, type CartesianProps } from "./cartesian-root"
import {
  clamp,
  drawSnake,
  easeOutCubic,
  type Pt,
} from "./snake-paint"
import { skinOf, type Species } from "./species"
import { useSnakeCanvas } from "./use-chart"

/** One line series = one snake. Tail at the first row, head resting on the
 * latest value, permanently mid-slither. */
export function Snake(_props: {
  dataKey: string
  species?: Species
  /** Per-snake slither multiplier. */
  wiggle?: number
  /** "pit" = area chart: the line snake rides a writhing pit of snakes
   * stacked down to the baseline. Every layer is load-bearing. */
  variant?: "snake" | "pit"
}) {
  return null
}
Snake.layer = "series" as const

/** The prey. Lives at the crosshair; the snakes never quite catch it. */
export function drawMouse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number
) {
  const tw = Math.sin(t * 7) * 0.6 // nervous tail
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = "rgba(196, 189, 172, 0.95)"
  // tail
  ctx.beginPath()
  ctx.moveTo(4, -1.5)
  ctx.quadraticCurveTo(10, -3 + tw, 13, -0.5 + tw)
  ctx.strokeStyle = "rgba(196, 189, 172, 0.8)"
  ctx.lineWidth = 1
  ctx.stroke()
  // body + head
  ctx.beginPath()
  ctx.ellipse(0, -3, 5, 3.2, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(-4.5, -3.8, 2.6, 2.1, -0.35, 0, Math.PI * 2)
  ctx.fill()
  // ear
  ctx.beginPath()
  ctx.arc(-3.2, -6, 1.5, 0, Math.PI * 2)
  ctx.fill()
  // eye
  ctx.fillStyle = "#1c1a14"
  ctx.beginPath()
  ctx.arc(-5.6, -4.2, 0.55, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function SlitherCanvas() {
  const c = useChart()
  const canvasRef = useSnakeCanvas(c.width, c.height, c.frozen, (ctx, t) => {
    ctx.translate(c.margins.left, c.margins.top)
    const { data, series, xAt, y, innerH, hoverIndex } = c

    // Crosshair first, so the snakes slither over the mouse.
    if (hoverIndex != null) {
      const hx = xAt(hoverIndex)
      ctx.strokeStyle = "rgba(210, 220, 195, 0.22)"
      ctx.setLineDash([3, 5])
      ctx.beginPath()
      ctx.moveTo(hx, 0)
      ctx.lineTo(hx, innerH)
      ctx.stroke()
      ctx.setLineDash([])
      drawMouse(ctx, hx, innerH, t)
    }

    series.forEach((s, si) => {
      const path: Pt[] = []
      data.forEach((row, i) => {
        const v = row[s.dataKey]
        if (typeof v === "number" && !Number.isNaN(v))
          path.push({ x: xAt(i), y: y(v) })
      })
      if (path.length < 2) return
      const width = clamp(c.innerH * 0.055, 6, 12)
      const reveal = easeOutCubic(clamp((t - 0.15 - si * 0.4) / 2.1, 0, 1))
      if (reveal <= 0) return
      const wig = (s.wiggle ?? 1) * c.wiggle
      const skin = skinOf(s.species)
      const hovered = c.hoveredKey === s.dataKey ? 1 : 0
      const dimmed = c.hoveredKey && c.hoveredKey !== s.dataKey ? 1 : 0

      // The pit: understudy snakes stacked between the line and the ground.
      // Together they read as the fill of an area chart.
      if (s.variant === "pit") {
        const layers = clamp(Math.round(c.innerH / (width * 3.2)), 3, 7)
        for (let k = layers; k >= 1; k--) {
          const f = k / (layers + 1)
          const layerPath = path.map((p) => ({
            x: p.x,
            y: p.y + (innerH - p.y) * f,
          }))
          drawSnake(ctx, layerPath, {
            skin,
            width: width * 0.85,
            time: t,
            seed: si * 0.37 + k * 0.83,
            reveal: easeOutCubic(
              clamp((t - 0.15 - si * 0.4 - k * 0.12) / 2.1, 0, 1)
            ),
            hover: 0,
            dim: Math.max(Number(dimmed), 0.3 + f * 0.45),
            wiggleAmp: clamp(width * 0.6, 2, 6) * wig,
            headScale: 0.8,
            frozen: c.frozen,
          })
        }
      }

      drawSnake(ctx, path, {
        skin,
        width,
        time: t,
        seed: si * 0.37 + 0.21,
        reveal,
        hover: hovered,
        dim: dimmed ? 1 : 0,
        wiggleAmp: clamp(width * 0.75, 2, 7) * wig,
        frozen: c.frozen,
      })
    })

    // Value markers on top so the reading stays honest mid-slither.
    if (hoverIndex != null) {
      const hx = xAt(hoverIndex)
      for (const s of series) {
        const v = data[hoverIndex]?.[s.dataKey]
        if (typeof v !== "number" || Number.isNaN(v)) continue
        ctx.beginPath()
        ctx.arc(hx, y(v), 3.2, 0, Math.PI * 2)
        ctx.fillStyle = skinOf(s.species).belly
        ctx.fill()
        ctx.strokeStyle = "rgba(0,0,0,0.55)"
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
  })

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: c.width,
        height: c.height,
      }}
      aria-hidden
    />
  )
}

/** Line chart, if the line were alive and mildly venomous. */
export function SlitherChart(props: CartesianProps) {
  return <CartesianRoot kind="slither" Canvas={SlitherCanvas} {...props} />
}
