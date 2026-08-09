import { getIdentity, hasRole, CAN_WRITE } from "@/lib/identity";
import { makeCover, coverFor } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Manual "create AI image" button (cover + in-content block image). Prompt-driven:
// `scene` is the editor's prompt describing the image. Forces generation via the
// configured image provider (Gemini/OpenAI/xAI/Pollinations — see imageProviders)
// even if the auto toggle is off, saves to storage (MinIO/PVC), and returns the
// URL. Falls back to the branded SVG illustration when AI image is unavailable
// (no key / 429 / error) so the editor always gets something on-brand.
export async function POST(req: Request) {
  const id = await getIdentity();
  if (!hasRole(id, CAN_WRITE)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { slug, title, cat, tone, scene } = (await req.json().catch(() => ({}))) as {
    slug?: string; title?: string; cat?: string; tone?: string; scene?: string;
  };
  if (!title) return Response.json({ error: "Thiếu tiêu đề" }, { status: 400 });
  const s = (slug || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60) || "cover";
  const nonce = Date.now() % 1000000; // vary + cache-bust each manual generate
  const raw = await makeCover(s, title, cat || "", tone || "#0072BC", true, (scene || "").trim(), nonce);
  const aiUsed = raw.startsWith("/api/cover-img/");
  const url = aiUsed ? `${raw}?v=${nonce}` : raw;
  return Response.json({
    url,
    aiUsed,
    note: aiUsed
      ? "Đã tạo ảnh bằng AI (theo prompt)"
      : "AI ảnh chưa bật/không dùng được (kiểm tra Cấu hình API → Tạo ảnh bìa) — đã dùng ảnh minh hoạ thương hiệu.",
    fallback: coverFor(title, cat || "", tone || "#0072BC"),
  });
}
