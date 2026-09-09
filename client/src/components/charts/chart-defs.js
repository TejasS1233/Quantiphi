import { Children, isValidElement } from "react";

export function getChartChildComponentName(child) {
  const childType = child.type;
  return typeof child.type === "function"
    ? childType.displayName || childType.name || ""
    : "";
}

const VISX_PATTERN_COMPONENT_NAMES = new Set([
  "Lines",
  "Circles",
  "Waves",
  "Hexagons",
  "Path",
  "Pattern",
]);

/** @visx/pattern default exports use short names (e.g. `Lines`); also match *Pattern* displayNames. */
export function isPatternDefComponent(child) {
  const name = getChartChildComponentName(child);
  return name.includes("Pattern") || VISX_PATTERN_COMPONENT_NAMES.has(name);
}

export function isGradientDefComponent(child) {
  const name = getChartChildComponentName(child);
  return (
    name.includes("Gradient") ||
    name === "LinearGradient" ||
    name === "RadialGradient"
  );
}

export function isChartDefsComponent(child) {
  return isPatternDefComponent(child) || isGradientDefComponent(child);
}

/** Split hoisted defs: @visx/pattern nodes already wrap `<defs>` and render at the svg root. */
export function partitionChartDefNodes(defNodes) {
  const patternDefNodes = [];
  const gradientDefNodes = [];

  for (const node of defNodes) {
    if (isPatternDefComponent(node)) {
      patternDefNodes.push(node);
    } else {
      gradientDefNodes.push(node);
    }
  }

  return { patternDefNodes, gradientDefNodes };
}

export function collectChartDefsChildren(children) {
  const defNodes = [];

  Children.forEach(children, (child) => {
    if (isValidElement(child) && isChartDefsComponent(child)) {
      defNodes.push(child);
    }
  });

  return defNodes;
}
