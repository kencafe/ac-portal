// Image-generation provider registry — parallel to lib/providers (text). The
// admin picks a provider + model + API key in the CMS, exactly like the text
// model. Image APIs are NOT OpenAI-chat-compatible, so this has its own shape
// (and its own key: settings.aiImageApiKey, separate from the text key).

export interface ImageProvider {
  id: string;
  name: string;
  keyless: boolean; // Pollinations needs no key/billing
  endpoint: string; // shown read-only
  keyHint: string;
  keyUrl: string;
  models: string[]; // curated fallback list (used when live listing isn't available)
}

export const IMAGE_PROVIDERS: ImageProvider[] = [
  {
    id: "pollinations",
    name: "Pollinations (miễn phí, không key)",
    keyless: true,
    endpoint: "https://image.pollinations.ai",
    keyHint: "(không cần key)",
    keyUrl: "https://pollinations.ai",
    models: ["flux", "turbo"],
  },
  {
    id: "gemini",
    name: "Google Gemini (cần billing)",
    keyless: false,
    endpoint: "https://generativelanguage.googleapis.com",
    keyHint: "AIza…",
    keyUrl: "https://aistudio.google.com/apikey",
    models: ["gemini-2.5-flash-image", "gemini-2.0-flash-preview-image-generation"],
  },
];

export function getImageProvider(id?: string): ImageProvider {
  return IMAGE_PROVIDERS.find((p) => p.id === id) ?? IMAGE_PROVIDERS[0];
}

export const IMAGE_PROVIDERS_PUBLIC = IMAGE_PROVIDERS.map((p) => ({
  id: p.id,
  name: p.name,
  keyless: p.keyless,
  endpoint: p.endpoint,
  keyHint: p.keyHint,
  keyUrl: p.keyUrl,
  models: p.models,
}));

export type ImageModelInfo = { id: string; name: string };

// List image-capable models for a provider. Gemini is queried live (filtered to
// image models); keyless/others return the curated list.
export async function listImageModels(p: ImageProvider, key: string): Promise<ImageModelInfo[]> {
  if (p.id === "gemini" && key) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=1000`, {
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      throw new Error(res.status === 400 || res.status === 403 ? "Token không hợp lệ" : `HTTP ${res.status}`);
    }
    const data = await res.json();
    const arr: Array<{ name?: string; displayName?: string }> = data.models ?? [];
    const models = arr
      .map((m) => ({ id: (m.name || "").replace(/^models\//, ""), name: m.displayName || (m.name || "").replace(/^models\//, "") }))
      .filter((m) => /image|imagen/i.test(m.id));
    return models.length ? models : p.models.map((m) => ({ id: m, name: m }));
  }
  return p.models.map((m) => ({ id: m, name: m }));
}
