import { createContext, useContext } from "react"
import type { Species } from "./species"
import type { BandScale, LinearScale } from "./scales"

export type Row = Record<string, unknown>

export type SeriesConfig = { label: string; species: Species }
export type ChartConfig = Record<string, SeriesConfig>

export type SeriesDef = {
  dataKey: string
  species: Species
  /** Extra slither, if the data is boring. 0..1 */
  wiggle?: number
  /** Cobra hood flare override. 0..1 */
  hood?: number
}

export type Margins = { top: number; right: number; bottom: number; left: number }

export type ChartCtx = {
  kind: "slither" | "cobra"
  data: Row[]
  config: ChartConfig
  series: SeriesDef[]
  xKey: string | null
  width: number
  height: number
  margins: Margins
  innerW: number
  innerH: number
  /** Center x (within the inner plot) for row i. */
  xAt: (i: number) => number
  band: BandScale | null
  y: LinearScale
  hoverIndex: number | null
  setHoverIndex: (i: number | null) => void
  hoveredKey: string | null
  setHoveredKey: (k: string | null) => void
  cursorX: number
  /** Chart-wide slither multiplier (1 = honest, 2 = unhinged). */
  wiggle: number
  frozen: boolean
}

export const ChartContext = createContext<ChartCtx | null>(null)

export function useChart(): ChartCtx {
  const ctx = useContext(ChartContext)
  if (!ctx)
    throw new Error(
      "slither-charts: this component must live inside a chart. Snakes escape otherwise."
    )
  return ctx
}

// ---- polar (ouroboros) ----

export type Slice = {
  name: string
  value: number
  frac: number
  a0: number
  a1: number
  species: Species
  label: string
}

export type PolarCtx = {
  slices: Slice[]
  total: number
  cx: number
  cy: number
  r: number
  thickness: number
  width: number
  height: number
  hoverSlice: number | null
  setHoverSlice: (i: number | null) => void
  hoveredKey: string | null
  setHoveredKey: (k: string | null) => void
  cursor: { x: number; y: number }
  frozen: boolean
}

export const PolarContext = createContext<PolarCtx | null>(null)

export function usePolar(): PolarCtx {
  const ctx = useContext(PolarContext)
  if (!ctx)
    throw new Error(
      "slither-charts: this component must live inside an <OuroborosChart>."
    )
  return ctx
}
