"use client";

import Link from "next/link";
import {
  SERVICES,
  SERVICES_EN,
  otherServices,
  SECTION_HEADINGS,
  DETAIL_UI,
} from "@/data/services";
import type { Accent } from "@/data/services";
import { ACCENTS, Accent as TokenAccent, COLORS, CONTENT_MAX, GRAD, PHASE_COLORS, RADIUS } from "@/lib/tokens";
import { card, btnPrimary, btnDefault, tag } from "@/lib/ui";
import { routes } from "@/lib/routes";
import { useLang } from "@/components/shared/LangContext";
import Glyph from "@/components/shared/Glyph";

function RectPlate({ slug, color, w, h, g }: { slug: string; color: string; w: number; h: number; g: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: w,
        height: h,
        borderRadius: 6,
        background: color,
        flexShrink: 0,
      }}
    >
      <Glyph slug={slug} size={g} color="#fff" />
    </span>
  );
}

export default function ServiceDetailView({ slug }: { slug: string }) {
  const { lang } = useLang();
  const en = lang === "en";
  const s = SERVICES[slug];
  const sEn = SERVICES_EN[slug];
  const a = ACCENTS[s.accent as TokenAccent];
  const others = otherServices(s.slug);

  // Language-picked service fields (fall back to VN when EN is missing).
  const name = en ? sEn?.enName ?? s.name : s.name;
  const group = en ? sEn?.group ?? s.group : s.group;
  const positioning = en ? sEn?.positioning ?? s.positioning : s.positioning;
  const specs = en ? sEn?.specs ?? s.specs : s.specs;
  const deliverables = en ? sEn?.deliverables ?? s.deliverables : s.deliverables;
  const outcomes = en ? sEn?.outcomes ?? s.outcomes : s.outcomes;
  const stack = en ? sEn?.stack ?? s.stack : s.stack;

  const ctaTitle = (en ? DETAIL_UI.cta.title.en : DETAIL_UI.cta.title.vi).replace("{{ name }}", name);

  return (
    <>
      {/* Hero */}
      <section style={{ background: GRAD.hero, padding: "40px 24px 44px" }}>
        <div style={{ maxWidth: CONTENT_MAX, margin: "0 auto" }}>
          <nav style={{ fontSize: 13, color: COLORS.ink3, marginBottom: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href={routes.home} style={{ color: COLORS.ink3 }}>
              {en ? DETAIL_UI.breadcrumbHome.en : DETAIL_UI.breadcrumbHome.vi}
            </Link>
            <span>/</span>
            <Link href={routes.services} style={{ color: COLORS.ink3 }}>
              {en ? DETAIL_UI.breadcrumbServices.en : DETAIL_UI.breadcrumbServices.vi}
            </Link>
            <span>/</span>
            <span style={{ color: COLORS.ink2 }}>{name}</span>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <RectPlate slug={s.slug} color={a.color} w={54} h={34} g={22} />
            <span style={{ ...tag(s.accent as TokenAccent) }}>{group}</span>
          </div>

          <h1 style={{ fontSize: "clamp(28px, 3.2vw, 42px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.18, margin: 0, color: COLORS.ink }}>
            {name}
          </h1>
          <p style={{ fontSize: "clamp(15px, 1.5vw, 19px)", color: COLORS.ink3, margin: "8px 0 0" }}>{s.nameEn}</p>
          <p style={{ fontSize: 16.5, lineHeight: 1.75, color: COLORS.ink2, maxWidth: 760, margin: "18px 0 0" }}>{positioning}</p>

          <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
            <a href="/#contact" style={btnPrimary}>{en ? DETAIL_UI.heroPrimary.en : DETAIL_UI.heroPrimary.vi}</a>
            <a href="#phases" style={btnDefault}>{en ? DETAIL_UI.heroSecondary.en : DETAIL_UI.heroSecondary.vi}</a>
            <a href={`/downloads/AC-Portal-Datasheet-${s.code}.pdf`} download style={btnDefault}>
              {en ? "⬇ Download datasheet (PDF)" : "⬇ Tải datasheet (PDF)"}
            </a>
          </div>
        </div>
      </section>

      {/* Scope / specs */}
      <section id="scope" style={{ padding: "56px 24px" }}>
        <div style={{ maxWidth: CONTENT_MAX, margin: "0 auto" }}>
          <SecHead vi={SECTION_HEADINGS.scope.vi} en={SECTION_HEADINGS.scope.en} mark={s.accent as TokenAccent} lang={lang} />
          <div style={{ ...card, overflow: "hidden" }}>
            {specs.map((row, i) => (
              <div
                key={row.k}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(140px, 200px) 1fr",
                  gap: 20,
                  padding: "14px 18px",
                  borderBottom: i < specs.length - 1 ? `1px solid ${COLORS.split}` : "none",
                }}
              >
                <span style={{ fontSize: 13.5, color: COLORS.ink3 }}>{row.k}</span>
                <span style={{ fontSize: 14.5, color: COLORS.ink }}>{row.v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phases */}
      <section id="phases" style={{ padding: "56px 24px", background: COLORS.surface, borderTop: `1px solid ${COLORS.split}`, borderBottom: `1px solid ${COLORS.split}` }}>
        <div style={{ maxWidth: CONTENT_MAX, margin: "0 auto" }}>
          <SecHead vi={SECTION_HEADINGS.phases.vi} en={SECTION_HEADINGS.phases.en} mark={s.accent as TokenAccent} lang={lang} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, alignItems: "stretch" }}>
            {s.phases.map((p, pi) => {
              const items = en ? sEn?.phaseItems?.[pi] ?? p.items : p.items;
              return (
                <div key={p.num} style={{ ...card, height: "100%", overflow: "hidden" }}>
                  <div style={{ height: 3, background: `linear-gradient(90deg, ${PHASE_COLORS.join(", ")})` }} />
                  <div style={{ padding: "20px 20px 22px" }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.ink3 }}>
                      {en ? DETAIL_UI.phaseWord.en : DETAIL_UI.phaseWord.vi} {p.num}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.ink, margin: "6px 0 2px" }}>{en ? p.en : p.vi}</div>
                    <div style={{ fontSize: 13, color: COLORS.ink3, marginBottom: 14 }}>{en ? p.vi : p.en}</div>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                      {items.map((it) => (
                        <li key={it} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.5, color: COLORS.ink2 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: a.color, marginTop: 7, flexShrink: 0 }} />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Deliverables / Stack / Outcomes */}
      <section id="stack" style={{ padding: "56px 24px" }}>
        <div style={{ maxWidth: CONTENT_MAX, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            <div style={{ ...card, padding: 24 }}>
              <BlockHead>{en ? DETAIL_UI.blockHeadings.deliverables.en : DETAIL_UI.blockHeadings.deliverables.vi}</BlockHead>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {deliverables.map((d) => (
                  <li key={d} style={{ display: "flex", gap: 10, fontSize: 14.5, lineHeight: 1.55, color: COLORS.ink }}>
                    <span style={{ color: COLORS.brandGreen, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ ...card, padding: 24 }}>
              <BlockHead>{en ? DETAIL_UI.blockHeadings.outcomes.en : DETAIL_UI.blockHeadings.outcomes.vi}</BlockHead>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {outcomes.map((o) => (
                  <li key={o} style={{ display: "flex", gap: 10, fontSize: 14.5, lineHeight: 1.55, color: COLORS.ink }}>
                    <span style={{ color: a.color, fontWeight: 700, flexShrink: 0 }}>→</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ ...card, padding: 24, marginTop: 16 }}>
            <BlockHead>{en ? DETAIL_UI.blockHeadings.stack.en : DETAIL_UI.blockHeadings.stack.vi}</BlockHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {stack.map((t) => (
                <span
                  key={t}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 30,
                    padding: "0 12px",
                    borderRadius: RADIUS.chip,
                    background: COLORS.surfaceAlt,
                    border: `1px solid ${COLORS.split}`,
                    fontSize: 13.5,
                    color: COLORS.ink2,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Other services */}
      <section style={{ padding: "56px 24px", background: COLORS.surface, borderTop: `1px solid ${COLORS.split}` }}>
        <div style={{ maxWidth: CONTENT_MAX, margin: "0 auto" }}>
          <SecHead vi={SECTION_HEADINGS.others.vi} en={SECTION_HEADINGS.others.en} mark={s.accent as TokenAccent} lang={lang} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
            {others.map((o) => {
              const oa = ACCENTS[o.accent as TokenAccent];
              const oName = en ? SERVICES_EN[o.slug]?.enName ?? o.name : o.name;
              return (
                <Link
                  key={o.slug}
                  href={routes.serviceDetail(o.slug)}
                  style={{ ...card, padding: 16, display: "flex", alignItems: "center", gap: 12, color: COLORS.ink }}
                >
                  <RectPlate slug={o.slug} color={oa.color} w={42} h={26} g={17} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{oName}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA panel */}
      <section style={{ padding: "56px 24px" }}>
        <div style={{ maxWidth: CONTENT_MAX, margin: "0 auto" }}>
          <div
            style={{
              background: GRAD.statsPanel,
              borderRadius: RADIUS.panel,
              padding: "32px 28px",
              color: "#fff",
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 18px 44px -26px rgba(0,21,41,0.6)",
            }}
          >
            <div style={{ maxWidth: 560 }}>
              <div style={{ fontSize: 22, fontWeight: 600 }}>{ctaTitle}</div>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "rgba(255,255,255,0.75)", margin: "10px 0 0" }}>
                {en ? DETAIL_UI.cta.sub.en : DETAIL_UI.cta.sub.vi}
              </p>
              <div style={{ display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap", fontSize: 14 }}>
                <a href="tel:+84973391388" style={{ color: "#8FD1FF" }}>
                  {en ? DETAIL_UI.cta.phoneKey.en : DETAIL_UI.cta.phoneKey.vi}: +84 973 391 388
                </a>
                <a href="mailto:dungpv30@fpt.com.vn" style={{ color: "#8FD1FF" }}>
                  {en ? DETAIL_UI.cta.emailKey.en : DETAIL_UI.cta.emailKey.vi}: dungpv30@fpt.com.vn
                </a>
              </div>
            </div>
            <a href="/#contact" style={{ ...btnPrimary, background: "#fff", color: COLORS.navy900 }}>
              {en ? DETAIL_UI.cta.button.en : DETAIL_UI.cta.button.vi}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function SecHead({ vi, en, mark, lang }: { vi: string; en: string; mark: Accent; lang: string }) {
  const isEn = lang === "en";
  const primary = isEn ? en || vi : vi;
  const sub = isEn ? vi : en;
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 10, height: 10, borderRadius: 2, background: ACCENTS[mark].color }} />
        <h2 style={{ fontSize: "clamp(21px, 2.2vw, 28px)", fontWeight: 600, letterSpacing: "-0.015em", margin: 0, color: COLORS.ink }}>{primary}</h2>
      </div>
      <p style={{ fontSize: 14, color: COLORS.ink3, margin: "6px 0 0" }}>{sub}</p>
    </div>
  );
}

function BlockHead({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.ink, marginBottom: 16 }}>{children}</div>;
}
