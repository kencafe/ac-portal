import { NextRequest, NextResponse } from "next/server";
import { listPosts, listPublished, upsertPost, type Status } from "@/lib/store";
import { getIdentity, hasRole, CAN_WRITE } from "@/lib/identity";

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
  const saved = await upsertPost(body);
  console.log(`[audit] ${id.user} upsert post ${body.slug}`);
  return NextResponse.json(saved, { status: 201 });
}
