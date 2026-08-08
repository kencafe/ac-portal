import { getIdentity, hasRole, CAN_WRITE } from "@/lib/identity";
import { makeCover, coverFor } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Manual "generate cover with AI" button. Forces the Gemini image model even if
// the global toggle is off. If AI image isn't available (e.g. billing not
// enabled → 429), makeCover returns the generated illustration instead; we
// detect that and tell the editor so they know AI didn't run.
export async function POST(req: Request) {
  const id = await getIdentity();
  if (!hasRole(id, CAN_WRITE)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { slug, title, cat, tone } = (await req.json().catch(() => ({}))) as { slug?: string; title?: string; cat?: string; tone?: string };
  if (!title) return Response.json({ error: "Thiếu tiêu đề" }, { status: 400 });
  const s = (slug || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60) || "cover";
  const url = await makeCover(s, title, cat || "", tone || "#0072BC", true);
  const aiUsed = url.startsWith("/api/cover-img/");
  return Response.json({
    url,
    aiUsed,
    note: aiUsed ? "Đã tạo ảnh bằng AI" : "AI ảnh chưa dùng được (thường do chưa bật billing cho key) — đã dùng ảnh minh hoạ tự động.",
    fallback: coverFor(title, cat || "", tone || "#0072BC"),
  });
}
