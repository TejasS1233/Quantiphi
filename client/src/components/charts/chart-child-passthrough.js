import { Children, cloneElement, Fragment, isValidElement } from "react";

/** Marker on wrapper components whose single child should inherit clip classification. */
export const CHART_CLIP_PASSTHROUGH = "__chartClipPassthrough";

export function isChartClipPassthrough(type) {
  return (typeof type === "function" && (type)[CHART_CLIP_PASSTHROUGH] ===
    true);
}

/** Unwrap visibility wrappers so `Grid` / axes stay outside the series clip. */
export function resolveChartChildElement(child) {
  if (isChartClipPassthrough(child.type)) {
    const inner = (child.props).children;
    if (isValidElement(inner)) {
      return resolveChartChildElement(inner);
    }
  }
  return child;
}

/** Walk chart children, flattening React fragments (studio often groups layers in `<>...</>`). */
export function forEachChartChild(
  children,
  callback
) {
  let index = 0;
  const visit = (nodes) => {
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) {
        return;
      }
      if (child.type === Fragment) {
        visit((child.props).children);
        return;
      }
      callback(child, index);
      index += 1;
    });
  };
  visit(children);
}

const CLIP_EXCLUDED_COMPONENT_NAMES = new Set([
  "Background",
  "Grid",
  "XAxis",
  "YAxis",
  "BarXAxis",
  "BarYAxis",
  "LiveXAxis",
  "LiveYAxis",
]);

const UNDERLAY_COMPONENT_NAMES = new Set(["ReferenceArea", "BarColumnTrack"]);

/** Markers render after the interaction overlay so they stay clickable. */
export function isPostOverlayComponent(child) {
  const childType = child.type;

  if (childType.__isChartMarkers || childType.__isPostOverlay) {
    return true;
  }

  const componentName =
    typeof child.type === "function"
      ? childType.displayName || childType.name || ""
      : "";

  return (
    componentName === "ChartMarkers" ||
    componentName === "MarkerGroup" ||
    componentName === "ChartBrush"
  );
}

/** Renders above grid/axes but below series; excluded from grow-clip reveal. */
export function isUnderlayComponent(child) {
  const childType = child.type;
  const componentName =
    typeof child.type === "function"
      ? childType.displayName || childType.name || ""
      : "";
  return UNDERLAY_COMPONENT_NAMES.has(componentName);
}

/** Grid and axes stay visible during series clip reveal (e.g. loading → ready). */
export function isClipExcludedComponent(child) {
  const childType = child.type;
  const componentName =
    typeof child.type === "function"
      ? childType.displayName || childType.name || ""
      : "";
  return CLIP_EXCLUDED_COMPONENT_NAMES.has(componentName);
}

/** SVG layer lists from chart shells need stable keys when rendered as arrays. */
export function renderKeyedChartLayers(children) {
  return children.map((child, index) =>
    cloneElement(child, { key: child.key ?? `chart-layer-${index}` })
  );
}
