// Server-side post store. Backs the CMS + public blog + homepage so that a post
// published in the CMS shows up automatically on the homepage and /blog.
//
// Backend: a JSON file under DATA_DIR (mount a PVC there in-cluster for
// persistence; falls back to <cwd>/.data locally). Seeded once from the static
// design content so nothing is lost. Swap for Postgres (CNPG `ns-blog-db`) by
// reimplementing readAll/writeAll against `DATABASE_URL`.

import { promises as fs } from "fs";
import path from "path";
import { POSTS, type Post, type Block } from "@/data/posts";

export type Status = "draft" | "review" | "published";
// `notified` guards the on-publish mailer so subscribers aren't emailed twice
// if a post is unpublished and re-published.
export type StoredPost = Post & { status: Status; notified?: boolean; featuredAt?: string; publishedAt?: string };

// Formatted VN timestamp "HH:mm · DD/MM/YYYY" (pod TZ = Asia/Ho_Chi_Minh).
export function fmtVN(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())} · ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "posts.json");

function seed(): StoredPost[] {
  // All design sample posts start published.
  return POSTS.map((p) => ({ ...p, status: "published" as Status }));
}

async function readAll(): Promise<StoredPost[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw) as StoredPost[];
  } catch {
    const seeded = seed();
    await writeAll(seeded).catch(() => {});
    return seeded;
  }
}

async function writeAll(posts: StoredPost[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(posts, null, 2), "utf8");
}

export async function listPosts(opts?: { status?: Status }): Promise<StoredPost[]> {
  const all = await readAll();
  const filtered = opts?.status ? all.filter((p) => p.status === opts.status) : all;
  return filtered;
}

export async function listPublished(limit?: number): Promise<StoredPost[]> {
  const pub = (await readAll()).filter((p) => p.status === "published");
  return typeof limit === "number" ? pub.slice(0, limit) : pub;
}

// Posts chosen by an editor to appear on the portal homepage. Featured posts
// are shown most-recently-pinned first (so a freshly pinned post always surfaces
// on the homepage), capped at `limit`. Falls back to the latest published posts
// when nothing is pinned, so the homepage is never empty.
export async function listFeatured(limit = 3): Promise<StoredPost[]> {
  const pub = (await readAll()).filter((p) => p.status === "published");
  const featured = pub
    .filter((p) => p.featured)
    .sort((a, b) => (b.featuredAt ?? "").localeCompare(a.featuredAt ?? ""));
  return (featured.length ? featured : pub).slice(0, limit);
}

export async function setFeatured(slug: string, featured: boolean): Promise<StoredPost | undefined> {
  const all = await readAll();
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx < 0) return undefined;
  all[idx] = { ...all[idx], featured, featuredAt: featured ? new Date().toISOString() : undefined };
  await writeAll(all);
  return all[idx];
}

export async function getPost(slug: string): Promise<StoredPost | undefined> {
  return (await readAll()).find((p) => p.slug === slug);
}

// Return a slug that isn't already taken, appending -2, -3… on collision. Used
// by AI ingest so auto-publishing an article whose title matches an existing
// post never silently overwrites it.
export async function availableSlug(base: string): Promise<string> {
  const taken = new Set((await readAll()).map((p) => p.slug));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    const s = `${base}-${i}`;
    if (!taken.has(s)) return s;
  }
  return `${base}-${Date.now()}`;
}

export async function upsertPost(input: Partial<StoredPost> & { slug: string }): Promise<StoredPost> {
  const all = await readAll();
  const idx = all.findIndex((p) => p.slug === input.slug);
  const base: StoredPost =
    idx >= 0
      ? all[idx]
      : {
          slug: input.slug,
          cat: "SRE",
          tone: "#0072BC",
          title: input.slug,
          excerpt: "",
          author: "",
          role: "",
          initials: "NS",
          date: "[Ngày đăng]",
          read: "1 phút đọc",
          tags: [],
          coverUrl: `assets/cover-${input.slug}.png`,
          blocks: [] as Block[],
          status: "draft",
        };
  const merged: StoredPost = { ...base, ...input, slug: input.slug };
  // Stamp publish time the first time a post becomes published.
  if (merged.status === "published" && !merged.publishedAt) merged.publishedAt = fmtVN();
  if (idx >= 0) all[idx] = merged;
  else all.unshift(merged);
  await writeAll(all);
  return merged;
}

export async function setStatus(slug: string, status: Status): Promise<StoredPost | undefined> {
  const all = await readAll();
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx < 0) return undefined;
  const publishedAt = status === "published" && !all[idx].publishedAt ? fmtVN() : all[idx].publishedAt;
  all[idx] = { ...all[idx], status, publishedAt };
  await writeAll(all);
  return all[idx];
}

export async function deletePost(slug: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((p) => p.slug !== slug);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}
