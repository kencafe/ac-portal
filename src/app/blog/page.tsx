import type { Metadata } from "next";
import { HEADER, LIST_HERO } from "@/data/posts";
import { rewriteHref } from "@/lib/routes";
import { LangProvider } from "@/components/shared/LangContext";
import BrandStripe from "@/components/shared/BrandStripe";
import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";
import BlogList from "@/components/blog/BlogList";
import { listPublished } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog kỹ thuật",
  description: LIST_HERO.lead,
};

const nav = HEADER.navItems.map((n) => ({ label: n.label, href: rewriteHref(n.href) }));
const cta = { label: HEADER.ctaLabel, href: rewriteHref(HEADER.ctaHref) };

export default async function BlogPage() {
  const posts = await listPublished();
  return (
    <LangProvider>
      <BrandStripe />
      <SiteHeader nav={nav} cta={cta} anchorBase="/" />
      <main>
        <BlogList posts={posts} />
      </main>
      <SiteFooter anchorBase="/" />
    </LangProvider>
  );
}
