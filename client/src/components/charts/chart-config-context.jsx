"use client";;
import { createContext, useContext, useMemo } from "react";

export const DEFAULT_CHART_CONFIG = {
  tooltipSpring: { stiffness: 300, damping: 30 },
  tooltipBoxSpring: { stiffness: 100, damping: 20 },
  highlightSpring: { stiffness: 180, damping: 28 },
};

const ChartConfigContext = createContext(null);

export function ChartConfigProvider({
  value,
  children
}) {
  const merged = useMemo(() => ({
    ...DEFAULT_CHART_CONFIG,
    ...value,
  }), [value]);

  return (
    <ChartConfigContext.Provider value={merged}>
      {children}
    </ChartConfigContext.Provider>
  );
}

export function useChartConfig() {
  return useContext(ChartConfigContext) ?? DEFAULT_CHART_CONFIG;
}

const DEFAULT_TOOLTIP_BOX_DAMPING =
  DEFAULT_CHART_CONFIG.tooltipBoxSpring.damping;

/** Maps a damping slider to the floating tooltip panel follow spring. `0` = instant. */
export function resolveTooltipBoxMotion(damping) {
  if (damping === 0) {
    return {
      animate: false,
      springConfig: DEFAULT_CHART_CONFIG.tooltipBoxSpring,
    };
  }

  const effectiveDamping = damping ?? DEFAULT_TOOLTIP_BOX_DAMPING;
  let stiffness = DEFAULT_CHART_CONFIG.tooltipBoxSpring.stiffness;

  if (effectiveDamping < DEFAULT_TOOLTIP_BOX_DAMPING) {
    const t =
      (DEFAULT_TOOLTIP_BOX_DAMPING - effectiveDamping) /
      DEFAULT_TOOLTIP_BOX_DAMPING;
    stiffness += t * 400;
  } else if (effectiveDamping > DEFAULT_TOOLTIP_BOX_DAMPING) {
    const t =
      (effectiveDamping - DEFAULT_TOOLTIP_BOX_DAMPING) /
      (100 - DEFAULT_TOOLTIP_BOX_DAMPING);
    stiffness -= t * 85;
  }

  return {
    animate: true,
    springConfig: {
      stiffness: Math.max(12, Math.round(stiffness)),
      damping: effectiveDamping,
    },
  };
}
