// Newsletter subscribers — visitors who opted in on the public blog to receive
// newly published articles by email. JSON file under DATA_DIR (PVC-backed).
// These are ONE of the recipient sets for the on-publish mailer; the other is
// the admin-configured distribution list (settings.mailExtraRecipients), which
// is where Keycloak group / team mailing addresses go.

import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "subscribers.json");

export interface Subscriber {
  email: string;
  at: string; // ISO opt-in time
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function readAll(): Promise<Subscriber[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Subscriber[];
  } catch {
    return [];
  }
}

async function writeAll(list: Subscriber[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(list, null, 2), "utf8");
}

export async function listSubscribers(): Promise<Subscriber[]> {
  return readAll();
}

export async function subscriberEmails(): Promise<string[]> {
  return (await readAll()).map((s) => s.email);
}

// Returns "added" | "exists" | "invalid".
export async function addSubscriber(emailRaw: string): Promise<"added" | "exists" | "invalid"> {
  const email = emailRaw.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return "invalid";
  const all = await readAll();
  if (all.some((s) => s.email === email)) return "exists";
  all.push({ email, at: new Date().toISOString() });
  await writeAll(all);
  return "added";
}

export async function removeSubscriber(emailRaw: string): Promise<boolean> {
  const email = emailRaw.trim().toLowerCase();
  const all = await readAll();
  const next = all.filter((s) => s.email !== email);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}
