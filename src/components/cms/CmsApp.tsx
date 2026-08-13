"use client";

import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import {
  SEED, SeedPost, PostStatus, CATS, TONE, CATEGORIES, TAGS, TAXONOMY_UI,
  KINDS, EDITOR_UI, NEW_DRAFT_DEFAULTS, BlockKind,
  API_UI, PUBLIC_API,
  SIDEBAR, TOPBAR, POSTS_VIEW_UI, ADMIN_UI,
} from "@/data/cms";
import { COLORS, RADIUS } from "@/lib/tokens";
import { PROVIDERS_PUBLIC } from "@/lib/providers";
import { IMAGE_PROVIDERS_PUBLIC } from "@/lib/imageProviders";
import CoverArt from "@/components/shared/CoverArt";

type View = "posts" | "editor" | "taxonomy" | "feeds" | "inbox" | "translate" | "api" | "admin" | "aistudio";

type Me = {
  authenticated: boolean;
  user: string;
  email: string;
  groups: string[];
  role: string;
  isAdmin: boolean;
  initials: string;
  signOutUrl: string;
};

type SiteSettings = {
  siteName: string;
  blogHost: string;
  postsPerPage: number;
  defaultLanguage: "vi" | "en";
  requireApprovalToPublish: boolean;
  autoPublishAiPosts: boolean;
  aiScheduleEnabled: boolean;
  aiScheduleHour: number;
  aiScheduleMode: "discover" | "feeds";
  aiFeeds: string[];
  mailHost: string;
  mailPort: number;
  mailSecure: boolean;
  mailUser: string;
  mailFrom: string;
  mailPasswordSet: boolean;
  mailAutoSend: boolean;
  mailExtraRecipients: string[];
  aiTopics: string[];
  aiAutoPublish: boolean;
  aiDiscoverCount: number;
  aiProvider: string;
  aiModel: string;
  aiApiKeySet: boolean;
  aiApiKeyHint: string;
  aiImageEnabled: boolean;
  aiImageProvider: string;
  aiImageModel: string;
  aiImageApiKeySet: boolean;
  aiImageApiKeyHint: string;
};

const panel: CSSProperties = { background: "#fff", border: `1px solid ${COLORS.split}`, borderRadius: RADIUS.card };
const panelPad: CSSProperties = { ...panel, padding: 20 };
const input: CSSProperties = { width: "100%", height: 38, padding: "0 12px", borderRadius: 6, border: `1px solid ${COLORS.border}`, fontSize: 13.5, background: "#fff", outline: "none", color: COLORS.ink };
const label: CSSProperties = { display: "block", fontSize: 12.5, color: COLORS.ink2, marginBottom: 6 };
const btnSm: CSSProperties = { height: 32, padding: "0 12px", borderRadius: 6, border: `1px solid ${COLORS.border}`, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, color: COLORS.ink };
const btnBlue: CSSProperties = { ...btnSm, background: COLORS.brandBlue, color: "#fff", border: "none" };

function statusPill(s: string): CSSProperties {
  const map: Record<string, [string, string, string]> = {
    "Đã xuất bản": ["#3F7A26", "#F0F8EB", "#C6E4B4"],
    "Chờ duyệt": ["#0072BC", "#E6F1F9", "#B3D5EA"],
    "Bản nháp": ["#C25A17", "#FEF1E9", "#F8CBA9"],
  };
  const [fg, bg, bd] = map[s] ?? ["#C25A17", "#FEF1E9", "#F8CBA9"];
  return { display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600, color: fg, background: bg, border: `1px solid ${bd}` };
}

