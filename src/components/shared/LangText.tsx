"use client";

import { useLang } from "./LangContext";

/**
 * Renders a string in the active language. Usable inside server components
 * (it is a client leaf) to localize small chrome labels without converting the
 * whole page to a client component. Falls back to VN when EN is empty.
 */
export default function LangText({ vi, en }: { vi: string; en: string }) {
  const { lang } = useLang();
  return <>{lang === "en" ? en || vi : vi}</>;
}
