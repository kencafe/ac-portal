import { getIdentity, hasRole, CAN_WRITE } from "@/lib/identity";
import { coverFor } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Manual "generate cover" button (cover + in-content block images). Produces the
// branded, content-aware dashboard SVG (lib/cover.ts) — on-brand and always
// relevant, never an off-topic photo. A per-click seed varies the motif/layout
// so repeated clicks give a different-but-branded image.
export async function POST(req: Request) {
  const id = await getIdentity();
  if (!hasRole(id, CAN_WRITE)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { title, cat, tone } = (await req.json().catch(() => ({}))) as { slug?: string; title?: string; cat?: string; tone?: string; scene?: string };
  if (!title) return Response.json({ error: "Thiếu tiêu đề" }, { status: 400 });
  const seed = Math.floor(Math.random() * 1_000_000) + 1;
  const url = `${coverFor(title, cat || "", tone || "#0072BC")}&seed=${seed}`;
  return Response.json({ url, aiUsed: true, note: "Đã tạo ảnh minh hoạ thương hiệu (theo nội dung)" });
}
