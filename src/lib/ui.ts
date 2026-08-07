import type { CSSProperties } from "react";
import { ACCENTS, Accent, COLORS, RADIUS, SHADOW, TRANSITION, CONTENT_MAX, PAGE_PX } from "./tokens";

// Shared style-object factories — the design system is inline-style based
// (ported from the .dc.html source) to guarantee pixel fidelity.

export const container: CSSProperties = {
  maxWidth: CONTENT_MAX,
  marginInline: "auto",
  paddingInline: PAGE_PX,
  width: "100%",
};

export const card: CSSProperties = {
  background: COLORS.surface,
  border: `1px solid ${COLORS.split}`,
  borderRadius: RADIUS.card,
  boxShadow: SHADOW.card,
};

export const btnBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderRadius: RADIUS.button,
  fontWeight: 500,
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: TRANSITION,
  border: "1px solid transparent",
  lineHeight: 1,
};

export const btnPrimary: CSSProperties = {
  ...btnBase,
  height: 40,
  padding: "0 18px",
  background: COLORS.brandBlue,
  color: "#fff",
  fontSize: 14,
};

export const btnPrimarySm: CSSProperties = {
  ...btnPrimary,
  height: 32,
  padding: "0 14px",
  fontSize: 13,
};

export const btnDefault: CSSProperties = {
  ...btnBase,
  height: 40,
  padding: "0 18px",
  background: "#fff",
  color: COLORS.ink,
  border: `1px solid ${COLORS.border}`,
  fontSize: 14,
};

export const btnDefaultSm: CSSProperties = {
  ...btnDefault,
  height: 32,
  padding: "0 12px",
  fontSize: 13,
};

export function tag(accent: Accent): CSSProperties {
  const a = ACCENTS[accent];
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 10px",
    borderRadius: RADIUS.chip,
    background: a.bg,
    border: `1px solid ${a.borderSoft}`,
    color: a.text,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.4,
    whiteSpace: "nowrap",
  };
}

export const microLabel: CSSProperties = {
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

export const leadText: CSSProperties = {
  fontSize: 16,
  lineHeight: 1.72,
  color: COLORS.ink2,
  maxWidth: 660,
};

export function hoverLift(accent: Accent) {
  return {
    borderColor: ACCENTS[accent].color,
    transform: "translateY(-4px)",
    boxShadow: SHADOW.hover(accent),
  } as CSSProperties;
}

// H2 section heading style
export const h2: CSSProperties = {
  fontSize: "clamp(21px, 2.2vw, 28px)",
  fontWeight: 600,
  letterSpacing: "-0.015em",
  margin: 0,
  color: COLORS.ink,
};

export const h2Sub: CSSProperties = {
  fontSize: 14,
  color: COLORS.ink3,
  margin: "6px 0 0",
};

export const sectionGapY = 56;