function StatTiles({ tiles }: { tiles: { label: string; value: number; color?: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
      {tiles.map((t) => (
        <div key={t.label} style={panelPad}>
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.02em", color: t.color ?? COLORS.ink }}>{t.value}</div>
          <div style={{ fontSize: 13, color: COLORS.ink3, marginTop: 4 }}>{t.label}</div>
        </div>
      ))}
    </div>
  );
}

function PanelHead({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${COLORS.split}` }}>
      <span style={{ fontWeight: 600, fontSize: 14, color: COLORS.ink }}>{children}</span>
      {right && <span style={{ marginLeft: "auto" }}>{right}</span>}
    </div>
  );
}

// ── Mapping between CMS labels and the store's post shape ──────────────
const ST2CMS: Record<string, PostStatus> = { published: "Đã xuất bản", review: "Chờ duyệt", draft: "Bản nháp" };
const CMS2ST: Record<string, string> = { "Đã xuất bản": "published", "Chờ duyệt": "review", "Bản nháp": "draft" };

function cmsBlocksToStore(b: [BlockKind, string][]) {
  return b.map(([k, t]) => (k === "list" ? { kind: k, items: t.split("\n").map((s) => s.trim()).filter(Boolean) } : { kind: k, text: t }));
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function storeToCms(p: any): SeedPost {
  return {
    slug: p.slug,
    title: p.title ?? p.slug,
    cat: p.cat ?? "SRE",
    status: ST2CMS[p.status] ?? "Bản nháp",
    date: p.date ?? "",
    author: p.author ?? "",
    excerpt: p.excerpt ?? "",
    tags: p.tags ?? [],
    featured: !!p.featured,
    coverUrl: p.coverUrl ?? "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blocks: (p.blocks ?? []).map((bl: any) =>
      bl.kind === "list" ? (["list", (bl.items ?? []).join("\n")] as [BlockKind, string]) : ([bl.kind, bl.text ?? ""] as [BlockKind, string]),
    ),
  };
}

async function apiSave(draft: SeedPost) {
  const payload = {
    slug: draft.slug || `bai-${Date.now()}`,
    title: draft.title,
    cat: draft.cat,
    tone: TONE[draft.cat] ?? "#0072BC",
    status: CMS2ST[draft.status] ?? "draft",
    date: draft.date,
    author: draft.author,
    role: "",
    initials: (draft.author || "NS").split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase() || "NS",
    read: `${Math.max(1, Math.round((draft.blocks.reduce((n, b) => n + (b[1]?.length ?? 0), 0)) / 900))} phút đọc`,
    excerpt: draft.excerpt,
    tags: draft.tags,
    // Preserve the chosen cover (paste/upload/AI); empty → server renders the
    // generated illustration via /api/cover.
    coverUrl: draft.coverUrl || `/api/cover?title=${encodeURIComponent(draft.title || "")}&cat=${encodeURIComponent(draft.cat || "")}&tone=${encodeURIComponent((TONE[draft.cat] ?? "#0072BC").replace("#", ""))}`,
    blocks: cmsBlocksToStore(draft.blocks),
  };
  const res = await fetch("/api/v1/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  return res.ok;
}

// AC-006: human-readable file size — KB when < 1 MB, else MB with 1 decimal.
function fmtBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CmsApp() {
  const [view, setView] = useState<View>("posts");
  const [posts, setPosts] = useState<SeedPost[]>(SEED);
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState("Tất cả");

  const [draft, setDraft] = useState<SeedPost>(makeDraft());
  const [tagInput, setTagInput] = useState("");
  const [saved, setSaved] = useState(false);

  const [inboxQuery, setInboxQuery] = useState("");
  const [inboxTab, setInboxTab] = useState("Tất cả");

  // API config
  const [rotated, setRotated] = useState(false);

  // Account (from oauth-proxy) + site settings
  const [me, setMe] = useState<Me | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // AI Studio
  const [aiUrl, setAiUrl] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiLog, setAiLog] = useState<string[]>([]);
  const [aiFeedInput, setAiFeedInput] = useState("");
  // File ingest (Word/PDF) + re-edit existing post
  const [aiFile, setAiFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [reeditBusy, setReeditBusy] = useState<string | null>(null);
  // Inline "biên tập lại" instruction box in the posts list
  const [reeditFor, setReeditFor] = useState<string | null>(null);
  const [reeditListText, setReeditListText] = useState("");
  // Paste raw text (login-walled sources) + copyright-safe summarize mode
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [pasteSrcName, setPasteSrcName] = useState("");
  const [pasteSrcUrl, setPasteSrcUrl] = useState("");
  const [pasteSummarize, setPasteSummarize] = useState(true);
  const [urlSummarize, setUrlSummarize] = useState(false);
  // Commission an article (AI writes from a brief)
  const [genBrief, setGenBrief] = useState("");
  const [genTitle, setGenTitle] = useState("");
  const [genCat, setGenCat] = useState("SRE");
  const [genAudience, setGenAudience] = useState("");
  // Editor preview toggle (manual review before publishing)
  const [showPreview, setShowPreview] = useState(false);
  const [reeditInstruction, setReeditInstruction] = useState("");
  const [previewBusy, setPreviewBusy] = useState(false);
  // Editor cover controls (paste URL / upload / AI generate)
  const [coverBusy, setCoverBusy] = useState(false);
  const [coverAiPrompt, setCoverAiPrompt] = useState(""); // prompt for AI cover generation (empty = auto from title)
  const [coverMinioUrl, setCoverMinioUrl] = useState(""); // direct MinIO link of the last AI-generated image
  const [coverMsg, setCoverMsg] = useState("");
  // AC-006: dimensions + file size of the current cover image ("1200×630 px · 245 KB").
  const [coverInfo, setCoverInfo] = useState("");

  // Content-block editing (AC-012): which block is "active" (last focused) so a
  // new block inserts right after it instead of only at the end; plus drag state
  // for reordering blocks via the ⠿ handle.
  const [activeBlock, setActiveBlock] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  // Byte size of the last uploaded/pasted cover File; null for remote/AI images (no File on hand).
  const coverSizeRef = useRef<number | null>(null);
  const coverFileRef = useRef<HTMLInputElement | null>(null);
  // In-content image blocks
  const [blockImgBusy, setBlockImgBusy] = useState<number | null>(null);
  const blockImgFileRef = useRef<HTMLInputElement | null>(null);
  const blockImgIdxRef = useRef<number>(-1);

  // AI provider config (Cấu hình API): pick provider → paste token → get models → choose → save
  const [aiProviderSel, setAiProviderSel] = useState("anthropic");
  const [aiKeyInput, setAiKeyInput] = useState("");
  const [aiKeyShow, setAiKeyShow] = useState(false);
  const [aiModelList, setAiModelList] = useState<{ id: string; name: string }[]>([]);
  const [aiModelSel, setAiModelSel] = useState("");
  const [aiCfgBusy, setAiCfgBusy] = useState(false);
  const [aiCfgMsg, setAiCfgMsg] = useState("");
  // Dedicated image config (runs alongside the text model): provider + model + own key
  const [aiImageModelSel, setAiImageModelSel] = useState("gemini-2.5-flash-image");
  const [aiImageProviderSel, setAiImageProviderSel] = useState("pollinations");
  const [aiImageKeyInput, setAiImageKeyInput] = useState("");
  const [aiImageKeyShow, setAiImageKeyShow] = useState(false);
  const [aiImageModelList, setAiImageModelList] = useState<{ id: string; name: string }[]>([]);
  const [aiImageCfgBusy, setAiImageCfgBusy] = useState(false);
  const [aiImageMsg, setAiImageMsg] = useState("");

  // AI auto-discovery + ingest history
  type HistItem = { at: string; mode: string; source: string; url: string; title: string; slug: string; status: string; aiUsed: boolean; note?: string };
  const [aiHistory, setAiHistory] = useState<HistItem[]>([]);
  const [aiTopicsInput, setAiTopicsInput] = useState("");
  const [feedChecks, setFeedChecks] = useState<Record<string, { ok: boolean; count: number; titles?: string[]; error?: string }>>({});
  const [feedCheckBusy, setFeedCheckBusy] = useState<string | null>(null);
  // Mail config
  const [mailPwInput, setMailPwInput] = useState("");
  const [mailTestTo, setMailTestTo] = useState("");
  const [mailMsg, setMailMsg] = useState("");
  const [mailBusy, setMailBusy] = useState(false);
  // Newsletter: auto-send on publish + recipients (subscribers + distribution list)
  const [subs, setSubs] = useState<{ email: string; at: string }[]>([]);
  const [recipientsInput, setRecipientsInput] = useState("");
  const [nlMsg, setNlMsg] = useState("");

  function makeDraft(): SeedPost {
    return { ...NEW_DRAFT_DEFAULTS, blocks: [["p", ""]] } as SeedPost;
  }

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .filter((p) => statusTab === "Tất cả" || p.status === statusTab)
      .filter((p) => !q || (p.title + " " + p.tags.join(" ")).toLowerCase().includes(q));
  }, [posts, query, statusTab]);

  const feedCount = settings?.aiFeeds?.length ?? 0;
  const pendingCount = posts.filter((p) => p.status !== "Đã xuất bản").length;

  async function refreshPosts() {
    try {
      const res = await fetch("/api/v1/posts?status=all", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.results)) setPosts(data.results.map(storeToCms));
    } catch {
      /* keep seed */
    }
  }
  useEffect(() => {
    refreshPosts();
    fetch("/api/v1/me", { cache: "no-store" }).then((r) => { if (r.ok) r.json().then(setMe); }).catch(() => {});
    fetch("/api/v1/settings", { cache: "no-store" }).then((r) => { if (r.ok) r.json().then((s: SiteSettings) => { setSettings(s); setAiModelSel(s.aiModel || ""); setAiProviderSel(s.aiProvider || "anthropic"); setAiTopicsInput((s.aiTopics || []).join(", ")); setRecipientsInput((s.mailExtraRecipients || []).join("\n")); setAiImageModelSel(s.aiImageModel || "gemini-2.5-flash-image"); setAiImageProviderSel(s.aiImageProvider || "pollinations"); }); }).catch(() => {});
    loadSubscribers();
    fetch("/api/v1/ai/history", { cache: "no-store" }).then((r) => { if (r.ok) r.json().then((d) => setAiHistory(d.results || [])); }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Paste an image from the clipboard anywhere in the editor → upload as cover.
  // Only reacts to image clipboard items, so pasting text into fields is unaffected.
  useEffect(() => {
    if (view !== "editor") return;
    const onPaste = (e: ClipboardEvent) => {
      if (coverBusy) return;
      // If the paste happens inside a content-image block input, let that block
      // handle it (upload into the block), not the cover.
      const el = e.target as HTMLElement | null;
      if (el && typeof el.closest === "function" && el.closest("[data-blockimg]")) return;
      for (const it of Array.from(e.clipboardData?.items || [])) {
        if (it.type.startsWith("image/")) {
          const f = it.getAsFile();
          if (f) { e.preventDefault(); uploadCover(f); return; }
        }
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, coverBusy]);

  // AC-006: derive the cover image's real dimensions (naturalWidth×naturalHeight)
  // whenever the cover changes, and combine with the last known File size (upload/
  // paste). Remote/AI images have no File → only W×H px is shown. Hidden when empty.
  useEffect(() => {
    const url = draft.coverUrl;
    if (!url) { coverSizeRef.current = null; setCoverInfo(""); return; }
    const size = coverSizeRef.current;
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (cancelled) return;
      const dims = `${img.naturalWidth}×${img.naturalHeight} px`;
      setCoverInfo(size != null ? `${dims} · ${fmtBytes(size)}` : dims);
    };
    img.onerror = () => { if (!cancelled) setCoverInfo(""); };
    img.src = url;
    return () => { cancelled = true; };
  }, [draft.coverUrl]);

  function signOut() {
    window.location.href = me?.signOutUrl || "/oauth/sign_out?rd=%2F";
  }
  async function saveSettings() {
    if (!settings) return;
    const res = await fetch("/api/v1/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    }).catch(() => null);
    if (res && res.ok) {
      setSettings(await res.json());
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    }
  }

  async function aiGetModels() {
    setAiCfgBusy(true);
    setAiCfgMsg("Đang lấy danh sách model…");
    try {
      const res = await fetch("/api/v1/ai/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: aiProviderSel, ...(aiKeyInput.trim() ? { token: aiKeyInput.trim() } : {}) }),
      });
      const d = await res.json();
      if (res.ok && Array.isArray(d.models)) {
        setAiModelList(d.models);
        if (!aiModelSel && d.models[0]) setAiModelSel(d.models[0].id);
        setAiCfgMsg(`Đã lấy ${d.models.length} model.`);
      } else {
        setAiCfgMsg(`❌ ${d.error || res.status}`);
      }
    } catch (e) {
      setAiCfgMsg(`❌ ${(e as Error).message}`);
    }
    setAiCfgBusy(false);
  }
  async function aiSaveConfig() {
    if (!settings) return;
    setAiCfgBusy(true);
    const body: Record<string, unknown> = { aiProvider: aiProviderSel, aiModel: aiModelSel };
    if (aiKeyInput.trim()) body.aiApiKey = aiKeyInput.trim();
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const s: SiteSettings = await res.json();
        setSettings(s);
        setAiModelSel(s.aiModel || "");
        setAiProviderSel(s.aiProvider || "anthropic");
        setAiKeyInput("");
        setAiCfgMsg(`✅ Đã lưu · ${s.aiProvider} · model: ${s.aiModel}${s.aiApiKeySet ? ` · token: ${s.aiApiKeyHint}` : ""}`);
      } else {
        const d = await res.json().catch(() => ({}));
        setAiCfgMsg(`❌ ${d.error || res.status}`);
      }
    } catch (e) {
      setAiCfgMsg(`❌ ${(e as Error).message}`);
    }
    setAiCfgBusy(false);
  }

  function aiLogLine(s: string) {
    setAiLog((l) => [s, ...l].slice(0, 30));
  }
  // Prominent, friendly error for manual AI actions (detects rate limits).
  function aiAlert(msg: unknown) {
    const m = String(msg ?? "");
    if (/\b429\b|quota|rate.?limit/i.test(m)) {
      alert("AI đang bị giới hạn lượt gọi (429/quota).\nKey đang ở gói miễn phí — đã hết lượt hôm nay. Thử lại sau, hoặc bật billing cho key để bỏ giới hạn.\n\nChi tiết: " + m.slice(0, 200));
    } else {
      alert("Lỗi khi gọi AI: " + m.slice(0, 300));
    }
  }
  async function loadHistory() {
    try {
      const r = await fetch("/api/v1/ai/history", { cache: "no-store" });
      if (r.ok) setAiHistory((await r.json()).results || []);
    } catch { /* ignore */ }
  }
  async function saveDiscoverCfg() {
    if (!settings) return;
    const topics = aiTopicsInput.split(",").map((t) => t.trim()).filter(Boolean);
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiTopics: topics, aiAutoPublish: settings.aiAutoPublish, aiDiscoverCount: settings.aiDiscoverCount }),
      });
      if (res.ok) {
        const s: SiteSettings = await res.json();
        setSettings(s);
        setAiTopicsInput((s.aiTopics || []).join(", "));
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2500);
      }
    } catch { /* ignore */ }
  }
  async function aiDiscover() {
    setAiBusy(true);
    aiLogLine("⏳ AI đang tự tìm bài phù hợp…");
    try {
      const res = await fetch("/api/v1/ai/discover", { method: "POST" });
      const d = await res.json();
      if (res.ok) {
        aiLogLine(`✨ Quét ${d.candidates} bài · chọn & xử lý ${d.picked}`);
        refreshPosts();
        loadHistory();
      } else {
        aiLogLine(`❌ ${d.error || res.status}`);
      }
    } catch (e) {
      aiLogLine(`❌ ${(e as Error).message}`);
    }
    setAiBusy(false);
  }
  async function aiIngest(publish: boolean) {
    if (!aiUrl.trim()) return;
    setAiBusy(true);
    aiLogLine(`⏳ ${publish ? "Biên tập & xuất bản" : "Biên tập → nháp"}: ${aiUrl}`);
    try {
      const res = await fetch("/api/v1/ai/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: aiUrl.trim(), publish, summarize: urlSummarize }),
      });
      const d = await res.json();
      if (res.ok) {
        aiLogLine(`✅ ${d.title} → ${d.status}${d.aiUsed ? "" : " (AI chưa cấu hình khóa)"}`);
        setAiUrl("");
        refreshPosts(); loadHistory();
        // Open the created post so the result is visible (preview + edit/publish).
        if (d.slug) { setAiBusy(false); openInEditor(d.slug, true); return; }
      } else {
        aiLogLine(`❌ ${d.error || res.status}`); aiAlert(d.error || res.status);
      }
    } catch (e) {
      aiLogLine(`❌ ${(e as Error).message}`); aiAlert((e as Error).message);
    }
    setAiBusy(false);
  }
  async function aiIngestFile(publish: boolean) {
    if (!aiFile) return;
    setAiBusy(true);
    aiLogLine(`⏳ Đọc & biên tập file: ${aiFile.name}`);
    try {
      const fd = new FormData();
      fd.append("file", aiFile);
      if (publish) fd.append("publish", "1");
      const res = await fetch("/api/v1/ai/ingest-file", { method: "POST", body: fd });
      const d = await res.json();
      if (res.ok) {
        aiLogLine(`✅ ${d.title} → ${d.status}${d.aiUsed ? "" : " (AI chưa cấu hình khóa)"}`);
        setAiFile(null);
        if (fileRef.current) fileRef.current.value = "";
        refreshPosts();
        loadHistory();
        if (!publish && d.slug) { setAiBusy(false); openInEditor(d.slug, true); return; }
      } else {
        aiLogLine(`❌ ${d.error || res.status}`);
      }
    } catch (e) {
      aiLogLine(`❌ ${(e as Error).message}`);
    }
    setAiBusy(false);
  }
  // Preview → ask the LLM to revise the article per an extra instruction. Saves
  // the current draft first so the instruction applies to the latest content,
  // then reloads the revised result back into the preview.
  async function reeditWithInstruction() {
    const instruction = reeditInstruction.trim();
    if (!instruction || !draft.slug) return;
    setPreviewBusy(true);
    try {
      await apiSave(draft);
      const res = await fetch("/api/v1/ai/reedit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: draft.slug, instruction }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { alert(d.error === "Forbidden" ? "Bạn không có quyền biên tập." : `Lỗi: ${d.error || res.status}`); }
      else { await openInEditor(draft.slug, true); setReeditInstruction(""); }
      loadHistory();
    } catch (e) { alert((e as Error).message); }
    setPreviewBusy(false);
  }
  async function aiGenerate(publish: boolean) {
    if (genBrief.trim().length < 10) { aiLogLine("❌ Đề bài quá ngắn"); return; }
    setAiBusy(true);
    aiLogLine(`⏳ AI đang soạn bài theo đề: ${genBrief.trim().slice(0, 60)}…`);
    try {
      const res = await fetch("/api/v1/ai/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: genBrief, title: genTitle.trim(), cat: genCat, audience: genAudience.trim(), publish }),
      });
      const d = await res.json();
      if (res.ok) {
        aiLogLine(`✅ ${d.title} → ${d.status}${d.aiUsed ? "" : " (AI chưa cấu hình khóa)"}`);
        setGenBrief(""); setGenTitle(""); setGenAudience("");
        refreshPosts(); loadHistory();
        if (!publish && d.slug) { setAiBusy(false); openInEditor(d.slug, true); return; }
      } else {
        aiLogLine(`❌ ${d.error || res.status}`);
      }
    } catch (e) { aiLogLine(`❌ ${(e as Error).message}`); }
    setAiBusy(false);
  }
  async function aiIngestPaste(publish: boolean) {
    if (pasteText.trim().length < 40) { aiLogLine("❌ Nội dung quá ngắn"); return; }
    setAiBusy(true);
    aiLogLine(`⏳ ${pasteSummarize ? "Tóm tắt & dẫn nguồn" : "Biên tập"}: nội dung dán`);
    try {
      const res = await fetch("/api/v1/ai/ingest-text", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: pasteTitle.trim(), text: pasteText, sourceName: pasteSrcName.trim(), sourceUrl: pasteSrcUrl.trim(), summarize: pasteSummarize, publish }),
      });
      const d = await res.json();
      if (res.ok) {
        aiLogLine(`✅ ${d.title} → ${d.status}${d.aiUsed ? "" : " (AI chưa cấu hình khóa)"}`);
        setPasteTitle(""); setPasteText(""); setPasteSrcName(""); setPasteSrcUrl("");
        refreshPosts(); loadHistory();
        if (!publish && d.slug) { setAiBusy(false); openInEditor(d.slug, true); return; }
      } else {
        aiLogLine(`❌ ${d.error || res.status}`);
      }
    } catch (e) { aiLogLine(`❌ ${(e as Error).message}`); }
    setAiBusy(false);
  }
  // Re-edit a post from the list, with an optional instruction typed inline
  // ("ngắn gọn hơn", "thêm ví dụ"…). Empty instruction = re-edit to house style.
  async function doReedit(slug: string, instruction: string) {
    setReeditBusy(slug);
    try {
      const res = await fetch("/api/v1/ai/reedit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, instruction: instruction.trim() || undefined }) });
      const d = await res.json();
      if (!res.ok) { alert(d.error === "Forbidden" ? "Bạn không có quyền biên tập." : `Lỗi: ${d.error || res.status}`); }
      else {
        // Show the re-edited result so the change is visible (previously the list
        // refreshed silently → looked like "nothing happened").
        setReeditFor(null); setReeditListText("");
        await refreshPosts();
        loadHistory();
        setReeditBusy(null);
        await openInEditor(slug, true);
        return;
      }
      refreshPosts();
      loadHistory();
    } catch (e) { alert((e as Error).message); }
    setReeditBusy(null);
  }
  async function aiRunFeeds() {
    setAiBusy(true);
    aiLogLine("⏳ Chạy nguồn ngay…");
    try {
      const res = await fetch("/api/v1/ai/run-feeds", { method: "POST" });
      const d = await res.json();
      aiLogLine(res.ok ? `✅ Đã nhập ${d.ingested} bài từ nguồn` : `❌ ${d.error || res.status}`);
      if (res.ok) refreshPosts();
    } catch (e) {
      aiLogLine(`❌ ${(e as Error).message}`);
    }
    setAiBusy(false);
  }
  // Persist the feed list immediately so adding/removing a source "just works"
  // (no separate save step) — this was the cause of "RSS không hoạt động".
  async function persistFeeds(feeds: string[]) {
    if (!settings) return;
    setSettings({ ...settings, aiFeeds: feeds });
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiFeeds: feeds }),
      });
      if (res.ok) setSettings(await res.json());
    } catch { /* keep optimistic state */ }
  }
  function addFeed() {
    const u = aiFeedInput.trim();
    if (!u || !settings) return;
    if ((settings.aiFeeds || []).includes(u)) { setAiFeedInput(""); return; }
    persistFeeds([...(settings.aiFeeds || []), u]);
    setAiFeedInput("");
  }
  function removeFeed(u: string) {
    if (!settings) return;
    persistFeeds((settings.aiFeeds || []).filter((f) => f !== u));
  }
  async function checkFeed(u: string) {
    setFeedCheckBusy(u);
    try {
      const res = await fetch("/api/v1/ai/feed-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: u }) });
      const d = await res.json();
      setFeedChecks((m) => ({ ...m, [u]: res.ok ? d : { ok: false, count: 0, error: d.error || res.status } }));
    } catch (e) {
      setFeedChecks((m) => ({ ...m, [u]: { ok: false, count: 0, error: (e as Error).message } }));
    }
    setFeedCheckBusy(null);
  }
  async function saveMailCfg() {
    if (!settings) return;
    setMailBusy(true);
    const body: Record<string, unknown> = { mailHost: settings.mailHost, mailPort: settings.mailPort, mailSecure: settings.mailSecure, mailUser: settings.mailUser, mailFrom: settings.mailFrom };
    if (mailPwInput.trim()) body.mailPassword = mailPwInput.trim();
    try {
      const res = await fetch("/api/v1/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { setSettings(await res.json()); setMailPwInput(""); setMailMsg("✅ Đã lưu cấu hình mail"); }
      else { const d = await res.json().catch(() => ({})); setMailMsg(`❌ ${d.error || res.status}`); }
    } catch (e) { setMailMsg(`❌ ${(e as Error).message}`); }
    setMailBusy(false);
  }
  async function testMail() {
    if (!mailTestTo.trim()) return;
    setMailBusy(true);
    setMailMsg("⏳ Đang gửi thử…");
    try {
      const res = await fetch("/api/v1/mail/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: mailTestTo.trim() }) });
      const d = await res.json();
      setMailMsg(res.ok ? `✅ Đã gửi thử tới ${mailTestTo}` : `❌ ${d.error || res.status}`);
    } catch (e) { setMailMsg(`❌ ${(e as Error).message}`); }
    setMailBusy(false);
  }
  async function loadSubscribers() {
    try {
      const res = await fetch("/api/v1/subscribers");
      if (res.ok) setSubs((await res.json()).results ?? []);
    } catch { /* ignore */ }
  }
  async function saveNewsletterCfg() {
    if (!settings) return;
    const recips = recipientsInput.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
    setNlMsg("⏳ Đang lưu…");
    try {
      const res = await fetch("/api/v1/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mailAutoSend: settings.mailAutoSend, mailExtraRecipients: recips }) });
      if (res.ok) { setSettings(await res.json()); setNlMsg("✅ Đã lưu cấu hình gửi bài"); }
      else { const d = await res.json().catch(() => ({})); setNlMsg(`❌ ${d.error || res.status}`); }
    } catch (e) { setNlMsg(`❌ ${(e as Error).message}`); }
  }
  async function removeSub(email: string) {
    setSubs((s) => s.filter((x) => x.email !== email)); // optimistic
    await fetch("/api/v1/subscribers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }).catch(() => {});
  }

  async function togglePublish(slug: string) {
    const cur = posts.find((p) => p.slug === slug);
    const next: PostStatus = cur?.status === "Đã xuất bản" ? "Bản nháp" : "Đã xuất bản";
    setPosts((ps) => ps.map((p) => (p.slug === slug ? { ...p, status: next } : p))); // optimistic
    await fetch(`/api/v1/posts/${slug}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: CMS2ST[next] }) }).catch(() => {});
    refreshPosts();
  }
  async function toggleFeatured(slug: string) {
    const cur = posts.find((p) => p.slug === slug);
    if (cur?.status !== "Đã xuất bản") { alert("Chỉ ghim được bài đã xuất bản lên trang chủ."); return; }
    const next = !cur?.featured;
    setPosts((ps) => ps.map((p) => (p.slug === slug ? { ...p, featured: next } : p))); // optimistic
    const res = await fetch(`/api/v1/posts/${slug}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featured: next }) }).catch(() => null);
    if (!res || !res.ok) alert(res?.status === 403 ? "Chỉ Publisher/Quản trị mới ghim được lên trang chủ." : "Cập nhật thất bại.");
    refreshPosts();
  }
  async function deletePost(slug: string, title: string): Promise<boolean> {
    if (!window.confirm(`Xoá vĩnh viễn bài "${title}"? Hành động này không hoàn tác được.`)) return false;
    setPosts((ps) => ps.filter((p) => p.slug !== slug)); // optimistic
    const res = await fetch(`/api/v1/posts/${slug}`, { method: "DELETE" }).catch(() => null);
    if (!res || !res.ok) {
      alert(res?.status === 403 ? "Chỉ Quản trị mới được xoá bài." : "Xoá thất bại.");
      refreshPosts();
      return false;
    }
    refreshPosts();
    return true;
  }
  function editPost(p: SeedPost) {
    setDraft({ ...p });
    setSaved(false);
    setShowPreview(false);
    setCoverMsg("");
    setView("editor");
  }
  function setBlockVal(i: number, val: string) {
    const nb = [...draft.blocks]; nb[i] = [nb[i][0], val]; setDraft({ ...draft, blocks: nb as [BlockKind, string][] });
  }
  // Insert a new block right after the active (last-focused) block, or at the end
  // when nothing is focused — so authors add an image/quote/etc. exactly where
  // they want (AC-012). The new block becomes active.
  function addBlockAt(kind: BlockKind) {
    const at = activeBlock == null ? draft.blocks.length : Math.min(activeBlock + 1, draft.blocks.length);
    const nb = [...draft.blocks]; nb.splice(at, 0, [kind, ""]);
    setDraft({ ...draft, blocks: nb as [BlockKind, string][] });
    setActiveBlock(at);
  }
  // Reorder blocks by dragging the ⠿ handle (AC-012).
  function moveBlock(from: number, to: number) {
    if (from === to || from < 0 || to < 0) return;
    const nb = [...draft.blocks]; const [m] = nb.splice(from, 1); nb.splice(to, 0, m);
    setDraft({ ...draft, blocks: nb as [BlockKind, string][] });
    setActiveBlock(to);
  }
  function blockImgFile(i: number) {
    blockImgIdxRef.current = i;
    blockImgFileRef.current?.click();
  }
  // Upload a file into a specific content-image block (shared by file-picker + paste).
  async function uploadBlockImage(i: number, file: File) {
    if (i < 0) return;
    setBlockImgBusy(i);
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("slug", `${draft.slug || "post"}-b${i}`);
      const res = await fetch("/api/v1/cover/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (res.ok) { setBlockVal(i, d.url); if (d.minioUrl) setCoverMinioUrl(d.minioUrl); } else alert(d.error || "Upload lỗi");
    } catch (e) { alert((e as Error).message); }
    setBlockImgBusy(null);
  }
  async function onBlockImgFile(file: File) {
    const i = blockImgIdxRef.current; if (i < 0) return;
    await uploadBlockImage(i, file);
    if (blockImgFileRef.current) blockImgFileRef.current.value = "";
  }
  async function genBlockImg(i: number) {
    // Prompt-driven: editor describes the image to generate (prefilled from the
    // current block text). Empty/cancel → the server auto-derives from title.
    const caption = (draft.blocks[i]?.[1] || "").trim();
    const scene = window.prompt("Mô tả ảnh muốn tạo (prompt) — để trống thì AI tự suy từ nội dung:", caption || draft.title || "");
    if (scene === null) return; // cancelled
    setBlockImgBusy(i);
    try {
      const res = await fetch("/api/v1/cover/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: `${draft.slug || "post"}-b${i}`, title: caption || draft.title, cat: draft.cat, tone: TONE[draft.cat] ?? "#0072BC", scene: scene.trim() }) });
      const d = await res.json();
      if (res.ok) { setBlockVal(i, d.url); if (d.minioUrl) setCoverMinioUrl(d.minioUrl); } else alert(d.error || "Tạo ảnh lỗi");
    } catch (e) { alert((e as Error).message); }
    setBlockImgBusy(null);
  }
  async function uploadCover(file: File) {
    setCoverBusy(true); setCoverMsg("⏳ Đang tải ảnh…");
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("slug", draft.slug || "cover");
      const res = await fetch("/api/v1/cover/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (res.ok) { coverSizeRef.current = file.size; setDraft((dr) => ({ ...dr, coverUrl: d.url })); setCoverMsg("✅ Đã tải ảnh bìa"); }
      else setCoverMsg(`❌ ${d.error || res.status}`);
    } catch (e) { setCoverMsg(`❌ ${(e as Error).message}`); }
    if (coverFileRef.current) coverFileRef.current.value = "";
    setCoverBusy(false);
  }
  async function genCoverAI() {
    setCoverBusy(true); setCoverMsg("⏳ AI đang tạo ảnh bìa…");
    try {
      const res = await fetch("/api/v1/cover/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: draft.slug, title: draft.title, cat: draft.cat, tone: TONE[draft.cat] ?? "#0072BC", scene: coverAiPrompt.trim() }) });
      const d = await res.json();
      if (res.ok) { coverSizeRef.current = null; setDraft((dr) => ({ ...dr, coverUrl: d.url })); setCoverMsg((d.aiUsed ? "✅ " : "⚠️ ") + (d.note || "")); setCoverMinioUrl(d.minioUrl || ""); }
      else setCoverMsg(`❌ ${d.error || res.status}`);
    } catch (e) { setCoverMsg(`❌ ${(e as Error).message}`); }
    setCoverBusy(false);
  }
  // Load a post from the store into the editor (used after manual AI ingest so
  // the admin can preview + edit before publishing). preview=true opens the
  // rendered preview immediately.
  async function openInEditor(slug: string, preview = false) {
    try {
      const res = await fetch(`/api/v1/posts/${slug}`, { cache: "no-store" });
      if (!res.ok) return;
      setDraft(storeToCms(await res.json()));
      setSaved(false);
      setShowPreview(preview);
      setView("editor");
    } catch { /* ignore */ }
  }
  function newPost() {
    setDraft(makeDraft());
    setSaved(false);
    setView("editor");
  }
  async function saveDraft() {
    const ok = await apiSave(draft);
    setSaved(ok);
    await refreshPosts();
  }

  const navActive = (key: string) => key === view;

  const aiWorking = aiBusy || coverBusy || previewBusy || !!reeditBusy;
  const lastLog = aiLog[0] || "";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "232px minmax(0, 1fr)", minHeight: "100vh", background: COLORS.pageBg }}>
      {/* Global AI progress toast */}
      {aiWorking && (
        <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 50, background: "#0b1f3a", color: "#fff", borderRadius: 10, padding: "12px 16px", boxShadow: "0 10px 30px -8px rgba(0,0,0,0.4)", maxWidth: 380, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "nsspin 0.8s linear infinite", flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>AI đang xử lý…</div>
            {lastLog && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lastLog}</div>}
          </div>
          <style>{"@keyframes nsspin{to{transform:rotate(360deg)}}"}</style>
        </div>
      )}
      {/* Sidebar */}
      <aside style={{ background: "#fff", borderRight: `1px solid ${COLORS.split}`, position: "sticky", top: 0, height: "100vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 18px 14px", borderBottom: `1px solid ${COLORS.split}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink }}>{SIDEBAR.brand.name}</div>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", color: COLORS.ink3 }}>{SIDEBAR.brand.unit}</div>
          <div style={{ fontSize: 12, color: COLORS.brandBlue, marginTop: 6, fontWeight: 600 }}>{SIDEBAR.brand.sub}</div>
        </div>
        <nav style={{ padding: "10px 0", flex: 1 }}>
          {SIDEBAR.groups.map((g) => (
            <div key={g.group} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: COLORS.ink3, padding: "8px 18px 4px" }}>{g.group}</div>
              {g.items.map((it) => {
                const isLink = "href" in it && it.href;
                const active = "key" in it && it.key ? navActive(it.key) : false;
                const count = "count" in it && it.count ? (it.count === "{total}" ? posts.length : it.count === "{feedCount}" ? feedCount : it.count) : null;
                const badge = "badge" in it && it.badge ? pendingCount : null;
                const content = (
                  <>
                    <span style={{ width: 18, textAlign: "center", opacity: 0.7 }}>{it.icon}</span>
                    <span style={{ flex: 1 }}>{it.label}</span>
                    {count != null && <span style={{ fontSize: 11.5, color: COLORS.ink3 }}>{count}</span>}
                    {badge != null && <span style={{ fontSize: 11, background: "#FEF1E9", color: "#C25A17", borderRadius: 8, padding: "0 7px", fontWeight: 700 }}>{badge}</span>}
                  </>
                );
                const style: CSSProperties = {
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 18px", fontSize: 13.5, cursor: "pointer",
                  color: active ? COLORS.brandBlue : COLORS.ink2, background: active ? "#E6F1F9" : "transparent",
                  borderRight: active ? `2px solid ${COLORS.brandBlue}` : "2px solid transparent", border: "none", width: "100%", textAlign: "left",
                };
                if (isLink) return <a key={it.label} href={String(("href" in it && it.href) || "/")} target="_blank" rel="noreferrer" style={style}>{content}</a>;
                return <button key={it.label} type="button" onClick={() => setView(("key" in it ? it.key : "posts") as View)} style={style}>{content}</button>;
              })}
            </div>
          ))}
        </nav>
        <div style={{ borderTop: `1px solid ${COLORS.split}`, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 30, height: 30, borderRadius: "50%", background: COLORS.brandBlue, color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{me?.initials ?? SIDEBAR.footer.avatar}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{me?.user ?? SIDEBAR.footer.name}</div>
            <div style={{ fontSize: 11.5, color: COLORS.ink3 }}>{me?.role ?? SIDEBAR.footer.role}</div>
          </div>
          <button
            type="button"
            onClick={signOut}
            title={ADMIN_UI.account.signOut}
            style={{ ...btnSm, height: 28, padding: "0 8px", fontSize: 12 }}
          >
            ⏻
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ position: "sticky", top: 0, zIndex: 5, background: "#fff", borderBottom: `1px solid ${COLORS.split}`, padding: "12px 24px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: COLORS.ink3 }}>{TOPBAR.crumbPrefix}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{TOPBAR.viewLabels[view]}</span>
          {saved && <span style={{ fontSize: 12.5, color: COLORS.brandGreen, marginLeft: 8 }}>{TOPBAR.saveHint}</span>}
          <a href="/blog" target="_blank" rel="noreferrer" style={{ ...btnSm, marginLeft: "auto", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>↗ Xem blog</a>
          <button type="button" onClick={newPost} style={{ ...btnBlue }}>{TOPBAR.newPostButton}</button>
        </header>

        <main style={{ padding: 24, minWidth: 0 }}>
          {view === "posts" && PostsView()}
          {view === "editor" && EditorView()}
          {view === "taxonomy" && TaxonomyView()}
          {view === "feeds" && FeedsView()}
          {view === "inbox" && InboxView()}
          {view === "api" && ApiView()}
          {view === "admin" && AdminView()}
          {view === "aistudio" && AiStudioView()}
        </main>
      </div>
    </div>
  );

  // ── Views ──────────────────────────────────────────────────────────────
  function AiStudioView() {
    const isAdmin = me?.isAdmin ?? true;
    const feeds = settings?.aiFeeds ?? [];
    return (
      <div style={{ display: "grid", gap: 16, maxWidth: 860 }}>
        {/* Commission — AI writes an original article from a brief */}
        <section style={{ ...panelPad, borderColor: COLORS.brandBlue }}>
          <PanelHead>📝 Đặt hàng bài viết → AI tự soạn nội dung</PanelHead>
          <div style={{ fontSize: 12.5, color: COLORS.ink3, margin: "6px 0 12px" }}>
            Mô tả đề bài, AI sẽ <b>tự viết bài hoàn chỉnh</b> theo phong cách blog (không cần nguồn). Hợp cho bài đào tạo/hướng dẫn nội bộ. VD: <i>“Đào tạo nhân viên về DNS: từ CoreDNS, DNS nội bộ đến DNS global — kèm ví dụ thực tế”</i>.
          </div>
          <textarea style={{ ...input, height: "auto", minHeight: 96, padding: "10px 12px", lineHeight: 1.6, marginBottom: 8 }} placeholder="Đề bài / yêu cầu nội dung… (càng chi tiết, bài càng đúng ý)" value={genBrief} onChange={(e) => setGenBrief(e.target.value)} disabled={aiBusy} />
          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <input style={{ ...input, flex: 2, minWidth: 180 }} placeholder="Tiêu đề (tuỳ chọn — để trống AI tự đặt)" value={genTitle} onChange={(e) => setGenTitle(e.target.value)} disabled={aiBusy} />
            <select style={{ ...input, flex: 1, minWidth: 130 }} value={genCat} onChange={(e) => setGenCat(e.target.value)} disabled={aiBusy}>
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <input style={{ ...input, marginBottom: 12 }} placeholder="Đối tượng người đọc (tuỳ chọn — vd: kỹ sư mới, quản trị hệ thống)" value={genAudience} onChange={(e) => setGenAudience(e.target.value)} disabled={aiBusy} />
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => aiGenerate(false)} disabled={aiBusy || genBrief.trim().length < 10} style={{ ...btnSm, opacity: aiBusy || genBrief.trim().length < 10 ? 0.5 : 1 }}>Soạn → Nháp (xem trước)</button>
            <button type="button" onClick={() => aiGenerate(true)} disabled={aiBusy || genBrief.trim().length < 10} style={{ ...btnBlue, opacity: aiBusy || genBrief.trim().length < 10 ? 0.5 : 1 }}>✨ Soạn &amp; Xuất bản</button>
          </div>
        </section>

        {/* Manual hot-news */}
        <section style={panelPad}>
          <PanelHead>Dán link → AI biên tập & xuất bản ngay (tin hot)</PanelHead>
          <div style={{ fontSize: 12.5, color: COLORS.ink3, margin: "6px 0 12px" }}>
            AI đọc bài từ URL rồi biên tập lại theo phong cách của blog, tạo bài hoàn chỉnh. Dùng cho tin nóng cần đăng ngay.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              style={{ ...input, flex: 1 }}
              placeholder="https://nguồn.com/bài-viết"
              value={aiUrl}
              onChange={(e) => setAiUrl(e.target.value)}
              disabled={aiBusy}
            />
            <button type="button" onClick={() => aiIngest(false)} disabled={aiBusy || !aiUrl} style={{ ...btnSm, opacity: aiBusy || !aiUrl ? 0.5 : 1 }}>Biên tập → Nháp</button>
            <button type="button" onClick={() => aiIngest(true)} disabled={aiBusy || !aiUrl} style={{ ...btnBlue, opacity: aiBusy || !aiUrl ? 0.5 : 1 }}>
              ✨ Biên tập & Xuất bản ngay
            </button>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 12.5, color: COLORS.ink2, cursor: "pointer" }}>
            <input type="checkbox" checked={urlSummarize} onChange={(e) => setUrlSummarize(e.target.checked)} disabled={aiBusy} />
            Chế độ <b>tóm tắt &amp; dẫn nguồn</b> (an toàn bản quyền — không chép nguyên văn, tự thêm link nguồn)
          </label>
        </section>

        {/* File ingest — Word / PDF */}
        <section style={panelPad}>
          <PanelHead>Tải file Word/PDF → AI biên tập</PanelHead>
          <div style={{ fontSize: 12.5, color: COLORS.ink3, margin: "6px 0 12px" }}>
            Chọn file <b>.docx / .pdf / .txt / .md</b> — AI trích nội dung rồi biên tập lại theo phong cách blog. Mặc định tạo <b>bản nháp</b> để bạn duyệt trước.
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input ref={fileRef} type="file" accept=".docx,.pdf,.txt,.md,.markdown" disabled={aiBusy} onChange={(e) => setAiFile(e.target.files?.[0] ?? null)} style={{ fontSize: 13, flex: 1, minWidth: 220 }} />
            <button type="button" onClick={() => aiIngestFile(false)} disabled={aiBusy || !aiFile} style={{ ...btnSm, opacity: aiBusy || !aiFile ? 0.5 : 1 }}>Biên tập → Nháp</button>
            <button type="button" onClick={() => aiIngestFile(true)} disabled={aiBusy || !aiFile} style={{ ...btnBlue, opacity: aiBusy || !aiFile ? 0.5 : 1 }}>✨ Biên tập & Xuất bản</button>
          </div>
        </section>

        {/* Paste raw text — login-walled sources (LinkedIn, Medium…) */}
        <section style={panelPad}>
          <PanelHead>Dán nội dung thô → AI biên tập</PanelHead>
          <div style={{ fontSize: 12.5, color: COLORS.ink3, margin: "6px 0 12px" }}>
            Dùng cho nguồn cần đăng nhập / chặn crawler (LinkedIn, Medium…): bạn tự copy nội dung bạn có quyền đọc, dán vào đây. Nên bật <b>tóm tắt &amp; dẫn nguồn</b> để an toàn bản quyền.
          </div>
          <input style={{ ...input, marginBottom: 8 }} placeholder="Tiêu đề (tuỳ chọn — để trống AI tự đặt)" value={pasteTitle} onChange={(e) => setPasteTitle(e.target.value)} disabled={aiBusy} />
          <textarea style={{ ...input, height: "auto", minHeight: 140, padding: "10px 12px", lineHeight: 1.6, marginBottom: 8 }} placeholder="Dán nội dung bài viết vào đây…" value={pasteText} onChange={(e) => setPasteText(e.target.value)} disabled={aiBusy} />
          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <input style={{ ...input, flex: 1, minWidth: 180 }} placeholder="Tên nguồn (vd: LinkedIn — Tác giả)" value={pasteSrcName} onChange={(e) => setPasteSrcName(e.target.value)} disabled={aiBusy} />
            <input style={{ ...input, flex: 1, minWidth: 180 }} placeholder="Link nguồn (https://…)" value={pasteSrcUrl} onChange={(e) => setPasteSrcUrl(e.target.value)} disabled={aiBusy} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 12.5, color: COLORS.ink2, cursor: "pointer" }}>
            <input type="checkbox" checked={pasteSummarize} onChange={(e) => setPasteSummarize(e.target.checked)} disabled={aiBusy} />
            Chế độ <b>tóm tắt &amp; dẫn nguồn</b> (khuyến nghị — không chép nguyên văn)
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => aiIngestPaste(false)} disabled={aiBusy || pasteText.trim().length < 40} style={{ ...btnSm, opacity: aiBusy || pasteText.trim().length < 40 ? 0.5 : 1 }}>Biên tập → Nháp</button>
            <button type="button" onClick={() => aiIngestPaste(true)} disabled={aiBusy || pasteText.trim().length < 40} style={{ ...btnBlue, opacity: aiBusy || pasteText.trim().length < 40 ? 0.5 : 1 }}>✨ Biên tập &amp; Xuất bản</button>
          </div>
        </section>

        {/* Daily schedule */}
        <section style={panelPad}>
          <PanelHead
            right={
              <button type="button" onClick={aiRunFeeds} disabled={aiBusy || feeds.length === 0} style={{ ...btnSm, height: 30, opacity: aiBusy || !feeds.length ? 0.5 : 1 }}>
                ▶ Chạy nguồn ngay
              </button>
            }
          >
            Lịch tự động hằng ngày
          </PanelHead>
          {settings && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <button
                  type="button"
                  disabled={!isAdmin}
                  onClick={() => setSettings({ ...settings, aiScheduleEnabled: !settings.aiScheduleEnabled })}
                  style={{ width: 42, height: 24, borderRadius: 12, border: "none", cursor: isAdmin ? "pointer" : "not-allowed", background: settings.aiScheduleEnabled ? COLORS.brandGreen : "#CBD3DA", position: "relative" }}
                >
                  <span style={{ position: "absolute", top: 2, left: settings.aiScheduleEnabled ? 20 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff" }} />
                </button>
                <span style={{ fontSize: 13.5 }}>
                  Tự động nhập lúc <b>{String(settings.aiScheduleHour).padStart(2, "0")}:00</b> hằng ngày
                </span>
                <input
                  type="number" min={0} max={23} disabled={!isAdmin}
                  value={settings.aiScheduleHour}
                  onChange={(e) => setSettings({ ...settings, aiScheduleHour: Math.max(0, Math.min(23, Number(e.target.value) || 0)) })}
                  style={{ ...input, width: 70, height: 32 }}
                />
                <button type="button" onClick={saveSettings} disabled={!isAdmin} style={{ ...btnBlue, height: 32, marginLeft: "auto", opacity: isAdmin ? 1 : 0.5 }}>Lưu lịch</button>
                {settingsSaved && <span style={{ fontSize: 12.5, color: COLORS.brandGreen }}>Đã lưu</span>}
              </div>
              <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: COLORS.ink2 }}>Chế độ:</span>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
                  <input type="radio" name="schedmode" checked={settings.aiScheduleMode === "discover"} disabled={!isAdmin} onChange={() => setSettings({ ...settings, aiScheduleMode: "discover" })} />
                  AI tự kiếm bài hay (theo chủ đề)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
                  <input type="radio" name="schedmode" checked={settings.aiScheduleMode === "feeds"} disabled={!isAdmin} onChange={() => setSettings({ ...settings, aiScheduleMode: "feeds" })} />
                  Lấy thẳng từ nguồn đã dán
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
                  Số bài
                  <input type="number" min={1} max={10} disabled={!isAdmin} value={settings.aiDiscoverCount} onChange={(e) => setSettings({ ...settings, aiDiscoverCount: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })} style={{ ...input, width: 60, height: 32 }} />
                </label>
              </div>
              <div style={{ fontSize: 12.5, color: COLORS.ink2, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.split}`, borderRadius: 8, padding: "10px 12px" }}>
                Đang có <b>{feeds.length}</b> nguồn RSS. Quản lý (thêm/kiểm tra/xoá) ở tab <b>“Nguồn RSS”</b> bên trái. Chế độ <b>feeds</b> lấy thẳng từ các nguồn đó; chế độ <b>discover</b> để AI tự tìm bài hay (kể cả khi chưa có nguồn — dùng bộ mặc định).
              </div>
              <div style={{ fontSize: 11.5, color: COLORS.ink3, marginTop: 10 }}>
                CronJob OpenShift <code>ac-portal-ai-ingest</code> gọi endpoint lúc {String(settings.aiScheduleHour).padStart(2, "0")}:00. Bài mới ra {settings.autoPublishAiPosts ? "xuất bản ngay" : "dạng nháp chờ duyệt"} (đổi ở Quản trị).
              </div>
            </div>
          )}
        </section>

        {/* Auto-discover — AI finds good articles and publishes them */}
        <section style={{ ...panelPad, borderColor: COLORS.brandGreen }}>
          <PanelHead
            right={
              <button type="button" onClick={aiDiscover} disabled={aiBusy} style={{ ...btnBlue, height: 30, opacity: aiBusy ? 0.6 : 1 }}>
                {aiBusy ? "⏳ Đang tìm…" : "✨ Tự tìm & xuất bản ngay"}
              </button>
            }
          >
            AI tự tìm bài hay & xuất bản
          </PanelHead>
          <div style={{ fontSize: 12.5, color: COLORS.ink3, margin: "6px 0 14px" }}>
            AI quét các nguồn ở trên (hoặc <b>bộ nguồn kỹ thuật uy tín mặc định</b> nếu bạn chưa thêm nguồn), bỏ bài đã lấy (theo lịch sử), tự chọn bài <b>phù hợp & chất lượng nhất</b> theo chủ đề rồi biên tập — chạy hằng ngày lúc {String(settings?.aiScheduleHour ?? 5).padStart(2, "0")}:00 hoặc bấm chạy ngay. Bạn không cần vào tìm bài.
          </div>
          {settings && (
            <div>
              <label style={label}>Chủ đề quan tâm (cách nhau bởi dấu phẩy)</label>
              <input style={{ ...input, marginBottom: 12 }} value={aiTopicsInput} onChange={(e) => setAiTopicsInput(e.target.value)} disabled={!isAdmin} placeholder="cloud, AI, DevOps, Kubernetes, security" />
              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
                  <input type="checkbox" checked={settings.aiAutoPublish} disabled={!isAdmin} onChange={(e) => setSettings({ ...settings, aiAutoPublish: e.target.checked })} />
                  Tự động xuất bản (không thì lưu nháp chờ duyệt)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
                  Số bài mỗi lần
                  <input type="number" min={1} max={10} value={settings.aiDiscoverCount} disabled={!isAdmin} onChange={(e) => setSettings({ ...settings, aiDiscoverCount: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })} style={{ ...input, width: 64, height: 32 }} />
                </label>
                <button type="button" onClick={saveDiscoverCfg} disabled={!isAdmin} style={{ ...btnBlue, height: 32, marginLeft: "auto", opacity: isAdmin ? 1 : 0.5 }}>Lưu cấu hình</button>
                {settingsSaved && <span style={{ fontSize: 12.5, color: COLORS.brandGreen }}>Đã lưu</span>}
              </div>
            </div>
          )}
        </section>

        {/* Activity log */}
        <section style={panelPad}>
          <PanelHead>Nhật ký (phiên hiện tại)</PanelHead>
          {aiLog.length === 0 ? (
            <div style={{ fontSize: 12.5, color: COLORS.ink3, marginTop: 8 }}>Chưa có hoạt động.</div>
          ) : (
            <div style={{ marginTop: 8, fontSize: 12.5, fontFamily: "monospace", color: COLORS.ink2, display: "grid", gap: 4 }}>
              {aiLog.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          )}
        </section>

        {/* Ingest history — persistent */}
        <section style={panelPad}>
          <PanelHead right={<button type="button" onClick={loadHistory} style={{ ...btnSm, height: 30 }}>↻ Tải lại</button>}>
            Lịch sử lấy bài ({aiHistory.length})
          </PanelHead>
          <div style={{ fontSize: 12.5, color: COLORS.ink3, margin: "6px 0 10px" }}>Đã lấy bài nào, từ đâu, khi nào, trạng thái gì — để bạn theo dõi dù không đăng nhập thường xuyên.</div>
          {aiHistory.length === 0 ? (
            <div style={{ fontSize: 12.5, color: COLORS.ink3 }}>Chưa có lịch sử.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr>{["Thời gian", "Nguồn", "Tiêu đề", "Trạng thái", "AI"].map((h) => <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: COLORS.ink3, fontWeight: 600, borderBottom: `1px solid ${COLORS.split}`, whiteSpace: "nowrap" }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {aiHistory.map((h, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${COLORS.split}` }}>
                      <td style={{ padding: "6px 8px", whiteSpace: "nowrap", color: COLORS.ink3 }}>{new Date(h.at).toLocaleString("vi-VN")}</td>
                      <td style={{ padding: "6px 8px", color: COLORS.ink3 }}>{h.mode === "discover" ? "AI tự tìm" : h.mode === "cron" ? "Lịch" : h.mode === "file" ? "Từ file" : h.mode === "reedit" ? "Biên tập lại" : h.mode === "generate" ? "Đặt hàng" : "Thủ công"}</td>
                      <td style={{ padding: "6px 8px" }}><a href={h.url} target="_blank" rel="noreferrer" style={{ color: COLORS.brandBlue }}>{h.title}</a></td>
                      <td style={{ padding: "6px 8px" }}><span style={{ fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 8, background: h.status === "published" ? "#E9F6E3" : h.status === "draft" ? "#FEF1E9" : "#F1F3F5", color: h.status === "published" ? "#3F7F27" : h.status === "draft" ? "#C25A17" : COLORS.ink3 }}>{h.status === "published" ? "Đã xuất bản" : h.status === "draft" ? "Nháp" : h.status}</span></td>
                      <td style={{ padding: "6px 8px", color: COLORS.ink3 }}>{h.aiUsed ? "✓" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    );
  }

  function AdminView() {
    const canEdit = me?.isAdmin ?? true;
    const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
      setSettings((s) => (s ? { ...s, [k]: v } : s));
    const row: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${COLORS.split}`, fontSize: 13.5 };
    const toggle = (on: boolean, onClick: () => void) => (
      <button type="button" onClick={onClick} disabled={!canEdit} style={{ width: 42, height: 24, borderRadius: 12, border: "none", cursor: canEdit ? "pointer" : "not-allowed", background: on ? COLORS.brandGreen : "#CBD3DA", position: "relative", transition: "background .15s" }}>
        <span style={{ position: "absolute", top: 2, left: on ? 20 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
      </button>
    );

    return (
      <div style={{ display: "grid", gap: 16, maxWidth: 860 }}>
        {/* Account */}
        <section style={panelPad}>
          <PanelHead right={<button type="button" onClick={signOut} style={{ ...btnSm, height: 30 }}>⏻ {ADMIN_UI.account.signOut}</button>}>
            {ADMIN_UI.account.title}
          </PanelHead>
          {me && !me.authenticated && (
            <div style={{ margin: "10px 0", fontSize: 12.5, color: "#C25A17", background: "#FEF1E9", borderRadius: 6, padding: "8px 10px" }}>{ADMIN_UI.account.localBadge}</div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
            <span style={{ width: 44, height: 44, borderRadius: "50%", background: COLORS.brandBlue, color: "#fff", fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{me?.initials ?? "…"}</span>
            <div style={{ fontSize: 13.5 }}>
              <div style={{ fontWeight: 600, color: COLORS.ink }}>{me?.user ?? "…"}</div>
              <div style={{ color: COLORS.ink3 }}>{me?.email || "—"}</div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right", fontSize: 12.5, color: COLORS.ink2 }}>
              <div>{ADMIN_UI.account.fields.role}: <b style={{ color: COLORS.brandBlue }}>{me?.role ?? "…"}</b></div>
              <div>{ADMIN_UI.account.fields.groups}: {me?.groups?.length ? me.groups.join(", ") : "—"}</div>
            </div>
          </div>
        </section>

        {/* Site settings */}
        <section style={panelPad}>
          <PanelHead right={<><button type="button" onClick={saveSettings} disabled={!canEdit || !settings} style={{ ...btnBlue, height: 30, opacity: canEdit && settings ? 1 : 0.5 }}>{ADMIN_UI.site.save}</button>{settingsSaved && <span style={{ fontSize: 12.5, color: COLORS.brandGreen, marginLeft: 8 }}>{ADMIN_UI.site.saved}</span>}</>}>
            {ADMIN_UI.site.title}
          </PanelHead>
          {!canEdit && <div style={{ margin: "8px 0", fontSize: 12.5, color: COLORS.ink3 }}>{ADMIN_UI.site.adminOnly}</div>}
          {settings && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={label}>{ADMIN_UI.site.fields.siteName}</label>
                  <input style={input} value={settings.siteName} disabled={!canEdit} onChange={(e) => set("siteName", e.target.value)} />
                </div>
                <div>
                  <label style={label}>{ADMIN_UI.site.fields.blogHost}</label>
                  <input style={input} value={settings.blogHost} disabled={!canEdit} onChange={(e) => set("blogHost", e.target.value)} />
                </div>
                <div>
                  <label style={label}>{ADMIN_UI.site.fields.postsPerPage}</label>
                  <input style={input} type="number" min={1} max={48} value={settings.postsPerPage} disabled={!canEdit} onChange={(e) => set("postsPerPage", Number(e.target.value) || 1)} />
                </div>
                <div>
                  <label style={label}>{ADMIN_UI.site.fields.defaultLanguage}</label>
                  <select style={input} value={settings.defaultLanguage} disabled={!canEdit} onChange={(e) => set("defaultLanguage", e.target.value as "vi" | "en")}>
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div style={row}>
                <span>{ADMIN_UI.site.fields.requireApprovalToPublish}</span>
                {toggle(settings.requireApprovalToPublish, () => set("requireApprovalToPublish", !settings.requireApprovalToPublish))}
              </div>
              <div style={{ ...row, borderBottom: "none" }}>
                <span>{ADMIN_UI.site.fields.autoPublishAiPosts}</span>
                {toggle(settings.autoPublishAiPosts, () => set("autoPublishAiPosts", !settings.autoPublishAiPosts))}
              </div>
            </div>
          )}
        </section>

        {/* Email (SMTP) config */}
        {settings && (
          <section style={panelPad}>
            <PanelHead
              right={
                <span style={{ fontSize: 12.5, color: settings.mailPasswordSet ? COLORS.brandGreen : COLORS.ink3 }}>
                  {settings.mailPasswordSet ? "App password: đã lưu" : "Chưa có app password"}
                </span>
              }
            >
              Cấu hình Email gửi đi (SMTP)
            </PanelHead>
            <div style={{ fontSize: 12.5, color: COLORS.ink3, margin: "6px 0 14px" }}>
              Dùng SMTP (vd Gmail + <b>App Password</b>). Với Gmail: host <code>smtp.gmail.com</code>, cổng <code>587</code>, bật xác thực 2 lớp rồi tạo App Password. Mật khẩu lưu phía server, không hiển thị lại.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div><label style={label}>SMTP host</label><input style={input} value={settings.mailHost} disabled={!canEdit} onChange={(e) => set("mailHost", e.target.value)} /></div>
              <div><label style={label}>Cổng</label><input style={input} type="number" value={settings.mailPort} disabled={!canEdit} onChange={(e) => set("mailPort", Number(e.target.value) || 587)} /></div>
              <div><label style={label}>SSL (465)</label>
                <select style={input} value={settings.mailSecure ? "1" : "0"} disabled={!canEdit} onChange={(e) => set("mailSecure", e.target.value === "1")}>
                  <option value="0">STARTTLS (587)</option>
                  <option value="1">SSL (465)</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div><label style={label}>Tài khoản (email)</label><input style={input} value={settings.mailUser} disabled={!canEdit} onChange={(e) => set("mailUser", e.target.value)} placeholder="ban@gmail.com" /></div>
              <div><label style={label}>From (tuỳ chọn)</label><input style={input} value={settings.mailFrom} disabled={!canEdit} onChange={(e) => set("mailFrom", e.target.value)} placeholder="FPT-IS NS <ban@gmail.com>" /></div>
            </div>
            <label style={label}>App Password</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input style={{ ...input, flex: 1, fontFamily: "monospace" }} type="password" value={mailPwInput} disabled={!canEdit} onChange={(e) => setMailPwInput(e.target.value)} placeholder={settings.mailPasswordSet ? "•••••• (đã lưu — nhập mới để thay)" : "app password 16 ký tự"} />
              <button type="button" onClick={saveMailCfg} disabled={!canEdit || mailBusy} style={{ ...btnBlue, opacity: canEdit && !mailBusy ? 1 : 0.5 }}>Lưu cấu hình</button>
            </div>
            <label style={label}>Gửi thử tới</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...input, flex: 1 }} value={mailTestTo} disabled={!canEdit} onChange={(e) => setMailTestTo(e.target.value)} placeholder="email@fpt.com" />
              <button type="button" onClick={testMail} disabled={!canEdit || mailBusy || !mailTestTo} style={{ ...btnSm, opacity: canEdit && mailTestTo && !mailBusy ? 1 : 0.5 }}>✉ Gửi thử</button>
            </div>
            {mailMsg && <div style={{ fontSize: 12.5, color: COLORS.ink2, marginTop: 10 }}>{mailMsg}</div>}
          </section>
        )}

        {/* Newsletter — auto-send on publish */}
        {settings && (
          <section style={panelPad}>
            <PanelHead right={<button type="button" onClick={saveNewsletterCfg} disabled={!canEdit} style={{ ...btnBlue, height: 30, opacity: canEdit ? 1 : 0.5 }}>Lưu cấu hình gửi bài</button>}>
              Gửi bài tự động qua email
            </PanelHead>
            <div style={{ fontSize: 12.5, color: COLORS.ink3, margin: "6px 0 12px" }}>
              Khi một bài được <b>xuất bản</b>, hệ thống tự gửi email tới <b>người đăng ký trên blog</b> + <b>danh sách phân phối</b> bên dưới (nơi đặt địa chỉ mailing-list của nhóm Keycloak/đội ngũ). Cần cấu hình SMTP ở trên.
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, cursor: canEdit ? "pointer" : "default" }}>
              <input type="checkbox" checked={settings.mailAutoSend} disabled={!canEdit} onChange={(e) => set("mailAutoSend", e.target.checked)} />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.ink }}>Tự động gửi email khi xuất bản bài</span>
            </label>
            <label style={label}>Danh sách phân phối (mỗi dòng/ dấu phẩy một email — nhóm, đội, mailing-list)</label>
            <textarea style={{ ...input, minHeight: 72, fontFamily: "monospace", marginBottom: 6 }} value={recipientsInput} disabled={!canEdit} onChange={(e) => setRecipientsInput(e.target.value)} placeholder={"team-sre@fpt.com\nblog-announce@fpt.com"} />
            {nlMsg && <div style={{ fontSize: 12.5, color: COLORS.ink2, margin: "4px 0 10px" }}>{nlMsg}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <label style={{ ...label, margin: 0 }}>Người đăng ký từ blog ({subs.length})</label>
              <button type="button" onClick={loadSubscribers} style={{ ...btnSm, height: 26, padding: "0 8px", marginLeft: "auto" }}>Tải lại</button>
            </div>
            <div style={{ maxHeight: 180, overflowY: "auto", marginTop: 6 }}>
              {subs.length === 0 ? (
                <div style={{ fontSize: 12.5, color: COLORS.ink3, padding: "6px 0" }}>Chưa có người đăng ký.</div>
              ) : subs.map((s) => (
                <div key={s.email} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: `1px solid ${COLORS.split}`, fontSize: 13 }}>
                  <span style={{ flex: 1, color: COLORS.ink2 }}>{s.email}</span>
                  <span style={{ fontSize: 11.5, color: COLORS.ink3 }}>{(s.at || "").slice(0, 10)}</span>
                  {canEdit && <button type="button" onClick={() => removeSub(s.email)} style={{ ...btnSm, height: 24, padding: "0 8px", color: "#C0392B" }}>Xoá</button>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Access / RBAC */}
        <section style={panelPad}>
          <PanelHead>{ADMIN_UI.access.title}</PanelHead>
          <div style={{ fontSize: 12.5, color: COLORS.ink3, margin: "6px 0 12px" }}>{ADMIN_UI.access.hint}</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>{ADMIN_UI.access.cols.map((c) => <th key={c} style={{ textAlign: "left", padding: "8px 10px", color: COLORS.ink3, fontWeight: 600, borderBottom: `1px solid ${COLORS.split}` }}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {ADMIN_UI.access.rows.map(([r, g, p]) => (
                <tr key={g} style={{ background: me?.groups?.includes(g) ? "#E6F1F9" : "transparent" }}>
                  <td style={{ padding: "8px 10px", fontWeight: 600, color: COLORS.ink }}>{r}</td>
                  <td style={{ padding: "8px 10px", fontFamily: "monospace", color: COLORS.brandBlue }}>{g}</td>
                  <td style={{ padding: "8px 10px", color: COLORS.ink2 }}>{p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    );
  }

  function PostsView() {
    const liveStats = [
      { label: "Tổng bài viết", value: posts.length },
      { label: "Đã xuất bản", value: posts.filter((p) => p.status === "Đã xuất bản").length, color: "#57A336" },
      { label: "Bản nháp", value: posts.filter((p) => p.status === "Bản nháp").length, color: "#F37021" },
      { label: "Chờ duyệt", value: posts.filter((p) => p.status === "Chờ duyệt").length, color: "#0072BC" },
    ];
    return (
      <>
        <StatTiles tiles={liveStats} />
        <div style={panel}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderBottom: `1px solid ${COLORS.split}`, flexWrap: "wrap" }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={POSTS_VIEW_UI.searchPlaceholder} style={{ ...input, width: 240, height: 34 }} />
            <div style={{ display: "flex", gap: 6 }}>
              {POSTS_VIEW_UI.statusTabs.map((t) => (
                <button key={t} type="button" onClick={() => setStatusTab(t)} style={{ ...btnSm, height: 30, background: statusTab === t ? "#E6F1F9" : "#fff", color: statusTab === t ? COLORS.brandBlue : COLORS.ink2, borderColor: statusTab === t ? "#B3D5EA" : COLORS.border }}>{t}</button>
              ))}
            </div>
            <span style={{ marginLeft: "auto", fontSize: 12.5, color: COLORS.ink3 }}>{filteredPosts.length} / {posts.length} bài</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 720 }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(200px,2.4fr) minmax(104px,150px) minmax(96px,130px) minmax(84px,110px) minmax(200px,240px)", gap: 10, padding: "10px 16px", fontSize: 12, fontWeight: 600, color: COLORS.ink3, borderBottom: `1px solid ${COLORS.split}` }}>
                {POSTS_VIEW_UI.tableHead.map((h) => <span key={h}>{h}</span>)}
              </div>
              {filteredPosts.map((p) => (
                <div key={p.slug} style={{ borderBottom: `1px solid ${COLORS.split}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(200px,2.4fr) minmax(104px,150px) minmax(96px,130px) minmax(84px,110px) minmax(200px,240px)", gap: 10, padding: "12px 16px", alignItems: "center" }}>
                  <div style={{ minWidth: 0, display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 64, height: 40, flexShrink: 0, borderRadius: 6, overflow: "hidden" }}>
                      <CoverArt coverUrl={p.coverUrl} title={p.title} cat={p.cat} tone={TONE[p.cat] ?? "#0072BC"} height={40} compact />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink, overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 6 }}>
                        {p.featured && <span title="Đang hiển thị trên trang chủ" style={{ fontSize: 11, fontWeight: 700, color: "#B7791F", background: "#FEF3C7", padding: "1px 7px", borderRadius: 4, whiteSpace: "nowrap" }}>★ Trang chủ</span>}
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</span>
                      </div>
                      <div style={{ fontSize: 12, color: COLORS.ink3 }}>/blog/{p.slug}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12.5, color: TONE[p.cat] ?? COLORS.ink2, fontWeight: 600 }}>{p.cat}</span>
                  <span><span style={statusPill(p.status)}>{p.status}</span></span>
                  <span style={{ fontSize: 12.5, color: COLORS.ink3 }}>{p.date}</span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => editPost(p)} style={{ ...btnSm, height: 28, padding: "0 10px" }}>{POSTS_VIEW_UI.editButton}</button>
                    <button type="button" onClick={() => openInEditor(p.slug, true)} title="Xem trước + chỉnh sửa / biên tập lại" style={{ ...btnSm, height: 28, padding: "0 10px" }}>👁 Xem</button>
                    <button type="button" onClick={() => { setReeditFor(reeditFor === p.slug ? null : p.slug); setReeditListText(""); }} disabled={reeditBusy === p.slug} title="AI biên tập lại — nhập yêu cầu chỉnh sửa" style={{ ...btnSm, height: 28, padding: "0 10px", color: COLORS.brandBlue, borderColor: "#B3D5EA", background: reeditFor === p.slug ? "#E6F1F9" : "#fff" }}>{reeditBusy === p.slug ? "…" : "✨ Biên tập lại"}</button>
                    <button type="button" onClick={() => togglePublish(p.slug)} style={{ ...btnSm, height: 28, padding: "0 10px" }}>{p.status === "Đã xuất bản" ? POSTS_VIEW_UI.hideButton : POSTS_VIEW_UI.publishButton}</button>
                    {p.status === "Đã xuất bản" && (
                      <button type="button" onClick={() => toggleFeatured(p.slug)} title={p.featured ? "Bỏ ghim khỏi trang chủ" : "Ghim lên trang chủ portal"} style={{ ...btnSm, height: 28, padding: "0 10px", color: p.featured ? "#B7791F" : COLORS.ink2, borderColor: p.featured ? "#F0C674" : COLORS.border, background: p.featured ? "#FEF3C7" : "#fff" }}>{p.featured ? "★ Bỏ ghim" : "☆ Trang chủ"}</button>
                    )}
                    {(me?.isAdmin ?? true) && <button type="button" onClick={() => deletePost(p.slug, p.title)} title="Xoá vĩnh viễn" style={{ ...btnSm, height: 28, padding: "0 10px", color: "#C0392B", borderColor: "#E7B4AC" }}>Xoá</button>}
                  </div>
                </div>
                {reeditFor === p.slug && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", padding: "0 16px 14px 16px", background: "#F4F8FB" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.brandBlue }}>✨ Yêu cầu chỉnh sửa:</span>
                    <input
                      autoFocus
                      value={reeditListText}
                      onChange={(e) => setReeditListText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && reeditBusy !== p.slug) doReedit(p.slug, reeditListText); }}
                      placeholder="VD: ngắn gọn hơn · thêm ví dụ thực tế · giọng trang trọng · bổ sung kết luận… (để trống = biên tập lại theo style)"
                      style={{ ...input, flex: 1, minWidth: 260, height: 34 }}
                    />
                    <button type="button" onClick={() => doReedit(p.slug, reeditListText)} disabled={reeditBusy === p.slug} style={{ ...btnBlue, height: 34, opacity: reeditBusy === p.slug ? 0.5 : 1 }}>{reeditBusy === p.slug ? "⏳ Đang chỉnh…" : "AI chỉnh sửa"}</button>
                    <button type="button" onClick={() => { setReeditFor(null); setReeditListText(""); }} style={{ ...btnSm, height: 34 }}>Huỷ</button>
                  </div>
                )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  function EditorView() {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button type="button" onClick={() => setShowPreview(false)} style={{ ...btnSm, height: 32, background: !showPreview ? "#E6F1F9" : "#fff", color: !showPreview ? COLORS.brandBlue : COLORS.ink2, borderColor: !showPreview ? "#B3D5EA" : COLORS.border }}>✎ Chỉnh sửa</button>
            <button type="button" onClick={() => setShowPreview(true)} style={{ ...btnSm, height: 32, background: showPreview ? "#E6F1F9" : "#fff", color: showPreview ? COLORS.brandBlue : COLORS.ink2, borderColor: showPreview ? "#B3D5EA" : COLORS.border }}>👁 Xem trước</button>
            {draft.status === "Đã xuất bản" && <a href={`/blog/${draft.slug}?from=cms`} target="_blank" rel="noreferrer" style={{ ...btnSm, height: 32, marginLeft: "auto", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>↗ Xem trên blog</a>}
            <span style={{ marginLeft: draft.status === "Đã xuất bản" ? 0 : "auto", fontSize: 12.5, color: COLORS.ink3 }}>Xem trước rồi chỉnh nếu cần trước khi xuất bản.</span>
          </div>
          {showPreview ? (
            <>
            <div style={{ ...panelPad, background: "#F4F8FB", borderColor: "#B3D5EA" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink, marginBottom: 8 }}>✨ Chưa ưng? Yêu cầu AI chỉnh lại</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  style={{ ...input, flex: 1, minWidth: 260 }}
                  placeholder="VD: ngắn gọn hơn, thêm ví dụ thực tế, giọng trang trọng hơn, bổ sung phần kết luận…"
                  value={reeditInstruction}
                  onChange={(e) => setReeditInstruction(e.target.value)}
                  disabled={previewBusy}
                  onKeyDown={(e) => { if (e.key === "Enter" && reeditInstruction.trim()) reeditWithInstruction(); }}
                />
                <button type="button" onClick={reeditWithInstruction} disabled={previewBusy || !reeditInstruction.trim()} style={{ ...btnBlue, opacity: previewBusy || !reeditInstruction.trim() ? 0.5 : 1 }}>{previewBusy ? "⏳ Đang chỉnh…" : "AI chỉnh theo yêu cầu"}</button>
              </div>
              <div style={{ fontSize: 11.5, color: COLORS.ink3, marginTop: 8 }}>AI sẽ viết lại bài theo yêu cầu này rồi hiển thị lại bản xem trước. Lặp lại đến khi ưng ý mới xuất bản.</div>
            </div>
            <article style={{ ...panelPad, maxWidth: 760 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: TONE[draft.cat] ?? COLORS.brandBlue, marginBottom: 8 }}>{draft.cat}</div>
              <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, color: COLORS.ink, margin: "0 0 10px" }}>{draft.title || "(chưa có tiêu đề)"}</h1>
              <div style={{ fontSize: 13, color: COLORS.ink3, marginBottom: 6 }}>{draft.author || "AI Studio"} · {draft.date || "—"}</div>
              {draft.excerpt && <p style={{ fontSize: 16, lineHeight: 1.7, color: COLORS.ink2, fontStyle: "italic", margin: "0 0 20px" }}>{draft.excerpt}</p>}
              <div style={{ marginBottom: 24 }}><CoverArt coverUrl={draft.coverUrl} title={draft.title} cat={draft.cat} tone={TONE[draft.cat] ?? "#0072BC"} height={280} rounded showTitle={false} /></div>
              {draft.blocks.map((b, i) => {
                const text = b[1] || "";
                if (b[0] === "img") return text ? <img key={i} src={text.startsWith("http") || text.startsWith("/") ? text : `/${text}`} alt="" style={{ width: "100%", borderRadius: 8, margin: "10px 0" }} /> : null;
                if (b[0] === "h") return <h2 key={i} style={{ fontSize: 20, fontWeight: 700, color: COLORS.ink, margin: "22px 0 8px" }}>{text}</h2>;
                if (b[0] === "quote") return <blockquote key={i} style={{ borderLeft: `3px solid ${COLORS.brandBlue}`, padding: "4px 0 4px 16px", margin: "16px 0", color: COLORS.ink2, fontStyle: "italic" }}>{text}</blockquote>;
                if (b[0] === "list") return <ul key={i} style={{ margin: "10px 0", paddingLeft: 22, color: COLORS.ink2, lineHeight: 1.7 }}>{text.split("\n").filter(Boolean).map((li, j) => <li key={j}>{li}</li>)}</ul>;
                return <p key={i} style={{ fontSize: 15.5, lineHeight: 1.75, color: COLORS.ink2, margin: "0 0 14px" }}>{text}</p>;
              })}
            </article>
            </>
          ) : (
          <>
          <div style={panelPad}>
            <label style={label}>{EDITOR_UI.fields.title.label}</label>
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder={EDITOR_UI.fields.title.placeholder} style={{ ...input, height: 46, fontSize: 17, fontWeight: 600 }} />
            <div style={{ height: 14 }} />
            <label style={label}>{EDITOR_UI.fields.slug.label}</label>
            <div style={{ display: "flex", alignItems: "center", border: `1px solid ${COLORS.border}`, borderRadius: 6, overflow: "hidden" }}>
              <span style={{ padding: "0 10px", height: 38, display: "inline-flex", alignItems: "center", background: COLORS.surfaceAlt, color: COLORS.ink3, fontSize: 13, borderRight: `1px solid ${COLORS.border}` }}>{EDITOR_UI.fields.slug.prefix}</span>
              <input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder={EDITOR_UI.fields.slug.placeholder} style={{ ...input, border: "none", borderRadius: 0 }} />
            </div>
            <div style={{ height: 14 }} />
            <label style={label}>{EDITOR_UI.fields.excerpt.label}</label>
            <textarea value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} placeholder={EDITOR_UI.fields.excerpt.placeholder} rows={3} style={{ ...input, height: "auto", padding: "10px 12px", lineHeight: 1.6 }} />
          </div>

          <div style={panelPad}>
            <input ref={blockImgFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onBlockImgFile(f); }} />
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: COLORS.ink }}>{EDITOR_UI.fields.blocksLabel}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              {KINDS.map((k) => (
                <button key={k.k} type="button" onClick={() => addBlockAt(k.k)} style={btnSm}>{EDITOR_UI.blockAddPrefix}{k.label}</button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: COLORS.ink3, marginBottom: 14 }}>
              {activeBlock == null
                ? "→ Khối mới thêm vào cuối. Bấm vào một khối để chèn ngay sau nó · kéo ⠿ để đổi vị trí."
                : `→ Khối mới sẽ chèn ngay sau khối #${activeBlock + 1} · kéo ⠿ để đổi vị trí.`}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {draft.blocks.map((b, i) => {
                const kind = KINDS.find((k) => k.k === b[0]);
                return (
                  <div
                    key={i}
                    onClick={() => setActiveBlock(i)}
                    onDragOver={(e) => { if (dragIndex !== null) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (dropIndex !== i) setDropIndex(i); } }}
                    onDragLeave={() => { if (dropIndex === i) setDropIndex(null); }}
                    onDrop={(e) => { if (dragIndex !== null) { e.preventDefault(); moveBlock(dragIndex, i); } setDragIndex(null); setDropIndex(null); }}
                    style={{ display: "flex", gap: 10, background: dragIndex === i ? "#EEF4F9" : "#FBFCFD", border: `1px solid ${dropIndex === i && dragIndex !== i ? COLORS.brandBlue : activeBlock === i ? "#B3D5EA" : COLORS.split}`, borderRadius: 8, padding: 12, opacity: dragIndex === i ? 0.6 : 1 }}
                  >
                    <span
                      draggable
                      onDragStart={(e) => { setDragIndex(i); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", String(i)); } catch { /* some browsers require setData */ } }}
                      onDragEnd={() => { setDragIndex(null); setDropIndex(null); }}
                      title="Kéo để đổi vị trí khối"
                      style={{ color: COLORS.ink3, cursor: "grab", userSelect: "none" }}
                    >⠿</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: COLORS.ink3, marginBottom: 6 }}>{kind?.label}</div>
                      {b[0] === "img" ? (
                        <div>
                          {b[1] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={b[1].startsWith("http") || b[1].startsWith("/") ? b[1] : `/${b[1]}`} alt="" style={{ width: "100%", maxHeight: 260, objectFit: "contain", background: "#F1F4F7", borderRadius: 8, marginBottom: 8 }} />
                          )}
                          <input
                            value={b[1]}
                            onChange={(e) => setBlockVal(i, e.target.value)}
                            onFocus={() => setActiveBlock(i)}
                            data-blockimg={i}
                            onPaste={(e) => {
                              for (const it of Array.from(e.clipboardData?.items || [])) {
                                if (it.type.startsWith("image/")) { const f = it.getAsFile(); if (f) { e.preventDefault(); e.stopPropagation(); uploadBlockImage(i, f); return; } }
                              }
                            }}
                            placeholder="Dán link ảnh, hoặc dán ảnh (Ctrl/Cmd+V)…"
                            style={{ ...input, marginBottom: 8 }}
                            disabled={blockImgBusy === i}
                          />
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button type="button" onClick={() => blockImgFile(i)} disabled={blockImgBusy === i} style={btnSm}>📤 Upload</button>
                            <button type="button" onClick={() => genBlockImg(i)} disabled={blockImgBusy === i} style={{ ...btnSm, color: COLORS.brandBlue, borderColor: "#B3D5EA" }}>{blockImgBusy === i ? "⏳…" : "✨ Tạo ảnh AI"}</button>
                          </div>
                        </div>
                      ) : (
                        <textarea
                          value={b[1]}
                          onChange={(e) => setBlockVal(i, e.target.value)}
                          onFocus={() => setActiveBlock(i)}
                          placeholder={kind?.hint}
                          rows={kind?.rows ?? 2}
                          style={{ ...input, height: "auto", padding: "8px 10px", lineHeight: 1.6 }}
                        />
                      )}
                    </div>
                    <button type="button" onClick={() => setDraft({ ...draft, blocks: draft.blocks.filter((_, j) => j !== i) })} style={{ border: "none", background: "none", color: COLORS.ink3, cursor: "pointer", fontSize: 15 }} aria-label="Xoá khối">✕</button>
                  </div>
                );
              })}
            </div>
          </div>
          </>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={panel}>
            <PanelHead>{EDITOR_UI.publishPanelHead}</PanelHead>
            <div style={{ padding: 16 }}>
              <label style={label}>{EDITOR_UI.statusFieldLabel}</label>
              <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                {EDITOR_UI.statusPicker.map((s) => (
                  <button key={s} type="button" onClick={() => setDraft({ ...draft, status: s })} style={{ ...btnSm, height: 28, background: draft.status === s ? "#E6F1F9" : "#fff", color: draft.status === s ? COLORS.brandBlue : COLORS.ink2 }}>{s}</button>
                ))}
              </div>
              <label style={label}>{EDITOR_UI.dateFieldLabel}</label>
              <input value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} placeholder={EDITOR_UI.datePlaceholder} style={{ ...input, marginBottom: 14 }} />
              <label style={label}>{EDITOR_UI.authorFieldLabel}</label>
              <input value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} placeholder={EDITOR_UI.authorPlaceholder} style={{ ...input, marginBottom: 16 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={saveDraft} style={{ ...btnBlue, flex: 1 }}>{saved ? EDITOR_UI.saveButtonDone : EDITOR_UI.saveButton}</button>
                <button type="button" onClick={() => setView("posts")} style={btnSm}>{EDITOR_UI.cancelButton}</button>
              </div>
              {/* Delete this post from the editor (AC-013) — admin only, and only
                  once the post actually exists in the list (not a brand-new draft). */}
              {(me?.isAdmin ?? true) && posts.some((p) => p.slug === draft.slug) && (
                <button
                  type="button"
                  onClick={async () => { if (await deletePost(draft.slug, draft.title || draft.slug)) setView("posts"); }}
                  style={{ ...btnSm, width: "100%", marginTop: 10, color: "#C0392B", borderColor: "#E7B4AC" }}
                >
                  🗑 Xoá bài viết
                </button>
              )}
            </div>
          </div>

          <div style={panel}>
            <PanelHead>Ảnh bìa</PanelHead>
            <div style={{ padding: 16 }}>
              <div style={{ borderRadius: RADIUS.card, overflow: "hidden", marginBottom: 12 }}>
                <CoverArt coverUrl={draft.coverUrl} title={draft.title || "(chưa có tiêu đề)"} cat={draft.cat} tone={TONE[draft.cat] ?? "#0072BC"} height={150} />
              </div>
              {coverInfo && (
                <div style={{ fontSize: 12, color: COLORS.ink2, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span aria-hidden>🖼️</span><span style={{ fontFamily: "monospace" }}>{coverInfo}</span>
                </div>
              )}
              <label style={label}>Dán link ảnh</label>
              <input style={{ ...input, marginBottom: 10 }} placeholder="https://…/anh.jpg" value={draft.coverUrl?.startsWith("http") ? draft.coverUrl : ""} onChange={(e) => { coverSizeRef.current = null; setDraft({ ...draft, coverUrl: e.target.value }); }} disabled={coverBusy} />
              <input ref={coverFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }} />
              <div
                tabIndex={0}
                onClick={() => !coverBusy && coverFileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f && !coverBusy) uploadCover(f); }}
                onPaste={(e) => {
                  if (coverBusy) return;
                  for (const it of Array.from(e.clipboardData?.items || [])) {
                    if (it.type.startsWith("image/")) { const f = it.getAsFile(); if (f) { e.preventDefault(); uploadCover(f); return; } }
                  }
                }}
                style={{ minHeight: 90, border: `1px dashed ${COLORS.border}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: COLORS.ink3, fontSize: 12.5, padding: 12, cursor: coverBusy ? "default" : "pointer", marginBottom: 10, outline: "none" }}
              >
                {coverBusy ? "⏳ Đang xử lý ảnh…" : "📋 Dán ảnh (Ctrl/Cmd+V) · kéo-thả vào đây · hoặc bấm để chọn ảnh từ máy"}
              </div>
              <label style={{ ...label, marginBottom: 4 }}>Prompt tạo ảnh AI <span style={{ color: COLORS.ink3, fontWeight: 400 }}>(để trống → AI tự suy từ tiêu đề/nội dung)</span></label>
              <textarea
                value={coverAiPrompt}
                onChange={(e) => setCoverAiPrompt(e.target.value)}
                placeholder="VD: isometric data center với các node Kubernetes nối nhau, tông xanh dương/cam, phong cách editorial phẳng, không chữ"
                disabled={coverBusy}
                rows={2}
                style={{ ...input, height: "auto", padding: 10, marginBottom: 8, fontFamily: "inherit", resize: "vertical" }}
              />
              {settings && (() => {
                // Show which image model is configured (from saved API setup) so
                // the admin knows the source before generating. If the provider
                // needs a key but none is saved, it will auto-fall back to
                // Pollinations (free) — surface that here too.
                const p = IMAGE_PROVIDERS_PUBLIC.find((pp) => pp.id === settings.aiImageProvider);
                const needsKey = p && !p.keyless && !settings.aiImageApiKeySet;
                return (
                  <div style={{ fontSize: 11.5, color: COLORS.ink3, marginBottom: 8, lineHeight: 1.5 }}>
                    🎨 Đang gen bằng: <b style={{ color: COLORS.ink2 }}>{p?.name ?? settings.aiImageProvider}</b>
                    {settings.aiImageModel ? <span> · model <code style={{ fontFamily: "monospace" }}>{settings.aiImageModel}</code></span> : null}
                    {needsKey && <span style={{ color: COLORS.brandOrange }}> — chưa có API key → sẽ tự dùng Pollinations (miễn phí)</span>}
                    <span style={{ color: COLORS.ink3 }}> · đổi ở <b>Cấu hình API → Tạo ảnh bìa</b></span>
                  </div>
                );
              })()}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={genCoverAI} disabled={coverBusy || !draft.title} style={{ ...btnBlue, opacity: coverBusy || !draft.title ? 0.5 : 1 }}>{coverBusy ? "⏳ Đang tạo…" : "✨ Tạo ảnh AI theo prompt"}</button>
                <button type="button" onClick={() => { setDraft({ ...draft, coverUrl: "" }); setCoverMsg("Dùng ảnh minh hoạ tự động."); }} disabled={coverBusy} style={btnSm}>Ảnh tự động</button>
              </div>
              {coverMsg && <div style={{ fontSize: 12, color: COLORS.ink2, marginTop: 10 }}>{coverMsg}</div>}
              {coverMinioUrl && (
                <div style={{ fontSize: 12, marginTop: 6, wordBreak: "break-all" }}>
                  🔗 MinIO: <a href={coverMinioUrl} target="_blank" rel="noreferrer" style={{ color: COLORS.brandBlue, fontFamily: "monospace" }}>{coverMinioUrl}</a>
                </div>
              )}
              <div style={{ fontSize: 11.5, color: COLORS.ink3, marginTop: 8 }}>Ảnh đã chọn/tạo hiển thị ở khung trên và <b>áp dụng khi bấm “Lưu bài viết”</b>. Ưu tiên: link/upload → ảnh AI → ảnh minh hoạ tự động.</div>
            </div>
          </div>

          <div style={panel}>
            <PanelHead>{EDITOR_UI.taxonomyPanelHead}</PanelHead>
            <div style={{ padding: 16 }}>
              <label style={label}>{EDITOR_UI.categoryFieldLabel}</label>
              <select value={draft.cat} onChange={(e) => setDraft({ ...draft, cat: e.target.value })} style={{ ...input, marginBottom: 14 }}>
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
              <label style={label}>{EDITOR_UI.tagFieldLabel}</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                {draft.tags.map((t) => (
                  <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.split}`, borderRadius: 4, padding: "3px 8px" }}>
                    {t}<button type="button" onClick={() => setDraft({ ...draft, tags: draft.tags.filter((x) => x !== t) })} style={{ border: "none", background: "none", cursor: "pointer", color: COLORS.ink3 }}>✕</button>
                  </span>
                ))}
              </div>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && tagInput.trim()) { e.preventDefault(); setDraft({ ...draft, tags: [...draft.tags, tagInput.trim()] }); setTagInput(""); } }}
                placeholder={EDITOR_UI.tagPlaceholder}
                style={input}
              />
            </div>
          </div>

        </div>
      </div>
    );
  }

  function TaxonomyView() {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, alignItems: "start" }}>
        <div style={panel}>
          <PanelHead>{TAXONOMY_UI.categoriesPanelHead}</PanelHead>
          <div style={{ padding: 8 }}>
            {CATEGORIES.map((c) => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: `1px solid ${COLORS.split}` }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: c.color }} />
                <span style={{ fontSize: 14, color: COLORS.ink, fontWeight: 500 }}>{c.name}</span>
                <span style={{ fontSize: 12.5, color: COLORS.ink3 }}>{c.count} {TAXONOMY_UI.countSuffix}</span>
                <button type="button" style={{ ...btnSm, height: 26, marginLeft: "auto" }}>{TAXONOMY_UI.categoryEditButton}</button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, padding: 12 }}>
              <input placeholder={TAXONOMY_UI.newCategoryPlaceholder} style={input} />
              <button type="button" style={btnBlue}>{TAXONOMY_UI.addButton}</button>
            </div>
          </div>
        </div>
        <div style={panel}>
          <PanelHead>{TAXONOMY_UI.tagsPanelHead}</PanelHead>
          <div style={{ padding: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TAGS.map((t) => (
              <span key={t.name} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.split}`, borderRadius: 4, padding: "4px 10px", color: COLORS.ink2 }}>
                {t.name}<span style={{ color: COLORS.ink3 }}>{t.count}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Real RSS source management (wired to settings.aiFeeds + the live pipeline).
  function FeedsView() {
    const isAdmin = me?.isAdmin ?? true;
    const realFeeds = settings?.aiFeeds ?? [];
    return (
      <div style={{ display: "grid", gap: 16, maxWidth: 900 }}>
        <section style={panelPad}>
          <PanelHead right={<button type="button" onClick={aiRunFeeds} disabled={aiBusy || realFeeds.length === 0} style={{ ...btnSm, height: 30, opacity: aiBusy || !realFeeds.length ? 0.5 : 1 }}>▶ Chạy nguồn ngay</button>}>
            Nguồn RSS / Atom ({realFeeds.length})
          </PanelHead>
          <div style={{ fontSize: 12.5, color: COLORS.ink3, margin: "6px 0 12px" }}>
            Nguồn để AI tự lấy & biên tập bài (theo lịch hoặc chạy tay). Chưa thêm nguồn nào thì AI dùng <b>bộ nguồn kỹ thuật uy tín mặc định</b>. Nên bấm <b>Kiểm tra</b> trước khi thêm.
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <input style={{ ...input, flex: 1, minWidth: 240 }} placeholder="https://nguồn.com/rss" value={aiFeedInput} onChange={(e) => setAiFeedInput(e.target.value)} disabled={!isAdmin} />
            <button type="button" onClick={() => checkFeed(aiFeedInput.trim())} disabled={!aiFeedInput.trim() || feedCheckBusy === aiFeedInput.trim()} style={{ ...btnSm, opacity: aiFeedInput.trim() ? 1 : 0.5 }}>{feedCheckBusy === aiFeedInput.trim() ? "…" : "Kiểm tra"}</button>
            <button type="button" onClick={addFeed} disabled={!isAdmin || !aiFeedInput} style={{ ...btnBlue, opacity: isAdmin && aiFeedInput ? 1 : 0.5 }}>+ Thêm nguồn</button>
          </div>
          {aiFeedInput.trim() && feedChecks[aiFeedInput.trim()] && (
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: feedChecks[aiFeedInput.trim()].ok ? COLORS.brandGreen : "#C0392B" }}>
              {feedChecks[aiFeedInput.trim()].ok ? `✓ Hợp lệ · ${feedChecks[aiFeedInput.trim()].count} bài · ${(feedChecks[aiFeedInput.trim()].titles || []).slice(0, 1).join("")}` : `✗ ${feedChecks[aiFeedInput.trim()].error || "Không hợp lệ"}`}
            </div>
          )}
          {realFeeds.length === 0 ? (
            <div style={{ fontSize: 12.5, color: COLORS.ink3, padding: "8px 0" }}>Chưa có nguồn riêng — AI đang dùng bộ nguồn mặc định.</div>
          ) : realFeeds.map((f) => {
            const chk = feedChecks[f];
            return (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${COLORS.split}`, fontSize: 13 }}>
                <span style={{ flex: 1, fontFamily: "monospace", color: COLORS.ink2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f}</span>
                {chk && <span style={{ fontSize: 11.5, fontWeight: 600, color: chk.ok ? COLORS.brandGreen : "#C0392B", whiteSpace: "nowrap" }} title={chk.error || (chk.titles || []).join(" · ")}>{chk.ok ? `✓ ${chk.count} bài` : `✗ ${chk.error || "lỗi"}`}</span>}
                <button type="button" onClick={() => checkFeed(f)} disabled={feedCheckBusy === f} style={{ ...btnSm, height: 26, padding: "0 8px" }}>{feedCheckBusy === f ? "…" : "Kiểm tra"}</button>
                <button type="button" onClick={() => removeFeed(f)} disabled={!isAdmin} style={{ ...btnSm, height: 26, padding: "0 8px", color: "#C0392B" }}>Xoá</button>
              </div>
            );
          })}
        </section>
        <div style={{ ...panelPad, background: "#FEF7F0", borderColor: "#F8CBA9" }}>
          <div style={{ fontWeight: 600, color: "#C25A17", marginBottom: 6 }}>Lưu ý bản quyền</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: COLORS.ink2, margin: 0 }}>Chỉ lấy tin từ nguồn cho phép. Với nội dung bên thứ ba, ưu tiên chế độ <b>tóm tắt &amp; dẫn nguồn</b> (trong AI tự động) để an toàn bản quyền.</p>
        </div>
      </div>
    );
  }

  // Real editing queue: posts awaiting review/publish (draft or chờ duyệt).
  function InboxView() {
    const q = inboxQuery.trim().toLowerCase();
    const tabs = ["Tất cả", "Bản nháp", "Chờ duyệt"];
    const pending = posts.filter((p) => p.status !== "Đã xuất bản");
    const items = pending
      .filter((p) => inboxTab === "Tất cả" || p.status === inboxTab)
      .filter((p) => !q || p.title.toLowerCase().includes(q));
    return (
      <div style={panel}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderBottom: `1px solid ${COLORS.split}`, flexWrap: "wrap" }}>
          <input value={inboxQuery} onChange={(e) => setInboxQuery(e.target.value)} placeholder="Tìm theo tiêu đề…" style={{ ...input, width: 240, height: 34 }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {tabs.map((t) => (
              <button key={t} type="button" onClick={() => setInboxTab(t)} style={{ ...btnSm, height: 30, background: inboxTab === t ? "#E6F1F9" : "#fff", color: inboxTab === t ? COLORS.brandBlue : COLORS.ink2 }}>{t}</button>
            ))}
          </div>
          <span style={{ marginLeft: "auto", fontSize: 12.5, color: COLORS.ink3 }}>{items.length} bài chờ</span>
        </div>
        {items.length === 0 ? (
          <div style={{ padding: 24, fontSize: 13.5, color: COLORS.ink3 }}>Không có bài nào đang chờ biên tập. Bài AI tạo dạng nháp sẽ hiện ở đây để bạn xem trước, chỉnh và xuất bản.</div>
        ) : items.map((p) => (
          <div key={p.slug} style={{ borderBottom: `1px solid ${COLORS.split}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(220px,2.6fr) minmax(96px,130px) minmax(96px,120px) minmax(210px,260px)", gap: 10, padding: "12px 16px", alignItems: "center" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink, overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                <div style={{ fontSize: 12, color: COLORS.ink3 }}>/blog/{p.slug}</div>
              </div>
              <span style={{ fontSize: 12.5, color: TONE[p.cat] ?? COLORS.ink2, fontWeight: 600 }}>{p.cat}</span>
              <span><span style={statusPill(p.status)}>{p.status}</span></span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button type="button" onClick={() => openInEditor(p.slug, true)} style={{ ...btnSm, height: 28, padding: "0 10px" }}>👁 Xem trước</button>
                <button type="button" onClick={() => editPost(p)} style={{ ...btnSm, height: 28, padding: "0 10px" }}>Sửa</button>
                <button type="button" onClick={() => { setReeditFor(reeditFor === p.slug ? null : p.slug); setReeditListText(""); }} disabled={reeditBusy === p.slug} style={{ ...btnSm, height: 28, padding: "0 10px", color: COLORS.brandBlue, borderColor: "#B3D5EA", background: reeditFor === p.slug ? "#E6F1F9" : "#fff" }}>{reeditBusy === p.slug ? "…" : "✨ Biên tập lại"}</button>
                <button type="button" onClick={() => togglePublish(p.slug)} style={{ ...btnBlue, height: 28, padding: "0 10px" }}>Xuất bản</button>
              </div>
            </div>
            {reeditFor === p.slug && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", padding: "0 16px 14px 16px", background: "#F4F8FB" }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.brandBlue }}>✨ Yêu cầu chỉnh sửa:</span>
                <input autoFocus value={reeditListText} onChange={(e) => setReeditListText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && reeditBusy !== p.slug) doReedit(p.slug, reeditListText); }} placeholder="VD: ngắn gọn hơn · thêm ví dụ · giọng trang trọng… (trống = biên tập lại theo style)" style={{ ...input, flex: 1, minWidth: 260, height: 34 }} />
                <button type="button" onClick={() => doReedit(p.slug, reeditListText)} disabled={reeditBusy === p.slug} style={{ ...btnBlue, height: 34, opacity: reeditBusy === p.slug ? 0.5 : 1 }}>{reeditBusy === p.slug ? "⏳…" : "AI chỉnh sửa"}</button>
                <button type="button" onClick={() => { setReeditFor(null); setReeditListText(""); }} style={{ ...btnSm, height: 34 }}>Huỷ</button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }


  async function aiGetImageModels() {
    setAiImageCfgBusy(true);
    setAiImageMsg("Đang lấy danh sách model ảnh…");
    try {
      const res = await fetch("/api/v1/ai/image-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: aiImageProviderSel, ...(aiImageKeyInput.trim() ? { token: aiImageKeyInput.trim() } : {}) }),
      });
      const d = await res.json();
      if (res.ok && Array.isArray(d.models)) {
        setAiImageModelList(d.models);
        if (!d.models.some((m: { id: string }) => m.id === aiImageModelSel) && d.models[0]) setAiImageModelSel(d.models[0].id);
        setAiImageMsg(`Đã lấy ${d.models.length} model ảnh.`);
      } else {
        setAiImageMsg(`❌ ${d.error || res.status}`);
      }
    } catch (e) {
      setAiImageMsg(`❌ ${(e as Error).message}`);
    }
    setAiImageCfgBusy(false);
  }
  // Save the image config (provider + model + own key), and enable/disable AI image gen.
  async function saveImageCfg(enabled: boolean) {
    setAiImageCfgBusy(true);
    setAiImageMsg("⏳ Đang lưu…");
    const body: Record<string, unknown> = { aiImageEnabled: enabled, aiImageProvider: aiImageProviderSel, aiImageModel: aiImageModelSel };
    if (aiImageKeyInput.trim()) body.aiImageApiKey = aiImageKeyInput.trim();
    try {
      const res = await fetch("/api/v1/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        const s: SiteSettings = await res.json();
        setSettings(s);
        setAiImageKeyInput("");
        setAiImageMsg(enabled
          ? `✅ Đã bật — nguồn ảnh: ${aiImageProviderSel} · model: ${aiImageModelSel}${s.aiImageApiKeySet ? ` · token: ${s.aiImageApiKeyHint}` : ""}`
          : "✅ Đã tắt tạo ảnh AI (dùng ảnh minh hoạ vector tự động)");
      } else { const d = await res.json().catch(() => ({})); setAiImageMsg(`❌ ${d.error || res.status}`); }
    } catch (e) { setAiImageMsg(`❌ ${(e as Error).message}`); }
    setAiImageCfgBusy(false);
  }
  function ApiView() {
    const canEditAi = me?.isAdmin ?? true;
    const curProvider = PROVIDERS_PUBLIC.find((p) => p.id === aiProviderSel) ?? PROVIDERS_PUBLIC[0];
    const dropdownModels =
      aiModelList.length > 0
        ? aiModelList
        : aiModelSel
          ? [{ id: aiModelSel, name: aiModelSel }]
          : [];
    // Image config (mirrors the text config): provider + model + own key.
    const curImageProvider = IMAGE_PROVIDERS_PUBLIC.find((p) => p.id === aiImageProviderSel) ?? IMAGE_PROVIDERS_PUBLIC[0];
    const dropdownImageModels =
      aiImageModelList.length > 0
        ? aiImageModelList
        : aiImageModelSel
          ? [{ id: aiImageModelSel, name: aiImageModelSel }]
          : (curImageProvider.models || []).map((m) => ({ id: m, name: m }));
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, alignItems: "start" }}>
        {/* Real Anthropic connection — paste token → get models → choose → save */}
        <section style={{ ...panelPad, gridColumn: "1 / -1" }}>
          <PanelHead
            right={
              <span style={{ fontSize: 12.5, color: settings?.aiApiKeySet ? COLORS.brandGreen : COLORS.ink3 }}>
                {settings?.aiProvider ? `${settings.aiProvider} · ` : ""}
                {settings?.aiApiKeySet ? `Token: ${settings.aiApiKeyHint}` : "Chưa có token"}
                {settings?.aiModel ? ` · ${settings.aiModel}` : ""}
              </span>
            }
          >
            Kết nối AI (đang dùng)
          </PanelHead>
          <div style={{ fontSize: 12.5, color: COLORS.ink3, margin: "6px 0 14px" }}>
            Chọn nhà cung cấp → dán API token → <b>Lấy model</b> để tải danh sách từ nhà cung cấp → chọn model → <b>Lưu model</b>. Endpoint tự điền theo nhà cung cấp; token lưu phía server và không hiển thị lại.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={label}>Nhà cung cấp</label>
              <select
                value={aiProviderSel}
                onChange={(e) => { setAiProviderSel(e.target.value); setAiModelList([]); setAiModelSel(""); setAiCfgMsg(""); }}
                disabled={!canEditAi}
                style={input}
              >
                {PROVIDERS_PUBLIC.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Endpoint (tự điền)</label>
              <input readOnly value={curProvider.endpoint} style={{ ...input, fontFamily: "monospace", color: COLORS.ink3 }} />
            </div>
          </div>
          <label style={label}>
            API token{" "}
            <a href={curProvider.keyUrl} target="_blank" rel="noreferrer" style={{ color: COLORS.brandBlue, fontWeight: 500 }}>· lấy token ở đâu?</a>
          </label>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input
              type={aiKeyShow ? "text" : "password"}
              value={aiKeyInput}
              onChange={(e) => setAiKeyInput(e.target.value)}
              placeholder={settings?.aiApiKeySet && settings.aiProvider === aiProviderSel ? "•••••• (đã lưu — dán mới để thay)" : curProvider.keyHint}
              disabled={!canEditAi || aiCfgBusy}
              style={{ ...input, flex: 1, fontFamily: "monospace" }}
            />
            <button type="button" onClick={() => setAiKeyShow(!aiKeyShow)} style={btnSm}>{aiKeyShow ? "Ẩn" : "Hiện"}</button>
            <button type="button" onClick={aiGetModels} disabled={!canEditAi || aiCfgBusy} style={{ ...btnSm, opacity: canEditAi && !aiCfgBusy ? 1 : 0.5 }}>↻ Lấy model</button>
          </div>
          <label style={label}>Model</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              value={aiModelSel}
              onChange={(e) => setAiModelSel(e.target.value)}
              disabled={!canEditAi || dropdownModels.length === 0}
              style={{ ...input, flex: 1 }}
            >
              {dropdownModels.length === 0 && <option value="">— Bấm "Lấy model" để tải danh sách —</option>}
              {dropdownModels.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
              ))}
            </select>
            <button type="button" onClick={aiSaveConfig} disabled={!canEditAi || aiCfgBusy || !aiModelSel} style={{ ...btnBlue, opacity: canEditAi && aiModelSel && !aiCfgBusy ? 1 : 0.5 }}>Lưu model</button>
          </div>
          {aiCfgMsg && <div style={{ fontSize: 12.5, color: COLORS.ink2, marginTop: 10 }}>{aiCfgMsg}</div>}
          {!canEditAi && <div style={{ fontSize: 12.5, color: COLORS.ink3, marginTop: 8 }}>Chỉ Quản trị mới sửa được cấu hình AI.</div>}
        </section>

        {/* Image AI config — mirrors the text config: provider + model + own key */}
        <section style={{ ...panelPad, gridColumn: "1 / -1" }}>
          <PanelHead
            right={
              <span style={{ fontSize: 12.5, color: settings?.aiImageEnabled ? COLORS.brandGreen : COLORS.ink3 }}>
                {settings?.aiImageEnabled ? `Đang bật · ${settings?.aiImageProvider}` : "Đang tắt"}
                {settings?.aiImageEnabled && settings?.aiImageModel ? ` · ${settings.aiImageModel}` : ""}
                {settings?.aiImageApiKeySet ? ` · token: ${settings.aiImageApiKeyHint}` : ""}
              </span>
            }
          >
            Tạo ảnh bìa bằng AI (chạy song song với model bài viết)
          </PanelHead>
          <div style={{ fontSize: 12.5, color: COLORS.ink3, margin: "6px 0 14px" }}>
            Cấu hình <b>độc lập với model bài viết</b>: chọn nhà cung cấp ảnh → dán API token (nếu cần) → <b>Lấy model</b> → chọn model → <b>Bật &amp; lưu</b>. Token ảnh lưu riêng (server, không hiển thị lại).
            <br/>• <b>Pollinations</b> — miễn phí, không cần key/billing. • <b>Gemini</b> — chất lượng cao, <b>cần bật billing</b> cho key.
            <br/>Tắt thì dùng ảnh minh hoạ vector tự động. Ưu tiên mỗi bài: <i>ảnh bạn đặt → ảnh AI → ảnh minh hoạ</i>.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={label}>Nhà cung cấp ảnh</label>
              <select
                value={aiImageProviderSel}
                onChange={(e) => { setAiImageProviderSel(e.target.value); setAiImageModelList([]); setAiImageModelSel(""); setAiImageMsg(""); }}
                disabled={!canEditAi}
                style={input}
              >
                {IMAGE_PROVIDERS_PUBLIC.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Endpoint (tự điền)</label>
              <input readOnly value={curImageProvider.endpoint} style={{ ...input, fontFamily: "monospace", color: COLORS.ink3 }} />
            </div>
          </div>
          {!curImageProvider.keyless && (
            <>
              <label style={label}>
                API token{" "}
                <a href={curImageProvider.keyUrl} target="_blank" rel="noreferrer" style={{ color: COLORS.brandBlue, fontWeight: 500 }}>· lấy token ở đâu?</a>
              </label>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <input
                  type={aiImageKeyShow ? "text" : "password"}
                  value={aiImageKeyInput}
                  onChange={(e) => setAiImageKeyInput(e.target.value)}
                  placeholder={settings?.aiImageApiKeySet && settings.aiImageProvider === aiImageProviderSel ? "•••••• (đã lưu — dán mới để thay)" : curImageProvider.keyHint}
                  disabled={!canEditAi || aiImageCfgBusy}
                  style={{ ...input, flex: 1, fontFamily: "monospace" }}
                />
                <button type="button" onClick={() => setAiImageKeyShow(!aiImageKeyShow)} style={btnSm}>{aiImageKeyShow ? "Ẩn" : "Hiện"}</button>
              </div>
            </>
          )}
          <label style={label}>Model</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
            <select
              value={aiImageModelSel}
              onChange={(e) => setAiImageModelSel(e.target.value)}
              disabled={!canEditAi || dropdownImageModels.length === 0}
              style={{ ...input, flex: 1 }}
            >
              {dropdownImageModels.length === 0 && <option value="">— Bấm "Lấy model" để tải danh sách —</option>}
              {dropdownImageModels.map((m) => <option key={m.id} value={m.id}>{m.name}{m.name !== m.id ? ` (${m.id})` : ""}</option>)}
            </select>
            <button type="button" onClick={aiGetImageModels} disabled={!canEditAi || aiImageCfgBusy} style={{ ...btnSm, opacity: canEditAi && !aiImageCfgBusy ? 1 : 0.5 }}>↻ Lấy model</button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => saveImageCfg(true)} disabled={!canEditAi || aiImageCfgBusy} style={{ ...btnBlue, opacity: canEditAi && !aiImageCfgBusy ? 1 : 0.5 }}>Bật &amp; lưu</button>
            <button type="button" onClick={() => saveImageCfg(false)} disabled={!canEditAi || aiImageCfgBusy} style={btnSm}>Tắt</button>
          </div>
          {aiImageMsg && <div style={{ fontSize: 12.5, color: COLORS.ink2, marginTop: 10 }}>{aiImageMsg}</div>}
          <div style={{ fontSize: 11.5, color: COLORS.ink3, marginTop: 8 }}>Ảnh sinh không kèm chữ, phong cách vector phẳng; lưu vào MinIO (fallback PVC). Mỗi ảnh thêm ~vài giây khi tạo bài.</div>
        </section>

        <div style={panel}>
          <PanelHead>Giới hạn &amp; chi phí</PanelHead>
          <div style={{ padding: 16, fontSize: 13, color: COLORS.ink2, lineHeight: 1.7 }}>
            <div style={{ background: "#FEF7F0", border: "1px solid #F8CBA9", borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <b style={{ color: "#C25A17" }}>Chưa có hạn mức thực thi.</b> Phần này trước là mẫu giao diện (không lưu, không chặn thật). Đã gỡ để tránh hiểu nhầm.
            </div>
            Giới hạn <b>thực sự chặn được</b> hiện có: <b>số bài mỗi lần chạy</b> (Số bài tự động, ở AI tự động) và <b>lịch bật/tắt</b>. Để có hạn mức token/chi phí theo ngày-tháng cần thêm <b>đo lường token mỗi lượt gọi</b> rồi khoá khi vượt — mình có thể làm nếu bạn cần.
          </div>
        </div>

        <div style={panel}>
          <PanelHead>{API_UI.publicApiPanelHead}</PanelHead>
          <div style={{ padding: 16 }}>
            <p style={{ fontSize: 13, color: COLORS.ink3, margin: "0 0 12px" }}>{API_UI.publicApiHint}</p>
            {PUBLIC_API.map((e) => (
              <div key={e.path} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${COLORS.split}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#3F7A26", background: "#F0F8EB", border: "1px solid #C6E4B4", borderRadius: 4, padding: "1px 6px" }}>{e.method}</span>
                <code style={{ fontSize: 12.5, color: COLORS.ink }}>{e.path}</code>
              </div>
            ))}
            <label style={{ ...label, marginTop: 14 }}>{API_UI.publicKeyLabel}</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input readOnly value={API_UI.publicKeyDefault} style={{ ...input, fontFamily: "monospace" }} />
              <button type="button" onClick={() => setRotated(true)} style={btnSm}>{rotated ? API_UI.rotateButtonDone : API_UI.rotateButton}</button>
            </div>
            <label style={{ ...label, marginTop: 14 }}>{API_UI.webhookLabel}</label>
            <input placeholder={API_UI.webhookPlaceholder} style={input} />
          </div>
        </div>

        <div style={{ ...panelPad, gridColumn: "1 / -1", background: "#FEF7F0", borderColor: "#F8CBA9" }}>
          <div style={{ fontWeight: 600, color: "#C25A17", marginBottom: 6 }}>{API_UI.apiKeyNotice.title}</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: COLORS.ink2, margin: 0 }}>{API_UI.apiKeyNotice.text}</p>
        </div>
      </div>
    );
  }
}
