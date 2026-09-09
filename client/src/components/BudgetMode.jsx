import { useState } from "react";
import { api } from "../api/client.js";

export default function BudgetMode({ currencies }) {
  const [base, setBase] = useState("USD");
  const [amount, setAmount] = useState("1000");
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.budget(base, Number(amount));
      setTable(data);
    } catch (err) {
      setError(err.message);
      setTable(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card highlight">
      <h2>✈ Travel Budgeting</h2>
      <form className="row" onSubmit={handleSubmit}>
        <label>
          Base currency
          <select value={base} onChange={(e) => setBase(e.target.value)}>
            {currencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Budget amount
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Calculating…" : "Compare"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {table && (
        <table className="table">
          <thead>
            <tr><th>Currency</th><th>Rate</th><th>Value</th></tr>
          </thead>
          <tbody>
            {table.table.map((r) => (
              <tr key={r.currency}>
                <td><strong>{r.currency}</strong></td>
                <td>{r.rate != null ? Number(r.rate).toFixed(4) : "—"}</td>
                <td>{r.value != null ? `${Number(r.value).toFixed(2)} ${r.currency}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
