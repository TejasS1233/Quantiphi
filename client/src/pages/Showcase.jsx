import { useEffect, useMemo, useState } from "react";
import { api } from "@/api/client.js";
import {
  INDEX_PALETTE,
  dailyChanges,
  positionInRange,
  useMultiTrend,
  useTrend,
} from "@/hooks/useMultiTrend.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/reui/badge";
import { FxLineChart } from "@/components/fx/FxLineChart.jsx";
import { FxIndexChart } from "@/components/fx/FxIndexChart.jsx";
import { FxDonut } from "@/components/fx/FxDonut.jsx";
import { FxGlowArea } from "@/components/fx/FxGlowArea.jsx";
import { FxChangeBars } from "@/components/fx/FxChangeBars.jsx";
import { FxRadar } from "@/components/fx/FxRadar.jsx";
import { FxRadial } from "@/components/fx/FxRadial.jsx";
import { DaysPicker, PairPicker } from "@/components/fx/Pickers.jsx";
import { cn } from "@/lib/utils";

const PAIRS = [
  ["USD", "INR"],
  ["EUR", "GBP"],
  ["USD", "JPY"],
  ["GBP", "INR"],
];
const BASES = ["USD", "EUR", "GBP"];
const AMOUNTS = [500, 1000, 5000];
const SIX = ["USD", "EUR", "GBP", "JPY", "INR", "AUD"];

function Section({ kicker, title, text, controls, children }) {
  return (
    <section className="mt-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge variant="secondary">{kicker}</Badge>
          <h2 className="font-display mt-2 text-2xl font-bold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{text}</p>
        </div>
        {controls}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-border/70 px-4 py-3">
      <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</div>
      <div className="font-display mt-0.5 text-lg font-bold tabular-nums">{value}</div>
    </div>
  );
}

