import {
  CobraChart,
  Cobra,
  Grid,
  HissTip,
  Legend,
  OuroborosChart,
  Ouroboros,
  SlitherChart,
  Snake,
  SPECIES,
  Squiggle,
  Worm,
  XAxis,
  YAxis,
  type Species,
} from "slither-charts";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: ReptileHouse,
});

/* ── captive data ─────────────────────────────────────────────────────── */

const caseWars = [
  { month: "Jan", snake_case: 14, camelCase: 86 },
  { month: "Feb", snake_case: 19, camelCase: 81 },
  { month: "Mar", snake_case: 27, camelCase: 78 },
  { month: "Apr", snake_case: 25, camelCase: 72 },
  { month: "May", snake_case: 38, camelCase: 69 },
  { month: "Jun", snake_case: 44, camelCase: 61 },
  { month: "Jul", snake_case: 42, camelCase: 57 },
  { month: "Aug", snake_case: 55, camelCase: 50 },
  { month: "Sep", snake_case: 63, camelCase: 44 },
  { month: "Oct", snake_case: 61, camelCase: 39 },
  { month: "Nov", snake_case: 74, camelCase: 33 },
  { month: "Dec", snake_case: 85, camelCase: 28 },
];

const caseConfig = {
  snake_case: { label: "snake_case", species: "garter" },
  camelCase: { label: "camelCase", species: "python" },
} as const;

const quarterly = [
  { quarter: "Q1", shipped: 12, bitten: 3 },
  { quarter: "Q2", shipped: 19, bitten: 7 },
  { quarter: "Q3", shipped: 9, bitten: 14 },
  { quarter: "Q4", shipped: 23, bitten: 6 },
];

const quarterlyConfig = {
  shipped: { label: "Features shipped", species: "viper" },
  bitten: { label: "Devs bitten", species: "coral" },
} as const;

const sprint = [
  { task: "Naming things", hours: 34 },
  { task: "Cache invalidation", hours: 26 },
  { task: "Off-by-one errors", hours: 17 },
  { task: "Standups about standups", hours: 13 },
  { task: "Actual work", hours: 10 },
];

const sprintConfig = {
  "Naming things": { label: "Naming things", species: "python" },
  "Cache invalidation": { label: "Cache invalidation", species: "garter" },
  "Off-by-one errors": { label: "Off-by-one errors", species: "coral" },
  "Standups about standups": { label: "Standups × standups", species: "viper" },
  "Actual work": { label: "Actual work", species: "mamba" },
} as const;

const stars = [3, 5, 4, 9, 14, 12, 22, 31, 28, 44, 61, 84];
const uptime = [99.2, 99.5, 99.4, 99.7, 99.6, 99.8, 99.8, 99.9, 99.98];
const legs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

/* ── page ─────────────────────────────────────────────────────────────── */

function InstallCmd({ cmd, note }: { cmd: string; note: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={copied ? "install copied" : "install"}
      title="Click to copy"
      onClick={() => {
        navigator.clipboard.writeText(cmd).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        });
      }}
    >
      <span className="lure">$</span>
      <span>{cmd}</span>
      <span className="lure">{copied ? "✓ copied" : note}</span>
    </button>
  );
}

function StatTile({
  value,
  label,
  data,
  species,
}: {
  value: string;
  label: string;
  data: number[];
  species: Species;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="terrarium stat-tile"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <div className="wormery">
        <Worm data={data} species={species} hovered={hovered} />
      </div>
    </div>
  );
}

