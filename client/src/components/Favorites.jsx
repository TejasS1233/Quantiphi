import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function Favorites({ refreshKey, onSelect }) {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await api.favorites();
      setFavorites(data.favorites || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, [refreshKey]);

  async function remove(id) {
    await api.removeFavorite(id);
    load();
  }

  return (
    <section className="card">
      <h2>Favorites</h2>
      {error && <p className="error">{error}</p>}
      {favorites.length === 0 && <p className="muted">No favorites yet — convert and ★ save a pair.</p>}
      <ul className="fav-list">
        {favorites.map((f) => (
          <li key={f.id}>
            <button
              className="ghost"
              onClick={() => onSelect?.(f.base_code, f.target_code)}
              title="Load this pair"
            >
              {f.base_code} → {f.target_code}
            </button>
            <button className="danger-ghost" onClick={() => remove(f.id)} title="Remove">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
