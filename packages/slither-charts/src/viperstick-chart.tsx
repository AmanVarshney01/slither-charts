import {
  Children,
  isValidElement,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react"
import {
  ChartContext,
  type ChartCtx,
  type Margins,
  type Row,
} from "./chart-context"
import { bandScale, linearScale } from "./scales"
import { clamp, drawSnake, easeOutCubic, smoothstep, type Pt } from "./snake-paint"
import { skinOf, type Species } from "./species"
import { useDimensions, useReducedMotion, useSnakeCanvas } from "./use-chart"

const BASE_MARGINS: Margins = { top: 30, right: 20, bottom: 24, left: 44 }

export type ViperstickChartProps = {
  /** Rows with open/high/low/close numbers. */
  data: Row[]
  /** Category field for the x axis (dates, usually). */
  xKey?: string
  openKey?: string
  highKey?: string
  lowKey?: string
  closeKey?: string
  /** Numeric field → a lane of small volume snakes under the candles. */
  volumeKey?: string
  /** Overlay a moving-average snake weaving through the candles.
   * The trend is a snake. Follow the snake. */
  trend?: { period?: number; species?: Species }
  /** Dashed line + tag at the latest close. On by default. */
  lastPriceLine?: boolean
  /** Marks the newest candle as actively trading: its snake is agitated,
   * tongue-flicks constantly, has not slept since listing. */
  live?: boolean
  /** Snake for candles that close up. Looks up. */
  upSpecies?: Species
  /** Snake for candles that close down. Looks down. Has regrets. */
  downSpecies?: Species
  className?: string
  children?: ReactNode
}

/** Candlestick chart for the finance reptiles. Each candle is one snake:
 * thin tail = one wick, thin neck = the other, and the fat mid-body spans
 * open→close. Green snakes face up, red snakes face down. Not financial
 * advice; the snakes are not licensed. */
export function ViperstickChart({
  data,
  xKey = "date",
  openKey = "open",
  highKey = "high",
  lowKey = "low",
  closeKey = "close",
  volumeKey,
  trend,
  lastPriceLine = true,
  live = false,
  upSpecies = "garter",
  downSpecies = "coral",
  className,
  children,
}: ViperstickChartProps) {
  const { ref, size } = useDimensions<HTMLDivElement>()
  const frozen = useReducedMotion()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [cursorX, setCursorX] = useState(0)

  const margins = lastPriceLine
    ? { ...BASE_MARGINS, right: 52 }
    : BASE_MARGINS

  const back: ReactNode[] = []
  const svg: ReactNode[] = []
  const dom: ReactNode[] = []
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    const layer = (child.type as ComponentType & { layer?: string }).layer
    if (layer === "back") back.push(child)
    else if (layer === "dom") dom.push(child)
    else if (layer === "svg") svg.push(child)
  })

  const innerH = Math.max(0, size.height - margins.top - margins.bottom)
  // Volume gets the basement floor of the terrarium.
  const laneH = volumeKey ? Math.max(24, Math.round(innerH * 0.18)) : 0
  const priceBottom = innerH - laneH - (laneH ? 10 : 0)

  const ctx: ChartCtx = useMemo(() => {
    const innerW = Math.max(0, size.width - margins.left - margins.right)
    let lo = Infinity
    let hi = -Infinity
    for (const row of data) {
      const l = row[lowKey]
      const h = row[highKey]
      if (typeof l === "number" && l < lo) lo = l
      if (typeof h === "number" && h > hi) hi = h
    }
    if (!Number.isFinite(lo)) {
      lo = 0
      hi = 1
    }
    const pad = (hi - lo || 1) * 0.08
    const band = bandScale(data.length, [0, innerW], 0.3, 0.3)
    return {
      kind: "cobra",
      data,
      config: {},
      series: [],
      xKey,
      width: size.width,
      height: size.height,
      margins,
      innerW,
      innerH,
      xAt: band.center,
      band,
      y: linearScale([lo - pad, hi + pad], [priceBottom, 0], 4),
      hoverIndex,
      setHoverIndex,
      hoveredKey: null,
      setHoveredKey: () => {},
      cursorX,
      wiggle: 1,
      frozen,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    xKey,
    lowKey,
    highKey,
    size.width,
    size.height,
    innerH,
    priceBottom,
    JSON.stringify(margins),
    hoverIndex,
    cursorX,
    frozen,
  ])

  const canvasRef = useSnakeCanvas(size.width, size.height, frozen, (cv, t) => {
    cv.translate(margins.left, margins.top)
    const { band, y, innerW } = ctx
    if (!band) return

    if (hoverIndex != null) {
      cv.fillStyle = "rgba(220, 230, 205, 0.055)"
      cv.fillRect(band.center(hoverIndex) - band.step / 2, 0, band.step, innerH)
    }

    // ── volume lane: a row of juveniles, one per candle ──
    if (volumeKey && laneH > 0) {
      let maxV = 0
      for (const row of data) {
        const v = row[volumeKey]
        if (typeof v === "number" && v > maxV) maxV = v
      }
      if (maxV > 0) {
        data.forEach((row, i) => {
          const v = row[volumeKey]
          const o = row[openKey]
          const c = row[closeKey]
          if (typeof v !== "number" || typeof o !== "number" || typeof c !== "number")
            return
          const h = Math.max(5, (v / maxV) * (laneH - 4))
          const xc = band.center(i)
          const reveal = easeOutCubic(clamp((t - 0.2 - i * 0.04) / 1, 0, 1))
          if (reveal <= 0) return
          drawSnake(cv, [
            { x: xc, y: innerH },
            { x: xc, y: innerH - h },
          ], {
            skin: skinOf(c >= o ? upSpecies : downSpecies),
            width: clamp(band.bandwidth * 0.28, 3.5, 8),
            time: t,
            seed: i * 0.37 + 5,
            reveal,
            dim: 0.45,
            wiggleAmp: 1.2,
            headScale: 0.6,
            frozen,
          })
        })
      }
    }

    // ── the candles ──
    data.forEach((row, i) => {
      const o = row[openKey]
      const h = row[highKey]
      const l = row[lowKey]
      const c = row[closeKey]
      if (
        typeof o !== "number" ||
        typeof h !== "number" ||
        typeof l !== "number" ||
        typeof c !== "number"
      )
        return
      const up = c >= o
      const xc = band.center(i)
      const yTop = y(h)
      const yBot = y(l)
      const len = Math.max(8, yBot - yTop)
      // Bulls slither upward (head at the high); bears hang their heads.
      const path: Pt[] = up
        ? [
            { x: xc, y: yBot },
            { x: xc, y: yTop },
          ]
        : [
            { x: xc, y: yTop },
            { x: xc, y: yBot },
          ]
      // Open/close as fractions of the tail→head run.
      const frac = (yy: number) => clamp((up ? yBot - yy : yy - yTop) / len, 0, 1)
      const b0 = Math.min(frac(y(o)), frac(y(c)))
      const b1 = Math.max(frac(y(o)), frac(y(c)))
      const soft = Math.min(0.1, Math.max(0.02, 6 / len))
      const width = clamp(band.bandwidth * 0.52, 6, 14)
      const reveal = easeOutCubic(clamp((t - 0.1 - i * 0.06) / 1.1, 0, 1))
      if (reveal <= 0) return
      const trading = live && i === data.length - 1
      drawSnake(cv, path, {
        skin: skinOf(up ? upSpecies : downSpecies),
        width,
        time: t,
        seed: i * 0.53,
        reveal,
        hover: hoverIndex === i || trading ? 1 : 0,
        wiggleAmp: trading ? 2.6 : 1.6,
        wiggleLen: Math.max(40, len * 0.6),
        headScale: 0.72,
        widthProfile: (u) =>
          0.26 +
          0.74 *
            (smoothstep(b0 - soft, b0 + soft, u) -
              smoothstep(b1 - soft, b1 + soft, u)) *
            // Ease off right at the head so the neck still reads.
            (1 - 0.35 * smoothstep(0.9, 1, u)),
        frozen,
      })
    })

    // ── the trend snake: long, thin, always right in hindsight ──
    if (trend && data.length > 2) {
      const period = Math.max(2, trend.period ?? 3)
      const closes = data.map((row) => row[closeKey])
      const path: Pt[] = []
      closes.forEach((c, i) => {
        if (typeof c !== "number") return
        let sum = 0
        let count = 0
        for (let k = Math.max(0, i - period + 1); k <= i; k++) {
          const v = closes[k]
          if (typeof v === "number") {
            sum += v
            count++
          }
        }
        if (count > 0) path.push({ x: band.center(i), y: y(sum / count) })
      })
      if (path.length > 1) {
        drawSnake(cv, path, {
          skin: skinOf(trend.species ?? "krait"),
          width: 4.5,
          time: t,
          seed: 9.7,
          reveal: easeOutCubic(clamp((t - 0.7) / 1.8, 0, 1)),
          wiggleAmp: 1.8,
          headScale: 0.85,
          frozen,
        })
      }
    }

    // ── last price: the number every reptile is watching ──
    const lastRow = data[data.length - 1]
    const lastClose = lastRow?.[closeKey]
    const lastOpen = lastRow?.[openKey]
    if (lastPriceLine && typeof lastClose === "number") {
      const up = typeof lastOpen === "number" ? lastClose >= lastOpen : true
      const skin = skinOf(up ? upSpecies : downSpecies)
      const ly = y(lastClose)
      cv.strokeStyle = skin.skin
      cv.globalAlpha = 0.55
      cv.setLineDash([4, 5])
      cv.beginPath()
      cv.moveTo(0, ly)
      cv.lineTo(innerW, ly)
      cv.stroke()
      cv.setLineDash([])
      cv.globalAlpha = 1
      const label =
        Math.abs(lastClose) >= 100 ? lastClose.toFixed(0) : lastClose.toFixed(1)
      cv.font = "600 10px ui-monospace, Menlo, monospace"
      const tw = cv.measureText(label).width + 10
      cv.fillStyle = skin.skin
      cv.beginPath()
      cv.roundRect(innerW + 3, ly - 8, tw, 16, 3)
      cv.fill()
      cv.fillStyle = "#10150f"
      cv.fillText(label, innerW + 8, ly + 3.5)
    }
  })

  const onMove = (clientX: number) => {
    const el = ref.current
    if (!el || data.length === 0) return
    const rect = el.getBoundingClientRect()
    const px = clientX - rect.left
    let best = 0
    let bestD = Infinity
    for (let i = 0; i < data.length; i++) {
      const d = Math.abs(margins.left + ctx.xAt(i) - px)
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    setCursorX(px)
    setHoverIndex(best)
  }

  const ready = size.width > 0 && size.height > 0
  const hovered = hoverIndex != null ? data[hoverIndex] : null

  return (
    <ChartContext.Provider value={ctx}>
      <div
        ref={ref}
        className={className}
        style={{ position: "relative", width: "100%", height: "100%" }}
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerLeave={() => setHoverIndex(null)}
        role="img"
        aria-label={`Candlestick chart with ${data.length} snakes`}
      >
        {ready && back.length > 0 && (
          <svg
            width={size.width}
            height={size.height}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
            aria-hidden
          >
            <g transform={`translate(${margins.left},${margins.top})`}>{back}</g>
          </svg>
        )}
        {ready && <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: size.width, height: size.height }} aria-hidden />}
        {ready && svg.length > 0 && (
          <svg
            width={size.width}
            height={size.height}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
            aria-hidden
          >
            <g transform={`translate(${margins.left},${margins.top})`}>{svg}</g>
          </svg>
        )}
        {ready && dom}
        {hovered && (
          <div
            style={{
              position: "absolute",
              left: clamp(cursorX + 14, 4, Math.max(4, size.width - 190)),
              top: 8,
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
            <div style={{ opacity: 0.65, marginBottom: 2 }}>
              {String(hovered[xKey])}
            </div>
            <div>
              O <b>{String(hovered[openKey])}</b> H <b>{String(hovered[highKey])}</b>{" "}
              L <b>{String(hovered[lowKey])}</b> C <b>{String(hovered[closeKey])}</b>
              {volumeKey && (
                <>
                  {" "}
                  V <b>{String(hovered[volumeKey])}</b>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </ChartContext.Provider>
  )
}
