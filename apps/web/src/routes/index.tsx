import {
  BoaMeter,
  CobraChart,
  Cobra,
  Grid,
  HissTip,
  Legend,
  MedusaChart,
  NestChart,
  OuroborosChart,
  Ouroboros,
  SlitherChart,
  Snake,
  SPECIES,
  Squiggle,
  ViperstickChart,
  Worm,
  XAxis,
  YAxis,
  type Species,
} from "slither-charts";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

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
  shipped: { label: "Features shipped", species: "cobra" },
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

const debt = [
  { sprint: "S1", regret: 3 },
  { sprint: "S2", regret: 5 },
  { sprint: "S3", regret: 9 },
  { sprint: "S4", regret: 8 },
  { sprint: "S5", regret: 14 },
  { sprint: "S6", regret: 19 },
  { sprint: "S7", regret: 17 },
  { sprint: "S8", regret: 26 },
  { sprint: "S9", regret: 34 },
  { sprint: "S10", regret: 45 },
];

const debtConfig = {
  regret: { label: "Story points of regret", species: "boa" },
} as const;

const nest = [
  { team: "interns", coffee: 1, bugs: 2, commits: 4 },
  { team: "interns", coffee: 2, bugs: 5, commits: 9 },
  { team: "interns", coffee: 3, bugs: 4, commits: 7 },
  { team: "interns", coffee: 4, bugs: 9, commits: 16 },
  { team: "interns", coffee: 5, bugs: 7, commits: 11 },
  { team: "interns", coffee: 7, bugs: 13, commits: 21 },
  { team: "seniors", coffee: 2, bugs: 9, commits: 6 },
  { team: "seniors", coffee: 3, bugs: 14, commits: 9 },
  { team: "seniors", coffee: 4, bugs: 11, commits: 5 },
  { team: "seniors", coffee: 5, bugs: 18, commits: 12 },
  { team: "seniors", coffee: 6, bugs: 16, commits: 8 },
  { team: "seniors", coffee: 8, bugs: 22, commits: 14 },
];

const nestConfig = {
  interns: { label: "Interns", species: "grass" },
  seniors: { label: "Seniors", species: "boa" },
} as const;

const skills = [
  { skill: "git blame", score: 92 },
  { skill: "vibes", score: 88 },
  { skill: "naming things", score: 31 },
  { skill: "YAML indentation", score: 54 },
  { skill: "estimating", score: 12 },
  { skill: "standup theater", score: 76 },
];

/* $SNEK is having a morning. */
type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const SNEK_OPENING_BELL: Candle[] = [
  { time: "09:30", open: 40.0, high: 42.6, low: 38.9, close: 41.8, volume: 320 },
  { time: "09:35", open: 41.8, high: 44.9, low: 41.2, close: 44.2, volume: 410 },
  { time: "09:40", open: 44.2, high: 45.1, low: 41.5, close: 42.1, volume: 380 },
  { time: "09:45", open: 42.1, high: 47.3, low: 41.9, close: 46.8, volume: 540 },
  { time: "09:50", open: 46.8, high: 47.5, low: 44.6, close: 45.2, volume: 300 },
  { time: "09:55", open: 45.2, high: 50.6, low: 45.0, close: 49.9, volume: 620 },
  { time: "10:00", open: 49.9, high: 50.8, low: 47.2, close: 48.1, volume: 280 },
  { time: "10:05", open: 48.1, high: 54.0, low: 47.8, close: 53.4, volume: 710 },
  { time: "10:10", open: 53.4, high: 54.2, low: 51.1, close: 52.0, volume: 330 },
  { time: "10:15", open: 52.0, high: 58.6, low: 51.7, close: 57.9, volume: 800 },
  { time: "10:20", open: 57.9, high: 58.8, low: 54.8, close: 55.4, volume: 360 },
  { time: "10:25", open: 55.4, high: 62.0, low: 55.1, close: 61.2, volume: 880 },
  { time: "10:30", open: 61.2, high: 62.1, low: 58.7, close: 59.6, volume: 400 },
  { time: "10:35", open: 59.6, high: 66.4, low: 59.2, close: 65.8, volume: 950 },
  { time: "10:40", open: 65.8, high: 66.6, low: 63.0, close: 64.1, volume: 420 },
  { time: "10:45", open: 64.1, high: 71.2, low: 63.8, close: 70.3, volume: 1010 },
  { time: "10:50", open: 70.3, high: 71.4, low: 67.5, close: 68.9, volume: 460 },
  { time: "10:55", open: 68.9, high: 77.2, low: 68.5, close: 76.4, volume: 1240 },
];

