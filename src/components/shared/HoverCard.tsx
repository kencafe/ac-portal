"use client";

import { CSSProperties, ReactNode, useState } from "react";

/**
 * Card with a hover transform. Merges `hoverStyle` over `style` on mouse-enter.
 * Optional accent corner-triangle drawn in the empty top-right on hover.
 *
 * CONSTRAINT on callers: if `hoverStyle` sets a longhand (borderColor,
 * backgroundColor, ...), `style` must set that same longhand too — never only
 * the shorthand (`border`, `background`). React diffs inline styles by key, so
 * on un-hover it clears a key that hoverStyle introduced by assigning "". A
 * cleared longhand does NOT fall back to the shorthand sitting in `style`; it
 * falls back to the CSS initial value, and `border-color`'s initial value is
 * currentColor. That is what left industry cards with a near-black 1px border
 * after the pointer moved away, while untouched cards looked correct.
 * `assertNoShorthandTrap` below fails loudly in development instead of letting
 * the next caller rediscover this the slow way.
 */
const SHORTHAND_TRAPS: [keyof CSSProperties, (keyof CSSProperties)[]][] = [
  ["border", ["borderColor", "borderWidth", "borderStyle"]],
  ["background", ["backgroundColor"]],
  ["padding", ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]],
  ["margin", ["marginTop", "marginRight", "marginBottom", "marginLeft"]],
];

function assertNoShorthandTrap(style: CSSProperties, hoverStyle: CSSProperties) {
  if (process.env.NODE_ENV === "production") return;
  for (const [shorthand, longhands] of SHORTHAND_TRAPS) {
    if (style[shorthand] === undefined) continue;
    for (const lh of longhands) {
      if (hoverStyle[lh] !== undefined && style[lh] === undefined) {
        console.error(
          `HoverCard: hoverStyle sets "${String(lh)}" but style only sets the ` +
            `"${String(shorthand)}" shorthand. On un-hover React clears ` +
            `"${String(lh)}" and it resolves to its initial value, not to the ` +
            `shorthand — set "${String(lh)}" in style as well.`,
        );
      }
    }
  }
}
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

  assertNoShorthandTrap(style, hoverStyle);

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
