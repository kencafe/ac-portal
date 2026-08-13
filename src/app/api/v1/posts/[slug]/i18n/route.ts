import { NextRequest, NextResponse } from "next/server";
import { getOrTranslatePostEn } from "@/lib/i18n-posts";

// GET /api/v1/posts/[slug]/i18n → English translation of the post body (AC-010b).
// Public (same as the post itself). Translates on first call, then serves the
// cached copy. Returns 503 when no LLM is configured so the client keeps VN.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const en = await getOrTranslatePostEn(slug);
  if (!en) return NextResponse.json({ error: "translation unavailable" }, { status: 503 });
  return NextResponse.json(en);
}
