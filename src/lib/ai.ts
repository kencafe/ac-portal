// AI ingest pipeline: fetch a source article (or RSS items), have an AI model
// edit + translate it to Vietnamese, and store it as a post — as a draft or
// published depending on site settings.
//
// The model call uses the Anthropic Messages API when an API key is configured
// (env AI_API_KEY, or the CMS "Cấu hình API" value injected as AI_API_KEY).
// Without a key the pipeline still runs but produces a clearly-labelled
// passthrough so the flow is testable offline — it never fabricates a
// human-quality translation silently.

import { upsertPost, getPost, availableSlug } from "@/lib/store";
import { getSettings } from "@/lib/settings";
import { notifyPublished } from "@/lib/notify";
import { getProvider, chatComplete } from "@/lib/providers";
import { addHistory, seenUrls, type IngestMode } from "@/lib/history";
import { putImage } from "@/lib/storage";
import { getImageProvider } from "@/lib/imageProviders";
import type { Block } from "@/data/posts";

const ENV_AI_API_KEY = process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY || "";
const ENV_AI_MODEL = process.env.AI_MODEL || "";
const DEFAULT_MODEL = "claude-sonnet-5";

// English image prompt for a clean, appealing editorial cover (no text).
// `scene` (from the AI, content-aware) or `hint` (excerpt/keywords) makes the
// image reflect the actual article, not a generic template.
// Map English tech keywords in the (often Vietnamese) title to a CONCRETE
// English visual motif. Feeding a Vietnamese title straight to an image model
// produces irrelevant results (e.g. "Kubernetes" → its Greek "helmsman"/ship's
// wheel meaning → boats). A curated motif grounds the model on the real topic.
function visualScene(title: string, cat: string): string {
  const t = `${title} ${cat}`.toLowerCase();
  const has = (re: RegExp) => re.test(t);
  if (has(/kubernetes|k8s|container|docker|openshift|helm|pod\b/)) return "container orchestration — hexagonal container pods on server racks, connected cluster nodes and monitoring dashboards";
  if (has(/metric|observ|monitor|prometheus|grafana|logging|tracing|telemetry|exporter/)) return "an observability dashboard with line charts, gauges and metric panels on dark screens";
  if (has(/ci\/cd|cicd|pipeline|devops|deploy|gitops|argo|tekton|jenkins/)) return "a CI/CD pipeline: connected build, test and deploy stages with automation gears and flowing arrows";
  if (has(/secur|devsecops|vulnerab|owasp|harden|zero.?trust|threat|encrypt/)) return "a cybersecurity concept — a glowing shield and padlock over a secured network of a data center";
  if (has(/cloud|aws|azure|gcp|infrastructure|terraform|\biac\b/)) return "cloud infrastructure — data-center servers linked to a cloud with network topology lines";
  if (has(/\bai\b|\bml\b|machine learning|llm|neural|genai|model|inference/)) return "an artificial-intelligence concept — a neural network of glowing nodes and data flows on a circuit board";
  if (has(/database|postgres|\bsql\b|\bdata\b|etl|lakehouse|warehouse/)) return "data engineering — stacked database cylinders with data pipelines and flowing streams";
  if (has(/network|mesh|istio|\bdns\b|ingress|routing|load.?balanc/)) return "a network topology of interconnected nodes, routers and traffic flows";
  if (has(/\bsre\b|reliab|incident|\bslo\b|availab|uptime/)) return "site reliability engineering — uptime dashboards, alerting panels and system-health graphs";
  return `a clean conceptual technology illustration about ${cat || "cloud and DevOps"}`;
}

function coverPrompt(title: string, cat: string, scene = "", raw = false): string {
  // Manual/raw prompt from the editor → use it verbatim (they control text,
  // logos, style). Auto covers keep the brand editorial style + no-text rule.
  if (raw && scene.trim()) return scene.trim();
  // scene = the AI's English imagePrompt when present; otherwise derive a
  // concrete English motif from the topic (never the raw Vietnamese title/prose).
  const subject = scene.trim() ? scene.trim() : visualScene(title, cat);
  return `Professional editorial cover illustration depicting ${subject}. Modern flat vector isometric style, conceptual and specific to the subject, clean composition, deep blue and green brand palette, subtle depth. No text, no words, no letters, no logos, no watermark.`;
}

async function saveCover(slug: string, buf: Buffer, ext: string): Promise<string> {
  const name = `${slug}.${ext}`;
  const type = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : ext === "gif" ? "image/gif" : "image/png";
  await putImage(name, buf, type);
  return `/api/cover-img/${name}`;
}

// Free, keyless AI image via Pollinations (Flux/SD). Works WITHOUT any billing.
async function pollinationsImage(slug: string, title: string, cat: string, scene = "", nonce = 0, raw = false): Promise<string> {
  // Deterministic seed by default; a nonce (manual re-generate) varies the image.
  const seed = nonce > 0 ? nonce % 1000000 : Math.abs(hashCode(title)) % 100000;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(coverPrompt(title, cat, scene, raw))}?width=1200&height=630&nologo=true&seed=${seed}&model=flux`;
  const res = await fetch(url, { signal: AbortSignal.timeout(120000), redirect: "follow" });
  if (!res.ok) throw new Error(`pollinations HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  if (!ct.startsWith("image/")) throw new Error(`pollinations non-image (${ct})`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error("pollinations empty image");
  const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg";
  return saveCover(slug, buf, ext);
}

