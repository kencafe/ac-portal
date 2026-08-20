"use client";

import { CASES, SECTION_TITLES, UI_STRINGS } from "@/data/landing";
import { ACCENTS, Accent, COLORS, RADIUS } from "@/lib/tokens";
import { tag } from "@/lib/ui";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import { useLang } from "@/components/shared/LangContext";

// Human-readable customer name from the placeholderHint ("Techcombank — kéo
// logo vào" → "Techcombank"), used as the text fallback when a logo is missing.
function logoName(hint?: string): string {
  return (hint || "").split("—")[0].trim();
}

export default function Cases() {
  const en = useLang().lang === "en";
  return (
    <Section id="cases">
      <SectionHeading vi={SECTION_TITLES.cases.vi} en={SECTION_TITLES.cases.en} mark="orange" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {CASES.map((c) => (
          <div
            key={c.tag}
            style={{
              background: "#fff",
              border: `1px solid ${COLORS.split}`,
              borderRadius: RADIUS.card,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Content first */}
            <div style={{ padding: "22px 22px 20px" }}>
              <span style={{ ...tag(c.tagAccent as Accent), fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {en ? c.tagEn : c.tag}
              </span>
              <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.ink, margin: "14px 0 8px", lineHeight: 1.4 }}>
                {en ? c.titleEn : c.title}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: COLORS.ink2, margin: "0 0 14px" }}>{en ? c.descEn : c.desc}</p>
              <a href="#contact" className="ns-arrow" style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.brandBlue }}>
                {en ? UI_STRINGS.caseCardLinkEn : c.linkLabel}
              </a>
            </div>

            {/* Logo grid pinned to bottom */}
            <div
              style={{
                marginTop: "auto",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1,
                padding: 1,
                background: c.gridBg,
                borderTop: `1px solid ${COLORS.split}`,
              }}
            >
              {c.logos.map((logo) => (
                <div
                  key={logo.id}
                  style={{
                    height: 64,
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "0 14px",
                  }}
                >
                  <span style={{ width: 3, height: 22, borderRadius: 2, background: ACCENTS[c.tagAccent as Accent].color, flexShrink: 0 }} />
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: COLORS.ink, lineHeight: 1.2 }}>
                    {logoName(logo.placeholderHint) || logo.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
