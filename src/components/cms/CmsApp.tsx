"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import {
  SEED, SeedPost, PostStatus, CATS, TONE, CATEGORIES, TAGS, TAXONOMY_UI,
  KINDS, EDITOR_UI, NEW_DRAFT_DEFAULTS, BlockKind,
  FEEDS, Feed, FEEDS_UI, FEEDS_STATS,
  INBOX, InboxItem, INBOX_UI,
  TRANSLATE_UI, TRANSLATE_CONFIG, GLOSSARY, GLOSSARY_UI, PREPUBLISH_CHECKLIST,
  API_UI, PUBLIC_API,
  SIDEBAR, TOPBAR, POSTS_VIEW_UI, ADMIN_UI,
} from "@/data/cms";
import { COLORS, RADIUS } from "@/lib/tokens";
import { PROVIDERS_PUBLIC } from "@/lib/providers";

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
  aiFeeds: string[];
  aiTopics: string[];
  aiAutoPublish: boolean;
  aiDiscoverCount: number;
  aiProvider: string;
  aiModel: string;
  aiApiKeySet: boolean;
  aiApiKeyHint: string;
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

function licensePill(l: string): CSSProperties {
  const cc = l.toUpperCase().startsWith("CC");
  return { display: "inline-flex", padding: "2px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600,
    color: cc ? "#3F7A26" : "#C25A17", background: cc ? "#F0F8EB" : "#FEF1E9", border: `1px solid ${cc ? "#C6E4B4" : "#F8CBA9"}` };
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
    date: p.date ?? "[Ngày đăng]",
    author: p.author ?? "",
    excerpt: p.excerpt ?? "",
    tags: p.tags ?? [],
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
    coverUrl: `assets/cover-${draft.slug || "post"}.png`,
    blocks: cmsBlocksToStore(draft.blocks),
  };
  const res = await fetch("/api/v1/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  return res.ok;
}