// Gemini image model (reuses aiApiKey; needs billing — 429 on free tier).
async function geminiImage(slug: string, title: string, cat: string, apiKey: string, model: string, scene = "", raw = false): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: coverPrompt(title, cat, scene, raw) }] }], generationConfig: { responseModalities: ["IMAGE"] } }),
    signal: AbortSignal.timeout(90000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const d = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = d?.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p) => p?.inlineData?.data);
  if (!img) throw new Error("no image in response");
  const mime: string = img.inlineData.mimeType || "image/png";
  const ext = mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : "png";
  return saveCover(slug, Buffer.from(img.inlineData.data, "base64"), ext);
}

// OpenAI-images-compatible generation (OpenAI gpt-image-1/DALL·E, xAI Grok
// image, and any gateway exposing POST {endpoint}/images/generations → b64_json).
async function openaiImage(slug: string, title: string, cat: string, endpoint: string, apiKey: string, model: string, scene = "", raw = false): Promise<string> {
  const body: Record<string, unknown> = { model, prompt: coverPrompt(title, cat, scene, raw), n: 1 };
  // `size` only for genuine OpenAI models (other OpenAI-compatible providers —
  // Together/DeepInfra/Recraft/xAI — reject OpenAI's size strings; use defaults).
  if (/^gpt-image/.test(model)) body.size = "1536x1024";
  else if (/dall-e-3/.test(model)) { body.size = "1792x1024"; body.response_format = "b64_json"; }
  else if (/dall-e-2/.test(model)) { body.size = "1024x1024"; body.response_format = "b64_json"; }
  else body.response_format = "b64_json"; // gpt-image-1 ignores this; others honor it
  const res = await fetch(`${endpoint.replace(/\/$/, "")}/images/generations`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const d = await res.json();
  const item = d?.data?.[0] ?? {};
  if (item.b64_json) return saveCover(slug, Buffer.from(item.b64_json, "base64"), "png");
  if (item.url) {
    // Provider returned a URL instead of base64 — fetch the bytes.
    const r = await fetch(item.url, { signal: AbortSignal.timeout(60000) });
    if (!r.ok) throw new Error(`image url HTTP ${r.status}`);
    const ct = r.headers.get("content-type") || "";
    const ext = ct.includes("jpeg") || ct.includes("jpg") ? "jpg" : ct.includes("webp") ? "webp" : "png";
    return saveCover(slug, Buffer.from(await r.arrayBuffer()), ext);
  }
  throw new Error("no image in response");
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; }
  return h;
}

// Excerpt: end the summary cleanly (AC-011). Within the window prefer the LAST
// sentence-ending punctuation (. ! ? … ; :) so the excerpt closes on a complete
// clause and keeps that punctuation. If no sentence end is found, fall back to a
// word-boundary cut + ellipsis (never mid-word). Short text is returned as-is.
function clipExcerpt(text: string, max = 220): string {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);

  // Sentence end = terminator followed by whitespace or end of window (so we
  // never break on a decimal point / abbreviation like "3.5" or "e.g.").
  const sentenceEnd = /[.!?…;:](?=\s|$)/g;
  let lastEnd = -1;
  for (let m = sentenceEnd.exec(cut); m; m = sentenceEnd.exec(cut)) lastEnd = m.index;
  // Accept the sentence boundary as long as it yields a non-trivial excerpt
  // (~80 chars), so a clean clause is preferred over a longer mid-sentence cut.
  const minLen = Math.min(80, max);
  if (lastEnd + 1 >= minLen) return cut.slice(0, lastEnd + 1).trim();

  // Fallback: word boundary + ellipsis.
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut;
  return base.replace(/[\s.,;:!?…-]+$/, "") + "…";
}

// Result of a cover generation: the image URL plus which provider/model actually
// produced it. `provider` is the real source used — the configured one, the
// "pollinations" free fallback, or "svg" when we fell back to the branded
// illustration. The editor surfaces this so the admin sees the true source.
export interface CoverResult {
  url: string;
  provider: string; // provider id actually used, or "svg"
  model: string;    // model actually used ("" for svg)
  aiUsed: boolean;   // true when a real AI image was produced
  fallbackReason?: string; // set when the configured provider failed and we used Pollinations/SVG
}

