// Builds the slither-charts shadcn registry — one item per chart, plus a
// shared `core` engine (the snake painter) they all depend on.
//
//   bun run registry:build   (or: node scripts/build-registry.mjs)
//
// Emits two things from the sources in packages/slither-charts/src/:
//   • registry.json at the repo root — powers shadcn's zero-config GitHub
//     shorthand: `npx shadcn@latest add AmanVarshney01/slither-charts/<item>`.
//     File paths are repo-relative sources; no inline content (the CLI reads
//     each file straight from the repo), and deps use the owner/repo/<item>
//     address so `core` resolves without any components.json.
//   • r/<item>.json + r/registry.json — a host-agnostic namespace registry
//     (content inlined) for anyone serving it under a "@slither-charts"
//     namespace.
//
// Registry layout is a faithful homage to dither-kit
// (https://github.com/Boring-Software-Inc/dither-kit), like everything else
// in here.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SRC = join(ROOT, "packages/slither-charts/src")
const OUT = join(ROOT, "r")

// Where files land in a consumer's project (relative to its root).
const TARGET_DIR = "components/slither-charts"
const NS = "@slither-charts"
const HOMEPAGE = "https://slither-charts.amanv.dev"
const AUTHOR = "Aman Varshney"

// GitHub repo backing the zero-config shorthand.
const REPO = "AmanVarshney01/slither-charts"
const SRC_REL = "packages/slither-charts/src"

// The engine every chart shares: the snake painter, species skins, scales,
// contexts, the cartesian shell, and the grid/axes/legend/HissTip chrome.
// Zero npm dependencies. Snakes don't need d3.
const CORE_FILES = [
  "species.ts",
  "scales.ts",
  "snake-paint.ts",
  "use-chart.ts",
  "chart-context.tsx",
  "cartesian-root.tsx",
  "grid.tsx",
  "axes.tsx",
  "legend.tsx",
  "hiss-tip.tsx",
]

const ITEMS = [
  {
    name: "core",
    title: "slither-charts — Core",
    description:
      "Shared engine for slither-charts: the canvas snake painter (traveling-wave slither, species skins, blinking eyes, forked tongues), scales, contexts, and the grid/axes/legend/HissTip chrome. Installed automatically by every chart. Zero dependencies, zero legs.",
    files: CORE_FILES,
    registryDependencies: [],
    dependencies: [],
    devDependencies: [],
  },
  {
    name: "slither-chart",
    title: "Slither Chart (line)",
    description:
      "Line chart where every series is a live snake slithering along the data, head resting on the latest value. Scrub tooltip with a crosshair mouse the snakes never catch. An unhinged homage to dither-kit.",
    files: ["slither-chart.tsx"],
    registryDependencies: [`${NS}/core`],
    dependencies: [],
    devDependencies: [],
  },
  {
    name: "cobra-chart",
    title: "Cobra Chart (bar)",
    description:
      "Bar chart where every bar is a cobra rearing to the exact height of your KPI, hood flared. Grouped series, staggered rise-in. An unhinged homage to dither-kit.",
    files: ["cobra-chart.tsx"],
    registryDependencies: [`${NS}/core`],
    dependencies: [],
    devDependencies: [],
  },
  {
    name: "ouroboros-chart",
    title: "Ouroboros Chart (pie)",
    description:
      "Pie chart as a ring of snakes, each politely biting the next one's tail — the circle that eats itself. Hover to make a slice rear up. An unhinged homage to dither-kit.",
    files: ["ouroboros-chart.tsx"],
    registryDependencies: [`${NS}/core`],
    dependencies: [],
    devDependencies: [],
  },
  {
    name: "worm",
    title: "Worm (sparkline)",
    description:
      "Sparkline. Legally a snake, spiritually a worm. Fits in a stat tile, points at your KPI, occasionally flicks its tongue at it. An unhinged homage to dither-kit.",
    files: ["worm.tsx"],
    registryDependencies: [`${NS}/core`],
    dependencies: [],
    devDependencies: [],
  },
  {
    name: "slither-charts",
    title: "slither-charts — Everything",
    description:
      "The whole reptile house: line, bar, pie, and sparkline charts where every mark is a live snake, on one tiny canvas engine. An unhinged homage to dither-kit.",
    // The barrel only ships here — it re-exports every chart, so it is only
    // valid when everything is installed.
    files: ["index.ts"],
    registryDependencies: [
      `${NS}/slither-chart`,
      `${NS}/cobra-chart`,
      `${NS}/ouroboros-chart`,
      `${NS}/worm`,
    ],
    dependencies: [],
    devDependencies: [],
  },
]

mkdirSync(OUT, { recursive: true })

function fileEntry(name) {
  return {
    path: `${TARGET_DIR}/${name}`,
    type: "registry:component",
    target: `${TARGET_DIR}/${name}`,
    content: readFileSync(join(SRC, name), "utf8"),
  }
}

// Namespace registry — per-item files with content inlined (host-agnostic).
for (const it of ITEMS) {
  const json = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: it.name,
    type: "registry:component",
    title: it.title,
    description: it.description,
    author: AUTHOR,
    dependencies: it.dependencies,
    devDependencies: it.devDependencies,
    registryDependencies: it.registryDependencies,
    files: it.files.map(fileEntry),
  }
  writeFileSync(join(OUT, `${it.name}.json`), `${JSON.stringify(json, null, 2)}\n`)
}

const nsRegistry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "slither-charts",
  homepage: HOMEPAGE,
  items: ITEMS.map((it) => ({
    name: it.name,
    type: "registry:component",
    title: it.title,
    description: it.description,
    dependencies: it.dependencies,
    registryDependencies: it.registryDependencies,
    files: it.files.map((name) => ({
      path: `${TARGET_DIR}/${name}`,
      type: "registry:component",
      target: `${TARGET_DIR}/${name}`,
    })),
  })),
}
writeFileSync(join(OUT, "registry.json"), `${JSON.stringify(nsRegistry, null, 2)}\n`)

// Repo-root registry — powers the zero-config GitHub shorthand. No inline
// content (the CLI reads sources from the repo); deps use owner/repo/<item>.
const githubRegistry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "slither-charts",
  homepage: HOMEPAGE,
  items: ITEMS.map((it) => ({
    name: it.name,
    type: "registry:component",
    title: it.title,
    description: it.description,
    dependencies: it.dependencies,
    registryDependencies: it.registryDependencies.map((d) =>
      d.replace(`${NS}/`, `${REPO}/`)
    ),
    files: it.files.map((name) => ({
      path: `${SRC_REL}/${name}`,
      type: "registry:component",
      target: `${TARGET_DIR}/${name}`,
    })),
  })),
}
writeFileSync(join(ROOT, "registry.json"), `${JSON.stringify(githubRegistry, null, 2)}\n`)

const total = ITEMS.reduce((n, it) => n + it.files.length, 0)
console.log(
  `registry: wrote ${ITEMS.length} items (${total} file refs) → r/{${ITEMS.map((i) => i.name).join(",")}}.json + r/registry.json + registry.json`
)
