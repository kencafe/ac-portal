import { getIdentity, hasRole, CAN_WRITE } from "@/lib/identity";
import { listHistory } from "@/lib/history";

export const dynamic = "force-dynamic";

// Ingest history — what the AI pulled and published, and when. Restricted to
// signed-in writers (reachable with an identity only via the CMS host).
export async function GET() {
  const id = await getIdentity();
  if (!hasRole(id, CAN_WRITE)) return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json({ results: await listHistory(100) });
}
