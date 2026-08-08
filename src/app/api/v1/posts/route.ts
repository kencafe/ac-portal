import { NextRequest, NextResponse } from "next/server";
import { listPosts, listPublished, upsertPost, type Status } from "@/lib/store";

export const dynamic = "force-dynamic";

// GET /api/v1/posts            → published posts (public)
// GET /api/v1/posts?status=all → all posts (CMS)
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  if (status === "all") return NextResponse.json({ results: await listPosts() });
  if (status) return NextResponse.json({ results: await listPosts({ status: status as Status }) });
  return NextResponse.json({ results: await listPublished() });
}

// POST /api/v1/posts → create/update a post (CMS)
// NOTE: auth (Editor/Admin) is a backend TODO — add a bearer check here.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }
  const saved = await upsertPost(body);
  return NextResponse.json(saved, { status: 201 });
}
