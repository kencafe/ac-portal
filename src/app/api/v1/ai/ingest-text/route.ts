import { getIdentity, hasRole, CAN_WRITE, CAN_PUBLISH } from "@/lib/identity";
import { ingestText } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Ingest pasted raw text (for login-walled / copy-blocked sources the admin has
// legitimate access to: LinkedIn, Medium, etc.). Writer role required; only a
// publisher/admin may publish straight away — otherwise it lands as a draft.
export async function POST(req: Request) {
  const id = await getIdentity();
  if (!hasRole(id, CAN_WRITE)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as {
    title?: string; text?: string; sourceName?: string; sourceUrl?: string;
    summarize?: boolean; cat?: string; publish?: boolean;
  };
  const text = (body.text || "").trim();
  if (text.length < 40) return Response.json({ error: "Nội dung quá ngắn (tối thiểu 40 ký tự)" }, { status: 400 });

  const wantPublish = !!body.publish;
  if (wantPublish && !hasRole(id, CAN_PUBLISH)) {
    return Response.json({ error: "Chỉ Kiểm duyệt/Quản trị mới xuất bản" }, { status: 403 });
  }

  try {
    const result = await ingestText(body.title || text.slice(0, 80), text, {
      forcePublish: wantPublish,
      cat: body.cat,
      mode: "manual",
      source: body.sourceName || body.sourceUrl || "dán nội dung",
      summarize: !!body.summarize,
      sourceName: body.sourceName,
      sourceUrl: body.sourceUrl,
      note: body.summarize ? "tóm tắt & dẫn nguồn" : "dán nội dung thô",
    });
    console.log(`[audit] ${id.user} paste-ingest → ${result.slug} (${result.status})`);
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
