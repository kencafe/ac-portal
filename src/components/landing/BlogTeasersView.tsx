"use client";

import { SECTION_TITLES, UI_STRINGS } from "@/data/landing";
import { accentAt, ACCENTS, COLORS, RADIUS } from "@/lib/tokens";
import { routes } from "@/lib/routes";
import type { Post } from "@/data/posts";
import CoverArt from "@/components/shared/CoverArt";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import HoverCard from "@/components/shared/HoverCard";
import { useLang } from "@/components/shared/LangContext";

export default function BlogTeasersView({ posts }: { posts: Post[] }) {
  const en = useLang().lang === "en";
  // Show only posts published to the active language page (VN vs EN), featured
  // first, capped at 3.
  const shown = posts
    .filter((p) => (p.lang ?? "vi") === (en ? "en" : "vi"))
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
    .slice(0, 3);

  return (
    <Section id="blog">
      <SectionHeading
        vi={SECTION_TITLES.blog.vi}
        en={SECTION_TITLES.blog.en}
        mark="blue"
        right={
          <a href={routes.blog} className="ns-arrow" style={{ fontSize: 14, fontWeight: 600, color: COLORS.brandBlue }}>
            {en ? UI_STRINGS.blogSeeAllEn : UI_STRINGS.blogSeeAll}
          </a>
        }
      />
      {shown.length === 0 ? (
        <p style={{ color: COLORS.ink3 }}>{en ? UI_STRINGS.blogEmptyEn : UI_STRINGS.blogEmpty}</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {shown.map((post, i) => {
            const accent = accentAt(i);
            const tone = post.tone || ACCENTS[accent].color;
            return (
              <HoverCard
                key={post.slug}
                as="a"
                href={routes.blogPost(post.slug)}
                style={{
                  display: "block",
                  background: "#fff",
                  border: `1px solid ${COLORS.split}`,
                  borderRadius: RADIUS.card,
                  color: COLORS.ink,
                }}
                hoverStyle={{ borderColor: tone, boxShadow: `0 10px 28px -14px ${tone}66` }}
              >
                <div style={{ borderTopLeftRadius: RADIUS.card, borderTopRightRadius: RADIUS.card, overflow: "hidden" }}>
                  <CoverArt coverUrl={post.coverUrl} title={post.title} cat={post.cat} tone={tone} height={168} />
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: tone, background: `${tone}14`, padding: "2px 9px", borderRadius: 4 }}>
                      {post.cat}
                    </span>
                    <span style={{ fontSize: 12.5, color: COLORS.ink3 }}>{post.date}</span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.35, color: COLORS.ink }}>{post.title}</div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: COLORS.ink2, margin: "10px 0 14px" }}>{post.excerpt}</p>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: tone }}>
                    {en ? UI_STRINGS.blogCardLinkEn : UI_STRINGS.blogCardLink}
                  </span>
                </div>
              </HoverCard>
            );
          })}
        </div>
      )}
    </Section>
  );
}
