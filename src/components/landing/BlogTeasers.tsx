import { BLOG_TEASERS, SECTION_TITLES, UI_STRINGS } from "@/data/landing";
import { ACCENTS, Accent, COLORS, RADIUS } from "@/lib/tokens";
import { tag } from "@/lib/ui";
import { routes } from "@/lib/routes";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import HoverCard from "@/components/shared/HoverCard";

export default function BlogTeasers() {
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {BLOG_TEASERS.map((post) => {
          const accent = post.accent as Accent;
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
              hoverStyle={{ borderColor: ACCENTS[accent].color, boxShadow: `0 10px 28px -14px ${ACCENTS[accent].color}66` }}
            >
              <div
                style={{
                  height: 168,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  backgroundImage: `url(/assets/cover-${post.slug}.png)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderTopLeftRadius: RADIUS.card,
                  borderTopRightRadius: RADIUS.card,
                }}
              />
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={tag(accent)}>{post.category}</span>
                  <span style={{ fontSize: 12.5, color: COLORS.ink3 }}>{post.date}</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.35, color: COLORS.ink }}>{post.title}</div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: COLORS.ink2, margin: "10px 0 14px" }}>{post.excerpt}</p>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: ACCENTS[accent].color }}>{UI_STRINGS.blogCardLink}</span>
              </div>
            </HoverCard>
          );
        })}
      </div>
    </Section>
  );
}
