// AI ingest pipeline: fetch a source article (or RSS items), have an AI model
// edit + translate it to Vietnamese, and store it as a post — as a draft or
// published depending on site settings.
//
// The model call uses the Anthropic Messages API when an API key is configured
// (env AI_API_KEY, or the CMS "Cấu hình API" value injected as AI_API_KEY).
// Without a key the pipeline still runs but produces a clearly-labelled
// passthrough so the flow is testable offline — it never fabricates a
// human-quality translation silently.

import { upsertPost } from "@/lib/store";
import { getSettings } from "@/lib/settings";
import { getProvider, chatComplete } from "@/lib/providers";
import type { Block } from "@/data/posts";

const ENV_AI_API_KEY = process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY || "";
const ENV_AI_MODEL = process.env.AI_MODEL || "";
const DEFAULT_MODEL = "claude-sonnet-5";

export type IngestResult = {
  slug: string;
  title: string;
  status: "draft" | "published";
  aiUsed: boolean;
  source: string;
};

function slugify(s: string): string {
  return s
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    .slice(0, 60) || "bai-viet-" + Date.now();
}

function stripHtml(html: string): { title: string; text: string } {
  const title =
    (html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1] ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      "").trim();
  // Prefer <article>, else <body>.
  const body = html.match(/<article[\s\S]*?<\/article>/i)?.[0] || html;
  const text = body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  return { title, text };
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
  const links: string[] = [];
  const items = xml.match(/<(item|entry)[\s\S]*?<\/\1>/gi) || [];
  for (const it of items) {
    const link =
      it.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] ||
      it.match(/<link>([^<]+)<\/link>/i)?.[1] ||
      it.match(/<guid[^>]*>([^<]+)<\/guid>/i)?.[1];
    if (link) links.push(link.trim());
    if (links.length >= limit) break;
  }
  return links;
}

// AI edit + translate to Vietnamese. Returns a title + content blocks.
async function aiEditTranslate(
  title: string,
  text: string,
): Promise<{ title: string; blocks: Block[]; aiUsed: boolean }> {
  const clipped = text.slice(0, 12000);

  // Provider + token + model come from the CMS "Cấu hình API" (settings) first,
  // then env. The provider decides Anthropic-style vs OpenAI-compatible calls.
  const settings = await getSettings();
  const provider = getProvider(settings.aiProvider);
  const apiKey = settings.aiApiKey || ENV_AI_API_KEY;
  const model = settings.aiModel || ENV_AI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    // Honest offline fallback — NOT a real translation.
    const blocks: Block[] = [
      { kind: "p", text: "[AI chưa cấu hình khóa — đây là nội dung gốc chưa dịch]" },
      { kind: "p", text: clipped.slice(0, 1500) },
    ];
    return { title: title || "Bài nhập tự động", blocks, aiUsed: false };
  }

  const prompt =
    `Bạn là biên tập viên kỹ thuật. Hãy biên tập lại và DỊCH SANG TIẾNG VIỆT bài viết sau. ` +
    `Trả về JSON thuần: {"title": "...", "paragraphs": ["...", "..."]}. ` +
    `Giữ giọng văn chuyên nghiệp, súc tích.\n\nTIÊU ĐỀ GỐC: ${title}\n\nNỘI DUNG:\n${clipped}`;

  const raw = await chatComplete(provider, apiKey, model, prompt);
  let parsed: { title?: string; paragraphs?: string[] };
  try {
    parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw);
  } catch {
    parsed = { title, paragraphs: [raw] };
  }
  const blocks: Block[] = (parsed.paragraphs ?? [])
    .filter(Boolean)
    .map((p) => ({ kind: "p", text: p }) as Block);
  return { title: parsed.title || title || "Bài nhập tự động", blocks, aiUsed: true };
}

// Ingest a single URL → a post. `forcePublish` overrides the settings default
// (used by the manual "hot news" button).
export async function ingestUrl(
  url: string,
  opts?: { forcePublish?: boolean; cat?: string },
): Promise<IngestResult> {
  const settings = await getSettings();
  const html = await fetchText(url);
  const { title: rawTitle, text } = stripHtml(html);
  const { title, blocks, aiUsed } = await aiEditTranslate(rawTitle, text);

  const publish = opts?.forcePublish ?? settings.autoPublishTranslations;
  const status: "draft" | "published" = publish ? "published" : "draft";
  const slug = slugify(title);

  await upsertPost({
    slug,
    title,
    cat: opts?.cat || "AIOps",
    tone: "#0072BC",
    excerpt: (blocks.find((b) => b.kind === "p")?.text ?? "").slice(0, 160),
    author: "AI Studio",
    role: "Tự động",
    initials: "AI",
    date: "[Ngày đăng]",
    read: "3 phút đọc",
    tags: ["ai-ingest"],
    coverUrl: `assets/cover-${slug}.png`,
    blocks,
    status,
  });

  return { slug, title, status, aiUsed, source: url };
}

// Run the daily job over a list of feed URLs. Returns per-item results.
export async function runFeeds(feedUrls: string[], perFeed = 3): Promise<IngestResult[]> {
  const out: IngestResult[] = [];
  for (const feed of feedUrls) {
    try {
      const xml = await fetchText(feed);
      const links = parseFeedLinks(xml, perFeed);
      for (const link of links) {
        try {
          out.push(await ingestUrl(link));
        } catch (e) {
          console.error(`[ai] ingest failed ${link}:`, (e as Error).message);
        }
      }
    } catch (e) {
      console.error(`[ai] feed failed ${feed}:`, (e as Error).message);
    }
  }
  return out;
}
