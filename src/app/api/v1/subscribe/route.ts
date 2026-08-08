import { addSubscriber } from "@/lib/subscribers";

export const dynamic = "force-dynamic";

// Public opt-in from the blog. No auth — anyone can subscribe with their email.
export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  if (!email) return Response.json({ error: "Thiếu email" }, { status: 400 });
  const r = await addSubscriber(email);
  if (r === "invalid") return Response.json({ error: "Email không hợp lệ" }, { status: 400 });
  return Response.json({ status: r }); // "added" | "exists"
}
