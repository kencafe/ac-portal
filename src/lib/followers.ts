// Followers — visitors who submitted the homepage contact/interest form. Unlike
// newsletter subscribers (email-only, see subscribers.ts), a follower carries
// name / company / needs so the team can follow up. JSON file under DATA_DIR
// (mount a PVC there in-cluster for persistence).
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "followers.json");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface Follower {
  name: string;
  email: string;
  company?: string;
  needs?: string;
  at: string; // first submitted (ISO)
  updatedAt?: string;
}

async function readAll(): Promise<Follower[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Follower[];
  } catch {
    return [];
  }
}

async function writeAll(list: Follower[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(list, null, 2), "utf8");
}

// Newest first.
export async function listFollowers(): Promise<Follower[]> {
  return (await readAll()).sort((a, b) => (b.at ?? "").localeCompare(a.at ?? ""));
}

export async function followerEmails(): Promise<string[]> {
  return (await readAll()).map((f) => f.email);
}

// Dedupe by email: a re-submit refreshes the info + stamps updatedAt without
// losing the original opt-in time. Returns "added" | "updated" | "invalid".
export async function addFollower(input: {
  name: string;
  email: string;
  company?: string;
  needs?: string;
}): Promise<"added" | "updated" | "invalid"> {
  const email = (input.email ?? "").trim().toLowerCase();
  const name = (input.name ?? "").trim();
  if (!name || !EMAIL_RE.test(email)) return "invalid";
  const fields = { name, company: (input.company ?? "").trim(), needs: (input.needs ?? "").trim() };
  const all = await readAll();
  const idx = all.findIndex((f) => f.email === email);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...fields, email, updatedAt: new Date().toISOString() };
    await writeAll(all);
    return "updated";
  }
  all.push({ email, ...fields, at: new Date().toISOString() });
  await writeAll(all);
  return "added";
}

export async function removeFollower(emailRaw: string): Promise<boolean> {
  const email = (emailRaw ?? "").trim().toLowerCase();
  const all = await readAll();
  const next = all.filter((f) => f.email !== email);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}
