import { promises as fsp } from "fs";
import path from "path";
import { getIdentity, hasRole, CAN_WRITE } from "@/lib/identity";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");

// Upload a cover image (manual editor). Saves to the PVC and returns its URL.
export async function POST(req: Request) {
  const id = await getIdentity();
  if (!hasRole(id, CAN_WRITE)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const slug = ((form?.get("slug") as string) || "cover").replace(/[^a-z0-9._-]/gi, "-").slice(0, 60) || "cover";
  if (!(file instanceof File)) return Response.json({ error: "Thiếu file" }, { status: 400 });
  if (!/^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(file.type)) return Response.json({ error: "Chỉ nhận ảnh (png/jpg/webp/gif/svg)" }, { status: 400 });
  if (file.size > 6 * 1024 * 1024) return Response.json({ error: "Ảnh quá lớn (>6MB)" }, { status: 400 });

  const ext = file.type.includes("svg") ? "svg" : file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : file.type.includes("gif") ? "gif" : "jpg";
  const name = `${slug}-up.${ext}`;
  try {
    await fsp.mkdir(path.join(DATA_DIR, "covers"), { recursive: true });
    await fsp.writeFile(path.join(DATA_DIR, "covers", name), Buffer.from(await file.arrayBuffer()));
    return Response.json({ url: `/api/cover-img/${name}` });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
