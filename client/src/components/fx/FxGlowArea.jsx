import { useId } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/reui/badge";
import { TrendingUpIcon } from "lucide-react";

const fmtDay = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });

/** ReUI c-chart-16 pattern (glowing area) bound to live { date, rate } points. */
export function FxGlowArea({ title, description, points = [], badgeText, color = "var(--chart-1)" }) {
  const uid = useId().replace(/:/g, "");
  const data = points.map((p) => ({ label: fmtDay(p.date), value: p.rate }));
  const config = { value: { label: title, color } };

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>
          {title}
          {badgeText && (
            <Badge variant="success-light" className="ml-2">
              <TrendingUpIcon aria-hidden="true" />
              {badgeText}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <AreaChart accessibilityLayer data={data} margin={{ top: 20, right: 2, bottom: 0, left: 2 }}>
            <defs>
              <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
              </linearGradient>
              <filter id={`${uid}-dot`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id={`${uid}-line`} x="-10%" y="-20%" width="120%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="value"
              type="natural"
              fill={`url(#${uid}-fill)`}
              stroke="var(--color-value)"
              strokeWidth={2}
              filter={`url(#${uid}-line)`}
              dot={{ r: 4, fill: "var(--color-value)", strokeWidth: 2, stroke: "var(--background)", filter: `url(#${uid}-dot)` }}
              activeDot={{ r: 6, strokeWidth: 3, stroke: "var(--background)" }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
