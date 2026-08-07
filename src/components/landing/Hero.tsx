import Image from "next/image";
import { HERO, STATS } from "@/data/landing";
import { COLORS, GRAD, CONTENT_MAX } from "@/lib/tokens";
import { btnPrimary, btnDefault } from "@/lib/ui";

export default function Hero() {
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
                fontSize: "clamp(30px, 3.6vw, 46px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.16,
                margin: 0,
                color: COLORS.ink,
              }}
            >
              {HERO.h1}
            </h1>
            <p
              style={{
                fontSize: "clamp(15px, 1.5vw, 19px)",
                fontWeight: 400,
                color: COLORS.ink3,
                margin: "10px 0 0",
              }}
            >
              {HERO.h1sub}
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.72, color: COLORS.ink2, maxWidth: 660, margin: "20px 0 0" }}>
              {HERO.lead}
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <a href="#contact" style={btnPrimary}>
                {HERO.buttons.primary}
              </a>
              <a href="#services" style={btnDefault}>
                {HERO.buttons.secondary}
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
              {HERO.panel.chips.map((chip) => (
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
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>{s.label}</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{s.en}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
