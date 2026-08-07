import { CASES, SECTION_TITLES } from "@/data/landing";
import { Accent, COLORS, RADIUS } from "@/lib/tokens";
import { tag } from "@/lib/ui";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";

export default function Cases() {
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
                {c.tag}
              </span>
              <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.ink, margin: "14px 0 8px", lineHeight: 1.4 }}>
                {c.title}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: COLORS.ink2, margin: "0 0 14px" }}>{c.desc}</p>
              <a href="#contact" className="ns-arrow" style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.brandBlue }}>
                {c.linkLabel}
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
                    height: 72,
                    background: "#fff",
                    padding: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/${logo.src}`}
                    alt=""
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
