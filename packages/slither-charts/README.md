# 🐍 slither-charts

Composable charts for React where **every mark is a live snake.**

An unhinged homage to [dither-kit](https://www.tripwire.sh/dither-kit) — same
children-as-config API, considerably more fangs. Line series slither along
your data and rest their heads on the latest value. Bars are cobras rearing
to the exact height of your KPI. The pie chart is an ouroboros: a ring of
snakes, each politely biting the next one's tail. Sparklines are worms. They
blink. They flick their tongues at your numbers.

Zero dependencies. Zero legs.

```bash
bun add slither-charts     # or npm/pnpm — the snakes don't judge
```

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
  <HissTip />  {/* the tooltip. it hisses. */}
  <Snake dataKey="mice" />
  <Snake dataKey="rats" wiggle={1.6} />
</SlitherChart>
```

Also in the enclosure: `<CobraChart>` + `<Cobra>` (bars), `<OuroborosChart>`
+ `<Ouroboros>` (pie), `<Snake variant="pit">` (area — the line stands on a
pit of snakes), `<NestChart>` (scatter — every point is a coiled hatchling),
`<MedusaChart>` (radial bars off one judgmental center), `<BoaMeter>` (a
gauge snake chasing its own tail; at 100% it catches it), `<ViperstickChart>`
(candles — green snakes look up, red snakes look down), and `<Worm>`
(sparkline).

Series colors are **species** — `python`, `coral`, `mamba`, `garter`,
`viper`, `boa`, `grass`, `krait`, `cobra`, `rattler`, `milk`, `anaconda`,
`sidewinder`, `ghost` — each a full skin (scale color, belly sheen, marking
pattern) and some with **traits**: cobras flare hoods, rattlers shake a tail
rattle when hovered, anacondas render 1.7× thick, sidewinders slither double.
`wiggle={1}` is honest, `wiggle={2}` is unhinged. Everything respects
`prefers-reduced-motion` (the snakes hold a pose).

Live terrariums → [slither-charts.amanv.dev](https://slither-charts.amanv.dev)
Sources & the shadcn-style copy-paste registry:
[github.com/AmanVarshney01/slither-charts](https://github.com/AmanVarshney01/slither-charts)
