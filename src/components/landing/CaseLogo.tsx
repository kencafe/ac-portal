"use client";

import { useState } from "react";
import { COLORS } from "@/lib/tokens";

// A customer logo cell. Shows the image when it loads; if the file is missing
// (many logos are placeholders awaiting the real asset), it falls back to the
// customer name as a text chip so the wall never shows a broken-image icon.
export default function CaseLogo({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div style={{ height: 72, background: "#fff", padding: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {failed ? (
        <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink2, textAlign: "center", letterSpacing: "0.01em" }}>{name}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/${src}`}
          alt={name}
          onError={() => setFailed(true)}
          style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
          loading="lazy"
        />
      )}
    </div>
  );
}
