import { ReactNode } from "react";
import { ACCENTS, Accent } from "@/lib/tokens";
import { h2, h2Sub } from "@/lib/ui";

/** Section heading: 10×10 colour square + VN title + EN sub-line. */
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
          <h2 style={h2}>{vi}</h2>
        </div>
        {right && <div style={{ marginLeft: "auto" }}>{right}</div>}
      </div>
      <p style={h2Sub}>{en}</p>
    </div>
  );
}
