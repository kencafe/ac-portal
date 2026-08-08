import { NextRequest, NextResponse } from "next/server";
import { getPost, upsertPost, setStatus, setFeatured, deletePost, type Status } from "@/lib/store";
import { getIdentity, hasRole, CAN_WRITE, CAN_PUBLISH, CAN_DELETE } from "@/lib/identity";
import { notifyPublished } from "@/lib/notify";

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

// PATCH → change status, or pin/unpin a post to the portal homepage
// (`featured`). Publishing and homepage pinning both need a publisher/admin;
// moving to draft/review is allowed for any writer.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const id = await getIdentity();
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));

  // Homepage pin toggle — editorial decision, requires publish rights.
  if (typeof body.featured === "boolean") {
    if (!hasRole(id, CAN_PUBLISH)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const updated = await setFeatured(slug, body.featured);
    if (updated) console.log(`[audit] ${id.user} ${body.featured ? "pinned" : "unpinned"} ${slug} on homepage`);
    return updated ? NextResponse.json(updated) : NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (!body.status) return NextResponse.json({ error: "status or featured required" }, { status: 400 });
  const needsPublish = body.status === "published";
  if (!hasRole(id, needsPublish ? CAN_PUBLISH : CAN_WRITE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const updated = await setStatus(slug, body.status as Status);
  if (updated) {
    console.log(`[audit] ${id.user} set ${slug} → ${body.status}`);
    // Fire the on-publish newsletter (no-op unless auto-send is on & configured).
    if (updated.status === "published") {
      const sent = await notifyPublished(updated);
      if (sent) console.log(`[mail] ${slug} newsletter → ${sent} recipients`);
    }
  }
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
