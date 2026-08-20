"use client";

import Image from "next/image";
import { HERO, STATS } from "@/data/landing";
import { COLORS, GRAD, CONTENT_MAX } from "@/lib/tokens";
import { btnPrimary, btnDefault } from "@/lib/ui";
import { useLang } from "@/components/shared/LangContext";

// A browser may wrap at a hyphen, which split the headline as "end-to-" /
// "end cho doanh nghiệp" and left the first line visibly short. Render the
// hyphenated term inside a nowrap span so the break can only land between
// words. Done with a span rather than U+2011 so it does not depend on the
// font shipping a non-breaking-hyphen glyph.
const NOWRAP_TERMS = ["end-to-end"];
const NOWRAP_SPLIT = new RegExp(`(${NOWRAP_TERMS.join("|")})`, "gi");

function keepTermsWhole(text: string) {
  // Compare the split part by value; do NOT .test() the /g/ regex here — its
  // lastIndex is stateful, so the second call would report false and silently
  // let the term wrap again.
  const terms = new Set(NOWRAP_TERMS);
  return text.split(NOWRAP_SPLIT).map((part, i) =>
    terms.has(part.toLowerCase()) ? (
      <span key={i} style={{ whiteSpace: "nowrap" }}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export default function Hero() {
  const { lang } = useLang();
  const en = lang === "en";
  const h1 = en ? HERO.h1En : HERO.h1;
  const h1sub = en ? "" : HERO.h1sub;
  const lead = en ? HERO.leadEn : HERO.lead;
  const btnPrimaryLabel = en ? HERO.buttons.primaryEn : HERO.buttons.primary;
  const btnSecondaryLabel = en ? HERO.buttons.secondaryEn : HERO.buttons.secondary;
  const chips = en ? HERO.panel.chipsEn : HERO.panel.chips;
  return (
    <section id="top" style={{ background: GRAD.hero, padding: "64px 24px 40px" }}>
      <div style={{ maxWidth: CONTENT_MAX, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 40,
            alignItems: "center",
          }}
        >
          {/* Left copy */}
          <div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 12px",
                borderRadius: 16,
                background: "#E6F1F9",
                border: "1px solid #B3D5EA",
                color: COLORS.brandBlue,
                fontSize: 12.5,
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              {HERO.tag}
            </span>
            <h1
              style={{
                // Measured on the live hero: the text column is 620px at a
                // 1440px viewport, and "Đối tác Cloud & AI end-to-end" needs
                // 664px at 46px — hence the headline fell to three lines with a
                // two-word orphan. 42px brings that first line to ~607px so it
                // fits, and text-wrap:balance then evens the two lines.
                fontSize: "clamp(30px, 3.2vw, 42px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.16,
                margin: 0,
                color: COLORS.ink,
                // Even the lines out instead of letting the last one orphan.
                // Ignored by browsers that do not support it — no fallback needed.
                textWrap: "balance",
              }}
            >
              {keepTermsWhole(h1)}
            </h1>
            {h1sub && (
              <p
                style={{
                  fontSize: "clamp(15px, 1.5vw, 19px)",
                  fontWeight: 400,
                  color: COLORS.ink3,
                  margin: "10px 0 0",
                  textWrap: "balance",
                }}
              >
                {keepTermsWhole(h1sub)}
              </p>
            )}
            <p style={{ fontSize: 16, lineHeight: 1.72, color: COLORS.ink2, maxWidth: 660, margin: "20px 0 0" }}>
              {lead}
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <a href="#contact" style={btnPrimary}>
                {btnPrimaryLabel}
              </a>
              <a href="#services" style={btnDefault}>
                {btnSecondaryLabel}
              </a>
              {/* Sale kit (company profile / design) PDF download for customers. */}
              <a href="/downloads/AC-Portal-SaleKit.pdf" download style={btnDefault}>
                {en ? "⬇ Download sale kit (PDF)" : "⬇ Tải bộ giới thiệu (PDF)"}
              </a>
            </div>
          </div>

          {/* Right decorative navy panel */}
          <div
            style={{
              background: GRAD.heroPanel,
              borderRadius: 12,
              padding: 16,
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 18px 44px -26px rgba(0,21,41,0.6)",
            }}
          >
            <div style={{ borderRadius: 8, overflow: "hidden", position: "relative", aspectRatio: "16 / 10" }}>
              <Image
                src={`/${HERO.panel.image}`}
                alt={HERO.panel.imageAlt}
                fill
                sizes="(max-width: 900px) 90vw, 560px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {HERO.panel.tag}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {chips.map((chip) => (
                <span
                  key={chip}
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.9)",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    borderRadius: 8,
                    padding: "6px 10px",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats panel */}
        <div
          style={{
            background: GRAD.statsPanel,
            borderRadius: 10,
            marginTop: 36,
            padding: 26,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 24,
            boxShadow: "0 18px 44px -26px rgba(0,21,41,0.6)",
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.14)" : "none",
                paddingRight: 16,
              }}
            >
              <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.02em", color: s.accent, lineHeight: 1.1 }}>
                {s.value}
                <span>{s.suffix}</span>
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>{en ? s.en : s.label}</div>
              {!en && <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{s.en}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
