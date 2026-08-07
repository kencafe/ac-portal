import { INDUSTRIES, SECTION_TITLES } from "@/data/landing";
import { ACCENTS, Accent, COLORS, RADIUS } from "@/lib/tokens";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import HoverCard from "@/components/shared/HoverCard";

export default function Industries() {
  return (
    <Section id="industries">
      <SectionHeading vi={SECTION_TITLES.industries.vi} en={SECTION_TITLES.industries.en} mark="blue" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 12,
        }}
      >
        {INDUSTRIES.map((ind) => {
          const a = ACCENTS[ind.accent as Accent];
          return (
            <HoverCard
              key={ind.vi}
              style={{
                background: "#fff",
                border: `1px solid ${COLORS.split}`,
                borderRadius: RADIUS.card,
                padding: "18px 18px 20px",
              }}
              hoverStyle={{ borderColor: a.color }}
            >
              <span style={{ display: "block", width: 30, height: 3, borderRadius: 2, background: a.color, marginBottom: 14 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.ink }}>{ind.vi}</div>
              <div style={{ fontSize: 12.5, color: COLORS.ink3, marginTop: 3 }}>{ind.en}</div>
            </HoverCard>
          );
        })}
      </div>
    </Section>
  );
}
