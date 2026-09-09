import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { api } from "../api/client.js";

export default function TrendChart({ base, target }) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await api.trends(base, target, 30);
        if (!cancelled) setPoints(data.points || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [base, target]);

  return (
    <section className="card">
      <h2>30-day trend: {base} → {target}</h2>
      {loading && <p className="muted">Loading chart…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && points.length > 0 && (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={points} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={24} />
            <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} width={70} />
            <Tooltip formatter={(v) => [Number(v).toFixed(4), "Rate"]} />
            <Line type="monotone" dataKey="rate" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
      {!loading && !error && points.length === 0 && (
        <p className="muted">No trend data available.</p>
      )}
    </section>
  );
}
