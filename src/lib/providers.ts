// AI provider registry. The user picks a provider and pastes a token; the base
// URLs and API style are known here so they never have to type an endpoint.
// Most providers (OpenAI, xAI/Grok, Qwen/DashScope, DeepSeek, Groq, Gemini)
// speak the OpenAI-compatible wire format; Anthropic has its own.

export type ApiStyle = "anthropic" | "openai";

export interface Provider {
  id: string;
  name: string;
  apiStyle: ApiStyle;
  endpoint: string; // base URL shown to the user (read-only)
  modelsUrl: string; // absolute list-models URL
  chatUrl: string; // absolute chat/messages URL
  keyHint: string; // token prefix hint
  keyUrl: string; // where to get a token
}

export const PROVIDERS: Provider[] = [
  {
    id: "anthropic",
    name: "Claude (Anthropic)",
    apiStyle: "anthropic",
    endpoint: "https://api.anthropic.com",
    modelsUrl: "https://api.anthropic.com/v1/models?limit=1000",
    chatUrl: "https://api.anthropic.com/v1/messages",
    keyHint: "sk-ant-…",
    keyUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "openai",
    name: "OpenAI (GPT)",
    apiStyle: "openai",
    endpoint: "https://api.openai.com/v1",
    modelsUrl: "https://api.openai.com/v1/models",
    chatUrl: "https://api.openai.com/v1/chat/completions",
    keyHint: "sk-…",
    keyUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "xai",
    name: "xAI (Grok)",
    apiStyle: "openai",
    endpoint: "https://api.x.ai/v1",
    modelsUrl: "https://api.x.ai/v1/models",
    chatUrl: "https://api.x.ai/v1/chat/completions",
    keyHint: "xai-…",
    keyUrl: "https://console.x.ai",
  },
  {
    id: "qwen",
    name: "Qwen (Alibaba DashScope)",
    apiStyle: "openai",
    endpoint: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    modelsUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/models",
    chatUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
    keyHint: "sk-…",
    keyUrl: "https://dashscope.console.aliyun.com/apiKey",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    apiStyle: "openai",
    endpoint: "https://api.deepseek.com/v1",
    modelsUrl: "https://api.deepseek.com/v1/models",
    chatUrl: "https://api.deepseek.com/v1/chat/completions",
    keyHint: "sk-…",
    keyUrl: "https://platform.deepseek.com/api_keys",
  },
  {
    id: "groq",
    name: "Groq",
    apiStyle: "openai",
    endpoint: "https://api.groq.com/openai/v1",
    modelsUrl: "https://api.groq.com/openai/v1/models",
    chatUrl: "https://api.groq.com/openai/v1/chat/completions",
    keyHint: "gsk_…",
    keyUrl: "https://console.groq.com/keys",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    apiStyle: "openai",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/openai",
    modelsUrl: "https://generativelanguage.googleapis.com/v1beta/openai/models",
    chatUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    keyHint: "AIza…",
    keyUrl: "https://aistudio.google.com/apikey",
  },
];

export function getProvider(id?: string): Provider {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}

// Client-safe view (no behavioural URLs the browser shouldn't call directly,
// but endpoint/keyHint/keyUrl are fine to show).
export const PROVIDERS_PUBLIC = PROVIDERS.map((p) => ({
  id: p.id,
  name: p.name,
  endpoint: p.endpoint,
  keyHint: p.keyHint,
  keyUrl: p.keyUrl,
}));

export type ModelInfo = { id: string; name: string };

export async function listModels(p: Provider, key: string): Promise<ModelInfo[]> {
  const headers: Record<string, string> =
    p.apiStyle === "anthropic"
      ? { "x-api-key": key, "anthropic-version": "2023-06-01" }
      : { authorization: `Bearer ${key}` };
  const res = await fetch(p.modelsUrl, { headers, signal: AbortSignal.timeout(20000) });
  if (!res.ok) {
    throw new Error(res.status === 401 || res.status === 403 ? "Token không hợp lệ" : `HTTP ${res.status}`);
  }
  const data = await res.json();
  const arr: Array<{ id?: string; name?: string; display_name?: string }> =
    data.data ?? data.models ?? [];
  return arr
    .map((m) => ({ id: (m.id || m.name || "").replace(/^models\//, ""), name: m.display_name || m.id || m.name || "" }))
    .filter((m) => m.id);
}

// Single-shot chat completion, provider-agnostic. Returns the assistant text.
export async function chatComplete(
  p: Provider,
  key: string,
  model: string,
  prompt: string,
): Promise<string> {
  if (p.apiStyle === "anthropic") {
    const res = await fetch(p.chatUrl, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) throw new Error(`${model} → HTTP ${res.status}: ${await res.text()}`);
    const d = await res.json();
    return d?.content?.[0]?.text ?? "";
  }
  const res = await fetch(p.chatUrl, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`${model} → HTTP ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return d?.choices?.[0]?.message?.content ?? "";
}
