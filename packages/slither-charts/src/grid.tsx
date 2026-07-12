import { useChart } from "./chart-context"

/** Horizontal guide lines. Subtle — snakes hate bright light. */
export function Grid({ vertical = false }: { vertical?: boolean }) {
  const { y, innerW, innerH, data, xAt } = useChart()
  return (
    <g>
      {y.ticks.map((t) => (
        <line
          key={t}
          x1={0}
          x2={innerW}
          y1={y(t)}
          y2={y(t)}
          style={{ stroke: "var(--sc-grid, rgba(190, 205, 180, 0.13))" }}
          strokeDasharray="3 5"
        />
      ))}
      {vertical &&
        data.map((_, i) => (
          <line
            key={i}
            x1={xAt(i)}
            x2={xAt(i)}
            y1={0}
            y2={innerH}
            style={{ stroke: "var(--sc-grid, rgba(190, 205, 180, 0.13))" }}
            strokeDasharray="3 5"
          />
        ))}
    </g>
  )
}
Grid.layer = "back" as const
