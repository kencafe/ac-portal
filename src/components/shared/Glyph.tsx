import { SERVICE_GLYPHS, SERVICE_SVG_ATTRS } from "@/data/landing";

/** Renders one of the 9 hand-drawn service glyphs (inner SVG markup, verbatim). */
export default function Glyph({
  slug,
  size = 24,
  color = "#fff",
  strokeWidth,
}: {
  slug: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const inner = SERVICE_GLYPHS[slug] ?? "";
  return (
    <svg
      width={size}
      height={size}
      viewBox={SERVICE_SVG_ATTRS.viewBox}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth ?? Number(SERVICE_SVG_ATTRS.strokeWidth)}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block" }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}

/** The 46×46 solid code plate carrying a glyph (service cards / hero). */
export function ServicePlate({
  slug,
  accentColor,
  size = 46,
  radius = 10,
  glyphSize = 24,
}: {
  slug: string;
  accentColor: string;
  size?: number;
  radius?: number;
  glyphSize?: number;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: radius,
        background: accentColor,
        flexShrink: 0,
      }}
    >
      <Glyph slug={slug} size={glyphSize} color="#fff" />
    </span>
  );
}
