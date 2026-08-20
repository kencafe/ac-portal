import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICES, HEADER_NAV, HEADER_CTA } from "@/data/services";
import { rewriteHref } from "@/lib/routes";
import { LangProvider } from "@/components/shared/LangContext";
import BrandStripe from "@/components/shared/BrandStripe";
import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";
import ServiceDetailView from "@/components/services/ServiceDetailView";

// SEC-002: these pages must render per-request. The CSP in src/middleware.ts
// carries a per-request script nonce with 'strict-dynamic', and 'strict-dynamic'
// makes the browser ignore the 'self' source — so a page prerendered at build
// time ships scripts with no nonce and the browser blocks every one of them
// (verified on dev: 12 un-nonced scripts, page renders but never hydrates).
// generateStaticParams was only a prerender optimisation; unknown slugs are
// still rejected by the notFound() below, and the page renders from static TS
// data so the per-request cost is negligible.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = SERVICES[slug];
  if (!s) return { title: "Dịch vụ" };
  return { title: s.name, description: s.positioning };
}

const nav = HEADER_NAV.map((n) => ({ label: n.label, href: rewriteHref(n.href) }));
const cta = { label: HEADER_CTA.label, href: rewriteHref(HEADER_CTA.href) };

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SERVICES[slug];
  if (!s) notFound();

  return (
    <LangProvider>
      <BrandStripe />
      <SiteHeader nav={nav} cta={cta} />
      <ServiceDetailView slug={slug} />
      <SiteFooter anchorBase="/" />
    </LangProvider>
  );
}
