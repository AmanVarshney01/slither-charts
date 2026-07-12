import { clamp, drawSnake, easeOutCubic, type Pt } from "./snake-paint"
import { skinOf, type Species } from "./species"
import { useDimensions, useReducedMotion, useSnakeCanvas } from "./use-chart"

export type WormProps = {
  /** Just numbers. Worms don't do config objects. */
  data: number[]
  species?: Species
  /** Parent-driven excitement (hover the whole card, the worm notices). */
  hovered?: boolean
  wiggle?: number
  className?: string
}

/** Sparkline. Legally a snake, spiritually a worm. Fits in a stat tile,
 * points at your KPI, occasionally flicks its tongue at it. */
export function Worm({
  data,
  species = "grass",
  hovered = false,
  wiggle = 1,
  className,
}: WormProps) {
  const { ref, size } = useDimensions<HTMLDivElement>()
  const frozen = useReducedMotion()

  const canvasRef = useSnakeCanvas(size.width, size.height, frozen, (ctx, t) => {
    if (data.length < 2) return
    const w = size.width
    const h = size.height
    const padX = Math.max(8, w * 0.04)
    const padY = Math.max(7, h * 0.22)
    let min = Infinity
    let max = -Infinity
    for (const v of data) {
      if (v < min) min = v
      if (v > max) max = v
    }
    if (min === max) {
      min -= 1
      max += 1
    }
    const path: Pt[] = data.map((v, i) => ({
      x: padX + ((w - padX * 2 - 10) * i) / (data.length - 1),
      y: padY + (h - padY * 2) * (1 - (v - min) / (max - min)),
    }))
    const width = clamp(h * 0.17, 3.5, 7)
    drawSnake(ctx, path, {
      skin: skinOf(species),
      width,
      time: t,
      seed: (data[0] ?? 0) * 0.13 + data.length * 0.07,
      reveal: easeOutCubic(clamp(t / 1.4, 0, 1)),
      hover: hovered ? 1 : 0,
      wiggleAmp: clamp(width * 0.7, 1.5, 4) * wiggle,
      wiggleLen: Math.max(30, w / 5),
      headScale: 0.9,
      frozen,
    })
  })

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%" }}
      aria-hidden
    >
      {size.width > 0 && (
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: size.width,
            height: size.height,
          }}
        />
      )}
    </div>
  )
}
