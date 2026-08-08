// AI ingest pipeline: fetch a source article (or RSS items), have an AI model
// edit + translate it to Vietnamese, and store it as a post — as a draft or
// published depending on site settings.
//
// The model call uses the Anthropic Messages API when an API key is configured
// (env AI_API_KEY, or the CMS "Cấu hình API" value injected as AI_API_KEY).
// Without a key the pipeline still runs but produces a clearly-labelled
// passthrough so the flow is testable offline — it never fabricates a
// human-quality translation silently.

import { upsertPost, getPost } from "@/lib/store";
import { getSettings } from "@/lib/settings";
import { notifyPublished } from "@/lib/notify";
import { getProvider, chatComplete } from "@/lib/providers";
import { addHistory, seenUrls, type IngestMode } from "@/lib/history";
import type { Block } from "@/data/posts";

const ENV_AI_API_KEY = process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY || "";
const ENV_AI_MODEL = process.env.AI_MODEL || "";
const DEFAULT_MODEL = "claude-sonnet-5";

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
async function aiEdit(
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
    // Honest offline fallback — the AI editor hasn't run.
    const blocks: Block[] = [
      { kind: "p", text: "[AI chưa cấu hình khóa — chưa biên tập, đây là nội dung gốc]" },
      { kind: "p", text: clipped.slice(0, 1500) },
    ];
    return { title: title || "Bài nhập tự động", blocks, aiUsed: false };
  }

  const prompt =
    `Bạn là biên tập viên kỹ thuật của blog FPT-IS Next Gen Service. Hãy BIÊN TẬP LẠI nội dung sau thành một bài viết hoàn chỉnh, chuẩn để xuất bản, bằng tiếng Việt.\n` +
    `PHONG CÁCH NHÀ (bắt buộc bám theo):\n` +
    `- Tiếng Việt kỹ thuật, chuyên nghiệp, súc tích; câu ngắn gọn, đi thẳng vấn đề, không sáo rỗng, không câu view.\n` +
    `- Tiêu đề rõ nghĩa, đúng trọng tâm. Mở bài nêu ngay bối cảnh/insight thực dụng (kiểu SRE/DevOps).\n` +
    `- Giữ nguyên thuật ngữ tiếng Anh phổ biến (Kubernetes, SRE, latency, error budget…) khi tự nhiên hơn là dịch cứng.\n` +
    `- Bố cục mạch lạc theo đoạn; mỗi đoạn một ý; ưu tiên nội dung có giá trị hành động.\n` +
    `- Nếu nội dung gốc là tiếng nước ngoài thì viết lại bằng tiếng Việt theo phong cách trên (không dịch word-by-word).\n` +
    `Trả về JSON thuần: {"title": "...", "paragraphs": ["...", "..."]}. Không thêm chữ ngoài JSON.\n\n` +
    `TIÊU ĐỀ GỐC: ${title}\n\nNỘI DUNG:\n${clipped}`;

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

// Core: run AI edit over raw {title,text} → create a post + log history.
// Shared by URL ingest and file (Word/PDF) ingest.
export async function ingestText(
  rawTitle: string,
  text: string,
  opts?: { forcePublish?: boolean; cat?: string; mode?: IngestMode; source?: string; note?: string; url?: string },
): Promise<IngestResult> {
  const settings = await getSettings();
  const { title, blocks, aiUsed } = await aiEdit(rawTitle, text);

  const publish = opts?.forcePublish ?? settings.autoPublishAiPosts;
  const status: "draft" | "published" = publish ? "published" : "draft";
  const slug = slugify(title);
  const url = opts?.url ?? opts?.source ?? "";

  const saved = await upsertPost({
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
export async function reeditPost(slug: string): Promise<IngestResult | null> {
  const post = await getPost(slug);
  if (!post) return null;

  // Flatten the current blocks back to source text for the editor.
  const text = (post.blocks ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((b: any) => (b.kind === "list" ? (b.items ?? []).join("\n") : b.text ?? ""))
    .filter(Boolean)
    .join("\n\n");

  const { title, blocks, aiUsed } = await aiEdit(post.title, text || post.excerpt || post.title);

  await upsertPost({
    slug,
    title: title || post.title,
    excerpt: (blocks.find((b) => b.kind === "p")?.text ?? post.excerpt ?? "").slice(0, 160),
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
    note: "biên tập lại theo style",
  });

  return { slug, title: title || post.title, status: post.status === "published" ? "published" : "draft", aiUsed, source: "reedit" };
}

// Ingest a single URL → a post (fetch + strip HTML, then AI edit).
export async function ingestUrl(
  url: string,
  opts?: { forcePublish?: boolean; cat?: string; mode?: IngestMode; source?: string; note?: string },
): Promise<IngestResult> {
  const html = await fetchText(url);
  const { title: rawTitle, text } = stripHtml(html);
  return ingestText(rawTitle, text, { ...opts, url, source: opts?.source ?? url });
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
