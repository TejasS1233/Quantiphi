import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function History({ refreshKey }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api.history(10)
      .then((d) => { if (!cancelled) setRows(d.history || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [refreshKey]);

  if (rows.length === 0) return null;

  return (
    <section className="card">
      <h2>Recent conversions</h2>
      <table className="table">
        <thead>
          <tr><th>Pair</th><th>Amount</th><th>Result</th><th>When</th></tr>
        </thead>
        <tbody>
          {rows.map((h) => (
            <tr key={h.id}>
              <td>{h.from_code} → {h.to_code}</td>
              <td>{h.amount}</td>
              <td>{Number(h.result).toFixed(2)} {h.to_code}</td>
              <td className="muted">{h.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
