import { useEffect, useMemo, useState } from "react";
import { api } from "@/api/client.js";
import { dailyChanges, positionInRange, useMultiTrend } from "@/hooks/useMultiTrend.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/reui/badge";
import { FxLineChart } from "@/components/fx/FxLineChart.jsx";
import { FxIndexChart } from "@/components/fx/FxIndexChart.jsx";
import { FxDonut } from "@/components/fx/FxDonut.jsx";
import { FxGlowArea } from "@/components/fx/FxGlowArea.jsx";
import { FxChangeBars } from "@/components/fx/FxChangeBars.jsx";
import { FxRadar } from "@/components/fx/FxRadar.jsx";
import { FxRadial } from "@/components/fx/FxRadial.jsx";

const MAJORS = ["EUR", "GBP", "JPY", "INR", "AUD"];

function Section({ kicker, title, text, children }) {
  return (
    <section className="mt-12">
      <div className="mb-5">
        <Badge variant="secondary">{kicker}</Badge>
        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      </div>
      {children}
    </section>
  );
}

export function Showcase() {
  const [data, setData] = useState({ usdInr: [], eurGbp: [], majors: {}, budget: [], loading: true });
  const cmp = useMultiTrend("USD", ["INR", "EUR", "GBP"], 30);

  useEffect(() => {
    let on = true;
    Promise.all([
      api.trends("USD", "INR", 90).catch(() => ({ points: [] })),
      api.trends("EUR", "GBP", 30).catch(() => ({ points: [] })),
      ...MAJORS.map((m) => api.trends("USD", m, 30).then((r) => [m, r.points || []]).catch(() => [m, []])),
      api.budget("USD", 1000).catch(() => ({ table: [] })),
    ]).then(([a, b, ...rest]) => {
      if (!on) return;
      const budgetRes = rest.pop();
      const majors = Object.fromEntries(rest);
      setData({
        usdInr: a.points || [],
        eurGbp: b.points || [],
        majors,
        budget: (budgetRes.table || []).map((r) => ({ name: r.currency, value: r.value ?? 0 })),
        loading: false,
      });
    });
    return () => {
      on = false;
    };
  }, []);

  const recent14 = useMemo(() => data.usdInr.slice(-14), [data.usdInr]);
  const fortnightChg = useMemo(() => {
    if (recent14.length < 2) return null;
    return (((recent14[recent14.length - 1].rate - recent14[0].rate) / recent14[0].rate) * 100).toFixed(2);
  }, [recent14]);

  const radarAxes = useMemo(
    () =>
      MAJORS.filter((m) => (data.majors[m] || []).length > 1).map((m) => ({
        axis: m,
        score: Number((positionInRange(data.majors[m]) ?? 0).toFixed(1)),
      })),
    [data.majors]
  );

  const rings = useMemo(
    () =>
      [
        { code: "INR", label: "USD → INR", color: "var(--chart-1)" },
        { code: "EUR", label: "USD → EUR", color: "var(--chart-2)" },
        { code: "JPY", label: "USD → JPY", color: "var(--chart-3)" },
      ]
        .map((r) => ({
          name: r.code,
          label: r.label,
          color: r.color,
          score: Number(((positionInRange(data.majors[r.code]) ?? 0)).toFixed(1)),
        }))
        .filter((r) => (data.majors[r.name] || []).length > 1),
    [data.majors]
  );

  const { loading } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Badge variant="success-light">Visual gallery</Badge>
      <h1 className="font-display mt-3 max-w-2xl text-4xl font-bold tracking-tight text-balance">
        Every chart style, all live
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Zero demo data — every visual below is computed from live backend series.
      </p>

      <Section kicker="Bklit · live" title="Line charts on real series" text="USD → INR over 90 days and EUR → GBP over 30 days.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">USD → INR · 90D</CardTitle></CardHeader>
            <CardContent><FxLineChart points={data.usdInr} loading={loading} aspectRatio="2 / 1" /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">EUR → GBP · 30D</CardTitle></CardHeader>
            <CardContent>
              <FxLineChart points={data.eurGbp} loading={loading} stroke="var(--chart-2)" aspectRatio="2 / 1" />
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section kicker="Bklit · live" title="Multi-currency comparison" text="Three pairs rebased to 100 — same engine as the Trends compare tab.">
        <Card>
          <CardHeader><CardTitle className="text-base">USD base · indexed performance · 30D</CardTitle></CardHeader>
          <CardContent><FxIndexChart rows={cmp.rows} keys={["INR", "EUR", "GBP"]} loading={cmp.loading} aspectRatio="2.8 / 1" /></CardContent>
        </Card>
      </Section>

      <Section kicker="Bklit · states" title="Loading choreography" text="Pulse skeleton, shimmer grid and label — driven by a single status prop.">
        <Card>
          <CardHeader><CardTitle className="text-base">Fetching market data…</CardTitle></CardHeader>
          <CardContent><FxLineChart points={[]} loading aspectRatio="3 / 1" /></CardContent>
        </Card>
      </Section>

      <Section kicker="ReUI · live" title="Momentum area & daily bars" text="Glowing area over the last 14 closes plus per-day change bars.">
        <div className="grid gap-4 lg:grid-cols-2">
          {loading ? (
            <Card className="h-80 animate-pulse" />
          ) : (
            <FxGlowArea
              title="USD → INR momentum"
              description="Last 14 closes · glowing markers"
              points={recent14}
              badgeText={fortnightChg != null ? `${fortnightChg >= 0 ? "+" : ""}${fortnightChg}%` : undefined}
            />
          )}
          {loading ? (
            <Card className="h-80 animate-pulse" />
          ) : (
            <FxChangeBars
              title="Daily moves"
              description="USD → INR day-over-day % change"
              changes={dailyChanges(data.usdInr.slice(-15))}
            />
          )}
        </div>
      </Section>

      <Section kicker="ReUI · live" title="Allocation, strength & range" text="Budget split donut, 30-day range radar and range-position radials.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">$1,000 across five majors</CardTitle>
              <CardDescription>USD base · server-computed</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <div className="mx-auto aspect-square max-h-72 animate-pulse rounded-full bg-muted" /> : (
                <FxDonut title="Budget split" centerLabel="USD budget" centerValue="1,000" slices={data.budget} />
              )}
            </CardContent>
          </Card>
          {loading ? (
            <Card className="h-80 animate-pulse" />
          ) : (
            <FxRadar
              title="Currency strength"
              description="Position in 30-day range · USD base"
              axes={radarAxes}
            />
          )}
          {loading ? (
            <Card className="h-80 animate-pulse" />
          ) : (
            <FxRadial
              title="Range thermometers"
              description="Where each pair sits in its monthly range"
              rings={rings}
            />
          )}
        </div>
      </Section>
      <div className="pb-16" />
    </div>
  );
}
