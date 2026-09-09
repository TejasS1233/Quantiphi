import { useMemo } from "react";
import { LineChart, Line } from "@/components/charts/line-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { ProjectionLine } from "@/components/charts/projection-line";
import { LineSeriesTerminalMarker } from "@/components/charts/line-series-terminal-marker";
import { buildProjectionPath } from "@/components/charts/projection-utils";

/**
 * Bklit line chart bound to FX trend points [{ date, rate }].
 * `series` optionally renders extra lines: [{ key, stroke }].
 */
export function FxLineChart({
  points = [],
  dataKey = "rate",
  series = [],
  stroke = "var(--chart-line-primary)",
  loading = false,
  label = "Loading market data…",
  aspectRatio = "2.4 / 1",
  forecast = false,
}) {
  const data = (points || []).map((p) => ({
    date: p.date instanceof Date ? p.date : new Date(`${p.date}T00:00:00`),
    [dataKey]: p.rate ?? p.value,
    ...(p.extra || {}),
  }));

  const projection = useMemo(() => {
    if (!forecast || data.length < 6) return [];
    try {
      return buildProjectionPath({
        sourceData: data,
        seriesKey: dataKey,
        mode: "auto",
        autoMethod: "lastSegment",
        horizonPoints: 8,
      });
    } catch {
      return [];
    }
  }, [forecast, data, dataKey]);

  return (
    <LineChart
      data={data}
      status={loading ? "loading" : "ready"}
      loadingLabel={label}
      aspectRatio={aspectRatio}
      yDomainTween
    >
      <Grid horizontal />
      <Line dataKey={dataKey} stroke={stroke} strokeWidth={2.5} fadeEdges />
      {series.map((s) => (
        <Line key={s.key} dataKey={s.key} stroke={s.stroke} strokeWidth={2} fadeEdges />
      ))}
      {forecast && projection.length > 1 && (
        <>
          <LineSeriesTerminalMarker dataKey={dataKey} />
          <ProjectionLine data={projection} stroke="var(--chart-3)" strokeDasharray="6,4" curveKind="bezier" showEndMarker />
        </>
      )}
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}
