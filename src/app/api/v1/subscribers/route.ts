import { getIdentity } from "@/lib/identity";
import { listSubscribers, removeSubscriber } from "@/lib/subscribers";

export const dynamic = "force-dynamic";

// Admin-only: list newsletter subscribers.
export async function GET() {
  const id = await getIdentity();
  if (!id.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json({ results: await listSubscribers() });
}

// Admin-only: remove a subscriber.
export async function DELETE(req: Request) {
  const id = await getIdentity();
  if (!id.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  if (!email) return Response.json({ error: "Thiếu email" }, { status: 400 });
  return Response.json({ removed: await removeSubscriber(email) });
}
