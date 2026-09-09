import { useId } from "react";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

/** ReUI c-chart-25 pattern (radial rings) bound to live rings [{ name, label, score, color }]. */
export function FxRadial({ title, description, rings = [] }) {
  const uid = useId().replace(/:/g, "");
  const data = rings.map((r) => ({ ...r, fill: `url(#${uid}-${r.name})` }));
  const config = Object.fromEntries([
    ["score", { label: "Score" }],
    ...rings.map((r) => [r.name, { label: r.label, color: r.color }]),
  ]);

  return (
    <Card className="h-full w-full">
      <CardHeader className="items-center pb-0 text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={config} className="mx-auto aspect-square max-h-[300px]">
          <RadialBarChart data={data} innerRadius={36} outerRadius={112} barSize={22}>
            <defs>
              {rings.map((r) => (
                <linearGradient key={r.name} id={`${uid}-${r.name}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={`var(--color-${r.name})`} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={`var(--color-${r.name})`} stopOpacity={1} />
                </linearGradient>
              ))}
              <filter id={`${uid}-glow`} x="-15%" y="-15%" width="130%" height="130%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="min-w-40 gap-2.5"
                  nameKey="name"
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-muted-foreground">{config[name]?.label || name}</span>
                      <span className="text-foreground font-semibold tabular-nums">{Number(value).toFixed(1)}/100</span>
                    </div>
                  )}
                />
              }
            />
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar dataKey="score" background cornerRadius={10} filter={`url(#${uid}-glow)`} />
            <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-translate-y-2" />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
