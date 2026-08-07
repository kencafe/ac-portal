"use client";

import { CSSProperties, useMemo, useState } from "react";
import {
  SEED, SeedPost, PostStatus, CATS, TONE, CATEGORIES, TAGS, TAXONOMY_UI,
  KINDS, EDITOR_UI, NEW_DRAFT_DEFAULTS, BlockKind,
  FEEDS, Feed, FEEDS_UI, FEEDS_STATS,
  INBOX, InboxItem, INBOX_UI,
  TRANSLATE_UI, TRANSLATE_CONFIG, GLOSSARY, GLOSSARY_UI, PREPUBLISH_CHECKLIST,
  API_PROVIDERS, API_DEFAULTS, API_UI, PUBLIC_API,
  POSTS_STATS, SIDEBAR, TOPBAR, POSTS_VIEW_UI,
} from "@/data/cms";
import { COLORS, RADIUS } from "@/lib/tokens";

type View = "posts" | "editor" | "taxonomy" | "feeds" | "inbox" | "translate" | "api";

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
  const [provider, setProvider] = useState(API_DEFAULTS.activeProvider);
  const [api, setApi] = useState({ ...API_DEFAULTS });
  const [showKey, setShowKey] = useState(false);
  const [tested, setTested] = useState(false);
  const [apiSaved, setApiSaved] = useState(false);
  const [rotated, setRotated] = useState(false);

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

  function togglePublish(slug: string) {
    setPosts((ps) => ps.map((p) => (p.slug === slug ? { ...p, status: p.status === "Đã xuất bản" ? "Bản nháp" : "Đã xuất bản" } : p)));
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
  function saveDraft() {
    setPosts((ps) => {
      const exists = ps.some((p) => p.slug === draft.slug && draft.slug);
      if (exists) return ps.map((p) => (p.slug === draft.slug ? draft : p));
      return [{ ...draft, slug: draft.slug || `bai-${ps.length + 1}` }, ...ps];
    });
    setSaved(true);
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
          <span style={{ width: 30, height: 30, borderRadius: "50%", background: COLORS.brandBlue, color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{SIDEBAR.footer.avatar}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink }}>{SIDEBAR.footer.name}</div>
            <div style={{ fontSize: 11.5, color: COLORS.ink3 }}>{SIDEBAR.footer.role}</div>
          </div>
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
        </main>
      </div>
    </div>
  );

  // ── Views ──────────────────────────────────────────────────────────────
  function PostsView() {
    return (
      <>
        <StatTiles tiles={POSTS_STATS} />
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
    const activeModels = API_PROVIDERS.find((p) => p.name === provider)?.models ?? [];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, alignItems: "start" }}>
        <div style={panel}>
          <PanelHead>{API_UI.providersPanelHead}</PanelHead>
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {API_PROVIDERS.map((p) => {
              const active = p.name === provider;
              return (
                <button key={p.name} type="button" onClick={() => { setProvider(p.name); setApi((a) => ({ ...a, model: p.models[0] })); }} style={{ textAlign: "left", cursor: "pointer", padding: 14, borderRadius: 8, border: `1px solid ${active ? COLORS.brandBlue : COLORS.split}`, background: active ? "#F4F9FD" : "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${active ? COLORS.brandBlue : COLORS.border}`, background: active ? COLORS.brandBlue : "#fff" }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{p.name}</span>
                    <span style={{ marginLeft: "auto", fontSize: 11.5, color: active ? COLORS.brandBlue : COLORS.ink3 }}>{active ? API_UI.providerStateInUse : API_UI.providerStateUnconfigured}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: COLORS.ink3, marginTop: 6, paddingLeft: 24 }}>{p.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={panel}>
          <PanelHead>{API_UI.connectionPanelHead.replace("{provider}", provider)}</PanelHead>
          <div style={{ padding: 16 }}>
            <label style={label}>{API_UI.fields.endpoint.label}</label>
            <input value={api.endpoint} onChange={(e) => setApi({ ...api, endpoint: e.target.value })} style={{ ...input, marginBottom: 14 }} />
            <label style={label}>{API_UI.fields.apiKey.label}</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <input type={showKey ? "text" : "password"} value={api.key} onChange={(e) => setApi({ ...api, key: e.target.value })} style={{ ...input, fontFamily: "monospace" }} />
              <button type="button" onClick={() => setShowKey(!showKey)} style={btnSm}>{showKey ? API_UI.keyHide : API_UI.keyShow}</button>
            </div>
            <div style={{ fontSize: 12, color: COLORS.ink3, marginBottom: 14 }}>{API_UI.fields.apiKeyHint}</div>
            <label style={label}>{API_UI.fields.model}</label>
            <select value={api.model} onChange={(e) => setApi({ ...api, model: e.target.value })} style={{ ...input, marginBottom: 14 }}>{activeModels.map((m) => <option key={m}>{m}</option>)}</select>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div><label style={label}>{API_UI.fields.temperature}</label><input value={api.temp} onChange={(e) => setApi({ ...api, temp: e.target.value })} style={input} /></div>
              <div><label style={label}>{API_UI.fields.maxTokens}</label><input value={api.maxTokens} onChange={(e) => setApi({ ...api, maxTokens: e.target.value })} style={input} /></div>
              <div><label style={label}>{API_UI.fields.timeout}</label><input value={api.timeout} onChange={(e) => setApi({ ...api, timeout: e.target.value })} style={input} /></div>
            </div>
            <label style={label}>{API_UI.fields.systemPrompt}</label>
            <textarea value={api.prompt} onChange={(e) => setApi({ ...api, prompt: e.target.value })} rows={4} style={{ ...input, height: "auto", padding: "10px 12px", lineHeight: 1.6, marginBottom: 14 }} />
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={() => setTested(true)} style={btnSm}>{API_UI.testButton}</button>
              {tested && <span style={{ fontSize: 13, color: COLORS.brandGreen }}>{API_UI.testResult}</span>}
              <button type="button" onClick={() => setApiSaved(true)} style={{ ...btnBlue, marginLeft: "auto" }}>{apiSaved ? API_UI.saveButtonDone : API_UI.saveButton}</button>
            </div>
          </div>
        </div>

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
