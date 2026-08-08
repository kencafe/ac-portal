// Branded, content-aware cover generator. Renders a dark-navy "dashboard card"
// SVG in the same family as the hand-designed seed covers (grid backdrop +
// category tag + a chart motif chosen from the article's topic + brand accent
// stripe). Deterministic (seeded from title+cat) so a post always renders the
// same image; server-rendered, no external service, no quota — never produces
// an off-topic photo. This is the default cover for AI posts.
//
// Diversity: 8 motifs. The topic picks a *set* of fitting motifs; the title
// seed then chooses one from that set, so two posts in the same category get
// different-looking charts instead of a repeated template. Motif internals
// (bar heights, radar shape, %, dot pattern…) are seeded too.

export const BRAND = { orange: "#F37021", blue: "#0072BC", green: "#57A336", sky: "#4AA3E0" } as const;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function seedFrom(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Motif = "gauge" | "donut" | "bars" | "area" | "radar" | "sparkstat" | "dotmatrix" | "nodes";

// Candidate motifs for a topic, ordered by fit. The title seed picks one of
// them so same-category posts vary.
function candidatesFor(cat: string, title: string): Motif[] {
  const t = (cat + " " + title).toLowerCase();
  if (/secur|zero.?trust|risk|shadow|threat|attack|mã hoá|bảo mật|xác thực|supply.?chain|cve|vuln/.test(t)) return ["radar", "dotmatrix", "nodes"];
  if (/gpu|infra|cost|chi phí|opencost|resource|util|hiệu suất|throughput|benchmark|scale|inference/.test(t)) return ["bars", "donut", "sparkstat"];
  if (/migrat|di trú|landing|cloud|platform|network|dns|traffic|mạng|hạ tầng/.test(t)) return ["area", "nodes", "sparkstat"];
  if (/observ|trace|metric|monitor|latency|uptime|log|telemetry/.test(t)) return ["area", "sparkstat", "gauge"];
  if (/sre|slo|sla|reliab|error.?budget|alert|cảnh báo|tin cậy|incident|sự cố|độ ổn định/.test(t)) return ["gauge", "donut", "bars"];
  if (/ai|ml|agent|model|kubeflow|llm|automation|tự động/.test(t)) return ["nodes", "dotmatrix", "sparkstat"];
  return ["gauge", "bars", "area", "radar", "donut", "sparkstat", "dotmatrix", "nodes"];
}

// --- motifs: hero graphic in the lower/right area (title occupies upper-left) ---
function gaugeMotif(rnd: () => number, accent: string): string {
  const cx = 410, cy = 470, r = 150;
  const pct = 0.80 + rnd() * 0.19;
  const a1 = Math.PI * (1 - pct);
  const p = (a: number) => [cx + Math.cos(a) * r, cy - Math.sin(a) * r] as const;
  const [sx, sy] = p(Math.PI), [ex, ey] = p(0), [fx, fy] = p(a1);
  const big = pct > 0.5 ? 0 : 1;
  const track = `<path d="M${sx} ${sy} A${r} ${r} 0 0 1 ${ex} ${ey}" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="26" stroke-linecap="round"/>`;
  const fill = `<path d="M${sx} ${sy} A${r} ${r} 0 ${big} 1 ${fx.toFixed(1)} ${fy.toFixed(1)}" fill="none" stroke="${accent}" stroke-width="26" stroke-linecap="round"/>`;
  const rest = `<path d="M${fx.toFixed(1)} ${fy.toFixed(1)} A${r} ${r} 0 0 1 ${ex} ${ey}" fill="none" stroke="${BRAND.orange}" stroke-width="26" stroke-linecap="round"/>`;
  const label = `<text x="${cx}" y="${cy - 6}" font-size="70" font-weight="800" fill="#ffffff" text-anchor="middle">${(pct * 100).toFixed(1).replace(".", ",")}%</text>`;
  const bx = 720, bw = 380;
  let bars = `<text x="${bx}" y="322" font-size="22" font-weight="600" fill="#ffffff" fill-opacity="0.7">chỉ số</text>`;
  for (let i = 0; i < 8; i++) { const w = (0.45 + rnd() * 0.55) * bw; const col = i >= 6 ? BRAND.orange : accent; bars += `<rect x="${bx}" y="${344 + i * 26}" width="${w.toFixed(0)}" height="12" rx="3" fill="${col}" fill-opacity="0.92"/>`; }
  return track + fill + rest + label + bars;
}
function donutMotif(rnd: () => number, accent: string): string {
  const cx = 760, cy = 400, r = 150, sw = 34;
  const segs = [0.55 + rnd() * 0.2, 0.15 + rnd() * 0.12, 0]; segs[2] = Math.max(0.08, 1 - segs[0] - segs[1]);
  const cols = [accent, BRAND.orange, BRAND.sky];
  let a0 = -Math.PI / 2, out = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="${sw}"/>`;
  segs.forEach((s, i) => {
    const a1 = a0 + s * Math.PI * 2; const big = s > 0.5 ? 1 : 0;
    const [x0, y0] = [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r];
    const [x1, y1] = [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r];
    out += `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${big} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${cols[i]}" stroke-width="${sw}"/>`;
    a0 = a1 + 0.05;
  });
  out += `<text x="${cx}" y="${cy + 14}" font-size="60" font-weight="800" fill="#ffffff" text-anchor="middle">${Math.round(segs[0] * 100)}%</text>`;
  return out;
}
function barsMotif(rnd: () => number, accent: string): string {
  const x0 = 130, base = 500, bw = 100, gap = 30, n = 8, maxH = 280, target = base - maxH * 0.72;
  let out = `<line x1="${x0 - 20}" y1="${target}" x2="1130" y2="${target}" stroke="#ffffff" stroke-opacity="0.5" stroke-dasharray="6 8"/>`;
  out += `<text x="1130" y="${target - 8}" font-size="20" fill="#ffffff" fill-opacity="0.7" text-anchor="end">mục tiêu</text>`;
  for (let i = 0; i < n; i++) {
    const x = x0 + i * (bw + gap); const h = (0.35 + rnd() * 0.6) * maxH; const over = base - h < target;
    out += `<rect x="${x}" y="${base - maxH}" width="${bw}" height="${maxH}" rx="4" fill="#ffffff" fill-opacity="0.06"/>`;
    out += `<rect x="${x}" y="${(base - h).toFixed(0)}" width="${bw}" height="${h.toFixed(0)}" rx="4" fill="${over ? accent : BRAND.orange}"/>`;
  }
  return out;
}
function areaMotif(rnd: () => number, accent: string): string {
  const x0 = 100, x1 = 1130, base = 500, top = 300, n = 7; const step = (x1 - x0) / (n - 1);
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) pts.push([x0 + i * step, base - (0.2 + rnd() * 0.75) * (base - top)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(0)} ${p[1].toFixed(0)}`).join(" ");
  const areaP = `M${x0} ${base} ` + pts.map((p) => `L${p[0].toFixed(0)} ${p[1].toFixed(0)}`).join(" ") + ` L${x1} ${base} Z`;
  const dots = pts.map((p) => `<circle cx="${p[0].toFixed(0)}" cy="${p[1].toFixed(0)}" r="7" fill="${accent}"/>`).join("");
  return `<path d="${areaP}" fill="${accent}" fill-opacity="0.16"/><path d="${line}" fill="none" stroke="${accent}" stroke-width="4"/>${dots}`;
}
function radarMotif(rnd: () => number, accent: string): string {
  const cx = 640, cy = 400, R = 190, n = 5 + Math.floor(rnd() * 2);
  let rings = "";
  for (const rr of [R, R * 0.66, R * 0.33]) rings += `<circle cx="${cx}" cy="${cy}" r="${rr.toFixed(0)}" fill="none" stroke="#ffffff" stroke-opacity="0.14"/>`;
  let spokes = ""; const poly: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2; const ex = cx + Math.cos(a) * R, ey = cy + Math.sin(a) * R;
    spokes += `<line x1="${cx}" y1="${cy}" x2="${ex.toFixed(0)}" y2="${ey.toFixed(0)}" stroke="#ffffff" stroke-opacity="0.12"/>`;
    const rr = (0.45 + rnd() * 0.5) * R; poly.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  const pp = poly.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(0)} ${p[1].toFixed(0)}`).join(" ") + " Z";
  const dots = poly.map((p) => `<circle cx="${p[0].toFixed(0)}" cy="${p[1].toFixed(0)}" r="6" fill="${accent}"/>`).join("");
  return rings + spokes + `<path d="${pp}" fill="${accent}" fill-opacity="0.22" stroke="${accent}" stroke-width="3"/>${dots}`;
}
function sparkstatMotif(rnd: () => number, accent: string): string {
  // big stat number (centred in the right half) + a sparkline underneath
  const cxText = 800, x0 = 560, x1 = 1060, y = 470, amp = 90; const n = 12; const step = (x1 - x0) / (n - 1);
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) pts.push([x0 + i * step, y - (0.2 + rnd() * 0.8) * amp]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(0)} ${p[1].toFixed(0)}`).join(" ");
  const stat = (rnd() * 40 + 60).toFixed(1).replace(".", ",");
  return `<text x="${cxText}" y="380" font-size="92" font-weight="800" fill="#ffffff" text-anchor="middle">${stat}<tspan font-size="42" fill="${accent}">%</tspan></text>` +
    `<path d="${line}" fill="none" stroke="${accent}" stroke-width="4"/>` +
    pts.map((p) => `<circle cx="${p[0].toFixed(0)}" cy="${p[1].toFixed(0)}" r="4" fill="${accent}" fill-opacity="0.8"/>`).join("");
}
function dotmatrixMotif(rnd: () => number, accent: string): string {
  // heatmap grid of squares (severity/coverage look). Uses fill+fill-opacity
  // (not 8-digit hex, which many SVG renderers ignore).
  const cols = 12, rows = 6, x0 = 470, y0 = 296, s = 40, g = 8;
  let out = "";
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const v = rnd();
    const cell = v > 0.85
      ? `fill="${BRAND.orange}"`
      : v > 0.6
        ? `fill="${accent}"`
        : `fill="#ffffff" fill-opacity="${v > 0.35 ? 0.16 : 0.06}"`;
    out += `<rect x="${x0 + c * (s + g)}" y="${y0 + r * (s + g)}" width="${s}" height="${s}" rx="6" ${cell}/>`;
  }
  return out;
}
function nodesMotif(rnd: () => number, accent: string): string {
  const cx = 700 + rnd() * 30, cy = 400;
  const dotColors = [accent, BRAND.orange, BRAND.green, BRAND.sky, "#ffffff"];
  const nodes: { x: number; y: number; r: number; c: string }[] = [];
  const count = 6 + Math.floor(rnd() * 4);
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2 + rnd() * 0.6; const rad = 110 + rnd() * 130;
    const x = Math.min(1140, Math.max(470, cx + Math.cos(ang) * rad));
    const y = Math.min(560, Math.max(280, cy + Math.sin(ang) * rad * 0.8));
    nodes.push({ x, y, r: 7 + rnd() * 11, c: dotColors[Math.floor(rnd() * dotColors.length)] });
  }
  const edges = nodes.map((n) => `<line x1="${cx.toFixed(0)}" y1="${cy.toFixed(0)}" x2="${n.x.toFixed(0)}" y2="${n.y.toFixed(0)}" stroke="#ffffff" stroke-opacity="0.14"/>`).join("");
  const rings = [130, 220].map((r, i) => `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r}" fill="none" stroke="#ffffff" stroke-opacity="${0.16 - i * 0.05}" ${i === 0 ? 'stroke-dasharray="6 8"' : ""}/>`).join("");
  const dots = nodes.map((n) => `<circle cx="${n.x.toFixed(0)}" cy="${n.y.toFixed(0)}" r="${n.r.toFixed(0)}" fill="${n.c}"/>`).join("");
  const hub = `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="42" fill="${accent}"/>`;
  return rings + edges + dots + hub;
}

