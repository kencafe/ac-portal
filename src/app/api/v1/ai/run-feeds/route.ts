import { getIdentity } from "@/lib/identity";
import { getSettings } from "@/lib/settings";
import { runFeeds } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Daily auto-ingest over the configured feeds. Two callers:
//  - the OpenShift CronJob (05:00) → authenticates with header X-Cron-Token
//    matching env AI_CRON_TOKEN.
//  - an admin clicking "Chạy ngay" in the CMS → authenticated by role.
export async function POST(req: Request) {
  const token = process.env.AI_CRON_TOKEN || "";
  const headerToken = req.headers.get("x-cron-token") || "";
  const byCron = !!token && headerToken === token;

  if (!byCron) {
    const id = await getIdentity();
    if (id.role !== "Quản trị") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const settings = await getSettings();
  const feeds = settings.aiFeeds ?? [];
  if (feeds.length === 0) {
    return Response.json({ error: "Chưa cấu hình nguồn (aiFeeds)" }, { status: 400 });
  }

  const results = await runFeeds(feeds);
  console.log(`[ai] run-feeds byCron=${byCron} feeds=${feeds.length} ingested=${results.length}`);
  return Response.json({ ingested: results.length, results });
}
