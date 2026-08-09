import { getIdentity } from "@/lib/identity";
import { getPublicSettings, saveSettings, type Settings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Redacted — the Anthropic token is never sent to the browser.
export async function GET() {
  return Response.json(await getPublicSettings());
}

// Only admins may change site configuration.
export async function PUT(req: Request) {
  const id = await getIdentity();
  if (!id.isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const patch = (await req.json()) as Partial<Settings>;
  // Never overwrite a stored secret with an empty value — the browser only
  // sends aiApiKey / mailPassword when the admin typed a fresh one.
  if (!patch.aiApiKey || !patch.aiApiKey.trim()) delete patch.aiApiKey;
  if (!patch.mailPassword || !patch.mailPassword.trim()) delete patch.mailPassword;
  if (!patch.aiImageApiKey || !patch.aiImageApiKey.trim()) delete patch.aiImageApiKey;
  await saveSettings(patch);
  console.log(`[audit] ${id.user} updated settings`);
  return Response.json(await getPublicSettings());
}
