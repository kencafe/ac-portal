"use client";

import { ReactNode } from "react";
import { ACCENTS, Accent } from "@/lib/tokens";
import { h2, h2Sub } from "@/lib/ui";
import { useLang } from "./LangContext";

/** Section heading: colour square + title in the active language + sub-line in
 *  the other language. VN is primary by default; EN becomes primary when the
 *  language toggle is set to English. */
export default function SectionHeading({
  vi,
  en,
  mark = "blue",
  right,
}: {
  vi: string;
  en: string;
  mark?: Accent;
  right?: ReactNode;
}) {
  const { lang } = useLang();
  const primary = lang === "en" ? en || vi : vi;
  // In EN mode show the English heading only (no Vietnamese sub-line); in VN mode
  // keep the English sub-line as the bilingual accent.
  const sub = lang === "en" ? "" : en;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: ACCENTS[mark].color,
              flexShrink: 0,
            }}
          />
          <h2 style={h2}>{primary}</h2>
        </div>
        {right && <div style={{ marginLeft: "auto" }}>{right}</div>}
      </div>
      {sub && <p style={h2Sub}>{sub}</p>}
    </div>
  );
}
