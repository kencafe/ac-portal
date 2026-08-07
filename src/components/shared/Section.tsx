import { CSSProperties, ReactNode } from "react";
import { COLORS, CONTENT_MAX } from "@/lib/tokens";

/** A page section with the standard 56px vertical rhythm and 1280 container. */
export default function Section({
  id,
  children,
  surface = false,
  bordered = false,
  style,
}: {
  id?: string;
  children: ReactNode;
  surface?: boolean;
  bordered?: boolean;
  style?: CSSProperties;
}) {
  return (
    <section
      id={id}
      style={{
        padding: "56px 24px",
        background: surface ? COLORS.surface : "transparent",
        borderTop: bordered ? `1px solid ${COLORS.split}` : undefined,
        borderBottom: bordered ? `1px solid ${COLORS.split}` : undefined,
        ...style,
      }}
    >
      <div style={{ maxWidth: CONTENT_MAX, margin: "0 auto" }}>{children}</div>
    </section>
  );
}
