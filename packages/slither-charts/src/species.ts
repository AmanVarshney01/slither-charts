// Series colors are snake species. Each species is a full skin: base scale
// color, belly highlight, marking color + pattern, eye/tongue accents. The
// pattern is what makes two series readable even for colorblind users — a
// python and a coral snake differ in texture, not just hue.

export type SkinPattern = "diamonds" | "bands" | "stripe" | "zigzag" | "plain"

export type Skin = {
  /** Latin-ish flavor name, shows up in legends/tooltips if you want it. */
  latin: string
  skin: string
  belly: string
  marking: string
  /** Secondary marking for banded species (coral's gold ring). */
  marking2?: string
  pattern: SkinPattern
  eye: string
  pupil: string
  tongue: string
  /* ── traits: things the species DOES, not just wears ── */
  /** 0..1 permanent hood flare behind the head (cobras). */
  hood?: number
  /** Segmented tail rattle; shakes when the snake is excited. */
  rattle?: boolean
  /** Body width multiplier (anacondas are load-bearing). */
  girth?: number
  /** Slither-amplitude multiplier (sidewinders can't help it). */
  verve?: number
}

export type Species =
  | "python"
  | "coral"
  | "mamba"
  | "garter"
  | "viper"
  | "boa"
  | "grass"
  | "krait"
  | "cobra"
  | "rattler"
  | "milk"
  | "anaconda"
  | "sidewinder"
  | "ghost"

export const SPECIES: Record<Species, Skin> = {
  python: {
    latin: "Python memeticus",
    skin: "#D9A441",
    belly: "#F4E3B2",
    marking: "#5C3D14",
    pattern: "diamonds",
    eye: "#F6E7A2",
    pupil: "#241505",
    tongue: "#E4573D",
  },
  coral: {
    latin: "Micrurus chartensis",
    skin: "#E4573D",
    belly: "#F7C8A9",
    marking: "#1E1712",
    marking2: "#F2C94C",
    pattern: "bands",
    eye: "#F7E9C4",
    pupil: "#160D08",
    tongue: "#FFB4A0",
  },
  mamba: {
    latin: "Dendroaspis dashboardii",
    skin: "#8FA69B",
    belly: "#D8E2DA",
    marking: "#54665D",
    pattern: "plain",
    eye: "#EFE9D4",
    pupil: "#10150F",
    tongue: "#3B4A42",
  },
  garter: {
    latin: "Thamnophis gridulus",
    skin: "#3E7C6B",
    belly: "#BFE3D2",
    marking: "#EAD98B",
    pattern: "stripe",
    eye: "#F2E9BE",
    pupil: "#0E1A15",
    tongue: "#E4573D",
  },
  viper: {
    latin: "Vipera regressio",
    skin: "#7A5C8E",
    belly: "#D9C6E8",
    marking: "#2E1F3A",
    pattern: "zigzag",
    eye: "#F0D9A8",
    pupil: "#170F1E",
    tongue: "#E4573D",
  },
  boa: {
    latin: "Boa constrictor budgetaris",
    skin: "#A8734B",
    belly: "#E8CBA8",
    marking: "#4A2E1B",
    pattern: "diamonds",
    eye: "#F2DFA8",
    pupil: "#1C0F06",
    tongue: "#E4573D",
  },
  grass: {
    latin: "Natrix sparklinea",
    skin: "#7C9A3E",
    belly: "#D6E6A8",
    marking: "#44551F",
    pattern: "stripe",
    eye: "#F2E9BE",
    pupil: "#141A08",
    tongue: "#E4573D",
  },
  // Deployment blue. Ships to production, sheds on rollback.
  krait: {
    latin: "Bungarus deploymentus",
    skin: "#3671F0",
    belly: "#9DB9FF",
    marking: "#1E3F9E",
    pattern: "stripe",
    eye: "#DBE6FF",
    pupil: "#050A18",
    tongue: "#E4573D",
  },
  // Flares its hood at every data point. Loves attention.
  cobra: {
    latin: "Naja verticalis",
    skin: "#8A7A3D",
    belly: "#D9CC96",
    marking: "#4A401C",
    pattern: "plain",
    eye: "#EFE3AC",
    pupil: "#181405",
    tongue: "#E4573D",
    hood: 0.9,
  },
  // Rattles before it bites, like a good deprecation warning.
  rattler: {
    latin: "Crotalus deprecatus",
    skin: "#B99C6B",
    belly: "#EBDCB8",
    marking: "#57402A",
    pattern: "diamonds",
    eye: "#F2E3B4",
    pupil: "#1C1206",
    tongue: "#E4573D",
    rattle: true,
  },
  // Red touches white? That's not a coral. This one's just doing a bit.
  milk: {
    latin: "Lampropeltis sus",
    skin: "#C03A2E",
    belly: "#F2D8CF",
    marking: "#181214",
    marking2: "#F2EFE4",
    pattern: "bands",
    eye: "#F7E9DC",
    pupil: "#170B08",
    tongue: "#FFB4A0",
  },
  // For series that carry the whole dashboard.
  anaconda: {
    latin: "Eunectes gigabytus",
    skin: "#5E7050",
    belly: "#C4D3B0",
    marking: "#2C3A24",
    pattern: "diamonds",
    eye: "#E9EFCF",
    pupil: "#101508",
    tongue: "#3B4A42",
    girth: 1.7,
  },
  // Approaches every value at an angle. Never blocks the main thread.
  sidewinder: {
    latin: "Crotalus asynchronous",
    skin: "#CBB68F",
    belly: "#F0E6CC",
    marking: "#8A6F42",
    pattern: "zigzag",
    eye: "#F5EBCB",
    pupil: "#201607",
    tongue: "#E4573D",
    verve: 2,
  },
  // Albino. Red eyes. Renders your null series with dignity.
  ghost: {
    latin: "Serpens undefined",
    skin: "#E8E0DA",
    belly: "#FDFBF7",
    marking: "#C9B8C4",
    pattern: "plain",
    eye: "#E4573D",
    pupil: "#7A1E14",
    tongue: "#E4A0A0",
  },
}

export const isSpecies = (v: unknown): v is Species =>
  typeof v === "string" && v in SPECIES

export const skinOf = (s: Species): Skin => SPECIES[s]
