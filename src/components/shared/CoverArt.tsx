"use client";

import { useState } from "react";
import { COLORS, RADIUS } from "@/lib/tokens";

// Post cover that ALWAYS shows something intentional:
//  - a real image when the post has a working cover (source og:image or a local
//    asset), else
//  - a branded "title-card" (gradient + category + article title) so posts with
//    no image — or a broken/missing cover file — never render as a blank block.
// Client component: an <img> onError swaps to the title-card at runtime, which
// also rescues legacy posts whose cover file no longer exists.
export default function CoverArt({
  coverUrl,
  title,
  cat,
  tone,
  height,
  minHeight,
  rounded = false,
  showTitle = true,
  compact = false,
}: {
  coverUrl?: string;
  title: string;
  cat?: string;
  tone?: string;
  height: number | string;
  minHeight?: number;
  rounded?: boolean;
  showTitle?: boolean;
  compact?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const t = tone || COLORS.brandBlue;
  const hasImg = !!coverUrl && !failed;
  // Absolute URLs and root-relative paths (/api/cover, /assets/…) are used as-is;
  // only bare asset paths (assets/…) get a leading slash — avoids `//api/cover`.
  const src = !coverUrl ? "" : /^(https?:)?\/\//.test(coverUrl) || coverUrl.startsWith("/") ? coverUrl : `/${coverUrl}`;

  return (
    <div
      style={{
        position: "relative",
        height,
        minHeight,
        borderRadius: rounded ? RADIUS.card : 0,
        overflow: "hidden",
        background: `linear-gradient(135deg, ${t} 0%, ${t}80 100%)`,
      }}
    >
      {hasImg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={title}
          onError={() => setFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
        />
      )}
      {!hasImg && !compact && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "18px 20px", color: "#fff" }}>
          {/* subtle motif */}
          <span aria-hidden style={{ position: "absolute", right: -30, bottom: -30, width: 160, height: 160, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.18)" }} />
          <span aria-hidden style={{ position: "absolute", right: 24, top: 24, width: 70, height: 70, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.14)" }} />
          <span style={{ alignSelf: "flex-start", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: "rgba(255,255,255,0.18)", padding: "3px 10px", borderRadius: 4 }}>
            {cat || "FPT-IS NS"}
          </span>
          {showTitle && (
            <span style={{ fontSize: typeof height === "number" && height < 160 ? 15 : 20, fontWeight: 700, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", textShadow: "0 1px 2px rgba(0,0,0,0.15)" }}>
              {title}
            </span>
          )}
          <span style={{ fontSize: 11.5, fontWeight: 600, opacity: 0.9 }}>FPT-IS · Next Gen Service</span>
        </div>
      )}
    </div>
  );
}