function drawMotif(kind: Motif, rnd: () => number, accent: string): string {
  switch (kind) {
    case "gauge": return gaugeMotif(rnd, accent);
    case "donut": return donutMotif(rnd, accent);
    case "bars": return barsMotif(rnd, accent);
    case "area": return areaMotif(rnd, accent);
    case "radar": return radarMotif(rnd, accent);
    case "sparkstat": return sparkstatMotif(rnd, accent);
    case "dotmatrix": return dotmatrixMotif(rnd, accent);
    case "nodes": return nodesMotif(rnd, accent);
  }
}

export function renderCoverSvg(opts: { title?: string; cat?: string; tone?: string; seed?: number }): string {
  const title = (opts.title || "FPT-IS Next Gen Service").slice(0, 140);
  const cat = (opts.cat || "FPT-IS NS").slice(0, 40);
  const rawTone = opts.tone || "0072BC";
  const accent = "#" + (/^#?[0-9a-fA-F]{6}$/.test(rawTone) ? rawTone.replace("#", "") : "0072BC");
  const extra = (opts.seed ?? 0) >>> 0;
  const rnd = mulberry32((seedFrom(title + cat) ^ extra) >>> 0);
  const W = 1200, H = 630;

  const grid: string[] = [];
  for (let x = 0; x <= W; x += 60) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#ffffff" stroke-opacity="0.05"/>`);
  for (let y = 0; y <= H; y += 60) grid.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#ffffff" stroke-opacity="0.05"/>`);

  // Topic gives a candidate set; title seed picks which one → per-article variety.
  const cands = candidatesFor(cat, title);
  // `>>> 0` keeps the XOR result unsigned — otherwise a high bit makes it a
  // negative int and `% length` yields a negative index → undefined motif.
  const kind = cands[((seedFrom(title) ^ extra) >>> 0) % cands.length];
  const motif = drawMotif(kind, rnd, accent);

  const words = title.split(/\s+/);
  const l1: string[] = [], l2: string[] = [];
  for (const w of words) { if (l1.join(" ").length < 26) l1.push(w); else if (l2.join(" ").length < 28) l2.push(w); }
  const more = words.length > l1.length + l2.length;
  const titleSvg = `<text x="72" y="196" font-size="34" font-weight="800" fill="#ffffff">${esc(l1.join(" "))}</text>` +
    (l2.length ? `<text x="72" y="238" font-size="34" font-weight="800" fill="#ffffff">${esc(l2.join(" "))}${more ? "…" : ""}</text>` : "");
  const tagW = Math.min(60 + cat.length * 15, 520);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1f3a"/><stop offset="1" stop-color="#0a1526"/></linearGradient>
<radialGradient id="glow" cx="72%" cy="32%" r="65%"><stop offset="0" stop-color="${accent}" stop-opacity="0.22"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<g>${grid.join("")}</g>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
<g font-family="Arial, Helvetica, sans-serif">${motif}</g>
<g font-family="Arial, Helvetica, sans-serif">
<text x="72" y="100" font-size="24" font-weight="800" fill="${accent}" letter-spacing="3">${esc(cat.toUpperCase())}</text>
<rect x="72" y="116" width="${tagW}" height="4" rx="2" fill="${accent}"/>
${titleSvg}
<text x="72" y="582" font-size="20" font-weight="700" fill="#ffffff" fill-opacity="0.8">FPT-IS · Next Gen Service</text>
</g>
<rect x="0" y="${H - 8}" width="${W / 3}" height="8" fill="${BRAND.orange}"/>
<rect x="${W / 3}" y="${H - 8}" width="${W / 3}" height="8" fill="${BRAND.blue}"/>
<rect x="${2 * W / 3}" y="${H - 8}" width="${W / 3}" height="8" fill="${BRAND.green}"/>
</svg>`;
}
