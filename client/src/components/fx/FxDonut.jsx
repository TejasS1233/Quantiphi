import { Cell, Label, Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/** ReUI-style donut (c-chart-19 pattern) bound to live data. */
export function FxDonut({ title, centerLabel, centerValue, slices = [] }) {
  const config = Object.fromEntries(
    slices.map((s, i) => [s.name, { label: s.name, color: PALETTE[i % PALETTE.length] }])
  );
  const total = slices.reduce((a, s) => a + (s.value || 0), 0);

  return (
    <ChartContainer config={config} className="mx-auto aspect-square max-h-72">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie data={slices} dataKey="value" nameKey="name" innerRadius={64} outerRadius={96} strokeWidth={2} stroke="var(--background)">
          {slices.map((s, i) => (
            <Cell key={s.name} fill={PALETTE[i % PALETTE.length]} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !("cx" in viewBox)) return null;
              return (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground font-display text-2xl font-bold">
                    {centerValue ?? total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </tspan>
                  <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 22} className="fill-muted-foreground text-xs">
                    {centerLabel ?? title ?? "Total"}
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