// Generate a real cover image via the configured image provider (see
// lib/imageProviders): pollinations (free/keyless, default), gemini (billing),
// or any OpenAI-images-compatible provider (OpenAI/xAI). Saves to storage and
// returns the URL plus the real provider/model used. When the configured
// provider fails (missing key / 429 / error) it auto-falls back to Pollinations
// (free, keyless) before finally falling back to the branded SVG illustration —
// so the manual "create AI image" button always yields a real image when
// Pollinations egress is available.
export async function makeCoverDetailed(slug: string, title: string, cat = "", tone = "#0072BC", force = false, scene = "", nonce = 0, raw = false): Promise<CoverResult> {
  const fallback = coverFor(title, cat, tone);
  const s = await getSettings();
  if (!s.aiImageEnabled && !force) return { url: fallback, provider: "svg", model: "", aiUsed: false };
  const provider = getImageProvider(s.aiImageProvider);
  const model = s.aiImageModel || provider.models[0] || "";
  let fallbackReason = "";
  try {
    if (provider.apiStyle === "gemini") {
      const apiKey = s.aiImageApiKey || "";
      if (!apiKey) throw new Error("no image api key (đặt ở Cấu hình API → Tạo ảnh bìa)");
      const out = await geminiImage(slug, title, cat, apiKey, model || "gemini-2.5-flash-image", scene, raw);
      console.log(`[ai] cover via gemini for ${slug}`);
      return { url: out, provider: provider.id, model: model || "gemini-2.5-flash-image", aiUsed: true };
    }
    if (provider.apiStyle === "openai-images") {
      const apiKey = s.aiImageApiKey || "";
      if (!apiKey) throw new Error("no image api key (đặt ở Cấu hình API → Tạo ảnh bìa)");
      const out = await openaiImage(slug, title, cat, provider.endpoint, apiKey, model, scene, raw);
      console.log(`[ai] cover via ${provider.id} for ${slug}`);
      return { url: out, provider: provider.id, model, aiUsed: true };
    }
    const out = await pollinationsImage(slug, title, cat, scene, nonce, raw);
    console.log(`[ai] cover via pollinations for ${slug}`);
    // pollinationsImage always requests the flux model, so report that (not the
    // configured aiImageModel, which may belong to a different provider).
    return { url: out, provider: "pollinations", model: "flux", aiUsed: true };
  } catch (e) {
    fallbackReason = (e as Error).message;
    console.error(`[ai] cover image failed for ${slug} (${provider.id}):`, fallbackReason);
    // Auto-fallback to Pollinations (free, keyless) when the configured provider
    // isn't already Pollinations — keeps the manual button working when the
    // billed provider has no key / hit 429.
    if (provider.apiStyle !== "pollinations") {
      try {
        const out = await pollinationsImage(slug, title, cat, scene, nonce, raw);
        console.log(`[ai] cover via pollinations (fallback) for ${slug}`);
        return { url: out, provider: "pollinations", model: "flux", aiUsed: true, fallbackReason };
      } catch (e2) {
        fallbackReason = `${fallbackReason}; pollinations: ${(e2 as Error).message}`;
        console.error(`[ai] pollinations fallback failed for ${slug}:`, (e2 as Error).message);
      }
    }
    return { url: fallback, provider: "svg", model: "", aiUsed: false, fallbackReason };
  }
}

// Backwards-compatible wrapper: returns just the URL (used by the auto/ingest
// paths that don't need to know the exact provider used).
export async function makeCover(slug: string, title: string, cat = "", tone = "#0072BC", force = false, scene = "", nonce = 0, raw = false): Promise<string> {
  return (await makeCoverDetailed(slug, title, cat, tone, force, scene, nonce, raw)).url;
}

// Curated, reputable tech sources so "AI tự tìm bài" works out-of-the-box even
// when the admin hasn't added any RSS feed yet. Used only as a fallback for
// discovery — the admin's own feeds take precedence when present.
export const DEFAULT_DISCOVER_FEEDS = [
  "https://kubernetes.io/feed.xml",
  "https://www.cncf.io/feed/",
  "https://aws.amazon.com/blogs/devops/feed/",
  "https://cloud.google.com/blog/products/devops-sre/rss",
  "https://www.docker.com/blog/feed/",
  "https://kubernetes.io/blog/feed.xml",
];

export type IngestResult = {
  slug: string;
  title: string;
  status: "draft" | "published";
  aiUsed: boolean;
  source: string;
};

// Vietnamese display date "DD/MM/YYYY" for the article header (TZ is set to
// Asia/Ho_Chi_Minh on the pod). Replaces the design "[Ngày đăng]" placeholder.
function todayVN(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())} · ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// Count words (space-tokens) across all blocks — the same measure the reading
// time uses, so length targets and the displayed "N phút đọc" label agree.
function wordCount(blocks: Block[]): number {
  return blocks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((b: any) => (b.kind === "list" ? (b.items ?? []).join(" ") : b.text ?? ""))
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

// Estimate reading time from block text (~200 words/min, min 1).
function readingTime(blocks: Block[]): string {
  return `${Math.max(1, Math.round(wordCount(blocks) / 200))} phút đọc`;
}

// Target length for full articles: ~10-minute read. readingTime uses 200
// words/min, so ~2000 space-tokens ≈ 10 min; TOO_SHORT triggers one expand pass.
const TARGET_WORDS = 2000;
const TOO_SHORT = 1600;

// House length/depth guidance appended to full-article prompts (NOT the
// copyright-safe summarize path, which stays intentionally short).
const LENGTH_GUIDE =
  `\nMỤC TIÊU ĐỘ DÀI (bắt buộc): Bài phải đủ dài để đọc trong khoảng 8–10 phút — tương đương KHOẢNG 1.900–2.200 chữ tiếng Việt. Đây là bài CHUYÊN SÂU, KHÔNG phải tóm tắt: khai thác đầy đủ từng phần. Mỗi tiêu đề phụ có ít nhất 2–3 đoạn văn có chiều sâu, kèm ví dụ thực tế/số liệu/tình huống minh hoạ cụ thể, cùng lý do "tại sao" và cách áp dụng. Có mở bài nêu bối cảnh và một phần kết luận/khuyến nghị. Câu chữ súc tích NHƯNG tổng thể phải đủ dài và đủ sâu — tuyệt đối KHÔNG nhồi chữ sáo rỗng, KHÔNG lặp ý để kéo dài.\n`;

// Resolve a possibly-relative image URL against the article URL. Returns "" on
// failure so the gradient placeholder kicks in.
function absolutize(src: string, base: string): string {
  if (!src) return "";
  try {
    return new URL(src, base).toString();
  } catch {
    return "";
  }
}

// Generated-cover URL for a post with no real photo — a branded title-card
// image served by /api/cover (server-rendered, so no blank/flash).
export function coverFor(title: string, cat = "", tone = "#0072BC"): string {
  const q = new URLSearchParams({ title: title.slice(0, 140), cat, tone: tone.replace("#", "") });
  return `/api/cover?${q.toString()}`;
}

function slugify(s: string): string {
  return s
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    .slice(0, 60) || "bai-viet-" + Date.now();
}

function stripHtml(html: string): { title: string; text: string; cover: string } {
  const title =
    (html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1] ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      "").trim();
  // Prefer <article>, else <body>.
  const body = html.match(/<article[\s\S]*?<\/article>/i)?.[0] || html;
  // Lead image: Open Graph / Twitter card meta first (attr order-agnostic),
  // else the first real content <img> in the article (skip icons/logos/svg).
  const articleImg = (() => {
    for (const m of body.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
      const src = m[1];
      if (/\.svg(\?|$)/i.test(src)) continue;
      if (/(logo|icon|avatar|sprite|badge|emoji|favicon)/i.test(src)) continue;
      return src;
    }
    return "";
  })();
  const cover = (
    html.match(/<meta[^>]+property=["']og:image(?::url)?["'][^>]+content=["']([^"']+)/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1] ||
    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)/i)?.[1] ||
    articleImg ||
    ""
  ).trim();
  const text = body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  return { title, text, cover };
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "user-agent": "ac-portal-ai/1.0 (+https://appcarrier.cloud)" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`fetch ${url} → HTTP ${res.status}`);
  return res.text();
}

