// Generated cover image for posts without a real photo. Returns a branded SVG
// title-card (gradient + category + wrapped title + NS wordmark) as an actual
// image — server-rendered, cacheable, works everywhere (cards, article hero,
// OG previews) with no client-side flash. Used as the AI-post cover fallback.

export const dynamic = "force-dynamic";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Greedy word-wrap to at most `maxLines` lines of ~`max` chars.
function wrap(title: string, max = 22, maxLines = 4): string[] {
  const words = title.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
      if (lines.length === maxLines - 1) break;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  const rest = words.slice(lines.join(" ").split(/\s+/).filter(Boolean).length).join(" ");
  if (rest) cur = rest;
  if (cur) lines.push(cur.length > max + 6 ? cur.slice(0, max + 5) + "…" : cur);
  return lines.slice(0, maxLines);
}

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const title = (p.get("title") || "FPT-IS Next Gen Service").slice(0, 140);
  const cat = (p.get("cat") || "FPT-IS NS").slice(0, 40);
  const rawTone = p.get("tone") || "0072BC";
  const tone = "#" + (/^#?[0-9a-fA-F]{6}$/.test(rawTone) ? rawTone.replace("#", "") : "0072BC");

  const lines = wrap(title);
  const startY = 300 - (lines.length - 1) * 34;
  const tspans = lines
    .map((ln, i) => `<tspan x="80" y="${startY + i * 68}">${esc(ln)}</tspan>`)
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${tone}"/>
      <stop offset="1" stop-color="${tone}" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="1080" cy="120" r="120" fill="none" stroke="#ffffff" stroke-opacity="0.14" stroke-width="2"/>
  <circle cx="1140" cy="560" r="190" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"/>
  <g font-family="Arial, Helvetica, sans-serif">
    <rect x="80" y="150" rx="6" ry="6" width="${Math.min(60 + cat.length * 15, 520)}" height="42" fill="#ffffff" fill-opacity="0.20"/>
    <text x="102" y="178" font-size="22" font-weight="700" fill="#ffffff" letter-spacing="1">${esc(cat.toUpperCase())}</text>
    <text font-size="52" font-weight="800" fill="#ffffff">${tspans}</text>
    <text x="80" y="560" font-size="24" font-weight="700" fill="#ffffff" fill-opacity="0.92">FPT-IS · Next Gen Service</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
