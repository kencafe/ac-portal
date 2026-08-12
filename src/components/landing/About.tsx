"use client";

import { Fragment, ReactNode } from "react";
import { ABOUT, SECTION_TITLES } from "@/data/landing";
import { ACCENTS, Accent, COLORS } from "@/lib/tokens";
import { card, tag } from "@/lib/ui";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import Icon from "@/components/shared/Icon";
import { useLang } from "@/components/shared/LangContext";

/** Colour the quote keywords inline. */
function colourize(text: string, keywords: { text: string; color: string }[]): ReactNode {
  let parts: ReactNode[] = [text];
  keywords.forEach((kw, ki) => {
    const next: ReactNode[] = [];
    parts.forEach((part, pi) => {
      if (typeof part !== "string") {
        next.push(part);
        return;
      }
      const segs = part.split(kw.text);
      segs.forEach((seg, si) => {
        if (seg) next.push(seg);
        if (si < segs.length - 1) {
          next.push(
            <strong key={`k${ki}-${pi}-${si}`} style={{ color: kw.color, fontWeight: 600 }}>
              {kw.text}
            </strong>,
          );
        }
      });
    });
    parts = next;
  });
  return <>{parts.map((p, i) => (typeof p === "string" ? <Fragment key={i}>{p}</Fragment> : p))}</>;
}

export default function About() {
  const { lang } = useLang();
  const en = lang === "en";
  const intro = en ? ABOUT.intro.en : ABOUT.intro.vi;
  const quoteText = en ? ABOUT.quote.textEn : ABOUT.quote.text;
  const quoteKeywords = en ? ABOUT.quote.keywordsEn : ABOUT.quote.keywords;
  const quoteBy = en ? ABOUT.quote.byEn : ABOUT.quote.by;
  const stripLabel = en ? ABOUT.platformStrip.labelEn : ABOUT.platformStrip.label;

  return (
    <Section id="about">
      <SectionHeading vi={SECTION_TITLES.about.vi} en={SECTION_TITLES.about.en} mark="orange" />

      {/* Row 1: intro + quote */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        <p style={{ fontSize: 16.5, lineHeight: 1.75, color: COLORS.ink2, margin: 0 }}>{intro}</p>
        <div style={{ ...card, borderLeft: `3px solid ${COLORS.brandBlue}`, padding: "22px 24px" }}>
          <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.7, color: COLORS.ink }}>
            {colourize(quoteText, [...quoteKeywords])}
          </p>
          <div style={{ marginTop: 14, fontSize: 13, color: COLORS.ink3 }}>— {quoteBy}</div>
        </div>
      </div>

      {/* Row 2: 8 value cards — EN mode promotes the English label to primary. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        {ABOUT.valueCards.map((c) => (
          <div
            key={c.title}
            style={{
              ...card,
              borderTop: `3px solid ${ACCENTS[c.accent as Accent].color}`,
              padding: "20px 20px 22px",
            }}
          >
            <Icon name={c.icon} size={18} color="rgba(0,0,0,0.35)" />
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", margin: "12px 0 6px", color: COLORS.ink }}>
              {en ? c.en : c.title}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.65, color: COLORS.ink2 }}>{en ? c.title : c.en}</div>
          </div>
        ))}
      </div>

      {/* Row 3: platform strip */}
      <div style={{ ...card, padding: "18px 20px", marginTop: 24, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: COLORS.ink3 }}>
          {stripLabel}
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ABOUT.platformStrip.tags.map((t) => (
            <span key={t.text} style={tag(t.accent as Accent)}>
              {t.text}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
