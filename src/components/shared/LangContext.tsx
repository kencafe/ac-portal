"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "vi" | "en";

type LangCtx = { lang: Lang; setLang: (l: Lang) => void };

const Ctx = createContext<LangCtx>({ lang: "vi", setLang: () => {} });

const STORAGE_KEY = "ns-lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("vi");

  // Initialise from ?lang= (shareable) then localStorage; reflect on <html lang>.
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("lang");
      const stored = localStorage.getItem(STORAGE_KEY);
      const init: Lang = q === "en" || q === "vi" ? q : stored === "en" || stored === "vi" ? stored : "vi";
      setLangState(init);
      document.documentElement.lang = init;
    } catch {
      /* SSR / no window */
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l;
    } catch {
      /* ignore */
    }
  };

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

/** Pick the string for the active language. */
export const pick = (lang: Lang, vi: string, en: string): string => (lang === "en" ? en || vi : vi);
