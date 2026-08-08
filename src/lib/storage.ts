// Image object storage. Writes/reads go to MinIO (S3) when MINIO_ENDPOINT is
// configured, otherwise fall back to the PVC (DATA_DIR/covers) so local dev and
// a MinIO-less cluster keep working. Reads always try MinIO first then the PVC,
// so images uploaded before MinIO existed are still served (no migration
// needed). Object keys are plain filenames; images are served through
// /api/cover-img/<key> (same-origin, keeps CSP simple).

import { promises as fsp } from "fs";
import path from "path";
import { Client as MinioClient } from "minio";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const BUCKET = process.env.MINIO_BUCKET || "covers";
const ENDPOINT = process.env.MINIO_ENDPOINT || "";

let _client: MinioClient | null | undefined;
function client(): MinioClient | null {
  if (_client !== undefined) return _client;
  _client = ENDPOINT
    ? new MinioClient({
        endPoint: ENDPOINT,
        port: Number(process.env.MINIO_PORT || 9000),
        useSSL: process.env.MINIO_USE_SSL === "true",
        accessKey: process.env.MINIO_ACCESS_KEY || "",
        secretKey: process.env.MINIO_SECRET_KEY || "",
      })
    : null;
  return _client;
}

function guessType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  return ext === "jpg" || ext === "jpeg" ? "image/jpeg"
    : ext === "webp" ? "image/webp"
    : ext === "gif" ? "image/gif"
    : ext === "svg" ? "image/svg+xml"
    : "image/png";
}

// Store an image object. MinIO when configured, else the PVC.
export async function putImage(name: string, buf: Buffer, contentType: string): Promise<void> {
  const c = client();
  if (c) {
    await c.putObject(BUCKET, name, buf, buf.length, { "Content-Type": contentType });
    return;
  }
  await fsp.mkdir(path.join(DATA_DIR, "covers"), { recursive: true });
  await fsp.writeFile(path.join(DATA_DIR, "covers", name), buf);
}

// Fetch an image object. Tries MinIO first (when configured), then the PVC, so
// pre-MinIO uploads still resolve. Returns null when the object is absent.
export async function getImage(name: string): Promise<{ buf: Buffer; contentType: string } | null> {
  const c = client();
  if (c) {
    try {
      const stat = await c.statObject(BUCKET, name).catch(() => null);
      const stream = await c.getObject(BUCKET, name);
      const chunks: Buffer[] = [];
      for await (const ch of stream as AsyncIterable<Buffer>) chunks.push(ch);
      return { buf: Buffer.concat(chunks), contentType: stat?.metaData?.["content-type"] || guessType(name) };
    } catch {
      /* not in MinIO — try the PVC below */
    }
  }
  try {
    const buf = await fsp.readFile(path.join(DATA_DIR, "covers", name));
    return { buf, contentType: guessType(name) };
  } catch {
    return null;
  }
}
