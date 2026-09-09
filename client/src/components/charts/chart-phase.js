export const DEFAULT_CHART_STATUS = "ready";

/** Default Y-domain tween when transitioning loading ↔ ready (ms). */
export const DEFAULT_Y_DOMAIN_TWEEN_MS = 500;

/** Relative domain delta below which Y tween may be skipped (see plan). */
export const Y_DOMAIN_TWEEN_SKIP_THRESHOLD = 0.02;

/** Resting phase for a given status before transition orchestration runs. */
export function resolveRestingChartPhase(status) {
  return status === "loading" ? "loading" : "ready";
}

export function isChartInteractionPhase(phase) {
  return phase === "ready";
}

export const DEFAULT_CHART_LIFECYCLE = {
  chartPhase: "ready",
  chartStatus: "ready",
  loadingLabel: undefined,
  yDomainTweenDuration: DEFAULT_Y_DOMAIN_TWEEN_MS,
  yDomainSkeletonByAxis: { left: [0, 100] },
  yDomainTargetByAxis: { left: [0, 100] }
};
