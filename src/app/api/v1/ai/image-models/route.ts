import { getIdentity } from "@/lib/identity";
import { getSettings } from "@/lib/settings";
import { getImageProvider, listImageModels } from "@/lib/imageProviders";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// List image models for an image provider. Uses the pasted token if present,
// else the stored image token (when the stored provider matches). Keyless
// providers (Pollinations) return their curated list. Admin-only; token never
// logged or echoed.
export async function POST(req: Request) {
  const id = await getIdentity();
  if (!id.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { provider?: string; token?: string };
  const settings = await getSettings();
  const provider = getImageProvider(body.provider || settings.aiImageProvider);
  const key =
    (body.token && body.token.trim()) ||
    (settings.aiImageProvider === provider.id ? settings.aiImageApiKey : "") ||
    "";
  if (!provider.keyless && !key) {
    return Response.json({ error: "Chưa có token — dán token trước." }, { status: 400 });
  }
  try {
    const models = await listImageModels(provider, key);
    return Response.json({ provider: provider.id, endpoint: provider.endpoint, models });
  } catch (e) {
    return Response.json({ error: `${provider.name}: ${(e as Error).message}` }, { status: 502 });
  }
}
