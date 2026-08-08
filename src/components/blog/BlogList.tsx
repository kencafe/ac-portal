"use client";

import { CSSProperties, useMemo, useState } from "react";
import Link from "next/link";
import { CATS, LIST_HERO, SECTION_HEADERS, EMPTY_STATE, SUBSCRIBE_PANEL, READ_MORE_LABEL, Post } from "@/data/posts";
import { COLORS, CONTENT_MAX, GRAD, RADIUS } from "@/lib/tokens";
import { card, coverBackground } from "@/lib/ui";
import { routes } from "@/lib/routes";
import Icon from "@/components/shared/Icon";

function Avatar({ initials, tone }: { initials: string; tone: string }) {
  return (
    <span
      style={{
        width: 26,
        height: 26,
        borderRadius: "50%",
        background: tone,
        color: "#fff",
        fontSize: 10.5,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}

function catTag(tone: string): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 9px",
    borderRadius: RADIUS.chip,
    background: `${tone}14`,
    color: tone,
    fontSize: 12,
    fontWeight: 600,
  };
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link href={routes.blogPost(post.slug)} style={{ ...card, display: "flex", flexDirection: "column", overflow: "hidden", color: COLORS.ink }}>
      <div style={{ height: 168, background: coverBackground(post.coverUrl, post.tone) }} />
      <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={catTag(post.tone)}>{post.cat}</span>
          <span style={{ fontSize: 12.5, color: COLORS.ink3 }}>{post.date}</span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.35, color: COLORS.ink }}>{post.title}</div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: COLORS.ink2, margin: "10px 0 16px" }}>{post.excerpt}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto" }}>
          <Avatar initials={post.initials} tone={post.tone} />
          <span style={{ fontSize: 12.5, color: COLORS.ink2 }}>{post.author}</span>
          <span style={{ fontSize: 12.5, color: COLORS.ink3, marginLeft: "auto" }}>{post.read}</span>
        </div>
      </div>
    </Link>
  );
}

