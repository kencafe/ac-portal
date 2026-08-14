"use client";

import { CSSProperties, FormEvent, useState } from "react";
import { CONTACT, SECTION_TITLES } from "@/data/landing";
import { COLORS, RADIUS } from "@/lib/tokens";
import { card } from "@/lib/ui";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import { useLang } from "@/components/shared/LangContext";

const inputStyle: CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 12px",
  borderRadius: RADIUS.button,
  border: `1px solid ${COLORS.border}`,
  fontSize: 14,
  color: COLORS.ink,
  background: "#fff",
  outline: "none",
};

export default function Contact() {
  const en = useLang().lang === "en";
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("Họ và tên") ?? "").trim();
    const email = String(data.get("Email") ?? "").trim();
    const company = String(data.get("Công ty") ?? "").trim();
    const need = String(data.get("Nhu cầu") ?? "").trim();
    if (!name || !need) {
      setError(en ? CONTACT.form.errors.required.en : CONTACT.form.errors.required.vi);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(en ? CONTACT.form.errors.email.en : CONTACT.form.errors.email.vi);
      return;
    }
    setError(null);
    setBusy(true);
    // Record the submitter as a follower/lead (see /api/v1/followers).
    try {
      const res = await fetch("/api/v1/followers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, needs: need }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSent(true);
    } catch {
      setError(en ? "Could not send — please try again." : "Gửi không thành công, vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }

  const rows = [
    { label: en ? CONTACT.phone.labelEn : CONTACT.phone.label, value: CONTACT.phone.value, href: CONTACT.phone.href },
    { label: en ? CONTACT.email.labelEn : CONTACT.email.label, value: CONTACT.email.value, href: CONTACT.email.href },
    { label: en ? CONTACT.office.labelEn : CONTACT.office.label, value: CONTACT.office.value },
  ];

  return (
    <Section id="contact" surface bordered>
      <SectionHeading vi={SECTION_TITLES.contact.vi} en={SECTION_TITLES.contact.en} mark="green" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        {/* Descriptions */}
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.split}`, fontWeight: 600, color: COLORS.ink }}>
            {en ? CONTACT.panelTitleEn : CONTACT.panelTitle}
          </div>
          {rows.map((r, i) => (
            <div
              key={r.label}
              className="ns-desc-row"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(110px, 160px) 1fr",
                gap: 16,
                padding: "14px 20px",
                borderBottom: i < rows.length - 1 ? `1px solid ${COLORS.split}` : "none",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, color: COLORS.ink3 }}>{r.label}</span>
              {r.href ? (
                <a href={r.href} style={{ fontSize: 15, fontWeight: 600, color: COLORS.brandBlue }}>
                  {r.value}
                </a>
              ) : (
                <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.brandBlue }}>{r.value}</span>
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} style={{ ...card, padding: 24, display: "flex", flexDirection: "column", gap: 18 }} noValidate>
          {CONTACT.form.fields.map((f) =>
            f.type === "textarea" ? (
              <label key={f.label} style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: 13, color: COLORS.ink2, marginBottom: 6 }}>{en ? f.labelEn : f.label}</span>
                <textarea
                  name={f.label}
                  rows={f.rows ?? 3}
                  placeholder={en ? f.placeholderEn : f.placeholder}
                  style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "vertical", lineHeight: 1.6 }}
                />
              </label>
            ) : (
              <label key={f.label} style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: 13, color: COLORS.ink2, marginBottom: 6 }}>{en ? f.labelEn : f.label}</span>
                <input name={f.label} type={f.type} placeholder={en ? f.placeholderEn : f.placeholder} style={inputStyle} />
              </label>
            ),
          )}

          {error && <div style={{ color: "#C0392B", fontSize: 13 }}>{error}</div>}

          <button
            type="submit"
            disabled={sent || busy}
            style={{
              alignSelf: "flex-start",
              height: 40,
              padding: "0 20px",
              borderRadius: RADIUS.button,
              border: "none",
              cursor: sent || busy ? "default" : "pointer",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: sent ? COLORS.brandGreen : COLORS.brandBlue,
              opacity: busy ? 0.7 : 1,
              transition: "background .2s",
            }}
          >
            {busy
              ? (en ? "Sending…" : "Đang gửi…")
              : sent
                ? (en ? CONTACT.form.submit.sentEn : CONTACT.form.submit.sent)
                : (en ? CONTACT.form.submit.defaultEn : CONTACT.form.submit.default)}
          </button>
        </form>
      </div>
    </Section>
  );
}
