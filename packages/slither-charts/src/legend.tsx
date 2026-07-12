import { useContext } from "react"
import { ChartContext, PolarContext } from "./chart-context"
import { skinOf, type Species } from "./species"

/** Tiny slithering swatch — a legend chip you can trust. */
export function Squiggle({ species, size = 22 }: { species: Species; size?: number }) {
  const skin = skinOf(species)
  const h = size * 0.55
  return (
    <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`} aria-hidden>
      <path
        d={`M1 ${h / 2} q ${size * 0.18} ${-h * 0.7}, ${size * 0.36} 0 t ${size * 0.36} 0`}
        fill="none"
        stroke={skin.skin}
        strokeWidth={h * 0.34}
        strokeLinecap="round"
      />
      <circle cx={size - 2.5} cy={h / 2} r={h * 0.24} fill={skin.skin} />
      <circle cx={size - 1.8} cy={h / 2 - h * 0.09} r={h * 0.07} fill={skin.pupil} />
    </svg>
  )
}

type Entry = { key: string; label: string; species: Species }

/** Hover a chip and the other snakes politely fade. The chip's tooltip
 * (title) is the species' latin name, because this is a serious library. */
export function Legend({ align = "right" }: { align?: "left" | "center" | "right" }) {
  const cart = useContext(ChartContext)
  const polar = useContext(PolarContext)

  let entries: Entry[] = []
  let hoveredKey: string | null = null
  let setHoveredKey: (k: string | null) => void = () => {}

  if (cart) {
    entries = cart.series.map((s) => ({
      key: s.dataKey,
      label: cart.config[s.dataKey]?.label ?? s.dataKey,
      species: s.species,
    }))
    hoveredKey = cart.hoveredKey
    setHoveredKey = cart.setHoveredKey
  } else if (polar) {
    entries = polar.slices.map((s) => ({
      key: s.name,
      label: s.label,
      species: s.species,
    }))
    hoveredKey = polar.hoveredKey
    setHoveredKey = polar.setHoveredKey
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 2,
        left: 0,
        right: 6,
        display: "flex",
        flexWrap: "wrap",
        gap: "4px 14px",
        justifyContent:
          align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end",
        pointerEvents: "auto",
        fontFamily: "var(--sc-mono, ui-monospace, monospace)",
        fontSize: 11,
        color: "var(--sc-legend, #c9d2c0)",
      }}
    >
      {entries.map((e) => (
        <button
          key={e.key}
          type="button"
          title={skinOf(e.species).latin}
          onPointerEnter={() => setHoveredKey(e.key)}
          onPointerLeave={() => setHoveredKey(null)}
          onFocus={() => setHoveredKey(e.key)}
          onBlur={() => setHoveredKey(null)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            padding: 0,
            cursor: "default",
            color: "inherit",
            font: "inherit",
            opacity: hoveredKey && hoveredKey !== e.key ? 0.45 : 1,
            transition: "opacity 160ms",
          }}
        >
          <Squiggle species={e.species} />
          {e.label}
        </button>
      ))}
    </div>
  )
}
Legend.layer = "dom" as const
