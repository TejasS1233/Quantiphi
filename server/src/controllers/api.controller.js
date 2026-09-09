const db = require("../config/db");
const fx = require("../services/fx.service");
const { normalizeCode, SUPPORTED_CURRENCIES } = require("../utils/currencies");

async function health(req, res) {
  res.json({ status: "ok", time: new Date().toISOString() });
}

async function listCurrencies(req, res, next) {
  try {
    try {
      const { rates } = await fx.getRates("USD");
      return res.json({ currencies: Object.keys(rates).sort(), source: "live" });
    } catch {
      return res.json({ currencies: SUPPORTED_CURRENCIES, source: "fallback" });
    }
  } catch (err) {
    next(err);
  }
}

async function getRates(req, res, next) {
  try {
    const base = normalizeCode(req.query.base || "USD");
    const data = await fx.getRates(base);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function convert(req, res, next) {
  try {
    const { from, to, amount } = req.body;
    const out = await fx.convertAmount(from, to, amount);
    db.prepare(
      "INSERT INTO conversion_history (from_code, to_code, amount, rate, result) VALUES (?, ?, ?, ?, ?)"
    ).run(out.from, out.to, out.amount, out.rate, out.result);
    res.json(out);
  } catch (err) {
    next(err);
  }
}

async function history(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const rows = db
      .prepare("SELECT * FROM conversion_history ORDER BY id DESC LIMIT ?")
      .all(limit);
    res.json({ count: rows.length, history: rows });
  } catch (err) {
    next(err);
  }
}

async function listFavorites(req, res, next) {
  try {
    const rows = db.prepare("SELECT * FROM favorites ORDER BY id DESC").all();
    res.json({ count: rows.length, favorites: rows });
  } catch (err) {
    next(err);
  }
}

async function addFavorite(req, res, next) {
  try {
    const base = normalizeCode(req.body.base || req.body.base_code);
    const target = normalizeCode(req.body.target || req.body.target_code);
    if (!base || !target) return res.status(400).json({ error: "base and target required" });
    if (base === target) return res.status(400).json({ error: "base and target must differ" });
    try {
      const info = db
        .prepare("INSERT INTO favorites (base_code, target_code) VALUES (?, ?)")
        .run(base, target);
      const row = db.prepare("SELECT * FROM favorites WHERE id = ?").get(info.lastInsertRowid);
      return res.status(201).json(row);
    } catch (e) {
      if (String(e.message).includes("UNIQUE")) {
        const row = db
          .prepare("SELECT * FROM favorites WHERE base_code = ? AND target_code = ?")
          .get(base, target);
        return res.status(200).json(row);
      }
      throw e;
    }
  } catch (err) {
    next(err);
  }
}

async function removeFavorite(req, res, next) {
  try {
    const info = db.prepare("DELETE FROM favorites WHERE id = ?").run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: "Favorite not found" });
    res.json({ deleted: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
}

async function trend(req, res, next) {
  try {
    const data = await fx.getTrend(
      req.query.base || "USD",
      req.query.target || "INR",
      req.query.days || 30
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function budget(req, res, next) {
  try {
    const { baseCurrency, base, amount } = req.body;
    const data = await fx.budgetTable(baseCurrency || base, amount);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  health, listCurrencies, getRates, convert, history,
  listFavorites, addFavorite, removeFavorite, trend, budget,
};
