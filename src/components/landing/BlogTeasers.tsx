import { listPublished } from "@/lib/store";
import { SECTION_TITLES, UI_STRINGS } from "@/data/landing";
import { accentAt, ACCENTS, COLORS, RADIUS } from "@/lib/tokens";
import { routes } from "@/lib/routes";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import HoverCard from "@/components/shared/HoverCard";

// Auto-reflects posts published in the CMS.
export default async function BlogTeasers() {
  const posts = (await listPublished(3)).slice(0, 3);

  return (
    <Section id="blog">
      <SectionHeading
        vi={SECTION_TITLES.blog.vi}
        en={SECTION_TITLES.blog.en}
        mark="blue"
        right={
          <a href={routes.blog} className="ns-arrow" style={{ fontSize: 14, fontWeight: 600, color: COLORS.brandBlue }}>
            {UI_STRINGS.blogSeeAll}
          </a>
        }
      />
      {posts.length === 0 ? (
        <p style={{ color: COLORS.ink3 }}>Chưa có bài viết nào được xuất bản.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {posts.map((post, i) => {
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
                <div
                  style={{
                    height: 168,
                    background: `${tone}14 url(/${post.coverUrl}) center/cover no-repeat`,
                    borderTopLeftRadius: RADIUS.card,
                    borderTopRightRadius: RADIUS.card,
                  }}
                />
                <div style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: tone, background: `${tone}14`, padding: "2px 9px", borderRadius: 4 }}>
                      {post.cat}
                    </span>
                    <span style={{ fontSize: 12.5, color: COLORS.ink3 }}>{post.date}</span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.35, color: COLORS.ink }}>{post.title}</div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: COLORS.ink2, margin: "10px 0 14px" }}>{post.excerpt}</p>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: tone }}>{UI_STRINGS.blogCardLink}</span>
                </div>
              </HoverCard>
            );
          })}
        </div>
      )}
    </Section>
  );
}
