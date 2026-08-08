import { getIdentity } from "@/lib/identity";
import { sendMail } from "@/lib/mail";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Send a test email to confirm the SMTP config works. Admin-only.
export async function POST(req: Request) {
  const id = await getIdentity();
  if (!id.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { to } = (await req.json().catch(() => ({}))) as { to?: string };
  if (!to || !/.+@.+\..+/.test(to)) {
    return Response.json({ error: "Nhập email người nhận hợp lệ." }, { status: 400 });
  }
  try {
    await sendMail(
      [to],
      "FPT-IS NS · Email thử",
      `<p>Đây là email thử từ <b>FPT-IS Next Gen Service Content Hub</b>.</p><p>Nếu bạn nhận được, cấu hình SMTP đã hoạt động.</p>`,
    );
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
