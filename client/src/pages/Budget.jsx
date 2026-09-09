import { useState } from "react";
import { toast } from "sonner";
import { Plane } from "lucide-react";
import { api } from "@/api/client.js";
import { useCurrencies } from "@/hooks/useCurrencies.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FxDonut } from "@/components/fx/FxDonut.jsx";

export function Budget() {
  const { currencies } = useCurrencies();
  const [base, setBase] = useState("USD");
  const [amount, setAmount] = useState("1000");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function compare(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.budget(base, Number(amount));
      setResult(data);
    } catch (err) {
      toast.error(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const slices = (result?.table || []).map((r) => ({ name: r.currency, value: r.value ?? 0 }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold tracking-tight">Travel budgeting</h1>
      <p className="mt-1 text-sm text-muted-foreground">One amount, five major currencies — computed server-side.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plane className="size-4 text-primary" /> Trip budget</CardTitle>
            <CardDescription>Enter your home budget to compare spending power.</CardDescription>
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
              <Button type="submit" disabled={loading}>
                {loading ? "Calculating…" : "Compare currencies"}
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

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Comparison table</CardTitle>
            <CardDescription>
              {result ? `${result.amount} ${result.baseCurrency} across five majors` : "Run a comparison to fill this table."}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            {result && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.table.map((r, i) => (
                    <TableRow key={r.currency}>
                      <TableCell>
                        <span className="mr-2 inline-block size-2.5 rounded-full" style={{ background: `var(--chart-${(i % 5) + 1})` }} />
                        <strong>{r.currency}</strong>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{Number(r.rate).toFixed(4)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {Number(r.value).toFixed(2)} {r.currency}
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
  );
}
