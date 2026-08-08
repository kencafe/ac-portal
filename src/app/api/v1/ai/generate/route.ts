import { getIdentity, hasRole, CAN_WRITE, CAN_PUBLISH } from "@/lib/identity";
import { generateArticle } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

// Commission an original article: the admin gives a brief, AI writes the whole
// post. Writer role required; only publisher/admin may publish immediately.
export async function POST(req: Request) {
  const id = await getIdentity();
  if (!hasRole(id, CAN_WRITE)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as {
    brief?: string; title?: string; cat?: string; audience?: string; publish?: boolean;
  };
  const brief = (body.brief || "").trim();
  if (brief.length < 10) return Response.json({ error: "Đề bài quá ngắn" }, { status: 400 });

  const wantPublish = !!body.publish;
  if (wantPublish && !hasRole(id, CAN_PUBLISH)) {
    return Response.json({ error: "Chỉ Kiểm duyệt/Quản trị mới xuất bản" }, { status: 403 });
  }

  try {
    const result = await generateArticle(brief, {
      title: body.title,
      cat: body.cat,
      audience: body.audience,
      forcePublish: wantPublish,
    });
    console.log(`[audit] ${id.user} commissioned article → ${result.slug} (${result.status})`);
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
