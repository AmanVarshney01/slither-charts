import { useChart } from "./chart-context"
import { CartesianRoot, type CartesianProps } from "./cartesian-root"
import { clamp, drawSnake, easeOutCubic, type Pt } from "./snake-paint"
import { skinOf, type Species } from "./species"
import { useSnakeCanvas } from "./use-chart"

/** One bar series = a lineup of cobras rearing out of the axis. The head
 * marks the value; the hood is for drama. */
export function Cobra(_props: {
  dataKey: string
  species?: Species
  /** 0..1 hood flare. Defaults to full theatrical. */
  hood?: number
}) {
  return null
}
Cobra.layer = "series" as const

function CobraCanvas() {
  const c = useChart()
  const canvasRef = useSnakeCanvas(c.width, c.height, c.frozen, (ctx, t) => {
    ctx.translate(c.margins.left, c.margins.top)
    const { data, series, band, y, innerH, hoverIndex } = c
    if (!band) return

    if (hoverIndex != null) {
      ctx.fillStyle = "rgba(220, 230, 205, 0.055)"
      ctx.fillRect(band.center(hoverIndex) - band.step / 2, 0, band.step, innerH)
    }

    const nS = Math.max(1, series.length)
    const slot = band.bandwidth / nS

    series.forEach((s, j) => {
      const skin = skinOf(s.species)
      const width = clamp(slot * 0.55, 6, 18)
      const headLen = Math.max(7, width * 1.9 * 0.85)

      data.forEach((row, i) => {
        const v = row[s.dataKey]
        if (typeof v !== "number" || Number.isNaN(v)) return
        const xc = band.center(i) - band.bandwidth / 2 + slot * (j + 0.5)
        // The head extends past the spine; stop the spine short so the
        // snout, not the neck, touches the value.
        const yTop = Math.min(innerH - headLen * 0.9, y(v) + headLen * 0.55)
        const spine: Pt[] = [
          { x: xc, y: innerH + 1 },
          { x: xc, y: yTop },
        ]
        const reveal = easeOutCubic(
          clamp((t - 0.1 - i * 0.07 - j * 0.22) / 1.15, 0, 1)
        )
        if (reveal <= 0) return
        drawSnake(ctx, spine, {
          skin,
          width,
          time: t,
          seed: i * 0.61 + j * 0.29,
          reveal,
          hover: hoverIndex === i ? 1 : 0,
          dim: c.hoveredKey && c.hoveredKey !== s.dataKey ? 1 : 0,
          wiggleAmp: clamp(slot * 0.12, 1.5, 4) * c.wiggle,
          wiggleLen: 50 + width * 2.5,
          hood: s.hood ?? 0.6,
          headScale: 0.85,
          frozen: c.frozen,
        })
      })
    })
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

/** Bar chart where every bar is a cobra standing at attention. Do not tap
 * the glass. */
export function CobraChart(props: CartesianProps) {
  return <CartesianRoot kind="cobra" Canvas={CobraCanvas} {...props} />
}
