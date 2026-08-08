import { getIdentity } from "@/lib/identity";
import { checkFeed } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Check whether an RSS/Atom source is valid & reachable. Admin-only.
export async function POST(req: Request) {
  const id = await getIdentity();
  if (!id.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { url } = (await req.json().catch(() => ({}))) as { url?: string };
  if (!url || !/^https?:\/\//.test(url)) {
    return Response.json({ error: "URL không hợp lệ" }, { status: 400 });
  }
  return Response.json(await checkFeed(url));
}
