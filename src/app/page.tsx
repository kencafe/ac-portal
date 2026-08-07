import { HEADER } from "@/data/landing";
import { rewriteHref } from "@/lib/routes";
import { LangProvider } from "@/components/shared/LangContext";
import BrandStripe from "@/components/shared/BrandStripe";
import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";
import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import Services from "@/components/landing/Services";
import Model from "@/components/landing/Model";
import Industries from "@/components/landing/Industries";
import Partners from "@/components/landing/Partners";
import BlogTeasers from "@/components/landing/BlogTeasers";
import Cases from "@/components/landing/Cases";
import Contact from "@/components/landing/Contact";

const nav = HEADER.nav.map((n) => ({ label: n.label, href: rewriteHref(n.href) }));
const cta = { label: HEADER.ctaButton.label, href: HEADER.ctaButton.href };

export default function LandingPage() {
  return (
    <LangProvider>
      <BrandStripe />
      <SiteHeader nav={nav} cta={cta} />
      <main>
        <Hero />
        <About />
        <Services />
        <Model />
        <Industries />
        <Partners />
        <BlogTeasers />
        <Cases />
        <Contact />
      </main>
      <SiteFooter />
    </LangProvider>
  );
}
