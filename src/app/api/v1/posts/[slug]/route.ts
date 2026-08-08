import { NextRequest, NextResponse } from "next/server";
import { getPost, upsertPost, setStatus, deletePost, type Status } from "@/lib/store";
import { getIdentity, hasRole, CAN_WRITE, CAN_PUBLISH, CAN_DELETE } from "@/lib/identity";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return post ? NextResponse.json(post) : NextResponse.json({ error: "not found" }, { status: 404 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const id = await getIdentity();
  if (!hasRole(id, CAN_WRITE)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const saved = await upsertPost({ ...body, slug });
  return NextResponse.json(saved);
}

// PATCH → change status only. Publishing needs a publisher/admin; moving to
// draft/review is allowed for any writer.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const id = await getIdentity();
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.status) return NextResponse.json({ error: "status required" }, { status: 400 });
  const needsPublish = body.status === "published";
  if (!hasRole(id, needsPublish ? CAN_PUBLISH : CAN_WRITE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const updated = await setStatus(slug, body.status as Status);
  if (updated) console.log(`[audit] ${id.user} set ${slug} → ${body.status}`);
  return updated ? NextResponse.json(updated) : NextResponse.json({ error: "not found" }, { status: 404 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const id = await getIdentity();
  if (!hasRole(id, CAN_DELETE)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { slug } = await params;
  const ok = await deletePost(slug);
  if (ok) console.log(`[audit] ${id.user} deleted ${slug}`);
  return NextResponse.json({ deleted: ok }, { status: ok ? 200 : 404 });
}