// Extract up to `limit` item links from an RSS/Atom feed.
export function parseFeedLinks(xml: string, limit = 5): string[] {
  return parseFeedItems(xml, limit).map((i) => i.url);
}

export type FeedItem = { title: string; url: string };

// Validate an RSS/Atom source: reachable + parseable + item count + samples.
export async function checkFeed(url: string): Promise<{ ok: boolean; count: number; titles: string[]; error?: string }> {
  try {
    const xml = await fetchText(url);
    const items = parseFeedItems(xml, 50);
    if (items.length === 0) return { ok: false, count: 0, titles: [], error: "Không phải RSS/Atom hoặc không có bài" };
    return { ok: true, count: items.length, titles: items.slice(0, 3).map((i) => i.title) };
  } catch (e) {
    return { ok: false, count: 0, titles: [], error: (e as Error).message };
  }
}

// Extract {title, link} pairs from an RSS/Atom feed.
export function parseFeedItems(xml: string, limit = 20): FeedItem[] {
  const out: FeedItem[] = [];
  const items = xml.match(/<(item|entry)[\s\S]*?<\/\1>/gi) || [];
  for (const it of items) {
    const url = (
      it.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] ||
      it.match(/<link>([^<]+)<\/link>/i)?.[1] ||
      it.match(/<guid[^>]*>([^<]+)<\/guid>/i)?.[1] ||
      ""
    ).trim();
    const title = (it.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "")
      .replace(/<!\[CDATA\[|\]\]>/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .trim();
    if (url) out.push({ title: title || url, url });
    if (out.length >= limit) break;
  }
  return out;
}

// AI biên tập: rewrite/clean up the raw content into a publish-ready Vietnamese
// article (the AI plays the editor's role instead of a person). Returns a title
// + content blocks.
// Parse the model's JSON reply into content blocks (h/p/list/quote), tolerant of
// fences and the legacy paragraphs[] shape. Falls back to a single block.
// Best-effort parse of the model's JSON reply, tolerant of TRUNCATED output
// (when the completion is cut mid-array the brackets don't close). Tries the
// greedy match first, then salvages by trimming to the last complete object and
// re-closing the array + root so a long-but-cut reply still yields most blocks.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseModelJson(raw: string): any {
  try {
    return JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw);
  } catch {
    /* try to repair a truncated reply */
  }
  const start = raw.indexOf("{");
  if (start < 0) return null;
  const s = raw.slice(start);
  const lastObj = s.lastIndexOf("}");
  if (lastObj > 0) {
    for (const suffix of ["]}", "}"]) {
      try {
        return JSON.parse(s.slice(0, lastObj + 1) + suffix);
      } catch {
        /* keep trying */
      }
    }
  }
  return null;
}

function blocksFromRaw(raw: string): { title: string; blocks: Block[]; imagePrompt: string } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed: any = parseModelJson(raw);
  const KINDS = new Set(["h", "p", "list", "quote"]);
  let blocks: Block[] = [];
  if (parsed && Array.isArray(parsed.blocks)) {
    blocks = parsed.blocks
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((b: any): Block | null => {
        const kind = KINDS.has(b?.type) ? b.type : "p";
        if (kind === "list") {
          const items = (Array.isArray(b.items) ? b.items : String(b.text ?? "").split("\n")).map((s: string) => String(s).trim()).filter(Boolean);
          return items.length ? { kind: "list", items } : null;
        }
        const text = String(b?.text ?? "").trim();
        return text ? { kind, text } : null;
      })
      .filter(Boolean) as Block[];
  } else if (parsed && Array.isArray(parsed.paragraphs)) {
    blocks = parsed.paragraphs.filter(Boolean).map((p: string) => ({ kind: "p", text: p }) as Block);
  }
  if (blocks.length === 0) {
    // Last resort: keep the raw text (split into paragraphs) instead of a tiny stub.
    blocks = raw.replace(/```json|```/g, "").split(/\n{2,}/).map((s) => s.trim()).filter(Boolean).slice(0, 40).map((t) => ({ kind: "p", text: t.slice(0, 2000) }) as Block);
    if (blocks.length === 0) blocks = [{ kind: "p", text: raw.slice(0, 2000) }];
  }
  return { title: parsed?.title || "", blocks, imagePrompt: typeof parsed?.imagePrompt === "string" ? parsed.imagePrompt : "" };
}

