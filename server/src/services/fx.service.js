// All upstream FX calls live here. Controllers never call fetch() directly.
const db = require("../config/db");
const { normalizeCode } = require("../utils/currencies");

const ER_BASE =
  process.env.EXCHANGE_RATE_API_URL || "https://open.er-api.com/v6/latest";
const ER_KEY = process.env.EXCHANGE_RATE_API_KEY || "";
const TREND_BASE = process.env.TREND_API_URL || "https://api.frankfurter.dev/v2";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1h live-rate cache in SQLite

function erUrl(base) {
  const b = normalizeCode(base);
  if (ER_KEY) return `https://v6.exchangerate-api.com/v6/${ER_KEY}/latest/${b}`;
  return `${ER_BASE.replace(/\/$/, "")}/${b}`;
}

function readCache(base) {
  const row = db
    .prepare("SELECT payload, updated_at FROM rate_cache WHERE base_code = ?")
    .get(base);
  if (!row) return null;
  const age = Date.now() - Date.parse(row.updated_at + "Z");
  if (Number.isNaN(age) || age > CACHE_TTL_MS) return null;
  try {
    return JSON.parse(row.payload);
  } catch {
    return null;
  }
}

function writeCache(base, payload) {
  db.prepare(
    `INSERT INTO rate_cache (base_code, payload, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(base_code) DO UPDATE SET payload = excluded.payload, updated_at = datetime('now')`
  ).run(base, JSON.stringify(payload));
}

async function getRates(base) {
  const b = normalizeCode(base);
  const cached = readCache(b);
  if (cached) return { ...cached, cached: true };

  const res = await fetch(erUrl(b));
  if (!res.ok) throw new Error(`Rate provider responded ${res.status}`);
  const data = await res.json();
  // er-api shape: { result, base_code, rates }; exchangerate-api v6 same shape.
  if (data.result && data.result !== "success")
    throw new Error(data["error-type"] || "Rate provider error");
  const payload = {
    base: data.base_code || b,
    date: data.time_last_update_utc || new Date().toUTCString(),
    rates: data.rates,
  };
  writeCache(b, payload);
  return { ...payload, cached: false };
}

async function convertAmount(from, to, amount) {
  const f = normalizeCode(from);
  const t = normalizeCode(to);
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0)
    throw Object.assign(new Error("amount must be a positive number"), { status: 400 });
  if (f === t) return { from: f, to: t, amount: amt, rate: 1, result: amt };
  const { rates } = await getRates(f);
  const rate = rates[t];
  if (!rate) throw Object.assign(new Error(`Unsupported target currency: ${t}`), { status: 400 });
  return { from: f, to: t, amount: amt, rate, result: amt * rate };
}

// 30-day trend via Frankfurter v2 (free, no key, 201 currencies).
// GET {TREND_BASE}/rates?from=YYYY-MM-DD&base=USD&quotes=INR
// -> [{ date, base, quote, rate }]
async function getTrend(base, target, days = 30) {
  const b = normalizeCode(base);
  const t = normalizeCode(target);
  const n = Math.min(Math.max(parseInt(days, 10) || 30, 2), 90);

  if (b === t) {
    const points = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      points.push({ date: d.toISOString().slice(0, 10), rate: 1 });
    }
    return { base: b, target: t, days: points.length, points };
  }

  const end = new Date();
  const start = new Date(end.getTime() - (n + 5) * 86400000); // buffer for weekends/holidays
  const fmt = (d) => d.toISOString().slice(0, 10);

  const url =
    `${TREND_BASE.replace(/\/$/, "")}/rates` +
    `?from=${fmt(start)}&base=${encodeURIComponent(b)}&quotes=${encodeURIComponent(t)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Trend provider responded ${res.status}`);
  const data = await res.json();
  const rows = Array.isArray(data) ? data : data.rates || [];
  const points = rows
    .filter((r) => r && r.date && Number.isFinite(Number(r.rate)))
    .map((r) => ({ date: r.date, rate: Number(r.rate) }))
    .slice(-n);

  if (!points.length) throw new Error(`No trend data for ${b} → ${t}`);
  return { base: b, target: t, days: points.length, points };
}

async function budgetTable(baseCurrency, amount) {
  const { MAJOR_BUDGET_CURRENCIES } = require("../utils/currencies");
  const b = normalizeCode(baseCurrency);
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0)
    throw Object.assign(new Error("amount must be a positive number"), { status: 400 });
  const { rates } = await getRates(b);
  const table = MAJOR_BUDGET_CURRENCIES.filter((c) => c !== b).slice(0, 5).map((c) => ({
    currency: c,
    rate: rates[c],
    value: rates[c] != null ? rates[c] * amt : null,
  }));
  return { baseCurrency: b, amount: amt, table };
}

module.exports = { getRates, convertAmount, getTrend, budgetTable };
