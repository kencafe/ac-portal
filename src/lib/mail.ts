// Outgoing mail via SMTP (e.g. Gmail + app password). Config comes from
// settings (mailHost/Port/Secure/User/From/Password). The password is a
// server-only secret, never exposed to the browser.

import nodemailer from "nodemailer";
import { getSettings } from "@/lib/settings";

export async function getTransport() {
  const s = await getSettings();
  if (!s.mailHost || !s.mailUser || !s.mailPassword) {
    throw new Error("Chưa cấu hình mail (host/user/app-password).");
  }
  return {
    transporter: nodemailer.createTransport({
      host: s.mailHost,
      port: s.mailPort || 587,
      secure: !!s.mailSecure, // true for 465, false for 587 (STARTTLS)
      auth: { user: s.mailUser, pass: s.mailPassword },
    }),
    from: s.mailFrom || s.mailUser,
  };
}

// Verify SMTP credentials without sending anything.
export async function verifyMail(): Promise<void> {
  const { transporter } = await getTransport();
  await transporter.verify();
}

export async function sendMail(to: string[], subject: string, html: string): Promise<number> {
  if (to.length === 0) return 0;
  const { transporter, from } = await getTransport();
  await transporter.sendMail({ from, to: to.join(", "), subject, html });
  return to.length;
}