export default function CmsApp() {
  const [view, setView] = useState<View>("posts");
  const [posts, setPosts] = useState<SeedPost[]>(SEED);
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState("Tất cả");

  const [draft, setDraft] = useState<SeedPost>(makeDraft());
  const [tagInput, setTagInput] = useState("");
  const [saved, setSaved] = useState(false);

  const [feeds, setFeeds] = useState<Feed[]>(FEEDS);
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newFeedCat, setNewFeedCat] = useState(CATS[0]);

  const [inbox, setInbox] = useState<InboxItem[]>(INBOX);
  const [inboxQuery, setInboxQuery] = useState("");
  const [inboxTab, setInboxTab] = useState("Tất cả");
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(INBOX.filter((i) => i.status === "Mới lấy về").map((i) => [i.id, true])),
  );
  const [openItem, setOpenItem] = useState<InboxItem | null>(null);
  const [tone, setTone] = useState(TRANSLATE_CONFIG.toneDefault);
  const [depth, setDepth] = useState(TRANSLATE_CONFIG.depthDefault);

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

  // AI provider config (Cấu hình API): pick provider → paste token → get models → choose → save
  const [aiProviderSel, setAiProviderSel] = useState("anthropic");
  const [aiKeyInput, setAiKeyInput] = useState("");
  const [aiKeyShow, setAiKeyShow] = useState(false);
  const [aiModelList, setAiModelList] = useState<{ id: string; name: string }[]>([]);
  const [aiModelSel, setAiModelSel] = useState("");
  const [aiCfgBusy, setAiCfgBusy] = useState(false);
  const [aiCfgMsg, setAiCfgMsg] = useState("");

  // AI auto-discovery + ingest history
  type HistItem = { at: string; mode: string; source: string; url: string; title: string; slug: string; status: string; aiUsed: boolean; note?: string };
  const [aiHistory, setAiHistory] = useState<HistItem[]>([]);
  const [aiTopicsInput, setAiTopicsInput] = useState("");

  function makeDraft(): SeedPost {
    return { ...NEW_DRAFT_DEFAULTS, blocks: [["p", ""]] } as SeedPost;
  }

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .filter((p) => statusTab === "Tất cả" || p.status === statusTab)
      .filter((p) => !q || (p.title + " " + p.tags.join(" ")).toLowerCase().includes(q));
  }, [posts, query, statusTab]);

  const feedCount = feeds.filter((f) => f.active).length;
  const pendingCount = inbox.filter((i) => i.status !== "Đã đăng").length;

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
    fetch("/api/v1/settings", { cache: "no-store" }).then((r) => { if (r.ok) r.json().then((s: SiteSettings) => { setSettings(s); setAiModelSel(s.aiModel || ""); setAiProviderSel(s.aiProvider || "anthropic"); setAiTopicsInput((s.aiTopics || []).join(", ")); }); }).catch(() => {});
    fetch("/api/v1/ai/history", { cache: "no-store" }).then((r) => { if (r.ok) r.json().then((d) => setAiHistory(d.results || [])); }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        body: JSON.stringify({ url: aiUrl.trim(), publish }),
      });
      const d = await res.json();
      if (res.ok) {
        aiLogLine(`✅ ${d.title} → ${d.status}${d.aiUsed ? "" : " (AI chưa cấu hình khóa)"}`);
        setAiUrl("");
        refreshPosts();
      } else {
        aiLogLine(`❌ ${d.error || res.status}`);
      }
    } catch (e) {
      aiLogLine(`❌ ${(e as Error).message}`);
    }
    setAiBusy(false);
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

  async function togglePublish(slug: string) {
    const cur = posts.find((p) => p.slug === slug);
    const next: PostStatus = cur?.status === "Đã xuất bản" ? "Bản nháp" : "Đã xuất bản";
    setPosts((ps) => ps.map((p) => (p.slug === slug ? { ...p, status: next } : p))); // optimistic
    await fetch(`/api/v1/posts/${slug}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: CMS2ST[next] }) }).catch(() => {});
    refreshPosts();
  }
  async function deletePost(slug: string, title: string) {
    if (!window.confirm(`Xoá vĩnh viễn bài "${title}"? Hành động này không hoàn tác được.`)) return;
    setPosts((ps) => ps.filter((p) => p.slug !== slug)); // optimistic
    const res = await fetch(`/api/v1/posts/${slug}`, { method: "DELETE" }).catch(() => null);
    if (!res || !res.ok) {
      alert(res?.status === 403 ? "Chỉ Quản trị mới được xoá bài." : "Xoá thất bại.");
    }
    refreshPosts();
  }
  function editPost(p: SeedPost) {
    setDraft({ ...p });
    setSaved(false);
    setView("editor");
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

  function openTranslate(item: InboxItem) {
    setOpenItem(item);
    setView("translate");
  }

  const navActive = (key: string) => key === view || (key === "inbox" && view === "translate");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "232px minmax(0, 1fr)", minHeight: "100vh", background: COLORS.pageBg }}>
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
                if (isLink) return <a key={it.label} href="#" style={style}>{content}</a>;
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
          <button type="button" onClick={newPost} style={{ ...btnBlue, marginLeft: "auto" }}>{TOPBAR.newPostButton}</button>
        </header>

        <main style={{ padding: 24, minWidth: 0 }}>
          {view === "posts" && PostsView()}
          {view === "editor" && EditorView()}
          {view === "taxonomy" && TaxonomyView()}
          {view === "feeds" && FeedsView()}
          {view === "inbox" && InboxView()}
          {view === "translate" && TranslateView()}
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
              <label style={label}>Nguồn RSS/Atom ({feeds.length})</label>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <input style={{ ...input, flex: 1 }} placeholder="https://nguồn.com/rss" value={aiFeedInput} onChange={(e) => setAiFeedInput(e.target.value)} disabled={!isAdmin} />
                <button type="button" onClick={addFeed} disabled={!isAdmin || !aiFeedInput} style={{ ...btnSm, opacity: isAdmin && aiFeedInput ? 1 : 0.5 }}>+ Thêm nguồn</button>
              </div>
              {feeds.length === 0 && <div style={{ fontSize: 12.5, color: COLORS.ink3 }}>Chưa có nguồn. Thêm URL RSS để lịch tự động chạy.</div>}
              {feeds.map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${COLORS.split}`, fontSize: 13 }}>
                  <span style={{ flex: 1, fontFamily: "monospace", color: COLORS.ink2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f}</span>
                  <button type="button" onClick={() => removeFeed(f)} disabled={!isAdmin} style={{ ...btnSm, height: 26, padding: "0 8px", color: "#C0392B" }}>Xoá</button>
                </div>
              ))}
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
              <button type="button" onClick={aiDiscover} disabled={aiBusy || (settings?.aiFeeds?.length ?? 0) === 0} style={{ ...btnBlue, height: 30, opacity: aiBusy || !(settings?.aiFeeds?.length) ? 0.5 : 1 }}>
                ✨ Tự tìm & xuất bản ngay
              </button>
            }
          >
            AI tự tìm bài hay & xuất bản
          </PanelHead>
          <div style={{ fontSize: 12.5, color: COLORS.ink3, margin: "6px 0 14px" }}>
            AI quét các nguồn ở trên, bỏ bài đã lấy (theo lịch sử), tự chọn bài <b>phù hợp & chất lượng nhất</b> theo chủ đề rồi biên tập — chạy hằng ngày lúc {String(settings?.aiScheduleHour ?? 5).padStart(2, "0")}:00 hoặc bấm chạy ngay. Bạn không cần vào tìm bài.
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
                      <td style={{ padding: "6px 8px", color: COLORS.ink3 }}>{h.mode === "discover" ? "AI tự tìm" : h.mode === "cron" ? "Lịch" : "Thủ công"}</td>
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
              <div style={{ display: "grid", gridTemplateColumns: "minmax(200px,2.4fr) minmax(104px,150px) minmax(96px,130px) minmax(84px,110px) 128px", gap: 10, padding: "10px 16px", fontSize: 12, fontWeight: 600, color: COLORS.ink3, borderBottom: `1px solid ${COLORS.split}` }}>
                {POSTS_VIEW_UI.tableHead.map((h) => <span key={h}>{h}</span>)}
              </div>
              {filteredPosts.map((p) => (
                <div key={p.slug} style={{ display: "grid", gridTemplateColumns: "minmax(200px,2.4fr) minmax(104px,150px) minmax(96px,130px) minmax(84px,110px) 128px", gap: 10, padding: "12px 16px", alignItems: "center", borderBottom: `1px solid ${COLORS.split}` }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink, overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: COLORS.ink3 }}>/blog/{p.slug}</div>
                  </div>
                  <span style={{ fontSize: 12.5, color: TONE[p.cat] ?? COLORS.ink2, fontWeight: 600 }}>{p.cat}</span>
                  <span><span style={statusPill(p.status)}>{p.status}</span></span>
                  <span style={{ fontSize: 12.5, color: COLORS.ink3 }}>{p.date}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button type="button" onClick={() => editPost(p)} style={{ ...btnSm, height: 28, padding: "0 10px" }}>{POSTS_VIEW_UI.editButton}</button>
                    <button type="button" onClick={() => togglePublish(p.slug)} style={{ ...btnSm, height: 28, padding: "0 10px" }}>{p.status === "Đã xuất bản" ? POSTS_VIEW_UI.hideButton : POSTS_VIEW_UI.publishButton}</button>
                    {(me?.isAdmin ?? true) && <button type="button" onClick={() => deletePost(p.slug, p.title)} title="Xoá vĩnh viễn" style={{ ...btnSm, height: 28, padding: "0 10px", color: "#C0392B", borderColor: "#E7B4AC" }}>Xoá</button>}
                  </div>
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
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: COLORS.ink }}>{EDITOR_UI.fields.blocksLabel}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {KINDS.map((k) => (
                <button key={k.k} type="button" onClick={() => setDraft({ ...draft, blocks: [...draft.blocks, [k.k, ""]] })} style={btnSm}>{EDITOR_UI.blockAddPrefix}{k.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {draft.blocks.map((b, i) => {
                const kind = KINDS.find((k) => k.k === b[0]);
                return (
                  <div key={i} style={{ display: "flex", gap: 10, background: "#FBFCFD", border: `1px solid ${COLORS.split}`, borderRadius: 8, padding: 12 }}>
                    <span style={{ color: COLORS.ink3, cursor: "grab", userSelect: "none" }}>⠿</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: COLORS.ink3, marginBottom: 6 }}>{kind?.label}</div>
                      <textarea
                        value={b[1]}
                        onChange={(e) => { const nb = [...draft.blocks]; nb[i] = [b[0], e.target.value]; setDraft({ ...draft, blocks: nb as [BlockKind, string][] }); }}
                        placeholder={kind?.hint}
                        rows={kind?.rows ?? 2}
                        style={{ ...input, height: "auto", padding: "8px 10px", lineHeight: 1.6 }}
                      />
                    </div>
                    <button type="button" onClick={() => setDraft({ ...draft, blocks: draft.blocks.filter((_, j) => j !== i) })} style={{ border: "none", background: "none", color: COLORS.ink3, cursor: "pointer", fontSize: 15 }} aria-label="Xoá khối">✕</button>
                  </div>
                );
              })}
            </div>
          </div>
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

          <div style={panel}>
            <PanelHead>{EDITOR_UI.coverPanelHead}</PanelHead>
            <div style={{ padding: 16 }}>
              <div style={{ height: 140, border: `1px dashed ${COLORS.border}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: COLORS.ink3, fontSize: 13, padding: 12 }}>{EDITOR_UI.coverDropText}</div>
              <div style={{ fontSize: 12, color: COLORS.ink3, marginTop: 8 }}>{EDITOR_UI.coverHint}</div>
              <div style={{ fontSize: 12, color: COLORS.ink3, marginTop: 4, fontFamily: "monospace" }}>{EDITOR_UI.coverPathTemplate.replace("{slug}", draft.slug || "slug")}</div>
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

  function FeedsView() {
    return (
      <>
        <StatTiles tiles={FEEDS_STATS} />
        <div style={panel}>
          <PanelHead>{FEEDS_UI.panelHead}</PanelHead>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 820 }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(200px,2fr) minmax(120px,1fr) 110px 130px 120px 150px", gap: 10, padding: "10px 16px", fontSize: 12, fontWeight: 600, color: COLORS.ink3, borderBottom: `1px solid ${COLORS.split}` }}>
                {FEEDS_UI.tableHead.map((h) => <span key={h}>{h}</span>)}
              </div>
              {feeds.map((f) => (
                <div key={f.id} style={{ display: "grid", gridTemplateColumns: "minmax(200px,2fr) minmax(120px,1fr) 110px 130px 120px 150px", gap: 10, padding: "12px 16px", alignItems: "center", borderBottom: `1px solid ${COLORS.split}` }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{f.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.ink3, overflow: "hidden", textOverflow: "ellipsis" }}>{f.url}</div>
                  </div>
                  <span style={{ fontSize: 13, color: COLORS.ink2 }}>{f.cat}</span>
                  <span style={{ fontSize: 13, color: COLORS.ink2 }}>{f.schedule}</span>
                  <span style={{ fontSize: 12.5, color: COLORS.ink3 }}>{f.active ? f.last : FEEDS_UI.pausedLastLabel}</span>
                  <span><span style={licensePill(f.license)}>{f.license}</span></span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button type="button" style={{ ...btnSm, height: 28, padding: "0 8px" }}>{FEEDS_UI.fetchButton}</button>
                    <button type="button" onClick={() => setFeeds((fs) => fs.map((x) => (x.id === f.id ? { ...x, active: !x.active } : x)))} style={{ ...btnSm, height: 28, padding: "0 8px" }}>{f.active ? FEEDS_UI.pauseButton : FEEDS_UI.resumeButton}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, padding: 16, flexWrap: "wrap", borderTop: `1px solid ${COLORS.split}` }}>
            <input value={newFeedUrl} onChange={(e) => setNewFeedUrl(e.target.value)} placeholder={FEEDS_UI.addFeed.urlPlaceholder} style={{ ...input, flex: "1 1 240px" }} />
            <select value={newFeedCat} onChange={(e) => setNewFeedCat(e.target.value)} style={{ ...input, width: 180 }}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
            <button type="button" onClick={() => { if (!newFeedUrl.trim()) return; setFeeds((fs) => [...fs, { id: `f${fs.length + 1}`, name: newFeedUrl.replace(/^https?:\/\//, "").split("/")[0], url: newFeedUrl, cat: newFeedCat, ...FEEDS_UI.addFeed.newFeedDefaults } as Feed]); setNewFeedUrl(""); }} style={btnBlue}>{FEEDS_UI.addFeed.addButton}</button>
          </div>
        </div>
        <div style={{ ...panelPad, marginTop: 16, background: "#FEF7F0", borderColor: "#F8CBA9" }}>
          <div style={{ fontWeight: 600, color: "#C25A17", marginBottom: 6 }}>{FEEDS_UI.copyrightNotice.title}</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: COLORS.ink2, margin: 0 }}>{FEEDS_UI.copyrightNotice.text}</p>
        </div>
      </>
    );
  }

  function InboxView() {
    const q = inboxQuery.trim().toLowerCase();
    const items = inbox
      .filter((i) => inboxTab === "Tất cả" || i.status === inboxTab)
      .filter((i) => !q || (i.titleEn + " " + i.titleVi).toLowerCase().includes(q));
    function translateSelected() {
      setInbox((xs) => xs.map((i) => (checked[i.id] && i.status === "Mới lấy về"
        ? { ...i, status: "Đã dịch", titleVi: i.titleVi || INBOX_UI.aiDraftPlaceholder, translated: i.translated.length ? i.translated : [INBOX_UI.aiDraftPlaceholder] } : i)));
    }
    return (
      <div style={panel}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderBottom: `1px solid ${COLORS.split}`, flexWrap: "wrap" }}>
          <input value={inboxQuery} onChange={(e) => setInboxQuery(e.target.value)} placeholder={INBOX_UI.searchPlaceholder} style={{ ...input, width: 240, height: 34 }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {INBOX_UI.tabs.map((t) => (
              <button key={t} type="button" onClick={() => setInboxTab(t)} style={{ ...btnSm, height: 30, background: inboxTab === t ? "#E6F1F9" : "#fff", color: inboxTab === t ? COLORS.brandBlue : COLORS.ink2 }}>{t}</button>
            ))}
          </div>
          <button type="button" onClick={translateSelected} style={{ ...btnBlue, marginLeft: "auto" }}>{INBOX_UI.translateSelectedButton}</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 760 }}>
            <div style={{ display: "grid", gridTemplateColumns: "36px minmax(220px,2.6fr) minmax(120px,170px) minmax(120px,170px) 150px", gap: 10, padding: "10px 16px", fontSize: 12, fontWeight: 600, color: COLORS.ink3, borderBottom: `1px solid ${COLORS.split}` }}>
              {INBOX_UI.tableHead.map((h, i) => <span key={i}>{h}</span>)}
            </div>
            {items.map((i) => (
              <div key={i.id} style={{ display: "grid", gridTemplateColumns: "36px minmax(220px,2.6fr) minmax(120px,170px) minmax(120px,170px) 150px", gap: 10, padding: "12px 16px", alignItems: "center", borderBottom: `1px solid ${COLORS.split}` }}>
                <input type="checkbox" checked={!!checked[i.id]} onChange={(e) => setChecked({ ...checked, [i.id]: e.target.checked })} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: COLORS.ink, fontWeight: 500 }}>{i.titleVi || INBOX_UI.untranslatedTitlePlaceholder}</div>
                  <div style={{ fontSize: 12.5, fontStyle: "italic", color: COLORS.ink3 }}>{i.titleEn}</div>
                </div>
                <span style={{ fontSize: 13, color: COLORS.ink2 }}>{i.source}</span>
                <span style={{ fontSize: 12.5, color: COLORS.ink2 }}>{i.status}</span>
                <button type="button" onClick={() => openTranslate(i)} style={{ ...btnSm, height: 28 }}>{INBOX_UI.openTranslationButton}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function TranslateView() {
    const item = openItem ?? inbox[0];
    if (!item) return <div>Không có bài để dịch.</div>;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ ...panelPad, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.ink }}>{item.titleVi || item.titleEn}</div>
            <div style={{ fontSize: 12.5, color: COLORS.ink3 }}>{TRANSLATE_UI.sourceLabel} <a href={item.link}>{item.source}</a> · {item.license}</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button type="button" style={btnSm}>{TRANSLATE_UI.retranslateButton}</button>
            <button type="button" style={btnBlue}>{TRANSLATE_UI.toDraftButton}</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          <div style={panel}>
            <div style={{ padding: "12px 16px", background: COLORS.surfaceAlt, borderBottom: `1px solid ${COLORS.split}`, fontSize: 13, color: COLORS.ink3, fontWeight: 600 }}>{TRANSLATE_UI.panelHeadEn}</div>
            <div style={{ padding: 16 }}>
              {item.original.map((p, i) => <p key={i} style={{ fontSize: 14.5, lineHeight: 1.75, color: COLORS.ink3, margin: "0 0 14px" }}>{p}</p>)}
            </div>
          </div>
          <div style={{ ...panel, border: `1px solid ${COLORS.brandBlue}`, boxShadow: "0 4px 18px -10px rgba(0,114,188,0.4)" }}>
            <div style={{ padding: "12px 16px", background: "#E6F1F9", borderBottom: "1px solid #B3D5EA", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: COLORS.brandBlue, fontWeight: 600 }}>{TRANSLATE_UI.panelHeadVi}</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, background: COLORS.brandBlue, color: "#fff", borderRadius: 4, padding: "1px 6px" }}>{TRANSLATE_UI.aiBadge}</span>
            </div>
            <div style={{ padding: 16 }}>
              <input defaultValue={item.titleVi} placeholder="Tiêu đề bản dịch" style={{ ...input, fontWeight: 600, marginBottom: 12 }} />
              {(item.translated.length ? item.translated : item.original).map((p, i) => (
                <textarea key={i} defaultValue={p} rows={3} style={{ ...input, height: "auto", padding: "8px 10px", lineHeight: 1.7, marginBottom: 10 }} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <div style={panel}>
            <PanelHead>{TRANSLATE_UI.configPanelHead}</PanelHead>
            <div style={{ padding: 16 }}>
              <label style={label}>{TRANSLATE_CONFIG.toneLabel}</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} style={{ ...input, marginBottom: 14 }}>{TRANSLATE_CONFIG.toneOptions.map((o) => <option key={o}>{o}</option>)}</select>
              <label style={label}>{TRANSLATE_CONFIG.depthLabel}</label>
              <select value={depth} onChange={(e) => setDepth(e.target.value)} style={{ ...input, marginBottom: 14 }}>{TRANSLATE_CONFIG.depthOptions.map((o) => <option key={o}>{o}</option>)}</select>
              <label style={{ display: "flex", gap: 8, fontSize: 13, color: COLORS.ink2, marginBottom: 8 }}><input type="checkbox" defaultChecked /> {TRANSLATE_CONFIG.checkboxes.keepTerms}</label>
              <label style={{ display: "flex", gap: 8, fontSize: 13, color: COLORS.ink2 }}><input type="checkbox" defaultChecked /> {TRANSLATE_CONFIG.checkboxes.addCanonical}</label>
            </div>
          </div>
          <div style={panel}>
            <PanelHead>{TRANSLATE_UI.glossaryPanelHead}</PanelHead>
            <div style={{ padding: 16 }}>
              {GLOSSARY.map((g) => (
                <div key={g.en} style={{ display: "grid", gridTemplateColumns: "1fr 18px 1fr", gap: 8, alignItems: "center", padding: "6px 0", fontSize: 13, borderBottom: `1px solid ${COLORS.split}` }}>
                  <span style={{ color: COLORS.ink }}>{g.en}</span><span style={{ color: COLORS.ink3, textAlign: "center" }}>→</span><span style={{ color: COLORS.ink2 }}>{g.vi}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <input placeholder={GLOSSARY_UI.enPlaceholder} style={{ ...input, height: 34 }} />
                <input placeholder={GLOSSARY_UI.viPlaceholder} style={{ ...input, height: 34 }} />
                <button type="button" style={btnSm}>{GLOSSARY_UI.addButton}</button>
              </div>
            </div>
          </div>
          <div style={panel}>
            <PanelHead>{TRANSLATE_UI.checklistPanelHead}</PanelHead>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {PREPUBLISH_CHECKLIST.map((c) => (
                <div key={c.label} style={{ display: "flex", gap: 10, fontSize: 13.5, color: COLORS.ink2 }}>
                  <span style={{ color: c.ok ? COLORS.brandGreen : COLORS.brandOrange, fontWeight: 700 }}>{c.ok ? "✓" : "!"}</span>
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
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


        <div style={panel}>
          <PanelHead>{API_UI.limitsPanelHead}</PanelHead>
          <div style={{ padding: 16 }}>
            <label style={label}>{API_UI.quotaDayLabel}</label>
            <input defaultValue={API_UI.quotaDayDefault} style={{ ...input, marginBottom: 14 }} />
            <label style={label}>{API_UI.quotaBudgetLabel}</label>
            <input defaultValue={API_UI.quotaBudgetDefault} style={{ ...input, marginBottom: 16 }} />
            <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.split}`, borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 12.5, color: COLORS.ink3, display: "flex", justifyContent: "space-between" }}><span>{API_UI.usage.usedThisMonth}</span><span>{API_UI.usage.usedThisMonthValue.replace("{quotaBudget}", API_UI.quotaBudgetDefault)}</span></div>
              <div style={{ height: 6, borderRadius: 3, background: "#E6EAF0", marginTop: 8, overflow: "hidden" }}><div style={{ width: "38%", height: "100%", background: "linear-gradient(90deg, #0072BC, #57A336)" }} /></div>
              <div style={{ fontSize: 12, color: COLORS.ink3, marginTop: 8 }}>{API_UI.usage.articlesTranslated}: {API_UI.usage.articlesTranslatedValue} · {API_UI.usage.avgTokens}: {API_UI.usage.avgTokensValue}</div>
            </div>
            {Object.values(API_UI.limitCheckboxes).map((c, i) => (
              <label key={c} style={{ display: "flex", gap: 8, fontSize: 13, color: COLORS.ink2, marginBottom: 8 }}><input type="checkbox" defaultChecked={i !== 1} /> {c}</label>
            ))}
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
