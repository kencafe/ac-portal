import type { Metadata } from "next";
import CmsApp from "@/components/cms/CmsApp";

export const metadata: Metadata = {
  title: "Content Studio · CMS",
  robots: { index: false, follow: false },
};

// SEC-002: CmsApp is a client component, so the whole admin depends on
// hydration — and the nonce'd 'strict-dynamic' CSP from src/middleware.ts
// blocks scripts on any page prerendered at build time (no nonce in the
// stored HTML). Render per-request so Next can stamp the request's nonce on.
export const dynamic = "force-dynamic";

export default function CmsPage() {
  return <CmsApp />;
}
