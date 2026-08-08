// Ingest history — a durable log of every article the AI pulled and what
// happened to it, so the (lazy) admin can see what got auto-published and when
// without digging through the post list. JSON file under DATA_DIR (PVC-backed).

import { promises as fs } from "fs";
import path from "path";

export type IngestMode = "manual" | "cron" | "discover" | "file" | "reedit";

export interface HistoryEntry {
  at: string; // ISO timestamp
  mode: IngestMode; // how it was triggered
  source: string; // feed URL / "paste" / "discover"
  url: string; // article URL
  title: string;
  slug: string;
  status: "published" | "draft" | "skipped" | "error";
  aiUsed: boolean; // did a real AI translation run
  note?: string; // reason for skip/error, or relevance note
}

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "ingest-history.json");
const MAX = 500; // keep the newest N entries

async function readAll(): Promise<HistoryEntry[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as HistoryEntry[];
  } catch {
    return [];
  }
}

async function writeAll(entries: HistoryEntry[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(entries.slice(0, MAX), null, 2), "utf8");
}

// Timestamp is injected by the caller (Date.now is fine in a Node route).
export async function addHistory(e: HistoryEntry): Promise<void> {
  const all = await readAll();
  all.unshift(e);
  await writeAll(all);
}

export async function listHistory(limit = 100): Promise<HistoryEntry[]> {
  return (await readAll()).slice(0, limit);
}

// URLs already handled — used to avoid re-ingesting the same article.
export async function seenUrls(): Promise<Set<string>> {
  const all = await readAll();
  return new Set(all.map((e) => e.url));
}
