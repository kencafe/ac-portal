"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang } from "./LangContext";
import { COLORS, SHADOW, CONTENT_MAX } from "@/lib/tokens";
import { btnPrimarySm } from "@/lib/ui";

export type NavItem = { label: string; labelEn?: string; href: string };

/**
 * Sticky site header (below the 3px brand stripe). VN/EN segmented toggle is
 * cosmetic per the design (it only rescales VN vs EN type in service cards).
 * `anchorBase` prefixes in-page anchors so they work from sub-pages ("/#about").
 */
export default function SiteHeader({
  nav,
  cta,
  anchorBase = "",
}: {
  nav: NavItem[];
  cta: NavItem;
  anchorBase?: string;
}) {
  const { lang, setLang } = useLang();

  const resolve = (href: string) =>
    href.startsWith("#") ? `${anchorBase}${href}` : href;

  return (
    <header
      style={{
        position: "sticky",
        top: 3,
        zIndex: 60,
        background: "#fff",
        boxShadow: SHADOW.header,
      }}
    >
      <div
        style={{
          maxWidth: CONTENT_MAX,
          margin: "0 auto",
          minHeight: 64,
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            color: COLORS.ink,
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          <Image
            src="/assets/appcarrier-icon.svg"
            alt="AppCarrier — FPT-IS Next Gen Service"
            width={28}
            height={28}
            style={{ borderRadius: 7, display: "block", flexShrink: 0 }}
          />
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
              FPT-IS
            </span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: COLORS.ink3,
                whiteSpace: "nowrap",
              }}
            >
              NEXT GEN SERVICE
            </span>
          </span>
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: "1 1 420px",
            flexWrap: "wrap",
            rowGap: 0,
          }}
        >
          {nav.map((item) => (
            <Link key={item.label} href={resolve(item.href)} className="ns-nav-link">
              {lang === "en" ? item.labelEn ?? item.label : item.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, marginLeft: "auto" }}>
          <div style={{ display: "flex", padding: 2, background: "rgba(0,0,0,0.04)", borderRadius: 6, flexShrink: 0 }}>
            {(["vi", "en"] as const).map((l) => {
              const active = lang === l;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={active}
                  style={{
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 10px",
                    borderRadius: 5,
                    fontSize: 12.5,
                    fontWeight: 600,
                    background: active ? "#fff" : "transparent",
                    color: active ? COLORS.brandBlue : COLORS.ink2,
                    boxShadow: active ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                    transition: "all .2s",
                  }}
                >
                  {l === "vi" ? "VN" : "EN"}
                </button>
              );
            })}
          </div>
          <Link href={resolve(cta.href)} style={btnPrimarySm}>
            {lang === "en" ? cta.labelEn ?? cta.label : cta.label}
          </Link>
        </div>
      </div>
    </header>
  );
}
