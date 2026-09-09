import { LineChart, Line } from "@/components/charts/line-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { INDEX_PALETTE } from "@/hooks/useMultiTrend.js";

/** Bklit multi-line chart over merged indexed rows (all series = 100 at start). */
export function FxIndexChart({ rows = [], keys = [], loading = false, aspectRatio = "2.6 / 1" }) {
  return (
    <LineChart
      data={rows}
      status={loading ? "loading" : "ready"}
      loadingLabel="Loading comparison…"
      aspectRatio={aspectRatio}
      yDomainTween
    >
      <Grid horizontal />
      {keys.map((k, i) => (
        <Line
          key={k}
          dataKey={k}
          stroke={INDEX_PALETTE[i % INDEX_PALETTE.length]}
          strokeWidth={2.5}
          fadeEdges
        />
      ))}
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}
