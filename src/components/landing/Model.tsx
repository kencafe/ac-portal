"use client";

import { MODEL, SECTION_TITLES } from "@/data/landing";
import { COLORS, RADIUS } from "@/lib/tokens";
import { card } from "@/lib/ui";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import { useLang } from "@/components/shared/LangContext";

export default function Model() {
  const en = useLang().lang === "en";
  return (
    <Section id="model" surface bordered>
      <SectionHeading vi={SECTION_TITLES.model.vi} en={SECTION_TITLES.model.en} mark="green" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        {MODEL.phases.map((p) => (
          <div
            key={p.num}
            style={{
              ...card,
              borderTop: `3px solid ${p.color}`,
              padding: "22px 20px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: p.color,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 15,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {p.num}
              </span>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: COLORS.ink3,
                }}
              >
                {en ? p.phaseLabelEn : p.phaseLabel}
              </span>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 19, fontWeight: 600, color: COLORS.ink }}>{en ? p.en : p.title}</div>
              <div style={{ fontSize: 13, color: COLORS.ink3, marginTop: 2 }}>{en ? p.title : p.en}</div>
            </div>

            <div
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: `1px solid ${COLORS.split}`,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {(en ? p.chipsEn : p.chips).map((chip) => (
                <span
                  key={chip}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 26,
                    padding: "0 10px",
                    borderRadius: RADIUS.chip,
                    background: COLORS.surfaceAlt,
                    border: `1px solid ${COLORS.split}`,
                    fontSize: 13,
                    color: COLORS.ink2,
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
