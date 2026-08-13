// On-demand English translation of a blog post's body (AC-010b).
//
// The site content is authored in Vietnamese. When a reader switches to EN we
// translate the post's title, standfirst and body blocks with the same LLM used
// for AI ingest (Anthropic Messages API by default) and cache the result on the
// post (store.setTranslation) so later EN views are instant and free. Image
// blocks are never translated; list items and text blocks are.
import { getPost, setTranslation } from "@/lib/store";
import { getSettings } from "@/lib/settings";
import { getProvider, chatComplete } from "@/lib/providers";
import type { Block } from "@/data/posts";

const ENV_AI_API_KEY = process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY || "";
const ENV_AI_MODEL = process.env.AI_MODEL || "";
const DEFAULT_MODEL = "claude-sonnet-5";

export type PostEn = { titleEn: string; excerptEn: string; blocksEn: Block[] };

// Positions of the translatable strings inside the blocks array.
type Seg = { bi: number; ii?: number };

export async function getOrTranslatePostEn(slug: string): Promise<PostEn | null> {
  const post = await getPost(slug);
  if (!post) return null;

  // Cache hit — already translated for the current content.
  if (post.blocksEn && post.titleEn) {
    return { titleEn: post.titleEn, excerptEn: post.excerptEn ?? post.excerpt, blocksEn: post.blocksEn };
  }

  // Collect every translatable segment (skip image URLs).
  const segs: Seg[] = [];
  post.blocks.forEach((b, bi) => {
    if (b.kind === "img") return;
    if (b.kind === "list") (b.items ?? []).forEach((_, ii) => segs.push({ bi, ii }));
    else if (b.text != null) segs.push({ bi });
  });
  const source = segs.map((s) => (s.ii == null ? post.blocks[s.bi].text ?? "" : post.blocks[s.bi].items?.[s.ii] ?? ""));

  const settings = await getSettings();
  const provider = getProvider(settings.aiProvider);
  const apiKey = settings.aiApiKey || ENV_AI_API_KEY;
  const model = settings.aiModel || ENV_AI_MODEL || DEFAULT_MODEL;
  if (!apiKey) return null; // no LLM configured → caller keeps the VN body

  const prompt =
    "You are a professional translator for a technical engineering blog (Cloud, DevOps, SRE, AI infrastructure). " +
    "Translate the Vietnamese text below into natural, professional English. Keep technical terms, product and " +
    "company names as-is. Do not add, drop, merge or reorder items. Return ONLY a JSON object of the exact shape " +
    `{"title": string, "excerpt": string, "body": string[]} where "body" has EXACTLY ${source.length} strings in the same order.\n\n` +
    `TITLE: ${JSON.stringify(post.title)}\n` +
    `EXCERPT: ${JSON.stringify(post.excerpt)}\n` +
    `BODY: ${JSON.stringify(source)}`;

  let parsed: { title?: string; excerpt?: string; body?: string[] };
  try {
    const raw = await chatComplete(provider, apiKey, model, prompt, 8192);
    const jtxt = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    parsed = JSON.parse(jtxt);
  } catch {
    return null; // network/parse error → keep VN, try again next view
  }
  if (!Array.isArray(parsed?.body) || parsed.body.length !== source.length) return null;

  // Rebuild the blocks array with translated text, leaving structure + images intact.
  const blocksEn: Block[] = post.blocks.map((b) => ({ ...b }));
  segs.forEach((s, idx) => {
    const val = parsed.body![idx];
    if (s.ii == null) {
      blocksEn[s.bi] = { ...blocksEn[s.bi], text: val };
    } else {
      const items = [...(blocksEn[s.bi].items ?? [])];
      items[s.ii] = val;
      blocksEn[s.bi] = { ...blocksEn[s.bi], items };
    }
  });

  const titleEn = parsed.title || post.title;
  const excerptEn = parsed.excerpt || post.excerpt;
  await setTranslation(slug, { titleEn, excerptEn, blocksEn });
  return { titleEn, excerptEn, blocksEn };
}
