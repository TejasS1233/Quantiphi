import { useId } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

/** ReUI c-chart-23 pattern (gradient radar) bound to live axes [{ axis, score }]. */
export function FxRadar({ title, description, axes = [], color = "var(--chart-1)" }) {
  const uid = useId().replace(/:/g, "");
  const config = { score: { label: "Range position", color } };

  return (
    <Card className="h-full w-full">
      <CardHeader className="items-center pb-0 text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={config} className="mx-auto aspect-square max-h-[300px]">
          <RadarChart accessibilityLayer data={axes}>
            <defs>
              <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-score)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--color-score)" stopOpacity={0.08} />
              </linearGradient>
              <filter id={`${uid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <ChartTooltip content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12 }} />
            <PolarGrid strokeDasharray="3 3" />
            <Radar
              dataKey="score"
              fill={`url(#${uid}-fill)`}
              stroke="var(--color-score)"
              strokeWidth={2}
              filter={`url(#${uid}-glow)`}
              dot={{ r: 4, fill: "var(--color-score)", strokeWidth: 0 }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
