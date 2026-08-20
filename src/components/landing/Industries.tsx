"use client";

import { INDUSTRIES, SECTION_TITLES } from "@/data/landing";
import { ACCENTS, Accent, COLORS, RADIUS } from "@/lib/tokens";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import HoverCard from "@/components/shared/HoverCard";
import { useLang } from "@/components/shared/LangContext";

export default function Industries() {
  const en = useLang().lang === "en";
  return (
    <Section id="industries">
      <SectionHeading vi={SECTION_TITLES.industries.vi} en={SECTION_TITLES.industries.en} mark="blue" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
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
                // Longhands, not the `border` shorthand: hoverStyle overrides
                // borderColor, and React clears a hover-only key on un-hover.
                // With only the shorthand here there is nothing left to fall
                // back to, so border-color resolved to currentColor and the
                // card kept a near-black 1px border after the pointer left.
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: COLORS.split,
                borderRadius: RADIUS.card,
                padding: "18px 18px 20px",
                transition: "background .18s ease, box-shadow .18s ease, border-color .18s ease, transform .18s ease",
              }}
              hoverStyle={{
                background: a.bg,
                borderColor: a.color,
                boxShadow: "0 14px 30px -18px rgba(0,21,41,0.42)",
                transform: "translateY(-2px)",
              }}
            >
              <span style={{ display: "block", width: 30, height: 3, borderRadius: 2, background: a.color, marginBottom: 14 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.ink }}>{en ? ind.en : ind.vi}</div>
              {!en && <div style={{ fontSize: 12.5, color: COLORS.ink3, marginTop: 3 }}>{ind.en}</div>}
            </HoverCard>
          );
        })}
      </div>
    </Section>
  );
}
