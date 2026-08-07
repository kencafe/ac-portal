"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "vi" | "en";

type LangCtx = { lang: Lang; setLang: (l: Lang) => void };

const Ctx = createContext<LangCtx>({ lang: "vi", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("vi");
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
