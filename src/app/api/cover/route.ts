// Generated cover ILLUSTRATION for posts without a photo. Returns a branded SVG
// graphic in the style of the hand-designed seed covers (dark grid + an abstract
// tech motif), not a plain text card. The motif and layout are seeded from the
// title so each post gets a distinct-looking image. Server-rendered & cacheable.

export const dynamic = "force-dynamic";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Deterministic PRNG so a given title always renders the same image.
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

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const title = (p.get("title") || "FPT-IS Next Gen Service").slice(0, 140);
  const cat = (p.get("cat") || "FPT-IS NS").slice(0, 40);
  const rawTone = p.get("tone") || "0072BC";
  const accent = "#" + (/^#?[0-9a-fA-F]{6}$/.test(rawTone) ? rawTone.replace("#", "") : "0072BC");

  const rnd = mulberry32(seedFrom(title + cat));
  const W = 1200, H = 630;

  // Dark navy backdrop + faint grid (seed-cover style).
  const grid: string[] = [];
  for (let x = 0; x <= W; x += 60) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#ffffff" stroke-opacity="0.05"/>`);
  for (let y = 0; y <= H; y += 60) grid.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#ffffff" stroke-opacity="0.05"/>`);

  // Network motif: a hub + orbiting nodes with connecting edges, placed to the
  // right so the category tag on the left stays clear.
  const cx = 760 + rnd() * 120, cy = 300 + rnd() * 60;
  const dotColors = [accent, "#F37021", "#57A336", "#4AA3E0", "#ffffff"];
  const nodes: { x: number; y: number; r: number; c: string }[] = [];
  const count = 6 + Math.floor(rnd() * 4);
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2 + rnd() * 0.6;
    const rad = 120 + rnd() * 170;
    nodes.push({ x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad * 0.8, r: 7 + rnd() * 12, c: dotColors[Math.floor(rnd() * dotColors.length)] });
  }
  const edges = nodes.map((n) => `<line x1="${cx.toFixed(0)}" y1="${cy.toFixed(0)}" x2="${n.x.toFixed(0)}" y2="${n.y.toFixed(0)}" stroke="#ffffff" stroke-opacity="0.14"/>`).join("");
  const rings = [150, 250, 340].map((r, i) => `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r}" fill="none" stroke="#ffffff" stroke-opacity="${0.16 - i * 0.04}" ${i === 1 ? 'stroke-dasharray="6 8"' : ""}/>`).join("");
  const dots = nodes.map((n) => `<circle cx="${n.x.toFixed(0)}" cy="${n.y.toFixed(0)}" r="${n.r.toFixed(0)}" fill="${n.c}"/>`).join("");
  const hub = `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="46" fill="${accent}"/><circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="60" fill="none" stroke="${accent}" stroke-width="2"/>`;

  // Short title (2 lines) — small, secondary to the graphic.
  const words = title.split(/\s+/);
  const l1: string[] = [], l2: string[] = [];
  for (const w of words) {
    if (l1.join(" ").length < 22) l1.push(w);
    else if (l2.join(" ").length < 24) l2.push(w);
  }
  const titleSvg = `<text x="72" y="250" font-size="40" font-weight="800" fill="#ffffff">${esc(l1.join(" "))}</text>` +
    (l2.length ? `<text x="72" y="300" font-size="40" font-weight="800" fill="#ffffff">${esc(l2.join(" "))}${words.length > l1.length + l2.length ? "…" : ""}</text>` : "");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1f3a"/><stop offset="1" stop-color="#0a1526"/>
    </linearGradient>
    <radialGradient id="glow" cx="${((cx / W) * 100).toFixed(0)}%" cy="${((cy / H) * 100).toFixed(0)}%" r="60%">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.28"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g>${grid.join("")}</g>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <g>${rings}${edges}${dots}${hub}</g>
  <g font-family="Arial, Helvetica, sans-serif">
    <text x="72" y="150" font-size="24" font-weight="800" fill="${accent}" letter-spacing="3">${esc(cat.toUpperCase())}</text>
    <rect x="72" y="166" width="${Math.min(48 + cat.length * 14, 460)}" height="4" rx="2" fill="${accent}"/>
    ${titleSvg}
    <text x="72" y="574" font-size="22" font-weight="700" fill="#ffffff" fill-opacity="0.85">FPT-IS · Next Gen Service</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=31536000, immutable" },
  });
}
