"use client";

import { useEffect, useState } from "react";
import type { Block } from "@/data/posts";
import { COLORS } from "@/lib/tokens";
import { useLang } from "@/components/shared/LangContext";

// Renders one content block. Mirrors the server BlockView on the article page.
function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "h":
      return <h2 style={{ fontSize: "clamp(19px, 1.9vw, 24px)", fontWeight: 600, letterSpacing: "-0.01em", color: COLORS.ink, margin: "34px 0 12px" }}>{block.text}</h2>;
    case "p":
      return <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "rgba(0,0,0,0.78)", margin: "0 0 18px" }}>{block.text}</p>;
    case "quote":
      return (
        <blockquote style={{ borderLeft: `3px solid ${COLORS.brandBlue}`, background: "#fff", borderRadius: "0 8px 8px 0", padding: "16px 22px", margin: "0 0 22px", fontSize: 17, fontWeight: 500, lineHeight: 1.6, color: COLORS.ink, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          {block.text}
        </blockquote>
      );
    case "img":
      return block.text ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={block.text} alt="" style={{ display: "block", width: "100%", borderRadius: 10, margin: "8px 0 22px" }} loading="lazy" />
      ) : null;
    case "list":
      return (
        <ul style={{ listStyle: "none", margin: "0 0 22px", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {(block.items ?? []).map((it, i) => (
            <li key={i} style={{ display: "flex", gap: 12, fontSize: 16.5, lineHeight: 1.75, color: "rgba(0,0,0,0.78)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.brandBlue, marginTop: 11, flexShrink: 0 }} />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

/**
 * Article body with on-demand EN translation (AC-010b). Renders the Vietnamese
 * blocks by default; when the reader switches to EN it fetches the cached/LLM
 * translation once and swaps in the English body. Falls back to VN on any error
 * (e.g. no LLM key), so the article is always readable.
 */
export default function ArticleBodyI18n({ slug, viBlocks }: { slug: string; viBlocks: Block[] }) {
  const { lang } = useLang();
  const [enBlocks, setEnBlocks] = useState<Block[] | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    if (lang !== "en" || enBlocks || state === "loading") return;
    let alive = true;
    setState("loading");
    fetch(`/api/v1/posts/${slug}/i18n`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { blocksEn?: Block[] }) => {
        if (!alive) return;
        if (Array.isArray(d.blocksEn)) { setEnBlocks(d.blocksEn); setState("idle"); }
        else setState("error");
      })
      .catch(() => alive && setState("error"));
    return () => { alive = false; };
  }, [lang, slug, enBlocks, state]);

  const showEn = lang === "en" && enBlocks;
  const blocks = showEn ? enBlocks! : viBlocks;

  return (
    <>
      {lang === "en" && state === "loading" && !enBlocks && (
        <p style={{ fontSize: 13, color: COLORS.ink3, fontStyle: "italic", margin: "0 0 16px" }}>Translating to English…</p>
      )}
      {lang === "en" && state === "error" && (
        <p style={{ fontSize: 13, color: COLORS.ink3, fontStyle: "italic", margin: "0 0 16px" }}>English translation unavailable — showing the original.</p>
      )}
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </>
  );
}
