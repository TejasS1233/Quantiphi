import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Download, TrendingDown, TrendingUp } from "lucide-react";
import { api } from "@/api/client.js";
import { useCurrencies } from "@/hooks/useCurrencies.js";
import { INDEX_PALETTE, useMultiTrend } from "@/hooks/useMultiTrend.js";
import { downloadCSV } from "@/lib/csv.js";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FxLineChart } from "@/components/fx/FxLineChart.jsx";
import { FxIndexChart } from "@/components/fx/FxIndexChart.jsx";
import { cn } from "@/lib/utils";

const DAY_OPTIONS = ["7", "14", "30", "60", "90"];
const COMPARE_DEFAULTS = ["INR", "EUR", "GBP", "JPY"];

export function Trends() {
  const { currencies } = useCurrencies();
  const [params, setParams] = useSearchParams();
  const [mode, setMode] = useState(params.get("mode") || "single");
  const [base, setBase] = useState(params.get("base") || "USD");
  const [target, setTarget] = useState(params.get("target") || "INR");
  const [days, setDays] = useState(params.get("days") || "30");
  const [forecast, setForecast] = useState(true);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [compare, setCompare] = useState(COMPARE_DEFAULTS.slice(0, 3));
  const [indexed, setIndexed] = useState(false);

  useEffect(() => {
    if (mode !== "single") return;
    let live = true;
    setLoading(true);
    setError("");
    api
      .trends(base, target, Number(days))
      .then((d) => live && setPoints(d.points || []))
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [mode, base, target, days]);

  const cmp = useMultiTrend(base, compare, days);

  useEffect(() => {
    setParams({ mode, base, target, days }, { replace: true });
  }, [mode, base, target, days, setParams]);

  function download() {
    if (mode === "single") {
      downloadCSV(
        `trend-${base}-${target}-${days}d.csv`,
        ["date", `${base}_${target}`],
        points.map((p) => [p.date, p.rate])
      );
    } else {
      downloadCSV(
        `compare-${base}-${compare.join("-")}-${days}d.csv`,
        ["date", ...compare.map((c) => `${base}_${c}`)],
        (indexed ? cmp.rows : cmp.raw).map((r) => [r.date.toISOString().slice(0, 10), ...compare.map((c) => r[c])])
      );
    }
    toast.success("CSV downloaded");
  }

  const stats = useMemo(() => {
    if (points.length < 2) return null;
    const rates = points.map((p) => p.rate);
    const first = rates[0];
    const last = rates[rates.length - 1];
    return {
      current: last,
      high: Math.max(...rates),
      low: Math.min(...rates),
      chg: ((last - first) / first) * 100,
    };
  }, [points]);

  function toggleTarget(c) {
    setCompare((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : prev.length >= 4 ? prev : [...prev, c]
    );
  }

  const pairOptions = currencies.filter((c) => c !== base);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Trend intelligence</h1>
          <p className="mt-1 text-sm text-muted-foreground">Bklit line charts on live Frankfurter series.</p>
        </div>
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList>
            <TabsTrigger value="single">Single pair</TabsTrigger>
            <TabsTrigger value="compare">Compare · up to 4</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={download}><Download /> CSV</Button>
        </div>
      </div>

      {mode === "single" ? (
        <>
          <Card className="mt-6">
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-wrap items-end gap-3">
                <div className="grid gap-1.5">
                  <Label>Base</Label>
                  <NativeSelect value={base} onChange={(e) => setBase(e.target.value)} className="w-32">
                    {currencies.map((c) => (
                      <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <div className="grid gap-1.5">
                  <Label>Target</Label>
                  <NativeSelect value={target} onChange={(e) => setTarget(e.target.value)} className="w-32">
                    {currencies.map((c) => (
                      <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
              </div>
              <Tabs value={days} onValueChange={setDays}>
                <TabsList>
                  {DAY_OPTIONS.map((d) => (
                    <TabsTrigger key={d} value={d}>{d}D</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center gap-3">
                <Label>Forecast</Label>
                <Tabs value={forecast ? "on" : "off"} onValueChange={(v) => setForecast(v === "on")}>
                  <TabsList>
                    <TabsTrigger value="off">Off</TabsTrigger>
                    <TabsTrigger value="on">8-day projection</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              {error ? (
                <p className="py-10 text-center text-sm text-destructive">{error}</p>
              ) : (
                <FxLineChart points={points} loading={loading} label={`Loading ${base} → ${target}…`} aspectRatio="2.6 / 1" forecast={forecast} />
              )}
            </CardContent>
          </Card>

          {stats && (
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "Current rate", value: stats.current.toFixed(4) },
                { label: `${days}-day high`, value: stats.high.toFixed(4) },
                { label: `${days}-day low`, value: stats.low.toFixed(4) },
                { label: "Change", value: `${stats.chg >= 0 ? "+" : ""}${stats.chg.toFixed(2)}%`, delta: stats.chg },
              ].map((s) => (
                <Card key={s.label}>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-display flex items-center gap-2 text-xl font-bold tabular-nums">
                      {s.value}
                      {s.delta != null &&
                        (s.delta >= 0 ? (
                          <TrendingUp className="size-4 text-success" />
                        ) : (
                          <TrendingDown className="size-4 text-destructive" />
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <Card className="mt-6">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid gap-1.5">
              <Label>Base currency</Label>
              <NativeSelect value={base} onChange={(e) => setBase(e.target.value)} className="w-32">
                {currencies.map((c) => (
                  <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <Tabs value={days} onValueChange={setDays}>
              <TabsList>
                {DAY_OPTIONS.map((d) => (
                  <TabsTrigger key={d} value={d}>{d}D</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Label>Scale</Label>
              <Tabs value={indexed ? "indexed" : "actual"} onValueChange={(v) => setIndexed(v === "indexed")}>
                <TabsList>
                  <TabsTrigger value="actual">Actual rates</TabsTrigger>
                  <TabsTrigger value="indexed">Rebased to 100</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Label className="mb-2 block">Targets ({compare.length}/4)</Label>
            <div className="mb-5 flex flex-wrap gap-2">
              {pairOptions.map((c) => {
                const on = compare.includes(c);
                const idx = compare.indexOf(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleTarget(c)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-all",
                      on
                        ? "border-transparent bg-muted text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    {on && (
                      <span className="size-2.5 rounded-full" style={{ background: INDEX_PALETTE[idx % INDEX_PALETTE.length] }} />
                    )}
                    {c}
                  </button>
                );
              })}
            </div>
            {cmp.error ? (
              <p className="py-10 text-center text-sm text-destructive">{cmp.error}</p>
            ) : (
              <>
                <FxIndexChart rows={indexed ? cmp.rows : cmp.raw} keys={compare} loading={cmp.loading} />
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  {compare.map((c, i) => (
                    <span key={c} className="flex items-center gap-1.5 font-medium">
                      <span className="size-2.5 rounded-full" style={{ background: INDEX_PALETTE[i % INDEX_PALETTE.length] }} />
                      {base} → {c}
                    </span>
                  ))}
                  <span className="ml-auto">Indexed to 100 at series start</span>
                </div>
              </>
            )}
            <CardDescription className="mt-4">
              {indexed
                ? "Rebased view — every series starts at 100 so % performance can be compared across scales."
                : "Actual rates — pairs share one axis, so small-scale pairs sit lower on the chart."}
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
