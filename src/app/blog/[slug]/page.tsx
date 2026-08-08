import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HEADER, ARTICLE_PAGE, SECTION_HEADERS, Post, Block } from "@/data/posts";
import { getPost, listPublished } from "@/lib/store";
import { COLORS, CONTENT_MAX, RADIUS } from "@/lib/tokens";
import { card, btnPrimary, btnDefault } from "@/lib/ui";
import { rewriteHref, routes } from "@/lib/routes";
import { LangProvider } from "@/components/shared/LangContext";
import BrandStripe from "@/components/shared/BrandStripe";
import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) return { title: "Bài viết" };
  return { title: p.title, description: p.excerpt };
}

const nav = HEADER.navItems.map((n) => ({ label: n.label, href: rewriteHref(n.href) }));
const cta = { label: HEADER.ctaLabel, href: rewriteHref(HEADER.ctaHref) };

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "h":
      return <h2 style={{ fontSize: "clamp(19px, 1.9vw, 24px)", fontWeight: 600, letterSpacing: "-0.01em", color: COLORS.ink, margin: "34px 0 12px" }}>{block.text}</h2>;
    case "p":
      return <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "rgba(0,0,0,0.78)", margin: "0 0 18px" }}>{block.text}</p>;
    case "quote":
      return (
        <blockquote style={{ borderLeft: `3px solid ${COLORS.brandBlue}`, background: "#fff", borderRadius: "0 8px 8px 0", padding: "16px 22px", margin: "0 0 22px", fontSize: 17, fontWeight: 500, lineHeight: 1.6, color: COLORS.ink, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          {block.text}
        </blockquote>
      );
    case "list":
      return (
        <ul style={{ listStyle: "none", margin: "0 0 22px", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {(block.items ?? []).map((it, i) => (
            <li key={i} style={{ display: "flex", gap: 12, fontSize: 16.5, lineHeight: 1.75, color: "rgba(0,0,0,0.78)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.brandBlue, marginTop: 11, flexShrink: 0 }} />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

function Avatar({ initials, tone, size }: { initials: string; tone: string; size: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: "50%", background: tone, color: "#fff", fontSize: size * 0.38, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {initials}
    </span>
  );
}

function RelatedCard({ post }: { post: Post }) {
  return (
    <Link href={routes.blogPost(post.slug)} style={{ ...card, display: "flex", flexDirection: "column", overflow: "hidden", color: COLORS.ink }}>
      <div style={{ height: 140, backgroundImage: `url(/${post.coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div style={{ padding: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: post.tone }}>{post.cat}</span>
        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35, color: COLORS.ink, marginTop: 6 }}>{post.title}</div>
      </div>
    </Link>
  );
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || post.status !== "published") notFound();
  const related = (await listPublished()).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <LangProvider>
      <BrandStripe />
      <SiteHeader nav={nav} cta={cta} anchorBase="/" />

      <article style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 56px" }}>
        {/* Breadcrumb */}
        <nav style={{ fontSize: 13, color: COLORS.ink3, marginBottom: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href={routes.home} style={{ color: COLORS.ink3 }}>{ARTICLE_PAGE.breadcrumb.home}</Link>
          <span>/</span>
          <Link href={routes.blog} style={{ color: COLORS.ink3 }}>{ARTICLE_PAGE.breadcrumb.blog}</Link>
          <span>/</span>
          <span style={{ color: COLORS.ink2 }}>{post.cat}</span>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, fontSize: 13, color: COLORS.ink3 }}>
          <span style={{ fontWeight: 600, color: post.tone }}>{post.cat}</span>
          <span>·</span>
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.read}</span>
        </div>

        <h1 style={{ fontSize: "clamp(28px, 3.4vw, 42px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.18, margin: 0, color: COLORS.ink }}>{post.title}</h1>
        <p style={{ fontSize: "clamp(16px, 1.6vw, 19px)", lineHeight: 1.6, color: COLORS.ink2, margin: "16px 0 0" }}>{post.excerpt}</p>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 28px" }}>
          <Avatar initials={post.initials} tone={post.tone} size={34} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{post.author}</div>
            <div style={{ fontSize: 12.5, color: COLORS.ink3 }}>{post.role}</div>
          </div>
        </div>

        <div style={{ height: 320, borderRadius: RADIUS.card, backgroundImage: `url(/${post.coverUrl})`, backgroundSize: "cover", backgroundPosition: "center", marginBottom: 32 }} />

        <div>
          {post.blocks.map((b, i) => (
            <BlockView key={i} block={b} />
          ))}
        </div>

        {/* Tags */}
        <div style={{ borderTop: `1px solid ${COLORS.split}`, marginTop: 24, paddingTop: 20, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {post.tags.map((t) => (
            <span key={t} style={{ fontSize: 12.5, color: COLORS.ink2, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.split}`, borderRadius: RADIUS.chip, padding: "4px 10px" }}>
              #{t}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          <Link href={routes.blog} style={btnDefault}>{ARTICLE_PAGE.footerButtons.back}</Link>
          <a href="/#contact" style={btnPrimary}>{ARTICLE_PAGE.footerButtons.contact}</a>
        </div>
      </article>

      {/* Related */}
      <section style={{ background: COLORS.surface, borderTop: `1px solid ${COLORS.split}`, padding: "48px 24px" }}>
        <div style={{ maxWidth: CONTENT_MAX, margin: "0 auto" }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 600, letterSpacing: "-0.015em", margin: 0, color: COLORS.ink }}>{SECTION_HEADERS.related.h2}</h2>
            <p style={{ fontSize: 13.5, color: COLORS.ink3, margin: "4px 0 0" }}>{SECTION_HEADERS.related.sub}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {related.map((p) => (
              <RelatedCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>

      <SiteFooter anchorBase="/" />
    </LangProvider>
  );
}
