import { useId } from "react";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const fmtDay = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });

/** ReUI c-chart-7 pattern (gradient bars) bound to live daily % changes. */
export function FxChangeBars({ title, description, changes = [] }) {
  const uid = useId().replace(/:/g, "");
  const data = changes.slice(-14).map((c) => ({ label: fmtDay(c.date), change: Number(c.change.toFixed(3)) }));
  const config = { change: { label: "Daily change %", color: "var(--chart-1)" } };

  const GradientBar = (props) => {
    const { x, y, width, height, value } = props;
    const up = (value ?? 0) >= 0;
    return (
      <>
        <defs>
          <linearGradient id={`${uid}-${up ? "up" : "dn"}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={up ? "var(--success)" : "var(--destructive)"} stopOpacity={0.85} />
            <stop offset="100%" stopColor={up ? "var(--success)" : "var(--destructive)"} stopOpacity={0.15} />
          </linearGradient>
        </defs>
        <rect x={x} y={y} width={width} height={Math.max(height, 2)} rx="5" ry="5" stroke="none" fill={`url(#${uid}-${up ? "up" : "dn"})`} />
      </>
    );
  };

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart accessibilityLayer data={data} margin={{ top: 12, right: 12, bottom: 12, left: 12 }} barCategoryGap="22%">
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={20} />
            <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v) => `${v}%`} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="change" shape={<GradientBar />} radius={[5, 5, 5, 5]}>
              {data.map((d, i) => (
                <Cell key={i} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
