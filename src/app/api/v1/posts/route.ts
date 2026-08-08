import { NextRequest, NextResponse } from "next/server";
import { listPosts, listPublished, upsertPost, getPost, type Status } from "@/lib/store";
import { getIdentity, hasRole, CAN_WRITE, CAN_PUBLISH } from "@/lib/identity";
import { notifyPublished } from "@/lib/notify";

export const dynamic = "force-dynamic";

// GET /api/v1/posts            → published posts (public)
// GET /api/v1/posts?status=all → all posts (CMS)
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  if (status === "all") return NextResponse.json({ results: await listPosts() });
  if (status) return NextResponse.json({ results: await listPosts({ status: status as Status }) });
  return NextResponse.json({ results: await listPublished() });
}

// POST /api/v1/posts → create/update a post (CMS). Requires a writer role;
// reachable with the signed-in identity only via the oauth2-proxy CMS host.
export async function POST(req: NextRequest) {
  const id = await getIdentity();
  if (!hasRole(id, CAN_WRITE)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body || !body.slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }
  // Publishing (or keeping published) requires a publisher/admin — same 4-eyes
  // gate as PATCH, so an author can't publish via the editor's status picker.
  if (body.status === "published" && !hasRole(id, CAN_PUBLISH)) {
    return NextResponse.json({ error: "Chỉ Kiểm duyệt/Quản trị mới được xuất bản" }, { status: 403 });
  }
  const wasPublished = (await getPost(body.slug))?.status === "published";
  const saved = await upsertPost(body);
  console.log(`[audit] ${id.user} upsert post ${body.slug} (${saved.status})`);
  // Newly published via the editor → fire the newsletter (guarded + no-op unless enabled).
  if (saved.status === "published" && !wasPublished) {
    const sent = await notifyPublished(saved);
    if (sent) console.log(`[mail] ${body.slug} newsletter → ${sent} recipients`);
  }
  return NextResponse.json(saved, { status: 201 });
}
