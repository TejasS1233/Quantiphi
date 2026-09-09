export function resolveFadeSides(fade) {
  if (fade === false) {
    return { left: false, right: false, any: false };
  }
  if (fade === "left") {
    return { left: true, right: false, any: true };
  }
  if (fade === "right") {
    return { left: false, right: true, any: true };
  }
  return { left: true, right: true, any: true };
}

/**
 * Stops for a horizontal fade gradient with opacity 0 at the faded side(s)
 * and opacity 1 in the middle. Matches the historic 0/15/85/100 pattern.
 */
export function fadeGradientStops(sides) {
  return [
    { offset: "0%", opacity: sides.left ? 0 : 1 },
    { offset: "15%", opacity: 1 },
    { offset: "85%", opacity: 1 },
    { offset: "100%", opacity: sides.right ? 0 : 1 },
  ];
}

/** Horizontal fade gradient pinned to the chart viewport (not the series path bounds). */
export function viewportFadeGradientAttrs(innerWidth) {
  return {
    gradientUnits: "userSpaceOnUse",
    x1: 0,
    x2: innerWidth,
    y1: 0,
    y2: 0,
  };
}
