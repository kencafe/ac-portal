// Site/admin configuration store. Same JSON-file backend as the post store
// (DATA_DIR/settings.json, PVC-backed in-cluster). Read by the admin panel and
// updatable only by admins (enforced in the API route).

import { promises as fs } from "fs";
import path from "path";

export type Settings = {
  siteName: string;
  blogHost: string;
  postsPerPage: number;
  defaultLanguage: "vi" | "en";
  // 4-eyes: when true a post must be approved before it can be published.
  requireApprovalToPublish: boolean;
  // Auto-publish AI-edited drafts (off by default — human in the loop).
  autoPublishAiPosts: boolean;
  // AI auto-ingest daily schedule.
  aiScheduleEnabled: boolean;
  aiScheduleHour: number; // 0–23, cluster TZ (default 5 = 05:00)
  aiScheduleMode: "discover" | "feeds"; // discover = AI tự kiếm bài hay; feeds = lấy thẳng từ nguồn dán
  aiFeeds: string[]; // RSS/Atom source URLs the daily job pulls from
  // Outgoing mail (SMTP, e.g. Gmail + app password).
  mailHost: string;
  mailPort: number;
  mailSecure: boolean; // true = 465/SSL, false = 587/STARTTLS
  mailUser: string;
  mailFrom: string; // From: header (defaults to mailUser)
  mailPassword: string; // SMTP/app password — SECRET; never returned (see publicSettings)
  // AI auto-discovery: pick the most relevant/high-quality unseen articles and publish.
  aiTopics: string[]; // topics/keywords describing what counts as a "good" article
  aiAutoPublish: boolean; // publish discovered articles automatically (vs draft)
  aiDiscoverCount: number; // how many articles to publish per discovery run
  // AI provider config.
  aiProvider: string; // provider id from lib/providers (e.g. "anthropic", "xai", "qwen")
  aiModel: string; // selected model id, e.g. "claude-sonnet-5"
  aiApiKey: string; // token for the active provider — SECRET; never returned (see publicSettings)
};

export const DEFAULT_SETTINGS: Settings = {
  siteName: "FPT-IS Next Gen Service",
  blogHost: "blog.appcarrier.cloud",
  postsPerPage: 9,
  defaultLanguage: "vi",
  requireApprovalToPublish: true,
  autoPublishAiPosts: false,
  aiScheduleEnabled: false,
  aiScheduleHour: 5,
  aiScheduleMode: "discover",
  aiFeeds: [],
  mailHost: "smtp.gmail.com",
  mailPort: 587,
  mailSecure: false,
  mailUser: "",
  mailFrom: "",
  mailPassword: "",
  aiTopics: ["cloud", "AI", "DevOps", "SRE", "Kubernetes", "security"],
  aiAutoPublish: false,
  aiDiscoverCount: 3,
  aiProvider: "anthropic",
  aiModel: "claude-sonnet-5",
  aiApiKey: "",
};

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "settings.json");

export async function getSettings(): Promise<Settings> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await getSettings()), ...patch };
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(next, null, 2), "utf8");
  return next;
}

// Settings safe to send to the browser: the raw token is stripped and replaced
// with a boolean + a short masked hint.
export type PublicSettings = Omit<Settings, "aiApiKey" | "mailPassword"> & {
  aiApiKeySet: boolean;
  aiApiKeyHint: string;
  mailPasswordSet: boolean;
};

function maskKey(k: string): string {
  if (!k) return "";
  return k.length <= 12 ? "••••" : `${k.slice(0, 7)}…${k.slice(-4)}`;
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const { aiApiKey, mailPassword, ...rest } = await getSettings();
  return {
    ...rest,
    aiApiKeySet: !!aiApiKey,
    aiApiKeyHint: maskKey(aiApiKey),
    mailPasswordSet: !!mailPassword,
  };
}
