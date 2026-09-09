import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeftRight, Download, Star, Trash2 } from "lucide-react";
import { api } from "@/api/client.js";
import { useCurrencies } from "@/hooks/useCurrencies.js";
import { downloadCSV } from "@/lib/csv.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/reui/badge";

export function Convert() {
  const { currencies, backendDown } = useCurrencies();
  const [params, setParams] = useSearchParams();
  const [from, setFrom] = useState(params.get("from") || "USD");
  const [to, setTo] = useState(params.get("to") || "INR");
  const [amount, setAmount] = useState(params.get("amount") || "100");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    api.history(8).then((d) => setHistory(d.history || [])).catch(() => {});
    api.favorites().then((d) => setFavorites(d.favorites || [])).catch(() => {});
  }, [tick]);

  async function convert(e) {
    e?.preventDefault();
    setLoading(true);
    try {
      const out = await api.convert(from, to, Number(amount));
      setResult(out);
      setParams({ from, to, amount: String(amount) }, { replace: true });
      setTick((t) => t + 1);
      toast.success(`${out.amount} ${out.from} = ${out.result.toFixed(2)} ${out.to}`);
    } catch (err) {
      toast.error(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function downloadHistory() {
    downloadCSV(
      "conversion-history.csv",
      ["from", "to", "amount", "rate", "result", "when"],
      history.map((h) => [h.from_code, h.to_code, h.amount, h.rate, h.result, h.created_at])
    );
    toast.success("History downloaded");
  }

  async function saveFavorite() {
    try {
      await api.addFavorite(from, to);
      setTick((t) => t + 1);
      toast.success(`Saved ${from} → ${to}`);
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function removeFavorite(id) {
    await api.removeFavorite(id);
    setTick((t) => t + 1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Converter</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live rates, computed server-side and saved to history.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadHistory} disabled={!history.length}>
            <Download /> History CSV
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Convert currency</CardTitle>
            <CardDescription>Pick a pair, enter an amount, convert.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={convert} className="flex flex-wrap items-end gap-3">
              <div className="grid gap-1.5">
                <Label>Source</Label>
                <NativeSelect value={from} onChange={(e) => setFrom(e.target.value)} className="w-32">
                  {currencies.map((c) => (
                    <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Swap"
                onClick={() => { setFrom(to); setTo(from); setResult(null); }}
              >
                <ArrowLeftRight />
              </Button>
              <div className="grid gap-1.5">
                <Label>Target</Label>
                <NativeSelect value={to} onChange={(e) => setTo(e.target.value)} className="w-32">
                  {currencies.map((c) => (
                    <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="grid gap-1.5">
                <Label>Amount</Label>
                <Input
                  type="number" min="0" step="any" value={amount}
                  onChange={(e) => setAmount(e.target.value)} className="w-36"
                />
              </div>
              <Button type="submit" disabled={loading || backendDown}>
                {loading ? "Converting…" : "Convert"}
              </Button>
            </form>

            {result && (
              <div className="mt-6 rounded-xl border border-primary/25 bg-primary/5 p-5">
                <div className="font-display text-3xl font-bold tabular-nums">
                  {result.result.toFixed(2)} <span className="text-lg text-muted-foreground">{result.to}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>{result.amount} {result.from} · 1 {result.from} = {result.rate} {result.to}</span>
                  <Button variant="outline" size="sm" onClick={saveFavorite}>
                    <Star /> Save pair
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <p className="text-sm text-muted-foreground">No favorites yet — convert and save a pair.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {favorites.map((f) => (
                    <li key={f.id} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
                      <button
                        className="text-sm font-semibold hover:text-primary"
                        onClick={() => { setFrom(f.base_code); setTo(f.target_code); setResult(null); }}
                      >
                        {f.base_code} → {f.target_code}
                      </button>
                      <Button variant="ghost" size="icon-sm" onClick={() => removeFavorite(f.id)} aria-label="Remove">
                        <Trash2 className="text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent conversions</CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              {history.length === 0 ? (
                <p className="px-4 text-sm text-muted-foreground">Nothing here yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pair</TableHead>
                      <TableHead className="text-right">Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell>
                          <Badge variant="secondary">{h.from_code} → {h.to_code}</Badge>
                          <span className="ml-2 text-xs text-muted-foreground">{h.amount}</span>
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {Number(h.result).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
