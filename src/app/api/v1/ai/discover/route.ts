import { getIdentity } from "@/lib/identity";
import { discoverAndPublish } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// AI auto-discovery: find the most relevant unseen articles and publish them.
// Callers: the daily CronJob (X-Cron-Token = env AI_CRON_TOKEN) or an admin
// clicking "Tự tìm & xuất bản ngay".
export async function POST(req: Request) {
  const token = process.env.AI_CRON_TOKEN || "";
  const byCron = !!token && (req.headers.get("x-cron-token") || "") === token;
  if (!byCron) {
    const id = await getIdentity();
    if (id.role !== "Quản trị") return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const r = await discoverAndPublish();
  console.log(`[ai] discover byCron=${byCron} candidates=${r.candidates} picked=${r.picked}`);
  return Response.json(r);
}
