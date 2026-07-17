import type { ReactNode } from "react"
import { arcPath, clamp, drawSnake, easeOutCubic } from "./snake-paint"
import { skinOf, type Species } from "./species"
import { useDimensions, useReducedMotion, useSnakeCanvas } from "./use-chart"

const DEG = Math.PI / 180

export type BoaMeterProps = {
  /** 0..1. At ≥ 1 the snake finally catches its own tail. */
  value: number
  species?: Species
  /** Ring thickness as a fraction of the radius. */
  thickness?: number
  className?: string
  /** Rendered dead-center — put your number here. */
  children?: ReactNode
}

/** Gauge chart: a progress snake chasing its own tail around a track.
 * At 100% it catches it and becomes an ouroboros. This is called shipping. */
export function BoaMeter({
  value,
  species = "boa",
  thickness = 0.24,
  className,
  children,
}: BoaMeterProps) {
  const { ref, size } = useDimensions<HTMLDivElement>()
  const frozen = useReducedMotion()

  const v = clamp(value, 0, 1)
  const done = v >= 0.995
  // Speedometer arc: opens at the bottom, 240° of track — unless the snake
  // has earned the full circle.
  const sweep = done ? 360 : 240
  const a0 = done ? -90 : 150

  const canvasRef = useSnakeCanvas(size.width, size.height, frozen, (ctx, t) => {
    const w = size.width
    const h = size.height
    const r = Math.max(12, Math.min(w, h) / 2 - 16)
    const cx = w / 2
    const cy = h / 2
    const bodyW = clamp(r * thickness, 6, 20)

    // The track: where the snake has yet to be.
    ctx.beginPath()
    ctx.arc(cx, cy, r, a0 * DEG, (a0 + sweep) * DEG)
    ctx.strokeStyle = "rgba(150, 160, 140, 0.16)"
    ctx.lineWidth = Math.max(2, bodyW * 0.28)
    ctx.setLineDash([2, 6])
    ctx.stroke()
    ctx.setLineDash([])

    const entrance = easeOutCubic(clamp((t - 0.1) / 1.5, 0, 1))
    const reveal = entrance * v
    if (reveal <= 0.01) return
    const path = arcPath(cx, cy, r, a0 * DEG, (a0 + sweep) * DEG)
    drawSnake(ctx, path, {
      skin: skinOf(species),
      width: bodyW,
      time: t,
      seed: 0.31,
      reveal,
      // Caught its tail: the celebratory wave is earned.
      hover: done ? 0.4 : 0,
      noWave: true,
      frozen,
    })
  })

  const ready = size.width > 0 && size.height > 0

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%" }}
      role="img"
      aria-label={`Gauge at ${Math.round(v * 100)}%${done ? ", ouroboros achieved" : ""}`}
    >
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
      {children && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
