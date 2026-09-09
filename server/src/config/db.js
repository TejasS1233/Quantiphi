const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const dbPath =
  process.env.SQLITE_PATH ||
  path.join(__dirname, "..", "..", "data", "app.db");

const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS conversion_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_code TEXT NOT NULL,
    to_code TEXT NOT NULL,
    amount REAL NOT NULL,
    rate REAL NOT NULL,
    result REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    base_code TEXT NOT NULL,
    target_code TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(base_code, target_code)
  );
  CREATE TABLE IF NOT EXISTS rate_cache (
    base_code TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_history_created ON conversion_history(created_at DESC);
`);

module.exports = db;
