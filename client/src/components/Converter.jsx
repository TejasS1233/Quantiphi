import { useState } from "react";
import { api } from "../api/client.js";

export default function Converter({ currencies, from, to, setFrom, setTo, onConverted }) {
  const [amount, setAmount] = useState("100");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConvert(e) {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const out = await api.convert(from, to, Number(amount));
      setResult(out);
      onConverted?.();
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function saveFavorite() {
    try {
      await api.addFavorite(from, to);
      onConverted?.();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="card">
      <h2>Converter</h2>
      <form className="row" onSubmit={handleConvert}>
        <label>
          Source
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {currencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="swap"
          title="Swap"
          onClick={() => { setFrom(to); setTo(from); setResult(null); }}
        >
          ⇄
        </button>
        <label>
          Target
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {currencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Amount
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Converting…" : "Convert"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {result && (
        <div className="result">
          <strong>
            {result.amount} {result.from} = {result.result.toFixed(2)} {result.to}
          </strong>
          <span className="muted">Rate: 1 {result.from} = {result.rate} {result.to}</span>
          <button type="button" className="ghost" onClick={saveFavorite}>
            ★ Save pair
          </button>
        </div>
      )}
    </section>
  );
}