function nextTime(prev: string): string {
  const [h = 0, m = 0] = prev.split(":").map(Number);
  const total = h * 60 + m + 5;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(
    total % 60
  ).padStart(2, "0")}`;
}

/** One market tick: usually the live candle wanders, sometimes a new candle
 * opens. The drift is slightly bullish because the snakes are. */
function marketTick(cs: Candle[]): Candle[] {
  const out = cs.slice();
  const last = { ...out[out.length - 1]! };
  if (Math.random() < 0.1) {
    out.push({
      time: nextTime(last.time),
      open: last.close,
      high: last.close,
      low: last.close,
      close: last.close,
      volume: 40,
    });
    if (out.length > 18) out.shift();
    return out;
  }
  const drift = (Math.random() - 0.44) * 1.7;
  last.close = Math.max(5, +(last.close + drift).toFixed(1));
  last.high = Math.max(last.high, last.close);
  last.low = Math.min(last.low, last.close);
  last.volume = Math.round(last.volume + Math.random() * 55);
  out[out.length - 1] = last;
  return out;
}

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

function TradingFloor() {
  const [candles, setCandles] = useState<Candle[]>(SNEK_OPENING_BELL);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setCandles(marketTick), 800);
    return () => clearInterval(id);
  }, []);

  const last = candles[candles.length - 1]!;
  const first = candles[0]!;
  const delta = ((last.close / first.open - 1) * 100).toFixed(1);
  const up = Number(delta) >= 0;

  return (
    <section>
      <div className="section-head">
        <p className="eyebrow">wing e — the trading floor</p>
        <h2>$SNEK terminal</h2>
        <p>
          A live candlestick chart. Wicks are tails, the thick part of the
          body goes from open to close. The newest candle is still trading —
          you can tell. The blue snake is the moving average. Follow the
          snake.
        </p>
      </div>

      <div className="terrarium exchange">
        <div className="specimen-tag">
          <span>specimen nº 08 — the candlestick chart</span>
          <span className="latin">Vipera candelabrum</span>
        </div>
        <div className="tape">
          <span className="pair">SNEK / USD</span>
          <span className="price">${last.close.toFixed(1)}</span>
          <span className={up ? "delta up" : "delta down"}>
            {up ? "▲" : "▼"} {delta}%
          </span>
          <span className="live-flag">
            <i className="live-dot" /> live
          </span>
          <span className="spacer" />
          <span className="pill active">5m</span>
          <span className="pill">1H</span>
          <span className="pill">1D</span>
          <span className="pill">molt</span>
        </div>
        <div className="pit-trade">
          <ViperstickChart
            data={candles}
            xKey="time"
            volumeKey="volume"
            trend={{ period: 4, species: "krait" }}
            live
          >
            <Grid />
            <XAxis dataKey="time" />
            <YAxis />
          </ViperstickChart>
        </div>
        <p className="exchange-foot">
          serpent exchange · market cap: yes · circulating supply: 1 (one)
          snake · not financial advice, the snakes are not licensed
        </p>
      </div>
    </section>
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
          Meme charts for React — every line, bar and pie slice is a live
          snake. Same composable API as a normal chart library. Pick a
          species, plug in your data, let them loose.
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
            Share of new variables by naming style. The green snake is
            winning, of course — it is called snake_case. Move your cursor
            over the chart to release the mouse.
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
          <p className="eyebrow">wing b — all the charts</p>
          <h2>The reptile house</h2>
          <p>
            Nine chart types so far. Please keep your hands away from the
            tooltips and don't tap on the glass — the cobras are rendering.
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
              Every bar is a snake standing up to the exact height of your
              value. They sway a little while you read.
            </p>
            <div className="pit">
              <CobraChart data={quarterly} config={quarterlyConfig}>
                <Grid />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Legend />
                <HissTip />
                <Cobra dataKey="shipped" species="cobra" />
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
              A ring of snakes, each one biting the next one's tail. A pie
              chart that eats itself — just like your sprint.
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

          <div className="terrarium">
            <div className="specimen-tag">
              <span>specimen nº 04 — the area chart</span>
              <span className="latin">Serpens cumulativa</span>
            </div>
            <h3>Tech debt, piling up</h3>
            <p className="note">
              An area chart is a line chart standing on a pit of snakes.
              Every layer is load-bearing.
            </p>
            <div className="pit">
              <SlitherChart data={debt} config={debtConfig}>
                <Grid />
                <XAxis dataKey="sprint" />
                <YAxis />
                <HissTip />
                <Snake dataKey="regret" species="boa" variant="pit" />
              </SlitherChart>
            </div>
          </div>

          <div className="terrarium">
            <div className="specimen-tag">
              <span>specimen nº 05 — the scatter plot</span>
              <span className="latin">Nidus punctorum</span>
            </div>
            <h3>Coffee vs. bugs fixed</h3>
            <p className="note">
              Every point is a baby snake curled up at its spot. Bigger coil
              = more commits. Hover one to wake it up — the interns are the
              green ones.
            </p>
            <div className="pit">
              <NestChart
                data={nest}
                config={nestConfig}
                xKey="coffee"
                yKey="bugs"
                groupKey="team"
                sizeKey="commits"
                xLabel="cups"
                yLabel="bugs fixed"
              />
            </div>
          </div>

          <div className="terrarium">
            <div className="specimen-tag">
              <span>specimen nº 06 — the radial chart</span>
              <span className="latin">Medusa retrospectiva</span>
            </div>
            <h3>Team skill assessment</h3>
            <p className="note">
              Bars going out in a circle. Longer snake = better at the
              skill. Do not make eye contact.
            </p>
            <div className="pit pit-round">
              <MedusaChart data={skills} dataKey="score" nameKey="skill" />
            </div>
          </div>

          <div className="terrarium">
            <div className="specimen-tag">
              <span>specimen nº 07 — the gauge</span>
              <span className="latin">Boa barometrica</span>
            </div>
            <h3>Are we done yet?</h3>
            <p className="note">
              A progress snake chases its own tail. At 100% it catches it.
              This is called shipping.
            </p>
            <div className="meter-duo pit">
              <div className="meter">
                <BoaMeter value={0.73} species="boa">
                  <span className="meter-value">73%</span>
                  <span className="meter-label">sprint 12</span>
                </BoaMeter>
              </div>
              <div className="meter">
                <BoaMeter value={1} species="garter">
                  <span className="meter-value">100%</span>
                  <span className="meter-label">ouroboros achieved</span>
                </BoaMeter>
              </div>
            </div>
          </div>

        </div>

        <div className="vivarium">
          <StatTile value="1,204" label="GitHub stars" data={stars} species="grass" />
          <StatTile value="99.98%" label="Terrarium uptime" data={uptime} species="garter" />
          <StatTile value="0" label="Legs shipped to date" data={legs} species="ghost" />
        </div>
      </section>

      <TradingFloor />

      <section>
        <div className="section-head">
          <p className="eyebrow">wing c — how to use it</p>
          <h2>Field guide</h2>
          <p>
            If you've used a chart library like recharts, you already know
            this API. Everything is a child component, each series is a
            snake, and the species picks the colors. Each chart also ships solo on
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
{"  "}rats: {"{"} label: <span className="s">"Rats"</span>, species: <span className="s">"rattler"</span> {"}"},{"\n"}
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
                  rats: { label: "Rats", species: "rattler" },
                }}
              >
                <Grid />
                <XAxis dataKey="month" />
                <YAxis />
                <Legend />
                <HissTip />
                <Snake dataKey="mice" species="coral" />
                <Snake dataKey="rats" species="rattler" wiggle={1.3} />
              </SlitherChart>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <p className="eyebrow">wing d — pick your snake</p>
          <h2>Species index</h2>
          <p>
            Instead of colors you pick species. Each one has its own skin
            and pattern, so two lines stay easy to tell apart even when the
            colors look similar.
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
          a loving ripoff of{" "}
          <a href="https://www.tripwire.sh/dither-kit" target="_blank" rel="noreferrer">
            dither-kit
          </a>{" "}
          by Boring Software Inc., itself a tribute to{" "}
          <a href="https://evilcharts.com" target="_blank" rel="noreferrer">
            Evil Charts
          </a>
          . it gets weirder with every generation.
        </p>
        <p>
          no mice were caught during the making of these animations. they are
          simply too fast.
        </p>
      </footer>
    </main>
  );
}
