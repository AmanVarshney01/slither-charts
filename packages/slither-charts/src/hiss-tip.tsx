import { useContext } from "react"
import { ChartContext, PolarContext } from "./chart-context"
import { skinOf } from "./species"
import { Squiggle } from "./legend"

const panel: React.CSSProperties = {
  position: "absolute",
  pointerEvents: "none",
  background: "var(--sc-tip-bg, rgba(16, 22, 15, 0.94))",
  border: "1px solid var(--sc-tip-border, rgba(190, 205, 180, 0.25))",
  borderRadius: 6,
  padding: "7px 10px",
  fontFamily: "var(--sc-mono, ui-monospace, monospace)",
  fontSize: 11,
  color: "var(--sc-tip-fg, #e8e4d0)",
  boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
  whiteSpace: "nowrap",
  zIndex: 3,
}

/** The tooltip. It hisses the values at you as you scrub. */
export function HissTip() {
  const cart = useContext(ChartContext)
  const polar = useContext(PolarContext)

  if (cart) {
    const { hoverIndex, data, series, config, xKey, cursorX, width } = cart
    if (hoverIndex == null || !data[hoverIndex]) return null
    const row = data[hoverIndex]
    const left = Math.min(Math.max(cursorX + 14, 4), Math.max(4, width - 210))
    return (
      <div style={{ ...panel, left, top: 30 }}>
        <div style={{ opacity: 0.65, marginBottom: 5 }}>
          {xKey ? String(row[xKey]) : `#${hoverIndex}`}{" "}
          <span style={{ opacity: 0.7, fontStyle: "italic" }}>sss…</span>
        </div>
        {series.map((s) => (
          <div
            key={s.dataKey}
            style={{ display: "flex", alignItems: "center", gap: 7, lineHeight: 1.7 }}
          >
            <Squiggle species={s.species} size={18} />
            <span style={{ opacity: 0.8 }}>
              {config[s.dataKey]?.label ?? s.dataKey}
            </span>
            <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 600 }}>
              {String(row[s.dataKey] ?? "–")}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (polar) {
    const { hoverSlice, slices, cursor, width } = polar
    if (hoverSlice == null || !slices[hoverSlice]) return null
    const s = slices[hoverSlice]
    const left = Math.min(Math.max(cursor.x + 14, 4), Math.max(4, width - 230))
    return (
      <div style={{ ...panel, left, top: Math.max(4, cursor.y - 44) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Squiggle species={s.species} size={18} />
          <span style={{ opacity: 0.8 }}>{s.label}</span>
          <span style={{ marginLeft: "auto", paddingLeft: 12, fontWeight: 600 }}>
            {s.value} · {(s.frac * 100).toFixed(0)}%
          </span>
        </div>
        <div style={{ opacity: 0.55, marginTop: 4, fontStyle: "italic" }}>
          {skinOf(s.species).latin}
        </div>
      </div>
    )
  }

  return null
}
HissTip.layer = "dom" as const
