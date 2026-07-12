import { useChart } from "./chart-context"

const label = {
  fill: "var(--sc-axis, #97a68f)",
  fontFamily: "var(--sc-mono, ui-monospace, monospace)",
  fontSize: 10,
  letterSpacing: "0.04em",
} as const

/** Category labels along the ground the snakes slither over.
 * `dataKey` is read by the chart root to label rows + tooltips. */
export function XAxis(_props: { dataKey: string }) {
  const { data, xKey, xAt, innerH, innerW } = useChart()
  const n = data.length
  // Thin labels when the terrarium is narrow.
  const every = Math.max(1, Math.ceil((n * 34) / Math.max(1, innerW)))
  return (
    <g>
      <line
        x1={0}
        x2={innerW}
        y1={innerH + 0.5}
        y2={innerH + 0.5}
        style={{ stroke: "var(--sc-axis-line, rgba(190, 205, 180, 0.3))" }}
      />
      {data.map((row, i) =>
        i % every === 0 ? (
          <text
            key={i}
            x={xAt(i)}
            y={innerH + 16}
            textAnchor="middle"
            style={label}
          >
            {String(xKey ? (row[xKey] ?? i) : i)}
          </text>
        ) : null
      )}
    </g>
  )
}
XAxis.layer = "svg" as const

export function YAxis({ format }: { format?: (v: number) => string }) {
  const { y } = useChart()
  const fmt = format ?? ((v: number) => (Math.abs(v) >= 1000 ? `${v / 1000}k` : `${v}`))
  return (
    <g>
      {y.ticks.map((t) => (
        <text
          key={t}
          x={-9}
          y={y(t) + 3}
          textAnchor="end"
          style={label}
        >
          {fmt(t)}
        </text>
      ))}
    </g>
  )
}
YAxis.layer = "svg" as const
