"use client";

import { useState } from "react";
import { PARTNERS, PARTNERS_LEAD, PARTNERS_LEAD_EN, PLATFORMS, PLATFORMS_LEAD, PLATFORMS_LEAD_EN, SECTION_TITLES } from "@/data/landing";
import { ACCENTS, Accent, COLORS, RADIUS } from "@/lib/tokens";
import { leadText } from "@/lib/ui";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import HoverCard from "@/components/shared/HoverCard";
import { useLang } from "@/components/shared/LangContext";

function logoSrc(logo: string) {
  return logo.startsWith("http") ? logo : `/${logo}`;
}

/** Brand colour per partner — used for the card accent + hover tint.
 *  ("nền ô lấy màu logo hãng"). Falls back to brand blue. */
const BRAND: Record<string, string> = {
  "partner-redhat": "#EE0000", "partner-ibm": "#0530AD", "partner-vmware": "#607078",
  "partner-dellemc": "#007DB8", "partner-hpe": "#01A982", "partner-supermicro": "#151F6D",
  "partner-hashicorp": "#7B42BC", "partner-nvidia": "#76B900", "partner-aws": "#FF9900",
  "partner-azure": "#0078D4", "partner-gcp": "#4285F4", "partner-fptsc": "#F37021",
  "partner-elastic": "#005571", "partner-veeam": "#00B336", "partner-cncf": "#326CE5",
  "partner-cisco": "#1BA0D7", "partner-fortinet": "#EE3124", "partner-paloalto": "#FA582D",
  "partner-cloudflare": "#F38020", "partner-sap": "#0FAAFF", "partner-databricks": "#FF3621",
  "partner-snowflake": "#29B5E8", "partner-datadog": "#632CA6", "partner-grafana": "#F46800",
  "partner-splunk": "#FF375F", "partner-gitlab": "#FC6D26", "partner-nutanix": "#024DA1",
  "partner-suse": "#30BA78", "partner-docker": "#2496ED", "partner-ubuntu": "#E95420",
};

/** Logo image with a text-wordmark fallback when the CDN has no icon
 *  (e.g. IBM / HPE were delisted from simpleicons). */
function PartnerLogo({ logo, name, color }: { logo: string; name: string; color: string }) {
  const [err, setErr] = useState(false);
  if (err || !logo) {
    return <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", color }}>{name}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoSrc(logo)}
      alt={name}
      onError={() => setErr(true)}
      style={{ maxHeight: 40, maxWidth: "70%", objectFit: "contain" }}
      loading="lazy"
    />
  );
}

export default function Partners() {
  const en = useLang().lang === "en";
  return (
    <Section id="partners">
      <SectionHeading vi={SECTION_TITLES.partners.vi} en={SECTION_TITLES.partners.en} mark="green" />
      <p style={{ ...leadText, marginTop: -12, marginBottom: 24 }}>{en ? PARTNERS_LEAD_EN : PARTNERS_LEAD}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 16 }}>
        {PARTNERS.map((p) => {
          const color = BRAND[p.id] ?? COLORS.brandBlue;
          return (
            <HoverCard
              key={p.id}
              style={{
                background: "#fff",
                border: `1px solid ${COLORS.split}`,
                borderTop: `3px solid ${color}`,
                borderRadius: RADIUS.card,
                padding: 20,
                transition: "background .18s ease, box-shadow .18s ease, transform .18s ease",
              }}
              hoverStyle={{ background: color + "12", boxShadow: `0 14px 30px -18px ${color}aa`, transform: "translateY(-3px)" }}
            >
              <div style={{ height: 52, display: "flex", alignItems: "center" }}>
                <PartnerLogo logo={p.logo} name={p.name} color={color} />
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: COLORS.ink, marginTop: 8 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: COLORS.ink3, marginTop: 3 }}>{en ? p.descEn : p.desc}</div>
            </HoverCard>
          );
        })}
      </div>

      <div style={{ marginTop: 44 }}>
        <SectionHeading vi={SECTION_TITLES.platforms.vi} en={SECTION_TITLES.platforms.en} mark="orange" />
        <p style={{ ...leadText, marginTop: -12, marginBottom: 24 }}>{en ? PLATFORMS_LEAD_EN : PLATFORMS_LEAD}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {PLATFORMS.map((p) => {
            const a = ACCENTS[p.accent as Accent];
            return (
              <HoverCard
                key={p.id}
                style={{
                  background: "#fff",
                  border: `1px solid ${COLORS.split}`,
                  borderTop: `3px solid ${a.color}`,
                  borderRadius: RADIUS.card,
                  padding: 20,
                  transition: "background .18s ease, box-shadow .18s ease, transform .18s ease",
                }}
                hoverStyle={{ background: a.bg, boxShadow: "0 14px 30px -18px rgba(0,21,41,0.42)", transform: "translateY(-3px)" }}
              >
                <div style={{ fontSize: 16.5, fontWeight: 700, color: COLORS.ink }}>{p.name}</div>
                <div style={{ fontSize: 13, color: COLORS.ink3, marginTop: 5, lineHeight: 1.5 }}>{en ? p.descEn : p.desc}</div>
              </HoverCard>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
