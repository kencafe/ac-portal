// Design tokens — ported verbatim from the FPTIS NS design handoff (README + .dc.html).
// High-fidelity: colours, shadows, easing are final values.

export type Accent = "blue" | "orange" | "green";

export const COLORS = {
  brandBlue: "#0072BC",
  brandBlueHover: "#338FCB",
  brandOrange: "#F37021",
  brandGreen: "#57A336",
  navy900: "#001529",
  navyPanelFrom: "#0B3C86",
  navyPanelTo: "#071A46",
  heroFrom: "#E6F1F9",
  pageBg: "#F5F5F5",
  surface: "#FFFFFF",
  surfaceAlt: "#FAFAFA",
  border: "#d9d9d9",
  split: "rgba(5,5,5,0.06)",
  ink: "rgba(0,0,0,0.88)",
  ink2: "rgba(0,0,0,0.65)",
  ink3: "rgba(0,0,0,0.55)",
} as const;

// Accent colour + tinted surfaces (tag, code plate, icon box).
export const ACCENTS: Record<
  Accent,
  { color: string; bg: string; border: string; borderSoft: string; text: string }
> = {
  blue: { color: "#0072BC", bg: "#E6F1F9", border: "#B3D5EA", borderSoft: "#C2DCEF", text: "#0072BC" },
  orange: { color: "#F37021", bg: "#FEF1E9", border: "#F8CBA9", borderSoft: "#F7D2B8", text: "#C25A17" },
  green: { color: "#57A336", bg: "#F0F8EB", border: "#C6E4B4", borderSoft: "#CDE7BC", text: "#3F7A26" },
};

// Mandatory alternating order: blue -> orange -> green.
export const ACCENT_ORDER: Accent[] = ["blue", "orange", "green"];
export const accentAt = (i: number): Accent => ACCENT_ORDER[i % 3];

export const RADIUS = {
  card: 8,
  plateSolid: 4,
  iconBox: 10,
  button: 6,
  chip: 4,
  filterChip: 16,
  panel: 10,
} as const;

export const SHADOW = {
  card: "0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px rgba(0,0,0,0.02)",
  navyPanel: "0 18px 44px -26px rgba(0,21,41,0.6)",
  header: "0 1px 4px rgba(0,21,41,0.08)",
  // hover shadow tinted by accent — append 73 (≈0.45 alpha) to the accent hex
  hover: (accent: Accent) => `0 10px 28px -12px ${ACCENTS[accent].color}73`,
} as const;

export const EASING = "cubic-bezier(.22,1,.36,1)";
export const TRANSITION = `all 220ms ${EASING}`;

export const CONTENT_MAX = 1280;
export const PAGE_PX = 24;

// Gradients
export const GRAD = {
  brandStripe:
    "linear-gradient(90deg, #F37021 0 33.34%, #0072BC 33.34% 66.67%, #57A336 66.67% 100%)",
  hero: "linear-gradient(180deg, #E6F1F9 0%, #F5F5F5 100%)",
  heroPanel: "linear-gradient(150deg, #0B3C86, #061436)",
  statsPanel: "linear-gradient(140deg, #0B3C86, #071A46)",
} as const;

// Phase colours for the 4-stage service model
export const PHASE_COLORS = ["#F37021", "#0072BC", "#38A3D8", "#57A336"] as const;

// Font stack
export const FONT_SANS =
  'Inter, var(--font-inter), system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
