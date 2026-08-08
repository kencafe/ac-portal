import { promises as fsp } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");

// Serve an AI-generated cover image saved on the PVC (DATA_DIR/covers/<file>).
// 404 → the caller's <CoverArt> falls back to the generated title-card.
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  // No path traversal — filename only.
  if (!/^[a-z0-9._-]+\.(png|jpg|jpeg|webp|gif|svg)$/i.test(file)) {
    return new Response("bad request", { status: 400 });
  }
  try {
    const buf = await fsp.readFile(path.join(DATA_DIR, "covers", file));
    const ext = file.split(".").pop()!.toLowerCase();
    const type = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : ext === "gif" ? "image/gif" : ext === "svg" ? "image/svg+xml" : "image/png";
    return new Response(new Uint8Array(buf), {
      headers: { "content-type": type, "cache-control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