type AiEditOpts = {
  instruction?: string; // extra guidance from the editor (preview → chỉnh theo ý)
  summarize?: boolean;  // copyright-safe mode: summary + commentary + attribution
  sourceName?: string;
  sourceUrl?: string;
};

async function aiEdit(
  title: string,
  text: string,
  opts: AiEditOpts = {},
): Promise<{ title: string; blocks: Block[]; aiUsed: boolean; imagePrompt: string }> {
  const { instruction, summarize, sourceName, sourceUrl } = opts;
  const clipped = text.slice(0, 24000);

  // Provider + token + model come from the CMS "Cấu hình API" (settings) first,
  // then env. The provider decides Anthropic-style vs OpenAI-compatible calls.
  const settings = await getSettings();
  const provider = getProvider(settings.aiProvider);
  const apiKey = settings.aiApiKey || ENV_AI_API_KEY;
  const model = settings.aiModel || ENV_AI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    // Honest offline fallback — the AI editor hasn't run.
    const blocks: Block[] = [
      { kind: "p", text: "[AI chưa cấu hình khóa — chưa biên tập, đây là nội dung gốc]" },
      { kind: "p", text: clipped.slice(0, 1500) },
    ];
    return { title: title || "Bài nhập tự động", blocks, aiUsed: false, imagePrompt: "" };
  }

  const styleRules =
    `PHONG CÁCH NHÀ (bắt buộc bám theo):\n` +
    `- Tiếng Việt kỹ thuật, chuyên nghiệp, súc tích; câu ngắn gọn, đi thẳng vấn đề, không sáo rỗng, không câu view.\n` +
    `- Tiêu đề rõ nghĩa, đúng trọng tâm. Mở bài nêu ngay bối cảnh/insight thực dụng (kiểu SRE/DevOps).\n` +
    `- Giữ nguyên thuật ngữ tiếng Anh phổ biến (Kubernetes, SRE, latency, error budget…) khi tự nhiên hơn là dịch cứng.\n` +
    `- BỐ CỤC: chia bài thành nhiều phần, mỗi phần có TIÊU ĐỀ PHỤ (heading) ngắn gọn; dưới mỗi heading là 1–3 đoạn văn. Dùng danh sách bullet khi liệt kê. Có thể dùng 1 trích dẫn nếu phù hợp.\n`;

  const head = summarize
    ? `Bạn là biên tập viên kỹ thuật của blog FPT-IS Next Gen Service. Hãy viết một bài TÓM TẮT & BÌNH LUẬN bằng tiếng Việt từ nội dung nguồn dưới đây — TUYỆT ĐỐI KHÔNG chép nguyên văn, KHÔNG dịch nguyên câu. An toàn bản quyền là bắt buộc.\n` +
      `YÊU CẦU CHẾ ĐỘ TÓM TẮT:\n` +
      `- Diễn đạt lại bằng lời của bạn, độ dài chỉ ~40–50% bản gốc.\n` +
      `- Nêu các ý chính, sau đó thêm một mục "Góc nhìn NS" (nhận định/khuyến nghị ngắn của đội ngũ).\n` +
      `- Không trích quá 1 câu ngắn từ bản gốc; nếu trích phải để trong "quote".\n` + styleRules
    : `Bạn là biên tập viên kỹ thuật của blog FPT-IS Next Gen Service. Hãy BIÊN TẬP LẠI nội dung sau thành một bài viết hoàn chỉnh, CÓ CẤU TRÚC, chuyên sâu, chuẩn để xuất bản, bằng tiếng Việt.\n` + styleRules + LENGTH_GUIDE;

  const prompt =
    head +
    `Trả về JSON THUẦN theo đúng schema (không thêm chữ ngoài JSON):\n` +
    `{"title":"...","blocks":[{"type":"h","text":"Tiêu đề phụ"},{"type":"p","text":"đoạn văn"},{"type":"list","items":["ý 1","ý 2"]},{"type":"quote","text":"trích dẫn"}]}\n` +
    `type chỉ nhận: "h" (tiêu đề phụ), "p" (đoạn văn), "list" (danh sách), "quote" (trích dẫn). ` +
    (summarize ? `Bài tóm tắt nên có 2–4 heading.\n` : `Bài nên có 5–7 heading, mỗi heading có ít nhất 2–3 đoạn văn.\n`) +
    `Kèm thêm trường "imagePrompt": một câu tiếng ANH mô tả cảnh minh hoạ bìa CỤ THỂ theo nội dung bài (đối tượng, bối cảnh kỹ thuật rõ ràng) để sinh ảnh — KHÔNG chứa chữ trong ảnh.\n` +
    (instruction?.trim()
      ? `\nYÊU CẦU CHỈNH SỬA THÊM TỪ BIÊN TẬP VIÊN (ưu tiên cao, bám sát): ${instruction.trim()}\n`
      : "") +
    `\nTIÊU ĐỀ GỐC: ${title}\n\nNỘI DUNG:\n${clipped}`;

  const raw = await chatComplete(provider, apiKey, model, prompt);
  let { title: genTitle, blocks, imagePrompt } = blocksFromRaw(raw);

  // Enforce the ~10-minute length target: if a full edit came back too short,
  // ask once to expand it (keeping topic + structure). Skipped for summaries.
  if (!summarize && wordCount(blocks) < TOO_SHORT) {
    try {
      const expandPrompt =
        `Bản nháp JSON dưới đây CÒN NGẮN so với yêu cầu (~${TARGET_WORDS} chữ, đọc 8–10 phút). ` +
        `Hãy VIẾT LẠI DÀI HƠN và SÂU HƠN: giữ nguyên chủ đề, ngôn ngữ (tiếng Việt) và cấu trúc heading, ` +
        `bổ sung ví dụ thực tế/số liệu/giải thích "tại sao" cho mỗi phần, thêm mở bài và kết luận nếu thiếu. ` +
        `KHÔNG nhồi chữ sáo rỗng, KHÔNG lặp ý. Trả về JSON THUẦN đúng schema cũ (title/blocks/imagePrompt).\n\nBẢN NHÁP:\n` +
        JSON.stringify({ title: genTitle, blocks });
      const raw2 = await chatComplete(provider, apiKey, model, expandPrompt);
      const out2 = blocksFromRaw(raw2);
      if (wordCount(out2.blocks) > wordCount(blocks)) {
        genTitle = out2.title || genTitle;
        blocks = out2.blocks;
        if (out2.imagePrompt) imagePrompt = out2.imagePrompt;
      }
    } catch (e) {
      console.error("[ai] expand pass failed:", (e as Error).message);
    }
  }

  // Attribution — always cite the source (required for the copyright-safe path,
  // added whenever a source is provided). Avoid duplicating if the model wrote one.
  if (sourceName || sourceUrl) {
    const cite = `Nguồn: ${[sourceName, sourceUrl].filter(Boolean).join(" — ")}`;
    const already = blocks.some((b) => (b.text ?? "").toLowerCase().startsWith("nguồn:"));
    if (!already) blocks.push({ kind: "quote", text: cite });
  }

  return { title: genTitle || title || "Bài nhập tự động", blocks, aiUsed: true, imagePrompt };
}

