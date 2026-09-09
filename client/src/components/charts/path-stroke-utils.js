// biome-ignore-all lint/correctness/useExhaustiveDependencies: usePathStrokeMetrics intentionally accepts caller-controlled deps
import { useEffect, useState } from "react";

export function findPathLengthAtX(path, pathLength, targetX) {
  if (!path || pathLength === 0) {
    return 0;
  }
  let low = 0;
  let high = pathLength;
  const tolerance = 0.5;

  while (high - low > tolerance) {
    const mid = (low + high) / 2;
    const point = path.getPointAtLength(mid);
    if (point.x < targetX) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return (low + high) / 2;
}

const EMPTY_METRICS = { pathD: null, pathLength: 0 };

/**
 * Caller passes the references that drive the rendered path (renderData,
 * innerWidth, etc.) as `deps`. A stringified summary like
 * `${renderData.length}:${innerWidth}` is *not* safe here — same-length
 * in-place mutations of `renderData` keep the summary identical, so the
 * effect would never re-fire and `pathD`/`pathLength` would stay frozen on
 * the previous geometry (the area fill repaints from `renderData` directly
 * and would diverge from the stroke).
 */
export function usePathStrokeMetrics(pathRef, deps) {
  const [metrics, setMetrics] = useState(EMPTY_METRICS);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) {
      return;
    }
    const d = path.getAttribute("d");
    const len = d ? path.getTotalLength() : 0;
    setMetrics((prev) =>
      prev.pathD === d && prev.pathLength === len
        ? prev
        : { pathD: d, pathLength: len }
    );
  }, deps);

  return metrics;
}

export function resolveDashTailBounds(dashFromIndex, dataLength) {
  return (
    dashFromIndex != null &&
    dashFromIndex >= 0 &&
    dashFromIndex < dataLength - 1
  );
}

export function resolveDashStartX(data, dashFromIndex, xScale, xAccessor) {
  const dashFromPoint = data[dashFromIndex];
  if (!dashFromPoint) {
    return 0;
  }
  return xScale(xAccessor(dashFromPoint)) ?? 0;
}
