import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  SERVICES,
  ORDER,
  otherServices,
  HEADER_NAV,
  HEADER_CTA,
  SECTION_HEADINGS,
  BLOCK_HEADINGS,
  CTA_PANEL,
} from "@/data/services";
import { ACCENTS, Accent, COLORS, CONTENT_MAX, GRAD, PHASE_COLORS, RADIUS } from "@/lib/tokens";
import { card, btnPrimary, btnDefault, tag } from "@/lib/ui";
import { rewriteHref, routes } from "@/lib/routes";
import { LangProvider } from "@/components/shared/LangContext";
import BrandStripe from "@/components/shared/BrandStripe";
import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";
import Glyph from "@/components/shared/Glyph";

export function generateStaticParams() {
  return ORDER.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = SERVICES[slug];
  if (!s) return { title: "Dịch vụ" };
  return { title: s.name, description: s.positioning };
}

const nav = HEADER_NAV.map((n) => ({ label: n.label, href: rewriteHref(n.href) }));
const cta = { label: HEADER_CTA.label, href: rewriteHref(HEADER_CTA.href) };

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

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SERVICES[slug];
  if (!s) notFound();
  const a = ACCENTS[s.accent as Accent];
  const others = otherServices(s.slug);

  return (
    <LangProvider>
      <BrandStripe />
      <SiteHeader nav={nav} cta={cta} />

      {/* Hero */}
      <section style={{ background: GRAD.hero, padding: "40px 24px 44px" }}>
        <div style={{ maxWidth: CONTENT_MAX, margin: "0 auto" }}>
          <nav style={{ fontSize: 13, color: COLORS.ink3, marginBottom: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href={routes.home} style={{ color: COLORS.ink3 }}>Trang chính</Link>
            <span>/</span>
            <Link href={routes.services} style={{ color: COLORS.ink3 }}>Dịch vụ</Link>
            <span>/</span>
            <span style={{ color: COLORS.ink2 }}>{s.name}</span>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <RectPlate slug={s.slug} color={a.color} w={54} h={34} g={22} />
            <span style={{ ...tag(s.accent as Accent) }}>{s.group}</span>
          </div>

          <h1 style={{ fontSize: "clamp(28px, 3.2vw, 42px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.18, margin: 0, color: COLORS.ink }}>
            {s.name}
          </h1>
          <p style={{ fontSize: "clamp(15px, 1.5vw, 19px)", color: COLORS.ink3, margin: "8px 0 0" }}>{s.nameEn}</p>
          <p style={{ fontSize: 16.5, lineHeight: 1.75, color: COLORS.ink2, maxWidth: 760, margin: "18px 0 0" }}>{s.positioning}</p>

          <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
            <a href="/#contact" style={btnPrimary}>Đặt buổi tư vấn</a>
            <a href="#phases" style={btnDefault}>Xem hạng mục công việc</a>
          </div>
        </div>
      </section>

      {/* Scope / specs */}
      <section id="scope" style={{ padding: "56px 24px" }}>
        <div style={{ maxWidth: CONTENT_MAX, margin: "0 auto" }}>
          <SecHead vi={SECTION_HEADINGS.scope.vi} en={SECTION_HEADINGS.scope.en} mark={s.accent as Accent} />
          <div style={{ ...card, overflow: "hidden" }}>
            {s.specs.map((row, i) => (
              <div
                key={row.k}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(140px, 200px) 1fr",
                  gap: 20,
                  padding: "14px 18px",
                  borderBottom: i < s.specs.length - 1 ? `1px solid ${COLORS.split}` : "none",
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
          <SecHead vi={SECTION_HEADINGS.phases.vi} en={SECTION_HEADINGS.phases.en} mark={s.accent as Accent} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, alignItems: "stretch" }}>
            {s.phases.map((p) => (
              <div key={p.num} style={{ ...card, height: "100%", overflow: "hidden" }}>
                <div style={{ height: 3, background: `linear-gradient(90deg, ${PHASE_COLORS.join(", ")})` }} />
                <div style={{ padding: "20px 20px 22px" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.ink3 }}>
                    Giai đoạn {p.num}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.ink, margin: "6px 0 2px" }}>{p.vi}</div>
                  <div style={{ fontSize: 13, color: COLORS.ink3, marginBottom: 14 }}>{p.en}</div>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    {p.items.map((it) => (
                      <li key={it} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.5, color: COLORS.ink2 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: a.color, marginTop: 7, flexShrink: 0 }} />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables / Stack / Outcomes */}
      <section id="stack" style={{ padding: "56px 24px" }}>
        <div style={{ maxWidth: CONTENT_MAX, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            <div style={{ ...card, padding: 24 }}>
              <BlockHead>{BLOCK_HEADINGS.deliverables}</BlockHead>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {s.deliverables.map((d) => (
                  <li key={d} style={{ display: "flex", gap: 10, fontSize: 14.5, lineHeight: 1.55, color: COLORS.ink }}>
                    <span style={{ color: COLORS.brandGreen, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ ...card, padding: 24 }}>
              <BlockHead>{BLOCK_HEADINGS.outcomes}</BlockHead>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {s.outcomes.map((o) => (
                  <li key={o} style={{ display: "flex", gap: 10, fontSize: 14.5, lineHeight: 1.55, color: COLORS.ink }}>
                    <span style={{ color: a.color, fontWeight: 700, flexShrink: 0 }}>→</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ ...card, padding: 24, marginTop: 16 }}>
            <BlockHead>{BLOCK_HEADINGS.stack}</BlockHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {s.stack.map((t) => (
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
          <SecHead vi={SECTION_HEADINGS.others.vi} en={SECTION_HEADINGS.others.en} mark={s.accent as Accent} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
            {others.map((o) => {
              const oa = ACCENTS[o.accent as Accent];
              return (
                <Link
                  key={o.slug}
                  href={routes.serviceDetail(o.slug)}
                  style={{ ...card, padding: 16, display: "flex", alignItems: "center", gap: 12, color: COLORS.ink }}
                >
                  <RectPlate slug={o.slug} color={oa.color} w={42} h={26} g={17} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{o.name}</span>
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
              <div style={{ fontSize: 22, fontWeight: 600 }}>{CTA_PANEL.title.replace("{{ name }}", s.name)}</div>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "rgba(255,255,255,0.75)", margin: "10px 0 0" }}>{CTA_PANEL.sub}</p>
              <div style={{ display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap", fontSize: 14 }}>
                <a href={CTA_PANEL.phone.href} style={{ color: "#8FD1FF" }}>{CTA_PANEL.phone.key}: {CTA_PANEL.phone.value}</a>
                <a href={CTA_PANEL.email.href} style={{ color: "#8FD1FF" }}>{CTA_PANEL.email.key}: {CTA_PANEL.email.value}</a>
              </div>
            </div>
            <a href="/#contact" style={{ ...btnPrimary, background: "#fff", color: COLORS.navy900 }}>{CTA_PANEL.button.label}</a>
          </div>
        </div>
      </section>

      <SiteFooter anchorBase="/" />
    </LangProvider>
  );
}

function SecHead({ vi, en, mark }: { vi: string; en: string; mark: Accent }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 10, height: 10, borderRadius: 2, background: ACCENTS[mark].color }} />
        <h2 style={{ fontSize: "clamp(21px, 2.2vw, 28px)", fontWeight: 600, letterSpacing: "-0.015em", margin: 0, color: COLORS.ink }}>{vi}</h2>
      </div>
      <p style={{ fontSize: 14, color: COLORS.ink3, margin: "6px 0 0" }}>{en}</p>
    </div>
  );
}

function BlockHead({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.ink, marginBottom: 16 }}>{children}</div>;
}