function ReptileHouse() {
  return (
    <main className="shed">
      <header className="hero">
        <p className="eyebrow">
          ord. serpentes · fam. chartidae · <em>reptile house nº 5</em>
        </p>
        <h1 className="wordmark">
          slither-<span className="fang">charts</span>
        </h1>
        <p className="tagline">
          A composable React chart library where every mark is a live snake.
          An unhinged homage to{" "}
          <a href="https://www.tripwire.sh/dither-kit" target="_blank" rel="noreferrer">
            dither-kit
          </a>
          , with the same children-as-config API and considerably more fangs.
        </p>
        <p className="fine-print">
          zero dependencies · zero legs · tongues flick at ~0.45 Hz
        </p>
        <div className="install-rack">
          <InstallCmd cmd="bun add slither-charts" note="npm package" />
          <InstallCmd
            cmd="npx shadcn@latest add AmanVarshney01/slither-charts/slither-charts"
            note="own the sources"
          />
        </div>

        <div className="terrarium">
          <div className="specimen-tag">
            <span>specimen nº 01 — the line chart</span>
            <span className="latin">Serpens linearis</span>
          </div>
          <h3>The great case war</h3>
          <p className="note">
            Share of new variables by naming convention. The garter snake is
            winning, which the garter snake attributes to nominative determinism.
            Scrub to release the mouse.
          </p>
          <div className="pit pit-tall">
            <SlitherChart data={caseWars} config={caseConfig}>
              <Grid />
              <XAxis dataKey="month" />
              <YAxis format={(v) => `${v}%`} />
              <Legend />
              <HissTip />
              <Snake dataKey="snake_case" species="garter" />
              <Snake dataKey="camelCase" species="python" />
            </SlitherChart>
          </div>
        </div>
      </header>

      <hr className="band" />

      <section>
        <div className="section-head">
          <p className="eyebrow">wing b — permanent collection</p>
          <h2>The reptile house</h2>
          <p>
            Four enclosures. Please keep hands away from the tooltips and do
            not tap on the terrarium glass; the cobras are rendering.
          </p>
        </div>

        <div className="gallery">
          <div className="terrarium">
            <div className="specimen-tag">
              <span>specimen nº 02 — the bar chart</span>
              <span className="latin">Naja verticalis</span>
            </div>
            <h3>Quarterly cobra report</h3>
            <p className="note">
              Every bar is a snake rearing to the exact height of your KPI.
              They sway while you read.
            </p>
            <div className="pit">
              <CobraChart data={quarterly} config={quarterlyConfig}>
                <Grid />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Legend />
                <HissTip />
                <Cobra dataKey="shipped" species="viper" />
                <Cobra dataKey="bitten" species="coral" />
              </CobraChart>
            </div>
          </div>

          <div className="terrarium">
            <div className="specimen-tag">
              <span>specimen nº 03 — the pie chart</span>
              <span className="latin">Ouroboros scrummaster</span>
            </div>
            <h3>Where the sprint went</h3>
            <p className="note">
              A ring of snakes, each politely biting the next one's tail. The
              oldest visualization: a cycle that consumes itself.
            </p>
            <div className="pit pit-round">
              <OuroborosChart
                data={sprint}
                config={sprintConfig}
                dataKey="hours"
                nameKey="task"
              >
                <Legend align="center" />
                <HissTip />
                <Ouroboros />
              </OuroborosChart>
            </div>
          </div>
        </div>

        <div className="vivarium">
          <StatTile value="1,204" label="GitHub stars" data={stars} species="grass" />
          <StatTile value="99.98%" label="Terrarium uptime" data={uptime} species="garter" />
          <StatTile value="0" label="Legs shipped to date" data={legs} species="mamba" />
        </div>
      </section>

      <section>
        <div className="section-head">
          <p className="eyebrow">wing c — handler's manual</p>
          <h2>Field guide</h2>
          <p>
            If you have used a composable chart library, you already know how
            to hold this one. Marks are declared as children; each series is a
            snake; the species picks the skin. Each chart also ships solo on
            the shadcn registry — <code>slither-chart</code>,{" "}
            <code>cobra-chart</code>, <code>ouroboros-chart</code>,{" "}
            <code>worm</code> — and pulls the shared snake engine
            automatically.
          </p>
        </div>

        <div className="field-guide">
          <div className="code-plate">
            <pre>{""}<code>
<span className="k">import</span> {"{"} SlitherChart, Snake, XAxis, YAxis,{"\n"}
{"  "}Grid, Legend, HissTip {"}"} <span className="k">from</span> <span className="s">"slither-charts"</span>{"\n"}
{"\n"}
<span className="c">// species = color + skin pattern + personality</span>{"\n"}
<span className="k">const</span> config = {"{"}{"\n"}
{"  "}mice: {"{"} label: <span className="s">"Mice"</span>, species: <span className="s">"coral"</span> {"}"},{"\n"}
{"  "}rats: {"{"} label: <span className="s">"Rats"</span>, species: <span className="s">"viper"</span> {"}"},{"\n"}
{"}"}{"\n"}
{"\n"}
{"<"}<span className="t">SlitherChart</span> data={"{"}data{"}"} config={"{"}config{"}"}{">"}{"\n"}
{"  "}{"<"}<span className="t">Grid</span> /{">"}{"\n"}
{"  "}{"<"}<span className="t">XAxis</span> dataKey=<span className="s">"month"</span> /{">"}{"\n"}
{"  "}{"<"}<span className="t">YAxis</span> /{">"}{"\n"}
{"  "}{"<"}<span className="t">Legend</span> /{">"}{"\n"}
{"  "}{"<"}<span className="t">HissTip</span> /{">"} <span className="c">{"// the tooltip. it hisses."}</span>{"\n"}
{"  "}{"<"}<span className="t">Snake</span> dataKey=<span className="s">"mice"</span> /{">"}{"\n"}
{"  "}{"<"}<span className="t">Snake</span> dataKey=<span className="s">"rats"</span> wiggle={"{"}1.3{"}"} /{">"}{"\n"}
{"<"}/<span className="t">SlitherChart</span>{">"}
</code></pre>
          </div>

          <div className="terrarium">
            <div className="specimen-tag">
              <span>live rendering of the code at left</span>
              <span className="latin">wiggle = 1.3</span>
            </div>
            <div className="pit-side">
              <SlitherChart
                data={[
                  { month: "Mon", mice: 4, rats: 2 },
                  { month: "Tue", mice: 6, rats: 5 },
                  { month: "Wed", mice: 5, rats: 9 },
                  { month: "Thu", mice: 9, rats: 7 },
                  { month: "Fri", mice: 12, rats: 13 },
                  { month: "Sat", mice: 10, rats: 18 },
                  { month: "Sun", mice: 15, rats: 16 },
                ]}
                config={{
                  mice: { label: "Mice", species: "coral" },
                  rats: { label: "Rats", species: "viper" },
                }}
              >
                <Grid />
                <XAxis dataKey="month" />
                <YAxis />
                <Legend />
                <HissTip />
                <Snake dataKey="mice" species="coral" />
                <Snake dataKey="rats" species="viper" wiggle={1.3} />
              </SlitherChart>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <p className="eyebrow">wing d — taxonomy</p>
          <h2>Species index</h2>
          <p>
            Series colors are species. Each ships a full skin — scale color,
            belly sheen, marking pattern — so two series stay readable even if
            you can't tell gold from green in the dark.
          </p>
        </div>

        <div className="species-index">
          {(Object.keys(SPECIES) as Species[]).map((s) => (
            <div className="species-card" key={s}>
              <Squiggle species={s} size={34} />
              <div className="who">
                <b>{s}</b>
                <span>{SPECIES[s].latin}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="burrow">
        <hr className="band" style={{ marginBottom: 26 }} />
        <p>
          red touches yellow, kills a fellow. red touches black, safe for your
          stack.
        </p>
        <p>
          an unhinged homage to{" "}
          <a href="https://www.tripwire.sh/dither-kit" target="_blank" rel="noreferrer">
            dither-kit
          </a>{" "}
          by Boring Software Inc., itself a tribute to{" "}
          <a href="https://evilcharts.com" target="_blank" rel="noreferrer">
            Evil Charts
          </a>
          . the lineage is getting weirder and we apologize to no one.
        </p>
        <p>
          no mice were caught during the making of these animations. they are
          simply too fast.
        </p>
      </footer>
    </main>
  );
}
