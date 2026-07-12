# 🐍 slither-charts

Composable charts for React where **every mark is a live snake.**

An unhinged homage to [dither-kit](https://www.tripwire.sh/dither-kit) — same
children-as-config API, same tiny-canvas-engine energy, considerably more
fangs. Line series slither along your data and rest their heads on the latest
value. Bars are cobras rearing to the exact height of your KPI. The pie chart
is an ouroboros: a ring of snakes, each politely biting the next one's tail.
Sparklines are worms. They blink. They flick their tongues at your numbers.

## The enclosure

| chart | component | what you get |
| --- | --- | --- |
| line | `<SlitherChart>` + `<Snake>` | snakes slithering along the data path |
| bar | `<CobraChart>` + `<Cobra>` | a lineup of cobras, hoods flared |
| pie | `<OuroborosChart>` + `<Ouroboros>` | the circle that eats itself |
| sparkline | `<Worm>` | legally a snake, spiritually a worm |

Plus the chrome: `<XAxis>` `<YAxis>` `<Grid>` `<Legend>` and `<HissTip>` —
the tooltip. It hisses. The crosshair marker is a small mouse. The snakes
never quite catch it.

## Adopting a snake

From npm (the whole reptile house, bundled):

```bash
bun add slither-charts     # or npm/pnpm — the snakes don't judge
```

Or shadcn-style — copy the sources into your project straight from this
repo, dither-kit style. Each chart pulls the shared `core` engine (the snake
painter) automatically:

```bash
npx shadcn@latest add AmanVarshney01/slither-charts/slither-chart     # line
npx shadcn@latest add AmanVarshney01/slither-charts/cobra-chart      # bar
npx shadcn@latest add AmanVarshney01/slither-charts/ouroboros-chart  # pie
npx shadcn@latest add AmanVarshney01/slither-charts/worm             # sparkline
npx shadcn@latest add AmanVarshney01/slither-charts/slither-charts   # all of it
```

Files land in `components/slither-charts/` with zero npm dependencies.
There is also a host-agnostic namespace registry in `r/` (content inlined)
for anyone serving `@slither-charts` — rebuild both with
`bun run registry:build`.

## Usage

```tsx
import {
  SlitherChart, Snake, XAxis, YAxis, Grid, Legend, HissTip,
} from "slither-charts"

// species = color + skin pattern + personality
const config = {
  mice: { label: "Mice", species: "coral" },
  rats: { label: "Rats", species: "viper" },
}

<SlitherChart data={data} config={config}>
  <Grid />
  <XAxis dataKey="month" />
  <YAxis />
  <Legend />
  <HissTip />
  <Snake dataKey="mice" />
  <Snake dataKey="rats" wiggle={1.6} />
</SlitherChart>
```

Series colors are **species** — `python`, `coral`, `mamba`, `garter`,
`viper`, `boa`, `grass` — and each ships a full skin: scale color, belly
sheen, and a marking pattern (diamonds, bands, dorsal stripe, zigzag), so two
series stay readable even if you can't tell gold from green in the dark.

Props worth knowing:

- `species` — picks the skin (see the species index on the demo site)
- `wiggle` — slither amplitude multiplier; `1` is honest, `2` is unhinged
- `hood` — cobra hood flare, `0..1`, defaults to theatrical
- Everything respects `prefers-reduced-motion` (the snakes hold a pose)

## Run the reptile house

```bash
bun install
bun dev        # demo site on http://localhost:3001
```

- `apps/web` — the demo site (a natural history museum, after closing time)
- `packages/slither-charts` — the `slither-charts` npm package itself
  (React + one canvas per chart, zero chart dependencies, zero legs)

## Lineage

[Evil Charts](https://evilcharts.com) begat
[dither-kit](https://github.com/Boring-Software-Inc/dither-kit) begat this.
The lineage is getting weirder and we apologize to no one.

Red touches yellow, kills a fellow. Red touches black, safe for your stack.