// Core: run AI edit over raw {title,text} → create a post + log history.
// Shared by URL ingest and file (Word/PDF) ingest.
export async function ingestText(
  rawTitle: string,
  text: string,
  opts?: { forcePublish?: boolean; cat?: string; mode?: IngestMode; source?: string; note?: string; url?: string; cover?: string; summarize?: boolean; sourceName?: string; sourceUrl?: string },
): Promise<IngestResult> {
  const settings = await getSettings();
  const { title, blocks, aiUsed, imagePrompt } = await aiEdit(rawTitle, text, {
    summarize: opts?.summarize,
    sourceName: opts?.sourceName,
    sourceUrl: opts?.sourceUrl ?? opts?.url,
  });

  const publish = opts?.forcePublish ?? settings.autoPublishAiPosts;
  const status: "draft" | "published" = publish ? "published" : "draft";
  const slug = await availableSlug(slugify(title));
  const url = opts?.url ?? opts?.source ?? "";
  const excerpt = clipExcerpt(blocks.find((b) => b.kind === "p")?.text ?? "");
  // Content-aware cover: use the AI's English visual imagePrompt when present.
  // Do NOT fall back to the Vietnamese excerpt/prose — feeding article prose to
  // an image model yields abstract/irrelevant covers. Empty scene lets
  // coverPrompt build a topic-based English visual prompt from title + category.
  const scene = (imagePrompt || "").trim();
  const cover = opts?.cover || (await makeCover(slug, title, opts?.cat || "AIOps", "#0072BC", false, scene));

  const saved = await upsertPost({
    slug,
    title,
    cat: opts?.cat || "AIOps",
    tone: "#0072BC",
    excerpt,
    author: "AI Studio",
    role: "Tự động",
    initials: "AI",
    date: todayVN(),
    read: readingTime(blocks),
    tags: opts?.summarize ? ["ai-ingest", "tom-tat"] : ["ai-ingest"],
    coverUrl: cover, // source og:image → AI image (if enabled) → generated title-card
    blocks,
    status,
  });

  // Auto-published article → fire the newsletter (no-op unless enabled/configured).
  if (status === "published") await notifyPublished(saved).catch(() => {});

  await addHistory({
    at: new Date().toISOString(),
    mode: opts?.mode ?? "manual",
    source: opts?.source ?? url ?? "file",
    url,
    title,
    slug,
    status,
    aiUsed,
    note: opts?.note,
  });

  return { slug, title, status, aiUsed, source: url || (opts?.source ?? "file") };
}

