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
}

export type Species =
  | "python"
  | "coral"
  | "mamba"
  | "garter"
  | "viper"
  | "boa"
  | "grass"

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
}

export const isSpecies = (v: unknown): v is Species =>
  typeof v === "string" && v in SPECIES

export const skinOf = (s: Species): Skin => SPECIES[s]
