// On-publish newsletter. When a post becomes published and mailAutoSend is on,
// email it to the combined recipient set:
//   1. public blog subscribers (opt-in on the site), and
//   2. the admin distribution list (settings.mailExtraRecipients) — where
//      Keycloak group / team mailing addresses go.
// Runs at most once per post (guarded by the post's `notified` flag).

import { getSettings } from "@/lib/settings";
import { sendMail } from "@/lib/mail";
import { subscriberEmails } from "@/lib/subscribers";
import { upsertPost, type StoredPost } from "@/lib/store";

function publicBlogUrl(slug: string, blogHost: string): string {
  const host = (blogHost || "appcarrier.cloud").replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${host}/blog/${slug}`;
}

function renderEmail(post: StoredPost, url: string, siteName: string): string {
  const excerpt = post.excerpt || (post.blocks.find((b) => b.kind === "p")?.text ?? "").slice(0, 200);
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a2b3c">
    <p style="font-size:12px;color:#0072BC;font-weight:700;margin:0 0 6px">${siteName}</p>
    <h1 style="font-size:20px;line-height:1.35;margin:0 0 10px">${post.title}</h1>
    <p style="font-size:14px;line-height:1.6;color:#33475b;margin:0 0 18px">${excerpt}</p>
    <a href="${url}" style="display:inline-block;background:#0072BC;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border-radius:6px">Đọc bài viết →</a>
    <p style="font-size:12px;color:#8595a6;margin:24px 0 0">Bạn nhận email này vì đã đăng ký nhận bài từ ${siteName}.</p>
  </div>`;
}

// Returns the number of recipients emailed (0 if disabled / already sent / none).
export async function notifyPublished(post: StoredPost): Promise<number> {
  if (post.status !== "published" || post.notified) return 0;
  const s = await getSettings();
  if (!s.mailAutoSend) return 0;
  if (!s.mailHost || !s.mailUser || !s.mailPassword) return 0; // not configured

  const recipients = Array.from(
    new Set([...(await subscriberEmails()), ...(s.mailExtraRecipients ?? [])].map((e) => e.trim().toLowerCase()).filter(Boolean)),
  );
  if (recipients.length === 0) return 0;

  const url = publicBlogUrl(post.slug, s.blogHost);
  try {
    await sendMail(recipients, `[${s.siteName}] ${post.title}`, renderEmail(post, url, s.siteName));
    await upsertPost({ slug: post.slug, notified: true });
    console.log(`[mail] newsletter for ${post.slug} → ${recipients.length} recipients`);
    return recipients.length;
  } catch (e) {
    console.error(`[mail] newsletter failed for ${post.slug}:`, (e as Error).message);
    return 0;
  }
}
