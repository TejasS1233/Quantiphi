import { useEffect, useState } from "react";
import { api } from "@/api/client.js";

export const INDEX_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/** Fetch trends for base × targets, merge dates, forward-fill, index to 100. */
export function useMultiTrend(base, targets, days) {
  const key = targets.join(",");
  const [state, setState] = useState({ rows: [], raw: [], loading: true, error: "" });

  useEffect(() => {
    let on = true;
    setState({ rows: [], raw: [], loading: true, error: "" });
    Promise.all(targets.map((t) => api.trends(base, t, Number(days)).catch(() => ({ points: [] }))))
      .then((results) => {
        if (!on) return;
        const byDate = new Map();
        results.forEach((r, i) => {
          (r.points || []).forEach((p) => {
            if (!byDate.has(p.date)) byDate.set(p.date, { date: new Date(`${p.date}T00:00:00`) });
            byDate.get(p.date)[targets[i]] = p.rate;
          });
        });
        let rows = [...byDate.values()].sort((a, b) => a.date - b.date);
        const last = {};
        rows = rows
          .map((row) => {
            const out = { date: row.date };
            targets.forEach((c) => {
              if (row[c] == null) out[c] = last[c] ?? null;
              else {
                out[c] = row[c];
                last[c] = row[c];
              }
            });
            return out;
          })
          .filter((row) => targets.some((c) => row[c] != null));
        const first = {};
        targets.forEach((c) => {
          const hit = rows.find((r) => r[c] != null);
          first[c] = hit ? hit[c] : null;
        });
        const indexed = rows.map((row) => {
          const out = { date: row.date };
          targets.forEach((c) => {
            out[c] = row[c] != null && first[c] ? (row[c] / first[c]) * 100 : null;
          });
          return out;
        });
        setState({ rows: indexed, raw: rows, loading: false, error: "" });
      })
      .catch((e) => on && setState({ rows: [], raw: [], loading: false, error: e.message }));
    return () => {
      on = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, key, days]);

  return state;
}

/** Single live trend series. */
export function useTrend(base, target, days) {
  const [s, setS] = useState({ points: [], loading: true, error: "" });

  useEffect(() => {
    let on = true;
    setS({ points: [], loading: true, error: "" });
    api
      .trends(base, target, Number(days))
      .then((d) => on && setS({ points: d.points || [], loading: false, error: "" }))
      .catch((e) => on && setS({ points: [], loading: false, error: e.message }));
    return () => {
      on = false;
    };
  }, [base, target, days]);

  return s;
}

/** Where the last value sits in its [low, high] range → 0..100. */
export function positionInRange(points) {
  if (!points?.length) return null;
  const rates = points.map((p) => p.rate);
  const lo = Math.min(...rates);
  const hi = Math.max(...rates);
  if (hi === lo) return 50;
  return ((rates[rates.length - 1] - lo) / (hi - lo)) * 100;
}

/** Daily % changes from trend points. */
export function dailyChanges(points) {
  if (!points || points.length < 2) return [];
  return points.slice(1).map((p, i) => ({
    date: p.date,
    change: ((p.rate - points[i].rate) / points[i].rate) * 100,
  }));
}
