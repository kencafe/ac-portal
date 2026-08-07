"use client";

import { CSSProperties, ReactNode, useState } from "react";

/**
 * Card with a hover transform. Merges `hoverStyle` over `style` on mouse-enter.
 * Optional accent corner-triangle drawn in the empty top-right on hover.
 */
export default function HoverCard({
  as = "div",
  href,
  style,
  hoverStyle,
  cornerAccent,
  children,
  ariaLabel,
}: {
  as?: "div" | "a";
  href?: string;
  style: CSSProperties;
  hoverStyle: CSSProperties;
  cornerAccent?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const corner: CSSProperties =
    cornerAccent && hover
      ? {
          background: `linear-gradient(225deg, ${cornerAccent} 0 34px, transparent 34px) no-repeat top right / 68px 68px`,
        }
      : {};

  const merged: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    ...style,
    ...(hover ? hoverStyle : null),
    ...(active ? { transform: "translateY(-1px)" } : null),
  };

  const inner = (
    <>
      {cornerAccent && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            ...corner,
          }}
        />
      )}
      {children}
    </>
  );

  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
  };

  if (as === "a" && href) {
    return (
      <a href={href} aria-label={ariaLabel} style={merged} {...handlers}>
        {inner}
      </a>
    );
  }
  return (
    <div style={merged} {...handlers}>
      {inner}
    </div>
  );
}
