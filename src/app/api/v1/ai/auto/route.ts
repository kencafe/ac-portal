import { getIdentity } from "@/lib/identity";
import { getSettings } from "@/lib/settings";
import { discoverAndPublish, runFeeds } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Daily auto-edit run. The CronJob fires hourly and this endpoint self-gates by
// the admin's schedule config (enabled + hour + mode). Admins can force a run
// now (?force=1) from the CMS, bypassing the gate.
export async function POST(req: Request) {
  const token = process.env.AI_CRON_TOKEN || "";
  const byCron = !!token && (req.headers.get("x-cron-token") || "") === token;
  const force = new URL(req.url).searchParams.get("force") === "1";

  if (!byCron) {
    const id = await getIdentity();
    if (id.role !== "Quản trị") return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const s = await getSettings();

  // Cron path self-gates; a forced admin run ignores the gate.
  if (byCron && !force) {
    if (!s.aiScheduleEnabled) return Response.json({ skipped: "schedule disabled" });
    const hour = new Date().getHours();
    if (hour !== s.aiScheduleHour) return Response.json({ skipped: `hour ${hour} != ${s.aiScheduleHour}` });
  }

  if (s.aiScheduleMode === "feeds") {
    const r = await runFeeds(s.aiFeeds ?? [], Math.max(1, s.aiDiscoverCount || 3));
    console.log(`[ai] auto mode=feeds ingested=${r.length}`);
    return Response.json({ mode: "feeds", ingested: r.length });
  }
  const r = await discoverAndPublish();
  console.log(`[ai] auto mode=discover candidates=${r.candidates} picked=${r.picked}`);
  return Response.json({ mode: "discover", ...r });
}
