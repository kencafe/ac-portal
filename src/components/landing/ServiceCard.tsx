"use client";

import { CSSProperties } from "react";
import { ACCENTS, Accent, COLORS, RADIUS, SHADOW, TRANSITION } from "@/lib/tokens";
import { ServicePlate } from "@/components/shared/Glyph";
import HoverCard from "@/components/shared/HoverCard";
import { useLang } from "@/components/shared/LangContext";
import { routes } from "@/lib/routes";

type Meta = {
  num: number;
  name: string;
  nameEn?: string;
  en: string;
  slug: string;
  accent: string;
  desc: string;
  descEn: string;
  ribbon?: string;
};

export default function ServiceCard({ meta }: { meta: Meta }) {
  const { lang } = useLang();
  const accent = meta.accent as Accent;
  const a = ACCENTS[accent];
  const isHot = Boolean(meta.ribbon); // AIOps exception

  const [nameSize, enSize] = lang === "vi" ? [16, 12.5] : [12.5, 16];

  const base: CSSProperties = {
    display: "block",
    color: COLORS.ink,
    background: "#fff",
    border: `1px solid ${isHot ? a.color : COLORS.split}`,
    borderRadius: RADIUS.card,
    padding: "22px 22px 24px",
    height: "100%",
    transition: TRANSITION,
    textDecoration: "none",
  };

  const hover: CSSProperties = isHot
    ? { boxShadow: `inset 0 3px 0 ${a.color}, ${SHADOW.hover(accent)}`, transform: "translateY(-4px)" }
    : { borderColor: a.color, transform: "translateY(-4px)", boxShadow: SHADOW.hover(accent) };

  return (
    <HoverCard
      as="a"
      href={routes.serviceDetail(meta.slug)}
      ariaLabel={meta.name}
      style={base}
      hoverStyle={hover}
      cornerAccent={isHot ? undefined : a.color}
    >
      {isHot && (
        <span
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 2,
            background: a.color,
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            padding: "4px 10px",
            borderBottomLeftRadius: 8,
          }}
        >
          {lang === "en" && meta.ribbon ? "NEW" : meta.ribbon}
        </span>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <ServicePlate slug={meta.slug} accentColor={a.color} />
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: nameSize, fontWeight: 600, letterSpacing: "-0.01em", color: COLORS.ink, lineHeight: 1.3 }}>
          {lang === "en" ? meta.nameEn ?? meta.name : meta.name}
        </div>
        <div style={{ fontSize: enSize, color: COLORS.ink3, marginTop: 2 }}>{meta.en}</div>
      </div>

      <p style={{ fontSize: 14, lineHeight: 1.65, color: COLORS.ink2, margin: "12px 0 16px" }}>{lang === "en" ? meta.descEn : meta.desc}</p>

      <span style={{ fontSize: 13.5, fontWeight: 600, color: a.color }}>{lang === "en" ? "Learn more →" : "Xem thêm →"}</span>
    </HoverCard>
  );
}
