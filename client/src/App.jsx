import { useEffect, useState } from "react";
import { api } from "./api/client.js";
import Converter from "./components/Converter.jsx";
import TrendChart from "./components/TrendChart.jsx";
import Favorites from "./components/Favorites.jsx";
import BudgetMode from "./components/BudgetMode.jsx";
import History from "./components/History.jsx";
import "./App.css";

const FALLBACK = ["USD", "EUR", "GBP", "JPY", "INR", "AUD", "CAD", "CHF", "CNY", "SGD"];

export default function App() {
  const [currencies, setCurrencies] = useState(FALLBACK);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  const [travelMode, setTravelMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [backendDown, setBackendDown] = useState(false);

  useEffect(() => {
    api
      .currencies()
      .then((d) => {
        if (d.currencies?.length) setCurrencies(d.currencies);
        setBackendDown(false);
      })
      .catch(() => setBackendDown(true));
  }, []);

  function bump() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Currency Converter</h1>
          <p className="muted">Real-time rates · 30-day trends · Travel budgeting</p>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={travelMode}
            onChange={(e) => setTravelMode(e.target.checked)}
          />
          ✈ Travel Budgeting
        </label>
      </header>

      {backendDown && (
        <p className="error banner">
          Backend unreachable — start it with <code>npm run dev</code> in <code>/server</code>.
        </p>
      )}

      <main className="grid">
        {travelMode ? (
          <BudgetMode currencies={currencies} />
        ) : (
          <>
            <Converter
              currencies={currencies}
              from={from}
              to={to}
              setFrom={setFrom}
              setTo={setTo}
              onConverted={bump}
            />
            <TrendChart base={from} target={to} />
          </>
        )}
        <div className="side">
          <Favorites refreshKey={refreshKey} onSelect={(b, t) => { setFrom(b); setTo(t); setTravelMode(false); }} />
          <History refreshKey={refreshKey} />
        </div>
      </main>
    </div>
  );
}
