// Generated cover ILLUSTRATION for posts without a photo. Returns a branded,
// content-aware "dashboard card" SVG in the style of the hand-designed seed
// covers (dark grid + a chart motif chosen from the topic). Server-rendered &
// cacheable. See lib/cover.ts for the generator.

import { renderCoverSvg } from "@/lib/cover";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const seedRaw = p.get("seed") || p.get("v") || "";
  const seed = /^\d+$/.test(seedRaw) ? Number(seedRaw) % 0xffffffff : 0;
  const svg = renderCoverSvg({
    title: p.get("title") || undefined,
    cat: p.get("cat") || undefined,
    tone: p.get("tone") || undefined,
    seed,
  });
  return new Response(svg, {
    headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=31536000, immutable" },
  });
}
