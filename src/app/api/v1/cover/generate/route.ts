import { getIdentity, hasRole, CAN_WRITE } from "@/lib/identity";
import { makeCoverDetailed, coverFor } from "@/lib/ai";
import { getImageProvider } from "@/lib/imageProviders";
import { imagePublicUrl } from "@/lib/storage";

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
  // raw=true → the editor's prompt is used verbatim (allows text/logos/own style).
  const r = await makeCoverDetailed(s, title, cat || "", tone || "#0072BC", true, (scene || "").trim(), nonce, true);
  const aiUsed = r.aiUsed;
  const url = aiUsed ? `${r.url}?v=${nonce}` : r.url;
  // Direct MinIO object link (so the editor sees where the image is stored).
  const key = aiUsed ? r.url.replace("/api/cover-img/", "") : "";
  const minioUrl = key ? imagePublicUrl(key) : "";
  // Human-readable label of the provider that actually produced the image.
  const providerName = r.provider === "svg" ? "Ảnh minh hoạ thương hiệu (SVG)" : getImageProvider(r.provider).name;
  const modelLabel = r.model ? ` · model ${r.model}` : "";
  let note: string;
  if (aiUsed && r.fallbackReason) {
    // Configured provider failed → we auto-used Pollinations (free).
    note = `Đã tạo ảnh bằng ${providerName}${modelLabel} (dự phòng — nhà cung cấp đã chọn lỗi: ${r.fallbackReason})${minioUrl ? ` · MinIO: ${minioUrl}` : ""}`;
  } else if (aiUsed) {
    note = `Đã tạo ảnh bằng ${providerName}${modelLabel}${minioUrl ? ` · MinIO: ${minioUrl}` : ""}`;
  } else {
    note = `Không tạo được ảnh AI (${r.fallbackReason || "kiểm tra Cấu hình API → Tạo ảnh bìa"}) — đã dùng ảnh minh hoạ thương hiệu.`;
  }
  return Response.json({
    url,
    aiUsed,
    provider: r.provider,
    providerName,
    model: r.model,
    minioUrl,
    note,
    fallback: coverFor(title, cat || "", tone || "#0072BC"),
  });
}
