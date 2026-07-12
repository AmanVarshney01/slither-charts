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
  type ChartConfig,
  type ChartCtx,
  type Margins,
  type Row,
  type SeriesDef,
} from "./chart-context"
import { bandScale, linearScale, pointScale, seriesExtent } from "./scales"
import { isSpecies, type Species } from "./species"
import { useDimensions, useReducedMotion } from "./use-chart"

// Generous top/right: heads, hoods and mid-flick tongues need somewhere to
// exist beyond the last data point without leaving the canvas.
const DEFAULT_MARGINS: Margins = { top: 30, right: 34, bottom: 24, left: 36 }

// Fallback casting order when a series doesn't pick its own species.
const CAST: Species[] = ["garter", "python", "coral", "viper", "mamba", "boa"]

export type CartesianProps = {
  data: Row[]
  config: ChartConfig
  children?: ReactNode
  margins?: Partial<Margins>
  className?: string
  /** Chart-wide slither multiplier. 1 = honest, 2 = unhinged. */
  wiggle?: number
  onHoverChange?: (index: number | null) => void
}

type Layered = { back: ReactNode[]; svg: ReactNode[]; dom: ReactNode[] }

function partition(children: ReactNode): {
  layers: Layered
  series: SeriesDef[]
  xKey: string | null
} {
  const layers: Layered = { back: [], svg: [], dom: [] }
  const series: SeriesDef[] = []
  let xKey: string | null = null
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    const type = child.type as ComponentType & { layer?: string }
    const props = child.props as Record<string, unknown>
    if (type.layer === "series") {
      series.push({
        dataKey: String(props.dataKey),
        species: isSpecies(props.species)
          ? props.species
          : CAST[series.length % CAST.length],
        wiggle: typeof props.wiggle === "number" ? props.wiggle : undefined,
        hood: typeof props.hood === "number" ? props.hood : undefined,
      })
      return
    }
    if (typeof props.dataKey === "string" && xKey == null && type.layer === "svg")
      xKey = props.dataKey
    if (type.layer === "back") layers.back.push(child)
    else if (type.layer === "dom") layers.dom.push(child)
    else layers.svg.push(child)
  })
  return { layers, series, xKey }
}

/** Shared root for the cartesian snakes (line + bar). Owns measurement,
 * scales, hover scrubbing, and the three render layers: back SVG (grid),
 * the snake canvas, front SVG (axes), then DOM chrome (legend, HissTip). */
export function CartesianRoot({
  kind,
  Canvas,
  data,
  config,
  children,
  margins: marginsProp,
  className,
  wiggle,
  onHoverChange,
}: CartesianProps & { kind: "slither" | "cobra"; Canvas: ComponentType }) {
  const { ref, size } = useDimensions<HTMLDivElement>()
  const frozen = useReducedMotion()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [cursorX, setCursorX] = useState(0)

  const { layers, series, xKey } = partition(children)
  const seriesKey = JSON.stringify(series)

  const ctx: ChartCtx = useMemo(() => {
    const margins = { ...DEFAULT_MARGINS, ...marginsProp }
    const innerW = Math.max(0, size.width - margins.left - margins.right)
    const innerH = Math.max(0, size.height - margins.top - margins.bottom)
    const keys = series.map((s) => s.dataKey)
    const y = linearScale(seriesExtent(data, keys), [innerH, 0], 4)
    const band = kind === "cobra" ? bandScale(data.length, [0, innerW]) : null
    const point = pointScale(data.length, [0, innerW])
    return {
      kind,
      data,
      config,
      series,
      xKey,
      width: size.width,
      height: size.height,
      margins,
      innerW,
      innerH,
      xAt: band ? band.center : point,
      band,
      y,
      hoverIndex,
      setHoverIndex,
      hoveredKey,
      setHoveredKey,
      cursorX,
      wiggle: wiggle ?? 1,
      frozen,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    config,
    seriesKey,
    xKey,
    kind,
    size.width,
    size.height,
    hoverIndex,
    hoveredKey,
    cursorX,
    wiggle,
    frozen,
    JSON.stringify(marginsProp),
  ])

  const onMove = (clientX: number) => {
    const el = ref.current
    if (!el || data.length === 0) return
    const rect = el.getBoundingClientRect()
    const px = clientX - rect.left
    let best = 0
    let bestD = Infinity
    for (let i = 0; i < data.length; i++) {
      const d = Math.abs(ctx.margins.left + ctx.xAt(i) - px)
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    setCursorX(px)
    setHoverIndex(best)
    onHoverChange?.(best)
  }

  const ready = size.width > 0 && size.height > 0

  return (
    <ChartContext.Provider value={ctx}>
      <div
        ref={ref}
        className={className}
        style={{ position: "relative", width: "100%", height: "100%" }}
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerLeave={() => {
          setHoverIndex(null)
          onHoverChange?.(null)
        }}
      >
        {ready && layers.back.length > 0 && (
          <svg
            width={size.width}
            height={size.height}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
            aria-hidden
          >
            <g transform={`translate(${ctx.margins.left},${ctx.margins.top})`}>
              {layers.back}
            </g>
          </svg>
        )}
        {ready && <Canvas />}
        {ready && (
          <svg
            width={size.width}
            height={size.height}
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
            role="img"
            aria-label={`${kind === "cobra" ? "Bar" : "Line"} chart with ${series.length} snake${series.length === 1 ? "" : "s"}`}
          >
            <g transform={`translate(${ctx.margins.left},${ctx.margins.top})`}>
              {layers.svg}
            </g>
          </svg>
        )}
        {ready && layers.dom}
      </div>
    </ChartContext.Provider>
  )
}
