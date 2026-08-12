"use client";

import { PARTNERS, PARTNERS_LEAD, PARTNERS_LEAD_EN, SECTION_TITLES } from "@/data/landing";
import { COLORS, RADIUS } from "@/lib/tokens";
import { leadText } from "@/lib/ui";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import HoverCard from "@/components/shared/HoverCard";
import { useLang } from "@/components/shared/LangContext";

function logoSrc(logo: string) {
  return logo.startsWith("http") ? logo : `/${logo}`;
}

export default function Partners() {
  const en = useLang().lang === "en";
  return (
    <Section id="partners">
      <SectionHeading vi={SECTION_TITLES.partners.vi} en={SECTION_TITLES.partners.en} mark="green" />
      <p style={{ ...leadText, marginTop: -12, marginBottom: 24 }}>{en ? PARTNERS_LEAD_EN : PARTNERS_LEAD}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {PARTNERS.map((p) => (
          <HoverCard
            key={p.id}
            style={{
              background: "#fff",
              border: `1px solid ${COLORS.split}`,
              borderRadius: RADIUS.card,
              padding: 20,
            }}
            hoverStyle={{ borderColor: COLORS.brandBlue, boxShadow: "0 10px 28px -14px rgba(0,114,188,0.45)" }}
          >
            <div style={{ height: 52, display: "flex", alignItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc(p.logo)}
                alt={p.name}
                style={{ maxHeight: 40, maxWidth: "70%", objectFit: "contain" }}
                loading="lazy"
              />
            </div>
            <div style={{ fontSize: 15.5, fontWeight: 600, color: COLORS.ink, marginTop: 8 }}>{p.name}</div>
            <div style={{ fontSize: 13, color: COLORS.ink3, marginTop: 3 }}>{en ? p.descEn : p.desc}</div>
          </HoverCard>
        ))}
      </div>
    </Section>
  );
}
