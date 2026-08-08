import { getIdentity, hasRole, CAN_WRITE } from "@/lib/identity";
import { reeditPost } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Re-edit an existing post to the house style. Writer role required.
export async function POST(req: Request) {
  const id = await getIdentity();
  if (!hasRole(id, CAN_WRITE)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { slug, instruction } = (await req.json().catch(() => ({}))) as { slug?: string; instruction?: string };
  if (!slug) return Response.json({ error: "slug required" }, { status: 400 });
  try {
    const r = await reeditPost(slug, instruction);
    if (!r) return Response.json({ error: "not found" }, { status: 404 });
    console.log(`[audit] ${id.user} AI re-edited ${slug}${instruction ? " (with instruction)" : ""}`);
    return Response.json(r);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 422 });
  }
}
