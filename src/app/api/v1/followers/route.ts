import { NextRequest, NextResponse } from "next/server";
import { addFollower, listFollowers, removeFollower } from "@/lib/followers";
import { getIdentity, hasRole, CAN_PUBLISH } from "@/lib/identity";

// POST /api/v1/followers — PUBLIC. A visitor submits the homepage contact form
// (name/email/company/needs) → recorded as a follower/lead.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const status = await addFollower({ name: body.name, email: body.email, company: body.company, needs: body.needs });
  if (status === "invalid") return NextResponse.json({ error: "Cần họ tên và email hợp lệ." }, { status: 400 });
  return NextResponse.json({ status });
}

// GET /api/v1/followers — the follower directory. Contains lead PII, so gated to
// Kiểm duyệt/Quản trị (CAN_PUBLISH).
export async function GET() {
  const id = await getIdentity();
  if (!hasRole(id, CAN_PUBLISH)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ followers: await listFollowers() });
}

// DELETE /api/v1/followers { email } — remove a follower (same gate).
export async function DELETE(req: NextRequest) {
  const id = await getIdentity();
  if (!hasRole(id, CAN_PUBLISH)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const ok = await removeFollower(body.email ?? "");
  return NextResponse.json({ ok });
}
