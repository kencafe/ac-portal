// Extract plain text from an uploaded document (Word .docx / PDF / .txt / .md)
// so the AI editor can rewrite it into a publish-ready article.
//
// - .docx → mammoth (raw text)
// - .pdf  → pdf-parse (imported from its lib path to avoid the package's
//           debug harness that reads a bundled test PDF on import)
// - .txt/.md/other text → decoded as UTF-8
import mammoth from "mammoth";

export type Extracted = { title: string; text: string };

function firstLineTitle(text: string, fallback: string): string {
  const line = text.split(/\r?\n/).map((l) => l.trim()).find((l) => l.length > 0) || "";
  return (line.slice(0, 120) || fallback).trim();
}

export async function extractFile(buf: Buffer, filename: string): Promise<Extracted> {
  const name = filename.toLowerCase();
  const base = filename.replace(/\.[^.]+$/, "");

  if (name.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer: buf });
    const text = value.replace(/\n{3,}/g, "\n\n").trim();
    if (!text) throw new Error("File Word rỗng hoặc không đọc được nội dung.");
    return { title: firstLineTitle(text, base), text };
  }

  if (name.endsWith(".pdf")) {
    // Import the inner lib to skip pdf-parse/index.js debug behaviour.
    const mod = await import("pdf-parse/lib/pdf-parse.js");
    const pdf = (mod as unknown as { default: (b: Buffer) => Promise<{ text: string }> }).default;
    const { text: raw } = await pdf(buf);
    const text = raw.replace(/\n{3,}/g, "\n\n").trim();
    if (!text) throw new Error("PDF không có lớp text (có thể là bản scan — cần OCR).");
    return { title: firstLineTitle(text, base), text };
  }

  if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".markdown")) {
    const text = buf.toString("utf8").trim();
    if (!text) throw new Error("File rỗng.");
    return { title: firstLineTitle(text, base), text };
  }

  throw new Error("Định dạng không hỗ trợ. Chỉ nhận .docx, .pdf, .txt, .md");
}
