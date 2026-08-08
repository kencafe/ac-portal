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
export type StoredPost = Post & { status: Status };

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

export async function getPost(slug: string): Promise<StoredPost | undefined> {
  return (await readAll()).find((p) => p.slug === slug);
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
  if (idx >= 0) all[idx] = merged;
  else all.unshift(merged);
  await writeAll(all);
  return merged;
}

export async function setStatus(slug: string, status: Status): Promise<StoredPost | undefined> {
  const all = await readAll();
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx < 0) return undefined;
  all[idx] = { ...all[idx], status };
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
