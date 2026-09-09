import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { api } from "@/api/client.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const METER_CODES = ["EUR", "GBP", "JPY", "INR", "AUD", "CAD", "CHF", "SGD"];

/** Ranks majors by 30-day momentum vs base — all live. */
export function FxStrengthMeter({ base = "USD", days = 30 }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    setLoading(true);
    Promise.all(
      METER_CODES.filter((c) => c !== base).map((c) =>
        api
          .trends(base, c, days)
          .then((t) => {
            const pts = t.points || [];
            if (pts.length < 2) return null;
            const chg = ((pts[pts.length - 1].rate - pts[0].rate) / pts[0].rate) * 100;
            return { code: c, chg };
          })
          .catch(() => null)
      )
    ).then((all) => {
      if (!on) return;
      setRows(all.filter(Boolean).sort((a, b) => b.chg - a.chg));
      setLoading(false);
    });
    return () => {
      on = false;
    };
  }, [base, days]);

  const max = Math.max(0.01, ...rows.map((r) => Math.abs(r.chg)));

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Strength meter</CardTitle>
        <CardDescription>
          {days}-day momentum vs {base}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-6 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {rows.map((r) => {
              const up = r.chg >= 0;
              return (
                <li key={r.code} className="flex items-center gap-3">
                  <span className="w-10 text-sm font-bold">{r.code}</span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("absolute inset-y-0 rounded-full", up ? "bg-success" : "bg-destructive")}
                      style={{ width: `${Math.max(4, (Math.abs(r.chg) / max) * 100)}%` }}
                    />
                  </div>
                  <span className={cn("flex w-20 items-center justify-end gap-1 text-xs font-bold tabular-nums", up ? "text-success" : "text-destructive")}>
                    {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                    {up ? "+" : ""}{r.chg.toFixed(2)}%
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
