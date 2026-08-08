import { NextRequest, NextResponse } from "next/server";
import { getPost, upsertPost, setStatus, deletePost, type Status } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return post ? NextResponse.json(post) : NextResponse.json({ error: "not found" }, { status: 404 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const saved = await upsertPost({ ...body, slug });
  return NextResponse.json(saved);
}

// PATCH → change status only (publish / hide / review)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  if (!body.status) return NextResponse.json({ error: "status required" }, { status: 400 });
  const updated = await setStatus(slug, body.status as Status);
  return updated ? NextResponse.json(updated) : NextResponse.json({ error: "not found" }, { status: 404 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ok = await deletePost(slug);
  return NextResponse.json({ deleted: ok }, { status: ok ? 200 : 404 });
}
