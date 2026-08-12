import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICES, ORDER, HEADER_NAV, HEADER_CTA } from "@/data/services";
import { rewriteHref } from "@/lib/routes";
import { LangProvider } from "@/components/shared/LangContext";
import BrandStripe from "@/components/shared/BrandStripe";
import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";
import ServiceDetailView from "@/components/services/ServiceDetailView";

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
