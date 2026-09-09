# FX Pulse — Currency Converter

Real-time currency conversion with trend intelligence, favorites, multi-currency
comparison, and a travel budgeting experience. Built for the Quantiphi × TSEC
**Vibe Coding Round**.

All business logic (pricing, math, validation) lives **server-side** — the React
frontend is presentation-only, exactly per the brief (`docs/problem-statement.md`).

## Pages

| Route | What it does |
| ----- | ------------ |
| `/` | Hero, live rate ticker, market stats, live USD→INR chart, feature grid |
| `/convert` | Dual-selector converter, favorites, recent history (toasts included) |
| `/trends` | Single-pair Bklit line chart **or** compare mode — up to 4 currencies rebased to 100 |
| `/budget` | Travel mode: 5-currency table, deal scores, budget donut, coffee index, FX tips |
| `/favorites` | Save, reload and manage favorite pairs |
| `/showcase` | Visual gallery — every chart is live and togglable (pairs, ranges, bases, amounts) |

## Stack

- **Frontend** — React 19 + Vite, Tailwind v4, shadcn/ui primitives, ReUI chart
  patterns, Bklit line charts, framer-motion, Sonner (`client/`)
- **Backend** — Node + Express, clean layered structure
  (`config → routes → controllers → services → utils`) (`server/`)
- **Persistence** — SQLite via `node:sqlite` (zero native deps): conversion history,
  favorites, and live-rate cache (1h TTL). DB file is git-ignored; schema auto-creates.
- **Data (no keys needed)** — live rates: ExchangeRate API (`open.er-api.com`);
  trend series: Frankfurter v2 (`api.frankfurter.dev`)

## Quickstart

```bash
npm run install:all   # install server + client deps
npm run dev           # runs both (needs root devDeps: npm install)

# …or separately:
npm run dev:server    # backend  → http://localhost:5000
npm run dev:client    # frontend → http://localhost:5173
```

Optional: copy `server/.env.example` → `server/.env` and
`client/.env.example` → `client/.env` to override ports, API URLs, or CORS origin.

## API reference (all under `/api`)

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/health` | Health check |
| GET | `/currencies` | Supported codes (live, static fallback) |
| GET | `/rates?base=USD` | Live rates for a base (cached 1h, `400` on unknown code) |
| POST | `/convert` `{from, to, amount}` | Convert at live rate + persist to history |
| GET | `/history?limit=20` | Recent conversions, newest first |
| GET / POST | `/favorites` | List / add `{base, target}` pair (idempotent) |
| DELETE | `/favorites/:id` | Remove a pair |
| GET | `/trends?base=&target=&days=30` | Daily series for charts (2–90 days) |
| POST | `/budget` `{baseCurrency, amount}` | 5-currency comparison table, computed server-side |

Error semantics: `400` validation / unknown currency, `502` upstream provider failure.

## Project structure

```
server/
  src/config/db.js          # SQLite init + schema
  src/routes/api.js         # route table + request validation
  src/controllers/          # thin handlers (no math here)
  src/services/fx.service.js# all FX logic: rates, convert, trends, budget
  src/utils/currencies.js   # canonical currency lists
  src/middleware/           # validation + error handler
  data/.gitkeep             # SQLite file lives here (git-ignored)
client/
  src/pages/                # Home, Convert, Trends, Budget, FavoritesPage, Showcase
  src/components/ui/        # shadcn primitives (CLI-installed, don't hand-edit)
  src/components/charts/    # Bklit line-chart system (CLI-installed)
  src/components/fx/        # live-bound charts: FxLineChart, FxIndexChart, FxDonut,
                            # FxGlowArea, FxChangeBars, FxRadar, FxRadial, tickers
  src/components/layout/    # Navbar, Footer
  src/hooks/                # useCurrencies, useTrend, useMultiTrend
  src/api/client.js         # typed fetch wrapper for /api
docs/problem-statement.md   # assessment brief, extracted from the PDF
```

