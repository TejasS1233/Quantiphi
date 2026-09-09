import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Coffee, Download, Lightbulb, PartyPopper, Plane, TrendingDown, TrendingUp } from "lucide-react";
import { api } from "@/api/client.js";
import { useCurrencies } from "@/hooks/useCurrencies.js";
import { positionInRange } from "@/hooks/useMultiTrend.js";
import { downloadCSV } from "@/lib/csv.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/reui/badge";
import { FxDonut } from "@/components/fx/FxDonut.jsx";
import { cn } from "@/lib/utils";

const QUICK_AMOUNTS = [500, 1000, 5000];

const CITY = {
  USD: { city: "New York", vibe: "Pizza slices at 2am, yellow cabs, skyline everything.", coffee: 5 },
  EUR: { city: "Paris", vibe: "Croissants at dawn, slow Seine evenings.", coffee: 4 },
  GBP: { city: "London", vibe: "Fish & chips by the Thames, pub gardens.", coffee: 3.8 },
  JPY: { city: "Tokyo", vibe: "Midnight ramen runs under neon skies.", coffee: 600 },
  INR: { city: "Mumbai", vibe: "Cutting chai on the move, sea-face sunsets.", coffee: 250 },
  AUD: { city: "Sydney", vibe: "Flat whites by the harbour, surf at sunrise.", coffee: 5.5 },
};

function verdict(score) {
  if (score >= 65) return { label: "Splurge zone", tone: "text-warning", note: "Target is running hot — pricey right now." };
  if (score >= 35) return { label: "Fair winds", tone: "text-info", note: "Balanced seas — spend normally." };
  return { label: "Convert now", tone: "text-success", note: "Home currency is strong — great time to lock in." };
}

export function Budget() {
  const { currencies } = useCurrencies();
  const [params, setParams] = useSearchParams();
  const [base, setBase] = useState(params.get("base") || "USD");
  const [amount, setAmount] = useState(params.get("amount") || "1000");
  const [result, setResult] = useState(null);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(false);

  async function compare(e) {
    e?.preventDefault();
    setLoading(true);
    try {
      const data = await api.budget(base, Number(amount));
      setResult(data);
      setParams({ base, amount: String(amount) }, { replace: true });
      // Deal scores: where each quote sits in its 30-day range vs base
      const rows = await Promise.all(
        data.table.map((r) =>
          api
            .trends(base, r.currency, 30)
            .then((t) => [r.currency, positionInRange(t.points || [])])
            .catch(() => [r.currency, null])
        )
      );
      setScores(Object.fromEntries(rows));
    } catch (err) {
      toast.error(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    compare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function downloadTable() {
    if (!result) return;
    downloadCSV(
      `budget-${result.baseCurrency}-${result.amount}.csv`,
      ["currency", "rate", "value"],
      result.table.map((r) => [r.currency, r.rate, r.value])
    );
    toast.success("Comparison downloaded");
  }

  const slices = (result?.table || []).map((r) => ({ name: r.currency, value: r.value ?? 0 }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card">
        <div className="bg-dots absolute inset-0 opacity-50" />
        <div className="pointer-events-none absolute -top-24 right-10 size-64 rounded-full bg-primary/15 blur-[100px]" />
        <div className="relative px-6 py-10 text-center sm:px-12">
          <Badge variant="success-light"><Plane className="size-3" /> Travel budgeting mode</Badge>
          <h1 className="font-display mx-auto mt-4 max-w-xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            How far will your money <span className="text-primary">fly?</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Drop in your trip budget and watch it land in five currencies at once —
            with deal scores, coffee math, and zero spreadsheet tears.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-bold tabular-nums transition-all",
                  String(a) === amount
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {a.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        {/* CALCULATOR */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plane className="size-4 text-primary" /> Trip budget</CardTitle>
            <CardDescription>Your home currency and holiday stash.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={compare} className="flex flex-col gap-4">
              <div className="grid gap-1.5">
                <Label>Base currency</Label>
                <NativeSelect value={base} onChange={(e) => setBase(e.target.value)}>
                  {currencies.map((c) => (
                    <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="grid gap-1.5">
                <Label>Budget amount</Label>
                <Input type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="h-11 rounded-full text-base">
                {loading ? "Fueling the jet…" : "Compare currencies"}
              </Button>
            </form>

            {result && (
              <div className="mt-6">
                <FxDonut
                  title="Budget split"
                  centerLabel={`${result.baseCurrency} budget`}
                  centerValue={Number(result.amount).toLocaleString()}
                  slices={slices}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* TABLE + DEAL SCORES */}
        <Card className="h-fit">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Landing report <PartyPopper className="size-4 text-primary" />
                </CardTitle>
                <CardDescription>
                  {result ? `${result.amount} ${result.baseCurrency} touching down worldwide` : "Run a comparison to fill this table."}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadTable} disabled={!result}>
                  <Download /> CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-2">
            {result && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destination</TableHead>
                    <TableHead className="text-right">You get</TableHead>
                    <TableHead>Deal score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.table.map((r, i) => {
                    const score = scores[r.currency];
                    const v = score != null ? verdict(score) : null;
                    return (
                      <TableRow key={r.currency}>
                        <TableCell>
                          <span className="mr-2 inline-block size-2.5 rounded-full" style={{ background: `var(--chart-${(i % 5) + 1})` }} />
                          <strong>{r.currency}</strong>
                          <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
                            {CITY[r.currency]?.city}
                          </span>
                          <div className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                            1 {result.baseCurrency} = {Number(r.rate).toFixed(4)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold tabular-nums">
                          {Number(r.value).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {score == null ? (
                            <span className="text-xs text-muted-foreground">scoring…</span>
                          ) : (
                            <div title={v.note}>
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className={cn("h-full rounded-full", score >= 65 ? "bg-warning" : score >= 35 ? "bg-info" : "bg-success")}
                                    style={{ width: `${Math.round(score)}%` }}
                                  />
                                </div>
                                <span className={cn("text-xs font-bold", v.tone)}>{v.label}</span>
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* COFFEE INDEX */}
      {result && (
        <section className="mt-8">
          <h2 className="font-display flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Coffee className="size-5 text-primary" /> The coffee index
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Forget purchasing-power parity — here is how many coffees your budget buys in each city.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.table.map((r) => {
              const info = CITY[r.currency];
              if (!info) return null;
              const cups = Math.floor(r.value / info.coffee);
              const up = (scores[r.currency] ?? 50) < 50;
              return (
                <Card key={r.currency} className="transition-colors hover:border-primary/40">
                  <CardContent className="pt-5">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-lg font-bold">{info.city}</span>
                      <Badge variant={up ? "success-light" : "secondary"}>
                        {up ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
                        {r.currency}
                      </Badge>
                    </div>
                    <div className="font-display mt-2 text-3xl font-bold tabular-nums">
                      {cups.toLocaleString()} <span className="text-base font-medium text-muted-foreground">coffees</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{info.vibe}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* TIPS */}
      <section className="mt-8 pb-16">
        <h2 className="font-display flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Lightbulb className="size-5 text-primary" /> Street-smart FX tips
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { t: "Convert on green days", d: "A 'Convert now' deal score means your home currency is flexing. Lock it in before the mood changes." },
            { t: "Never convert at the airport", d: "Kiosks take a holiday from fairness. Convert here, arrive rich." },
            { t: "Coffee is a currency", d: "If your budget buys 200+ Tokyo coffees, you're officially traveling well." },
          ].map((tip) => (
            <Card key={tip.t}>
              <CardContent className="pt-5">
                <p className="font-semibold">{tip.t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tip.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
