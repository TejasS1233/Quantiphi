"use client";;
import { createContext, useContext, useMemo } from "react";

const ChartLegendHoverContext =
  createContext(null);

export function ChartLegendHoverProvider({
  hoveredIndex,
  onHoverChange,
  children
}) {
  const value = useMemo(
    () => ({ hoveredIndex, setHoveredIndex: onHoverChange }),
    [hoveredIndex, onHoverChange]
  );

  return (
    <ChartLegendHoverContext.Provider value={value}>
      {children}
    </ChartLegendHoverContext.Provider>
  );
}

export function useChartLegendHover() {
  const context = useContext(ChartLegendHoverContext);
  return (
    context ?? {
      hoveredIndex: null,
      setHoveredIndex: () => {
        /* noop outside ChartLegendHoverProvider */
      },
    }
  );
}
