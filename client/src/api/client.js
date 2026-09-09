// Presentation layer only — all math/validation happens server-side.
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  health: () => req("/health"),
  currencies: () => req("/currencies"),
  rates: (base) => req(`/rates?base=${encodeURIComponent(base)}`),
  convert: (from, to, amount) =>
    req("/convert", { method: "POST", body: JSON.stringify({ from, to, amount }) }),
  history: (limit = 20) => req(`/history?limit=${limit}`),
  favorites: () => req("/favorites"),
  addFavorite: (base, target) =>
    req("/favorites", { method: "POST", body: JSON.stringify({ base, target }) }),
  removeFavorite: (id) => req(`/favorites/${id}`, { method: "DELETE" }),
  trends: (base, target, days = 30) =>
    req(`/trends?base=${encodeURIComponent(base)}&target=${encodeURIComponent(target)}&days=${days}`),
  budget: (baseCurrency, amount) =>
    req("/budget", { method: "POST", body: JSON.stringify({ baseCurrency, amount }) }),
};
