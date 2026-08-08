import { getIdentity } from "@/lib/identity";
import { getSettings } from "@/lib/settings";
import { getProvider, listModels } from "@/lib/providers";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// List models for a provider. Uses the pasted token if present, else the stored
// token (only when the stored provider matches), else env. Admin-only; the
// token is never logged or echoed back.
export async function POST(req: Request) {
  const id = await getIdentity();
  if (!id.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { provider?: string; token?: string };
  const settings = await getSettings();
  const provider = getProvider(body.provider || settings.aiProvider);
  const key =
    (body.token && body.token.trim()) ||
    (settings.aiProvider === provider.id ? settings.aiApiKey : "") ||
    process.env.AI_API_KEY ||
    "";
  if (!key) return Response.json({ error: "Chưa có token — dán token trước." }, { status: 400 });

  try {
    const models = await listModels(provider, key);
    return Response.json({ provider: provider.id, endpoint: provider.endpoint, models });
  } catch (e) {
    return Response.json({ error: `${provider.name}: ${(e as Error).message}` }, { status: 502 });
  }
}
