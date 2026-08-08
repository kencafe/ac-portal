import { getIdentity } from "@/lib/identity";
import { getSettings, saveSettings, type Settings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getSettings());
}

// Only admins may change site configuration.
export async function PUT(req: Request) {
  const id = await getIdentity();
  if (!id.isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const patch = (await req.json()) as Partial<Settings>;
  const saved = await saveSettings(patch);
  console.log(`[audit] ${id.user} updated settings`);
  return Response.json(saved);
}
