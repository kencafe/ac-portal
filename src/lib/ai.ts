// AI ingest pipeline: fetch a source article (or RSS items), have an AI model
// edit + translate it to Vietnamese, and store it as a post — as a draft or
// published depending on site settings.
//
// The model call uses the Anthropic Messages API when an API key is configured
// (env AI_API_KEY, or the CMS "Cấu hình API" value injected as AI_API_KEY).
// Without a key the pipeline still runs but produces a clearly-labelled
// passthrough so the flow is testable offline — it never fabricates a
// human-quality translation silently.

import { promises as fsp } from "fs";
import path from "path";
import { upsertPost, getPost, availableSlug } from "@/lib/store";
import { getSettings } from "@/lib/settings";
import { notifyPublished } from "@/lib/notify";
import { getProvider, chatComplete } from "@/lib/providers";
import { addHistory, seenUrls, type IngestMode } from "@/lib/history";
import type { Block } from "@/data/posts";

const ENV_AI_API_KEY = process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY || "";
const ENV_AI_MODEL = process.env.AI_MODEL || "";
const DEFAULT_MODEL = "claude-sonnet-5";
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");

// English image prompt for a clean, appealing editorial cover (no text).
// `scene` (from the AI, content-aware) or `hint` (excerpt/keywords) makes the
// image reflect the actual article, not a generic template.
function coverPrompt(title: string, cat: string, scene = ""): string {
  const subject = scene.trim()
    ? scene.trim()
    : `the topic "${title}"${cat ? ` in the field of ${cat}` : ""}`;
  return `Professional editorial cover illustration depicting ${subject}. Modern flat vector style, conceptual and specific to the subject, clean composition, deep blue and green brand palette, subtle depth. No text, no words, no letters, no logos, no watermark.`;
}

async function saveCover(slug: string, buf: Buffer, ext: string): Promise<string> {
  await fsp.mkdir(path.join(DATA_DIR, "covers"), { recursive: true });
  await fsp.writeFile(path.join(DATA_DIR, "covers", `${slug}.${ext}`), buf);
  return `/api/cover-img/${slug}.${ext}`;
}

// Free, keyless AI image via Pollinations (Flux/SD). Works WITHOUT any billing.
async function pollinationsImage(slug: string, title: string, cat: string, scene = "", nonce = 0): Promise<string> {
  // Deterministic seed by default; a nonce (manual re-generate) varies the image.
  const seed = nonce > 0 ? nonce % 1000000 : Math.abs(hashCode(title)) % 100000;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(coverPrompt(title, cat, scene))}?width=1200&height=630&nologo=true&seed=${seed}&model=flux`;
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
async function geminiImage(slug: string, title: string, cat: string, apiKey: string, model: string, scene = ""): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: coverPrompt(title, cat, scene) }] }], generationConfig: { responseModalities: ["IMAGE"] } }),
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

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; }
  return h;
}

// Generate a real cover image. Provider "pollinations" (free/keyless, default)
// or "gemini" (needs billing). Saves to the PVC and returns its URL; falls back
// to the generated illustration when disabled or on error.
export async function makeCover(slug: string, title: string, cat = "", tone = "#0072BC", force = false, scene = "", nonce = 0): Promise<string> {
  const fallback = coverFor(title, cat, tone);
  const s = await getSettings();
  if (!s.aiImageEnabled && !force) return fallback;
  const provider = s.aiImageProvider || "pollinations";
  try {
    if (provider === "gemini") {
      const apiKey = s.aiApiKey || ENV_AI_API_KEY;
      if (!apiKey) throw new Error("no api key");
      const out = await geminiImage(slug, title, cat, apiKey, s.aiImageModel || "gemini-2.5-flash-image", scene);
      console.log(`[ai] cover via gemini for ${slug}`);
      return out;
    }
    const out = await pollinationsImage(slug, title, cat, scene, nonce);
    console.log(`[ai] cover via pollinations for ${slug}`);
    return out;
  } catch (e) {
    console.error(`[ai] cover image failed for ${slug} (${provider}):`, (e as Error).message);
    return fallback;
  }
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

// Estimate reading time from block text (~200 words/min, min 1).
function readingTime(blocks: Block[]): string {
  const words = blocks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((b: any) => (b.kind === "list" ? (b.items ?? []).join(" ") : b.text ?? ""))
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} phút đọc`;
}

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
function blocksFromRaw(raw: string): { title: string; blocks: Block[]; imagePrompt: string } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: any;
  try {
    parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw);
  } catch {
    parsed = null;
  }
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
  if (blocks.length === 0) blocks = [{ kind: "p", text: raw.slice(0, 1500) }];
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
    : `Bạn là biên tập viên kỹ thuật của blog FPT-IS Next Gen Service. Hãy BIÊN TẬP LẠI nội dung sau thành một bài viết hoàn chỉnh, CÓ CẤU TRÚC, chuẩn để xuất bản, bằng tiếng Việt.\n` + styleRules;

  const prompt =
    head +
    `Trả về JSON THUẦN theo đúng schema (không thêm chữ ngoài JSON):\n` +
    `{"title":"...","blocks":[{"type":"h","text":"Tiêu đề phụ"},{"type":"p","text":"đoạn văn"},{"type":"list","items":["ý 1","ý 2"]},{"type":"quote","text":"trích dẫn"}]}\n` +
    `type chỉ nhận: "h" (tiêu đề phụ), "p" (đoạn văn), "list" (danh sách), "quote" (trích dẫn). Bài nên có 2–5 heading.\n` +
    `Kèm thêm trường "imagePrompt": một câu tiếng ANH mô tả cảnh minh hoạ bìa CỤ THỂ theo nội dung bài (đối tượng, bối cảnh kỹ thuật rõ ràng) để sinh ảnh — KHÔNG chứa chữ trong ảnh.\n` +
    (instruction?.trim()
      ? `\nYÊU CẦU CHỈNH SỬA THÊM TỪ BIÊN TẬP VIÊN (ưu tiên cao, bám sát): ${instruction.trim()}\n`
      : "") +
    `\nTIÊU ĐỀ GỐC: ${title}\n\nNỘI DUNG:\n${clipped}`;

  const raw = await chatComplete(provider, apiKey, model, prompt);
  const { title: genTitle, blocks, imagePrompt } = blocksFromRaw(raw);

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
  const excerpt = (blocks.find((b) => b.kind === "p")?.text ?? "").slice(0, 160);
  // Content-aware cover: AI imagePrompt if any, else title + excerpt.
  const scene = imagePrompt || `${title}. ${excerpt}`;
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
      `- Chia phần rõ ràng: mỗi phần một TIÊU ĐỀ PHỤ (heading); dùng bullet khi liệt kê; có thể dùng trích dẫn/nhấn mạnh khi cần. Bài nên có 4–8 heading, đủ sâu để dùng đào tạo.\n` +
      (opts?.audience?.trim() ? `- Đối tượng người đọc: ${opts.audience.trim()}.\n` : "") +
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
  }

  const publish = opts?.forcePublish ?? false;
  const status: "draft" | "published" = publish ? "published" : "draft";
  const slug = await availableSlug(slugify(title));
  const excerpt = (blocks.find((b) => b.kind === "p")?.text ?? "").slice(0, 160);
  const cover = await makeCover(slug, title, opts?.cat || "SRE", "#0072BC", false, imagePrompt || `${title}. ${excerpt}. ${brief.slice(0, 200)}`);

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