// Re-edit an existing post to the house style. Keeps the same slug, status,
// category and cover; only the title + body get rewritten by the AI editor.
// Logs the run to history (mode "reedit"). Returns null if the post is missing.
export async function reeditPost(slug: string, instruction?: string): Promise<IngestResult | null> {
  const post = await getPost(slug);
  if (!post) return null;

  // Flatten the current blocks back to source text for the editor.
  const text = (post.blocks ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((b: any) => (b.kind === "list" ? (b.items ?? []).join("\n") : b.text ?? ""))
    .filter(Boolean)
    .join("\n\n");

  const { title, blocks, aiUsed } = await aiEdit(post.title, text || post.excerpt || post.title, { instruction });

  await upsertPost({
    slug,
    title: title || post.title,
    excerpt: clipExcerpt(blocks.find((b) => b.kind === "p")?.text ?? post.excerpt ?? ""),
    blocks: blocks.length ? blocks : post.blocks,
    // status, cat, tone, author, cover, tags, featured are preserved by upsert merge.
  });

  await addHistory({
    at: new Date().toISOString(),
    mode: "reedit",
    source: "reedit",
    url: "",
    title: title || post.title,
    slug,
    status: post.status === "published" ? "published" : "draft",
    aiUsed,
    note: instruction?.trim() ? `chỉnh theo yêu cầu: ${instruction.trim().slice(0, 120)}` : "biên tập lại theo style",
  });

  return { slug, title: title || post.title, status: post.status === "published" ? "published" : "draft", aiUsed, source: "reedit" };
}

// Commission an ORIGINAL article from a brief — AI writes the content from
// scratch (e.g. "đào tạo nhân viên về DNS từ CoreDNS đến DNS nội bộ/global").
// Not editing a source: this is authored content, so no attribution needed.
export async function generateArticle(
  brief: string,
  opts?: { title?: string; cat?: string; audience?: string; forcePublish?: boolean },
): Promise<IngestResult> {
  const settings = await getSettings();
  const provider = getProvider(settings.aiProvider);
  const apiKey = settings.aiApiKey || ENV_AI_API_KEY;
  const model = settings.aiModel || ENV_AI_MODEL || DEFAULT_MODEL;

  let title = opts?.title?.trim() || "";
  let blocks: Block[];
  let aiUsed = false;
  let imagePrompt = "";

  if (!apiKey) {
    blocks = [
      { kind: "p", text: "[AI chưa cấu hình khóa — chưa sinh nội dung. Đây là đề bài đã đặt:]" },
      { kind: "p", text: brief.slice(0, 1500) },
    ];
    title = title || "Bài đặt hàng (chưa cấu hình AI)";
  } else {
    const prompt =
      `Bạn là chuyên gia kỹ thuật kiêm biên tập viên của blog FPT-IS Next Gen Service. Hãy TỰ VIẾT một bài viết HOÀN CHỈNH, nguyên gốc, bằng tiếng Việt theo ĐỀ BÀI (brief) dưới đây. Đây là nội dung do bạn soạn (không phải biên tập lại nguồn nào).\n` +
      `PHONG CÁCH & BỐ CỤC:\n` +
      `- Tiếng Việt kỹ thuật, chuyên nghiệp, chính xác; giữ thuật ngữ tiếng Anh phổ biến.\n` +
      `- Nếu là bài đào tạo/hướng dẫn: trình bày từ khái niệm nền tảng → chi tiết → ví dụ/thực hành thực tế → lưu ý & khuyến nghị.\n` +
      `- Chia phần rõ ràng: mỗi phần một TIÊU ĐỀ PHỤ (heading); dùng bullet khi liệt kê; có thể dùng trích dẫn/nhấn mạnh khi cần. Bài nên có 5–8 heading, mỗi heading ít nhất 2–3 đoạn, đủ sâu để dùng đào tạo.\n` +
      (opts?.audience?.trim() ? `- Đối tượng người đọc: ${opts.audience.trim()}.\n` : "") +
      LENGTH_GUIDE +
      `Trả về JSON THUẦN theo schema (không thêm chữ ngoài JSON):\n` +
      `{"title":"...","blocks":[{"type":"h","text":"..."},{"type":"p","text":"..."},{"type":"list","items":["..."]},{"type":"quote","text":"..."}]}\n` +
      `type chỉ nhận: "h","p","list","quote".\n` +
      `Kèm trường "imagePrompt": một câu tiếng ANH mô tả cảnh minh hoạ bìa CỤ THỂ theo nội dung bài (không chữ trong ảnh).\n\n` +
      `ĐỀ BÀI: ${brief.slice(0, 4000)}`;
    const raw = await chatComplete(provider, apiKey, model, prompt);
    const out = blocksFromRaw(raw);
    title = title || out.title || "Bài đặt hàng";
    blocks = out.blocks;
    imagePrompt = out.imagePrompt;
    aiUsed = true;

    // Enforce the ~10-minute length target with one expand pass if too short.
    if (wordCount(blocks) < TOO_SHORT) {
      try {
        const expandPrompt =
          `Bản nháp JSON dưới đây CÒN NGẮN so với yêu cầu (~${TARGET_WORDS} chữ, đọc 8–10 phút). ` +
          `Hãy VIẾT LẠI DÀI HƠN và SÂU HƠN: giữ chủ đề, tiếng Việt và cấu trúc heading, bổ sung ví dụ/số liệu/giải thích cho mỗi phần, thêm mở bài và kết luận. ` +
          `KHÔNG nhồi chữ, KHÔNG lặp ý. Trả về JSON THUẦN đúng schema cũ.\n\nBẢN NHÁP:\n` +
          JSON.stringify({ title, blocks });
        const out2 = blocksFromRaw(await chatComplete(provider, apiKey, model, expandPrompt));
        if (wordCount(out2.blocks) > wordCount(blocks)) {
          title = out2.title || title;
          blocks = out2.blocks;
          if (out2.imagePrompt) imagePrompt = out2.imagePrompt;
        }
      } catch (e) {
        console.error("[ai] generate expand pass failed:", (e as Error).message);
      }
    }
  }

  const publish = opts?.forcePublish ?? false;
  const status: "draft" | "published" = publish ? "published" : "draft";
  const slug = await availableSlug(slugify(title));
  const excerpt = clipExcerpt(blocks.find((b) => b.kind === "p")?.text ?? "");
  const cover = await makeCover(slug, title, opts?.cat || "SRE", "#0072BC", false, (imagePrompt || "").trim());

  const saved = await upsertPost({
    slug,
    title,
    cat: opts?.cat || "SRE",
    tone: "#0072BC",
    excerpt,
    author: "AI Studio",
    role: "Biên soạn",
    initials: "AI",
    date: todayVN(),
    read: readingTime(blocks),
    tags: ["ai-generate"],
    coverUrl: cover,
    blocks,
    status,
  });
  if (status === "published") await notifyPublished(saved).catch(() => {});

  await addHistory({
    at: new Date().toISOString(),
    mode: "generate",
    source: "đặt hàng",
    url: "",
    title,
    slug,
    status,
    aiUsed,
    note: `brief: ${brief.slice(0, 120)}`,
  });

  return { slug, title, status, aiUsed, source: "đặt hàng" };
}

// Ingest a single URL → a post (fetch + strip HTML, then AI edit).
export async function ingestUrl(
  url: string,
  opts?: { forcePublish?: boolean; cat?: string; mode?: IngestMode; source?: string; note?: string; summarize?: boolean },
): Promise<IngestResult> {
  const html = await fetchText(url);
  const { title: rawTitle, text, cover } = stripHtml(html);
  let host = "";
  try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { /* ignore */ }
  return ingestText(rawTitle, text, {
    ...opts,
    url,
    source: opts?.source ?? url,
    cover: absolutize(cover, url),
    sourceName: opts?.summarize ? host : undefined,
    sourceUrl: opts?.summarize ? url : undefined,
  });
}

// Run over a list of feed URLs (manual "Chạy nguồn ngay"). Returns per-item results.
export async function runFeeds(feedUrls: string[], perFeed = 3): Promise<IngestResult[]> {
  const out: IngestResult[] = [];
  const seen = await seenUrls();
  for (const feed of feedUrls) {
    try {
      const xml = await fetchText(feed);
      const links = parseFeedLinks(xml, perFeed);
      for (const link of links) {
        if (seen.has(link)) continue;
        try {
          out.push(await ingestUrl(link, { mode: "cron", source: feed }));
        } catch (e) {
          const msg = (e as Error).message;
          console.error(`[ai] ingest failed ${link}:`, msg);
          await addHistory({ at: new Date().toISOString(), mode: "cron", source: feed, url: link, title: link, slug: "", status: "error", aiUsed: false, note: msg.slice(0, 200) });
        }
      }
    } catch (e) {
      console.error(`[ai] feed failed ${feed}:`, (e as Error).message);
    }
  }
  return out;
}

// Ask the AI to pick the most relevant/high-quality candidates for the given
// topics. Returns the chosen indices. Falls back to the first N when no AI key.
async function pickBest(
  candidates: FeedItem[],
  topics: string[],
  count: number,
): Promise<number[]> {
  const settings = await getSettings();
  const apiKey = settings.aiApiKey || ENV_AI_API_KEY;
  if (!apiKey || candidates.length === 0) {
    return candidates.slice(0, count).map((_, i) => i);
  }
  const provider = getProvider(settings.aiProvider);
  const model = settings.aiModel || ENV_AI_MODEL || DEFAULT_MODEL;
  const list = candidates.map((c, i) => `${i}. ${c.title}`).join("\n");
  const prompt =
    `Chủ đề quan tâm: ${topics.join(", ")}.\n` +
    `Dưới đây là các bài viết ứng viên (theo số thứ tự). Chọn tối đa ${count} bài PHÙ HỢP NHẤT và CHẤT LƯỢNG NHẤT với các chủ đề trên. ` +
    `Chỉ trả về JSON: {"picks":[<các số thứ tự>]}. Không giải thích.\n\n${list}`;
  try {
    const raw = await chatComplete(provider, apiKey, model, prompt);
    const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
    const picks: number[] = Array.isArray(parsed.picks) ? parsed.picks : [];
    const valid = picks.filter((n) => Number.isInteger(n) && n >= 0 && n < candidates.length).slice(0, count);
    return valid.length ? valid : candidates.slice(0, count).map((_, i) => i);
  } catch {
    return candidates.slice(0, count).map((_, i) => i);
  }
}

export type DiscoverResult = { candidates: number; picked: number; results: IngestResult[] };

// Auto-discovery: gather candidates from the configured feeds, drop anything
// already handled (history), let the AI pick the best matches for the topics,
// then translate + (optionally) publish them, logging each to history.
export async function discoverAndPublish(): Promise<DiscoverResult> {
  const settings = await getSettings();
  // Admin feeds take precedence; fall back to the curated defaults so discovery
  // always has good sources to pull from.
  const feeds = (settings.aiFeeds && settings.aiFeeds.length) ? settings.aiFeeds : DEFAULT_DISCOVER_FEEDS;
  const topics = settings.aiTopics ?? [];
  const count = Math.max(1, settings.aiDiscoverCount || 3);
  const seen = await seenUrls();

  // 1. Gather + dedupe candidates.
  const candidates: FeedItem[] = [];
  for (const feed of feeds) {
    try {
      const xml = await fetchText(feed);
      for (const it of parseFeedItems(xml, 15)) {
        if (!seen.has(it.url) && !candidates.some((c) => c.url === it.url)) candidates.push(it);
      }
    } catch (e) {
      console.error(`[ai] discover feed failed ${feed}:`, (e as Error).message);
    }
  }
  if (candidates.length === 0) return { candidates: 0, picked: 0, results: [] };

  // 2. AI picks the best for the topics.
  const picks = await pickBest(candidates, topics, count);

  // 3. Ingest + (auto)publish the picks.
  const results: IngestResult[] = [];
  for (const idx of picks) {
    const c = candidates[idx];
    try {
      results.push(
        await ingestUrl(c.url, {
          forcePublish: settings.aiAutoPublish,
          mode: "discover",
          source: "discover",
          note: `topics: ${topics.join(", ")}`,
        }),
      );
    } catch (e) {
      const msg = (e as Error).message;
      console.error(`[ai] discover ingest failed ${c.url}:`, msg);
      await addHistory({
        at: new Date().toISOString(),
        mode: "discover",
        source: "discover",
        url: c.url,
        title: c.title,
        slug: "",
        status: "error",
        aiUsed: false,
        note: msg.slice(0, 200),
      });
    }
  }
  return { candidates: candidates.length, picked: results.length, results };
}
