// slither-charts — composable charts where every mark is a live snake.
// Same children-as-config shape as the chart library you were expecting,
// except the marks blink, slither, and flick their tongues at your data.

export { SlitherChart, Snake } from "./slither-chart"
export { CobraChart, Cobra } from "./cobra-chart"
export { OuroborosChart, Ouroboros } from "./ouroboros-chart"
export { Worm } from "./worm"
export { XAxis, YAxis } from "./axes"
export { Grid } from "./grid"
export { Legend, Squiggle } from "./legend"
export { HissTip } from "./hiss-tip"
export { SPECIES, skinOf, isSpecies } from "./species"
export type { Species, Skin, SkinPattern } from "./species"
export type { ChartConfig, SeriesConfig, Row } from "./chart-context"
export { drawSnake, arcPath, resample } from "./snake-paint"
export type { SnakeOpts, Pt } from "./snake-paint"
