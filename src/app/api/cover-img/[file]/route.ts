import { getImage } from "@/lib/storage";

export const dynamic = "force-dynamic";

// Serve a stored cover image (MinIO when configured, else the PVC — see
// lib/storage). 404 → the caller's <CoverArt> falls back to the generated
// title-card.
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  // No path traversal — filename only.
  if (!/^[a-z0-9._-]+\.(png|jpg|jpeg|webp|gif|svg)$/i.test(file)) {
    return new Response("bad request", { status: 400 });
  }
  const img = await getImage(file);
  if (!img) return new Response("not found", { status: 404 });
  return new Response(new Uint8Array(img.buf), {
    headers: { "content-type": img.contentType, "cache-control": "public, max-age=31536000, immutable" },
  });
}
