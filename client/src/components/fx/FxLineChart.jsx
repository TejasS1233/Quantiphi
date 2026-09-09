import { LineChart, Line } from "@/components/charts/line-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";

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
}) {
  const data = (points || []).map((p) => ({
    date: p.date instanceof Date ? p.date : new Date(`${p.date}T00:00:00`),
    [dataKey]: p.rate ?? p.value,
    ...(p.extra || {}),
  }));

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
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}