export function Showcase() {
  // — Majors in motion —
  const [pair1, setPair1] = useState("USD-INR");
  const [days1, setDays1] = useState("90");
  const [b1, t1] = pair1.split("-");
  const line = useTrend(b1, t1, days1);

  const lineStats = useMemo(() => {
    if (line.points.length < 2) return null;
    const r = line.points.map((p) => p.rate);
    const chg = ((r[r.length - 1] - r[0]) / r[0]) * 100;
    return {
      current: r[r.length - 1].toFixed(4),
      high: Math.max(...r).toFixed(4),
      low: Math.min(...r).toFixed(4),
      chg: `${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%`,
    };
  }, [line.points]);

  // — Head to head —
  const [cmpBase, setCmpBase] = useState("USD");
  const [cmpDays, setCmpDays] = useState("30");
  const [cmpTargets, setCmpTargets] = useState(["INR", "EUR", "GBP"]);
  const [cmpIndexed, setCmpIndexed] = useState(false);
  const cmp = useMultiTrend(cmpBase, cmpTargets, cmpDays);
  const cmpOptions = SIX.filter((c) => c !== cmpBase);

  // — Intraday pulse —
  const [pair3, setPair3] = useState("USD-INR");
  const [b3, t3] = pair3.split("-");
  const pulse = useTrend(b3, t3, 14);
  const pulseChg = useMemo(() => {
    if (pulse.points.length < 2) return null;
    const r = pulse.points.map((p) => p.rate);
    const c = ((r[r.length - 1] - r[0]) / r[0]) * 100;
    return `${c >= 0 ? "+" : ""}${c.toFixed(2)}%`;
  }, [pulse.points]);

  // — Money map —
  const [mapBase, setMapBase] = useState("USD");
  const [mapAmount, setMapAmount] = useState(1000);
  const [mapData, setMapData] = useState({ majors: {}, budget: [], loading: true });
  const mapTargets = SIX.filter((c) => c !== mapBase).slice(0, 5);

  useEffect(() => {
    let on = true;
    setMapData({ majors: {}, budget: [], loading: true });
    Promise.all([
      ...mapTargets.map((m) =>
        api.trends(mapBase, m, 30).then((r) => [m, r.points || []]).catch(() => [m, []])
      ),
      api.budget(mapBase, mapAmount).catch(() => ({ table: [] })),
    ]).then((all) => {
      if (!on) return;
      const budgetRes = all[all.length - 1];
      setMapData({
        majors: Object.fromEntries(all.slice(0, -1)),
        budget: (budgetRes.table || []).map((r) => ({ name: r.currency, value: r.value ?? 0 })),
        loading: false,
      });
    });
    return () => {
      on = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapBase, mapAmount]);

  const radarAxes = mapTargets
    .filter((m) => (mapData.majors[m] || []).length > 1)
    .map((m) => ({ axis: m, score: Number((positionInRange(mapData.majors[m]) ?? 0).toFixed(1)) }));

  const rings = ["INR", "EUR", "JPY"]
    .filter((c) => c !== mapBase && (mapData.majors[c] || []).length > 1)
    .map((c, i) => ({
      name: c,
      label: `${mapBase} → ${c}`,
      color: `var(--chart-${(i % 3) + 1})`,
      score: Number((positionInRange(mapData.majors[c]) ?? 0).toFixed(1)),
    }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Badge variant="success-light">Visual gallery</Badge>
      <h1 className="font-display mt-3 max-w-2xl text-4xl font-bold tracking-tight text-balance">
        The market, visualized
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Every currency move your money makes — flip pairs, stretch timeframes, compare
        economies. Everything below is live and togglable.
      </p>

      <Section
        kicker="Live exchange rates"
        title="Majors in motion"
        text="Pick a corridor, stretch the timeframe, watch the rate breathe."
        controls={
          <div className="flex flex-wrap gap-3">
            <PairPicker pairs={PAIRS} value={pair1} onChange={setPair1} />
            <DaysPicker value={days1} onChange={setDays1} />
          </div>
        }
      >
        <Card>
          <CardContent className="pt-6">
            <FxLineChart points={line.points} loading={line.loading} label={`Loading ${b1} → ${t1}…`} aspectRatio="2.8 / 1" />
            {lineStats && (
              <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Current" value={lineStats.current} />
                <Stat label={`${days1}D high`} value={lineStats.high} />
                <Stat label={`${days1}D low`} value={lineStats.low} />
                <Stat label="Change" value={lineStats.chg} />
              </div>
            )}
          </CardContent>
        </Card>
      </Section>

      <Section
        kicker="Currency face-off"
        title="Head to head"
        text="Which economy is running hottest? Toggle rebasing to compare % performance on equal footing."
        controls={
          <div className="flex flex-wrap gap-3">
            <Tabs value={cmpIndexed ? "indexed" : "actual"} onValueChange={(v) => setCmpIndexed(v === "indexed")}>
              <TabsList>
                <TabsTrigger value="actual">Actual rates</TabsTrigger>
                <TabsTrigger value="indexed">Rebased to 100</TabsTrigger>
              </TabsList>
            </Tabs>
            <DaysPicker value={cmpDays} onChange={setCmpDays} options={["14", "30", "60", "90"]} />
          </div>
        }
      >
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Base:</span>
              {BASES.map((b) => (
                <button
                  key={b}
                  onClick={() => setCmpBase(b)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-bold transition-all",
                    cmpBase === b
                      ? "border-primary/60 bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {b}
                </button>
              ))}
              <span className="ml-2 text-xs font-semibold text-muted-foreground">Contenders ({cmpTargets.length}/4):</span>
              {cmpOptions.map((c) => {
                const on = cmpTargets.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() =>
                      setCmpTargets((p) => (on ? p.filter((x) => x !== c) : p.length >= 4 ? p : [...p, c]))
                    }
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-bold transition-all",
                      on
                        ? "border-transparent bg-muted text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            <FxIndexChart rows={cmpIndexed ? cmp.rows : cmp.raw} keys={cmpTargets} loading={cmp.loading} />
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              {cmpTargets.map((c, i) => (
                <span key={c} className="flex items-center gap-1.5 font-medium">
                  <span className="size-2.5 rounded-full" style={{ background: INDEX_PALETTE[i % INDEX_PALETTE.length] }} />
                  {cmpBase} → {c}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section
        kicker="Short-term pulse"
        title="Two weeks of heartbeat"
        text="Glowing momentum curve beside day-by-day gains and slips."
        controls={<PairPicker pairs={PAIRS} value={pair3} onChange={setPair3} />}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {pulse.loading ? (
            <Card className="h-80 animate-pulse" />
          ) : (
            <FxGlowArea
              title={`${b3} → ${t3} momentum`}
              description="Last 14 closes · glowing markers"
              points={pulse.points}
              badgeText={pulseChg ?? undefined}
            />
          )}
          {pulse.loading ? (
            <Card className="h-80 animate-pulse" />
          ) : (
            <FxChangeBars
              title="Daily moves"
              description={`${b3} → ${t3} day-over-day % change`}
              changes={dailyChanges(pulse.points)}
            />
          )}
        </div>
      </Section>

      <Section
        kicker="Global money map"
        title="Where does your base rule?"
        text="Flip your home currency and see where it buys the most right now."
        controls={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              {BASES.map((b) => (
                <button
                  key={b}
                  onClick={() => setMapBase(b)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-bold transition-all",
                    mapBase === b
                      ? "border-primary/60 bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setMapAmount(a)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-bold tabular-nums transition-all",
                    mapAmount === a
                      ? "border-primary/60 bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {a.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {mapAmount.toLocaleString()} {mapBase} worldwide
              </CardTitle>
              <CardDescription>Server-computed split</CardDescription>
            </CardHeader>
            <CardContent>
              {mapData.loading ? (
                <div className="mx-auto aspect-square max-h-72 animate-pulse rounded-full bg-muted" />
              ) : (
                <FxDonut
                  title="Budget split"
                  centerLabel={`${mapBase} budget`}
                  centerValue={mapAmount.toLocaleString()}
                  slices={mapData.budget}
                />
              )}
            </CardContent>
          </Card>
          {mapData.loading ? (
            <Card className="h-80 animate-pulse" />
          ) : (
            <FxRadar title="Where you're strongest" description={`Range position vs 5 currencies · ${mapBase} base`} axes={radarAxes} />
          )}
          {mapData.loading ? (
            <Card className="h-80 animate-pulse" />
          ) : (
            <FxRadial
              title="Monthly thermometers"
              description="0 = sitting at the 30-day low · 100 = at the high"
              rings={rings}
            />
          )}
        </div>
      </Section>
      <div className="pb-16" />
    </div>
  );
}
