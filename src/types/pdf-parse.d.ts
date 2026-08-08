// pdf-parse ships no types for its internal lib entry; declare the minimal
// shape we use (import via the lib path avoids the package's debug harness).
declare module "pdf-parse/lib/pdf-parse.js" {
  interface PdfParseResult {
    text: string;
    numpages: number;
    info: unknown;
  }
  function pdf(data: Buffer | Uint8Array): Promise<PdfParseResult>;
  export default pdf;
}
