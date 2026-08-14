import { NextRequest, NextResponse } from "next/server";
import { getPost } from "@/lib/store";
import { notifyFollowers } from "@/lib/notify";
import { getIdentity, hasRole, CAN_PUBLISH } from "@/lib/identity";

// POST /api/v1/posts/[slug]/send-followers — email a published post to all
// followers (contact-form leads). Gated to Kiểm duyệt/Quản trị (CAN_PUBLISH).
export async function POST(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const id = await getIdentity();
  if (!hasRole(id, CAN_PUBLISH)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return NextResponse.json({ error: "Không tìm thấy bài." }, { status: 404 });
  if (post.status !== "published") return NextResponse.json({ error: "Chỉ gửi được bài đã xuất bản." }, { status: 400 });
  const res = await notifyFollowers(post);
  if (res.error) return NextResponse.json({ error: res.error, sent: res.sent }, { status: 400 });
  return NextResponse.json({ sent: res.sent });
}
