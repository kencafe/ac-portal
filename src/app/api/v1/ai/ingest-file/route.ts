import { getIdentity, hasRole, CAN_WRITE } from "@/lib/identity";
import { extractFile } from "@/lib/extract";
import { ingestText } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// AI-edit an uploaded Word/PDF/text file into a post. Writer role required.
// forcePublish=1 publishes straight away (publisher/admin would normally gate,
// but file ingest lands as a draft by default so the human stays in the loop).
export async function POST(req: Request) {
  const id = await getIdentity();
  if (!hasRole(id, CAN_WRITE)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Thiếu file" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return Response.json({ error: "File quá lớn (>10MB)" }, { status: 400 });

  const cat = (form?.get("cat") as string) || "AIOps";
  const forcePublish = (form?.get("publish") as string) === "1";

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const { title, text } = await extractFile(buf, file.name);
    const result = await ingestText(title, text, {
      forcePublish,
      cat,
      mode: "file",
      source: file.name,
      note: `upload: ${file.name}`,
    });
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 422 });
  }
}