export default function BlogList({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Tất cả");
  const [subscribed, setSubscribed] = useState(false);
  const [subEmail, setSubEmail] = useState("");
  const [subErr, setSubErr] = useState("");

  const featured = useMemo(() => posts.find((p) => p.featured) ?? posts[0], [posts]);
  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      posts
        .filter((p) => cat === "Tất cả" || p.cat === cat)
        .filter((p) => !q || (p.title + " " + p.excerpt + " " + (p.tags ?? []).join(" ")).toLowerCase().includes(q)),
    [posts, cat, q],
  );

  const showFeatured = cat === "Tất cả" && !q;
  const listed = showFeatured ? filtered.filter((p) => !p.featured) : filtered;

  return (
    <>
      {/* Hero */}
      <section style={{ background: GRAD.hero, padding: "56px 24px 40px" }}>
        <div style={{ maxWidth: CONTENT_MAX, margin: "0 auto" }}>
          <span style={{ display: "inline-flex", padding: "4px 12px", borderRadius: 16, background: "#E6F1F9", border: "1px solid #B3D5EA", color: COLORS.brandBlue, fontSize: 12.5, fontWeight: 600 }}>
            {LIST_HERO.tag}
          </span>
          <h1 style={{ fontSize: "clamp(28px, 3.4vw, 42px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.16, margin: "18px 0 0", color: COLORS.ink }}>
            {LIST_HERO.h1}
          </h1>
          <p style={{ fontSize: "clamp(15px, 1.5vw, 19px)", color: COLORS.ink3, margin: "8px 0 0" }}>{LIST_HERO.sub}</p>
          <p style={{ fontSize: 16, lineHeight: 1.72, color: COLORS.ink2, maxWidth: 720, margin: "18px 0 0" }}>{LIST_HERO.lead}</p>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: 420, marginTop: 24 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <Icon name="search" size={16} color={COLORS.ink3} />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={LIST_HERO.searchPlaceholder}
              style={{ width: "100%", height: 40, padding: "0 12px 0 36px", borderRadius: RADIUS.button, border: `1px solid ${COLORS.border}`, fontSize: 14, background: "#fff", outline: "none" }}
            />
          </div>
          <div style={{ fontSize: 13, color: COLORS.ink3, marginTop: 10 }}>
            {filtered.length} {LIST_HERO.countLabelSuffix}
          </div>

          {/* Category chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {CATS.map((c) => {
              const active = c === cat;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  style={{
                    height: 32,
                    padding: "0 14px",
                    borderRadius: 16,
                    border: `1px solid ${active ? COLORS.brandBlue : COLORS.border}`,
                    background: active ? COLORS.brandBlue : "#fff",
                    color: active ? "#fff" : COLORS.ink2,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all .2s",
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: CONTENT_MAX, margin: "0 auto", padding: "40px 24px 56px" }}>
        {/* Featured */}
        {showFeatured && featured && (
          <div style={{ marginBottom: 40 }}>
            <SecHead h2={SECTION_HEADERS.featured.h2} sub={SECTION_HEADERS.featured.sub} />
            <Link href={routes.blogPost(featured.slug)} style={{ ...card, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", overflow: "hidden", color: COLORS.ink }}>
              <div style={{ minHeight: 260, background: coverBackground(featured.coverUrl, featured.tone) }} />
              <div style={{ padding: 28, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={catTag(featured.tone)}>{featured.cat}</span>
                  <span style={{ fontSize: 12.5, color: COLORS.ink3 }}>{featured.date}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.3, color: COLORS.ink }}>{featured.title}</div>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: COLORS.ink2, margin: "12px 0 18px" }}>{featured.excerpt}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto" }}>
                  <Avatar initials={featured.initials} tone={featured.tone} />
                  <span style={{ fontSize: 13, color: COLORS.ink2 }}>{featured.author}</span>
                  <span style={{ fontSize: 13, color: COLORS.ink3, marginLeft: "auto" }}>{featured.read}</span>
                </div>
              </div>
            </Link>
          </div>
        )}

        <SecHead
          h2={cat === "Tất cả" ? SECTION_HEADERS.allArticlesDefaultHeading : cat}
          sub={SECTION_HEADERS.allArticlesSub}
        />

        {listed.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {listed.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        ) : (
          <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: RADIUS.card, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.ink }}>{EMPTY_STATE.title}</div>
            <p style={{ fontSize: 14, color: COLORS.ink2, margin: "8px 0 16px" }}>{EMPTY_STATE.desc}</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCat("Tất cả");
              }}
              style={{ height: 36, padding: "0 16px", borderRadius: RADIUS.button, border: `1px solid ${COLORS.border}`, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
            >
              {EMPTY_STATE.resetButton}
            </button>
          </div>
        )}

        {/* Subscribe panel */}
        <div style={{ background: GRAD.statsPanel, borderRadius: RADIUS.panel, padding: "32px 28px", marginTop: 48, color: "#fff" }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{SUBSCRIBE_PANEL.title}</div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", margin: "8px 0 18px" }}>{SUBSCRIBE_PANEL.sub}</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const email = subEmail.trim();
              if (!email) return;
              try {
                const res = await fetch("/api/v1/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
                if (res.ok) setSubscribed(true);
                else { const d = await res.json().catch(() => ({})); setSubErr(d.error || "Đăng ký thất bại"); }
              } catch { setSubErr("Lỗi kết nối, thử lại sau."); }
            }}
            style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
          >
            <input
              type="email"
              required
              value={subEmail}
              onChange={(e) => { setSubEmail(e.target.value); setSubErr(""); }}
              placeholder={SUBSCRIBE_PANEL.emailPlaceholder}
              style={{ flex: "1 1 240px", height: 46, padding: "0 14px", borderRadius: RADIUS.button, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, outline: "none" }}
            />
            <button
              type="submit"
              disabled={subscribed}
              style={{ height: 46, padding: "0 22px", borderRadius: RADIUS.button, border: "none", cursor: subscribed ? "default" : "pointer", fontSize: 14, fontWeight: 600, color: "#fff", background: subscribed ? COLORS.brandGreen : COLORS.brandOrange, transition: "background .2s" }}
            >
              {subscribed ? SUBSCRIBE_PANEL.buttonLabelSubscribed : SUBSCRIBE_PANEL.buttonLabel}
            </button>
          </form>
          {subErr && <p style={{ fontSize: 13, color: "#FFD2C7", marginTop: 10 }}>{subErr}</p>}
        </div>
      </div>
    </>
  );
}

function SecHead({ h2, sub }: { h2: string; sub: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: "clamp(20px, 2vw, 26px)", fontWeight: 600, letterSpacing: "-0.015em", margin: 0, color: COLORS.ink }}>{h2}</h2>
      <p style={{ fontSize: 13.5, color: COLORS.ink3, margin: "4px 0 0" }}>{sub}</p>
    </div>
  );
}
