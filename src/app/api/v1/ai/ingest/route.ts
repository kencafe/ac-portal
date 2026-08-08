import { getIdentity } from "@/lib/identity";
import { ingestUrl } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Manual "hot news": paste a link → AI edit + translate → publish immediately.
// Roles: editor/publisher/admin may run it; only publisher/admin may publish.
export async function POST(req: Request) {
  const id = await getIdentity();
  const mayIngest = ["Quản trị", "Kiểm duyệt", "Biên tập"].includes(id.role);
  if (!mayIngest) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { url, publish, summarize } = (await req.json()) as { url?: string; publish?: boolean; summarize?: boolean };
  if (!url || !/^https?:\/\//.test(url)) {
    return Response.json({ error: "url không hợp lệ" }, { status: 400 });
  }
  const wantPublish = !!publish;
  const mayPublish = ["Quản trị", "Kiểm duyệt"].includes(id.role);
  if (wantPublish && !mayPublish) {
    return Response.json({ error: "Chỉ Kiểm duyệt/Quản trị mới xuất bản" }, { status: 403 });
  }

  try {
    const result = await ingestUrl(url, { forcePublish: wantPublish, summarize: !!summarize });
    console.log(`[audit] ${id.user} AI-ingest ${url} → ${result.slug} (${result.status})`);
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
