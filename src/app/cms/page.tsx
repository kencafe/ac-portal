import type { Metadata } from "next";
import CmsApp from "@/components/cms/CmsApp";

export const metadata: Metadata = {
  title: "Content Studio · CMS",
  robots: { index: false, follow: false },
};

export default function CmsPage() {
  return <CmsApp />;
}
