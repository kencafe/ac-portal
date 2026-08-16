"use client";

import Link from "next/link";
import Image from "next/image";
import { FOOTER } from "@/data/landing";
import { rewriteHref } from "@/lib/routes";
import { COLORS, CONTENT_MAX } from "@/lib/tokens";
import { useLang } from "@/components/shared/LangContext";

export default function SiteFooter({ anchorBase = "" }: { anchorBase?: string }) {
  const en = useLang().lang === "en";
  const resolve = (href: string) => {
    const r = rewriteHref(href);
    return r.startsWith("#") ? `${anchorBase}${r}` : r;
  };
  const dim = "rgba(255,255,255,0.65)";

  return (
    <footer style={{ background: COLORS.navy900, color: dim, padding: "48px 24px 24px" }}>
      <div style={{ maxWidth: CONTENT_MAX, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 32,
          }}
        >
          {/* Brand column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <Image src="/assets/appcarrier-carrier-navy.svg" alt="" width={32} height={32} style={{ display: "block" }} />
              <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{FOOTER.brand.line1}</span>
                <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.06em", color: "rgba(255,255,255,0.5)" }}>
                  {FOOTER.brand.line2}
                </span>
              </span>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.6, maxWidth: 240 }}>{en ? FOOTER.blurbEn : FOOTER.blurb}</p>
            <div style={{ fontSize: 13.5, lineHeight: 1.9 }}>
              <a href={FOOTER.phone.href} style={{ color: dim }}>{FOOTER.phone.value}</a>
              <br />
              <a href={FOOTER.email.href} style={{ color: dim }}>{FOOTER.email.value}</a>
            </div>
          </div>

          {FOOTER.columns.map((col) => (
            <div key={col.head}>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 14 }}>{en ? col.headEn : col.head}</div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={resolve(link.href)} style={{ color: dim, fontSize: 13.5 }}>
                      {en ? link.labelEn : link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 36,
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.12)",
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 24px",
            justifyContent: "space-between",
          }}
        >
          <span>{FOOTER.bottom.copyright}</span>
          <span>{FOOTER.bottom.address}</span>
        </div>
      </div>
    </footer>
  );
}
