import { getIdentity } from "@/lib/identity";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const AI_BASE = process.env.AI_BASE_URL || "https://api.anthropic.com";

// List available Anthropic models. Uses the token pasted in the request body if
// present, otherwise the stored/env token — so the admin can "Lấy model" before
// saving. Admin-only; the token is never logged or echoed back.
export async function POST(req: Request) {
  const id = await getIdentity();
  if (!id.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { token?: string };
  const key =
    (body.token && body.token.trim()) ||
    (await getSettings()).aiApiKey ||
    process.env.AI_API_KEY ||
    "";
  if (!key) return Response.json({ error: "Chưa có token — dán token trước." }, { status: 400 });

  try {
    const res = await fetch(`${AI_BASE}/v1/models?limit=1000`, {
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      const detail = res.status === 401 ? "Token không hợp lệ" : `HTTP ${res.status}`;
      return Response.json({ error: `Anthropic: ${detail}` }, { status: 502 });
    }
    const data = await res.json();
    const models = (data.data ?? []).map((m: { id: string; display_name?: string }) => ({
      id: m.id,
      name: m.display_name || m.id,
    }));
    return Response.json({ models });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
