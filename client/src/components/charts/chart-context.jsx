"use client";;
import { createContext, useContext, useMemo } from "react";
import { DEFAULT_Y_AXIS_ID } from "./y-axis-scales";

// CSS variable references for theming
export const chartCssVars = {
  background: "var(--chart-background)",
  foreground: "var(--chart-foreground)",
  foregroundMuted: "var(--chart-foreground-muted)",
  label: "var(--chart-label)",
  linePrimary: "var(--chart-line-primary)",
  lineSecondary: "var(--chart-line-secondary)",
  crosshair: "var(--chart-crosshair)",
  grid: "var(--chart-grid)",
  indicatorColor: "var(--chart-indicator-color)",
  indicatorSecondaryColor: "var(--chart-indicator-secondary-color)",
  markerBackground: "var(--chart-marker-background)",
  markerBorder: "var(--chart-marker-border)",
  markerForeground: "var(--chart-marker-foreground)",
  badgeBackground: "var(--chart-marker-badge-background)",
  badgeForeground: "var(--chart-marker-badge-foreground)",
  segmentBackground: "var(--chart-segment-background)",
  segmentLine: "var(--chart-segment-line)",
  brushBorder: "var(--chart-brush-border)",
  tooltipBackground: "var(--chart-tooltip-background)",
};

/** Default scatter series colors from the chart palette (`--chart-1` … `--chart-5`). */
export const defaultScatterColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)"
];

const ChartStableContext = createContext(null);
const ChartHoverContext = createContext(null);

/**
 * Splits the merged `value` into a stable slice and a volatile hover slice,
 * publishing each to its own context. Each slice is memoized on its own
 * field identities, so changing `tooltipData` does not bust the stable
 * slice — consumers of `useChartStable()` skip re-renders on hover.
 */
export function ChartProvider({
  children,
  value
}) {
  const stable = useMemo(() => ({
    data: value.data,
    renderData: value.renderData,
    xScale: value.xScale,
    yScale: value.yScale,
    yScales: value.yScales,
    width: value.width,
    height: value.height,
    innerWidth: value.innerWidth,
    innerHeight: value.innerHeight,
    margin: value.margin,
    columnWidth: value.columnWidth,
    containerRef: value.containerRef,
    lines: value.lines,
    referenceAreas: value.referenceAreas,
    chartPhase: value.chartPhase,
    chartStatus: value.chartStatus,
    loadingLabel: value.loadingLabel,
    yDomainTweenDuration: value.yDomainTweenDuration,
    yDomainSkeletonByAxis: value.yDomainSkeletonByAxis,
    yDomainTargetByAxis: value.yDomainTargetByAxis,
    isLoaded: value.isLoaded,
    animationDuration: value.animationDuration,
    animationEasing: value.animationEasing,
    enterTransition: value.enterTransition,
    revealEpoch: value.revealEpoch,
    notifyLoadingPulseComplete: value.notifyLoadingPulseComplete,
    xAccessor: value.xAccessor,
    dateLabels: value.dateLabels,
    xDomain: value.xDomain,
    xDomainSlotCount: value.xDomainSlotCount,
    barScale: value.barScale,
    bandWidth: value.bandWidth,
    barXAccessor: value.barXAccessor,
    orientation: value.orientation,
    stacked: value.stacked,
    stackOffsets: value.stackOffsets,
    composedBarDataKeys: value.composedBarDataKeys,
    composedBarSize: value.composedBarSize,
    composedMaxBarSize: value.composedMaxBarSize,
    composedBarGap: value.composedBarGap,
    composedStacked: value.composedStacked,
    composedStackOffsets: value.composedStackOffsets,
    composedStackGap: value.composedStackGap,
  }), [
    value.data,
    value.renderData,
    value.xScale,
    value.yScale,
    value.yScales,
    value.width,
    value.height,
    value.innerWidth,
    value.innerHeight,
    value.margin,
    value.columnWidth,
    value.containerRef,
    value.lines,
    value.referenceAreas,
    value.chartPhase,
    value.chartStatus,
    value.loadingLabel,
    value.yDomainTweenDuration,
    value.yDomainSkeletonByAxis,
    value.yDomainTargetByAxis,
    value.isLoaded,
    value.animationDuration,
    value.animationEasing,
    value.enterTransition,
    value.revealEpoch,
    value.notifyLoadingPulseComplete,
    value.xAccessor,
    value.dateLabels,
    value.xDomain,
    value.xDomainSlotCount,
    value.barScale,
    value.bandWidth,
    value.barXAccessor,
    value.orientation,
    value.stacked,
    value.stackOffsets,
    value.composedBarDataKeys,
    value.composedBarSize,
    value.composedMaxBarSize,
    value.composedBarGap,
    value.composedStacked,
    value.composedStackOffsets,
    value.composedStackGap,
  ]);

  const hover = useMemo(() => ({
    tooltipData: value.tooltipData,
    setTooltipData: value.setTooltipData,
    selection: value.selection,
    clearSelection: value.clearSelection,
    hoveredBarIndex: value.hoveredBarIndex,
    setHoveredBarIndex: value.setHoveredBarIndex,
    hoveredCandleIndex: value.hoveredCandleIndex,
    setHoveredCandleIndex: value.setHoveredCandleIndex,
  }), [
    value.tooltipData,
    value.setTooltipData,
    value.selection,
    value.clearSelection,
    value.hoveredBarIndex,
    value.setHoveredBarIndex,
    value.hoveredCandleIndex,
    value.setHoveredCandleIndex,
  ]);

  return (
    <ChartStableContext.Provider value={stable}>
      <ChartHoverContext.Provider value={hover}>
        {children}
      </ChartHoverContext.Provider>
    </ChartStableContext.Provider>
  );
}

/**
 * Stable slice — data, scales, dimensions, animation state, layout config.
 * Subscribers skip re-renders on hover (the hover slice lives in a separate
 * context). Prefer this in cold consumers like axes, grid, pattern fills.
 */
export function useChartStable() {
  const context = useContext(ChartStableContext);
  if (!context) {
    throw new Error(
      "useChartStable must be used within a ChartProvider. " +
        "Make sure your component is wrapped in <LineChart>, <AreaChart>, <BarChart>, or <ComposedChart>."
    );
  }
  return context;
}

/** Y-scale for a series axis (`yAxisId` on Line / Area / YAxis). */
export function useYScale(yAxisId) {
  const { yScales, yScale } = useChartStable();
  const id =
    yAxisId == null || yAxisId === "" ? DEFAULT_Y_AXIS_ID : String(yAxisId);
  return yScales[id] ?? yScale;
}

/**
 * Hover slice — tooltipData, selection, hovered bar / candle indices.
 * Subscribers re-render on every mouse move. Use only when the component
 * actually reads hover state.
 */
export function useChartHover() {
  const context = useContext(ChartHoverContext);
  if (!context) {
    throw new Error(
      "useChartHover must be used within a ChartProvider. " +
        "Make sure your component is wrapped in <LineChart>, <AreaChart>, <BarChart>, or <ComposedChart>."
    );
  }
  return context;
}

/**
 * Merged stable + hover context. Convenient for components that need both,
 * but re-renders on every hover (because hover changes). Prefer
 * `useChartStable()` or `useChartHover()` for hot consumers that only need
 * one slice.
 */
export function useChart() {
  const stable = useChartStable();
  const hover = useChartHover();
  // Identity changes on every hover (hover is the volatile slice) — that's
  // fine for consumers using this merged hook; they explicitly opted in to
  // re-rendering on hover.
  return { ...stable, ...hover };
}

export default ChartStableContext;
