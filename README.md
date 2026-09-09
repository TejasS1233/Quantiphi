# FX Pulse — Currency Converter

Real-time currency conversion with trend intelligence, favorites, multi-currency
comparison, and a travel budgeting experience. Built for the Quantiphi × TSEC
**Vibe Coding Round**.

All business logic (pricing, math, validation) lives **server-side** — the React
frontend is presentation-only, exactly per the brief (`docs/problem-statement.md`).
<img width="1906" height="836" alt="image" src="https://github.com/user-attachments/assets/ae306e13-9b37-40f6-bbfa-e239dd8cc49e" />
<img width="1902" height="1030" alt="image" src="https://github.com/user-attachments/assets/ac56d1fb-8599-4957-957c-d54760d24b79" />
<img width="1900" height="917" alt="image" src="https://github.com/user-attachments/assets/4a4558f6-4dbe-4152-bf82-2a97ae6ec0f7" />
<img width="1895" height="952" alt="image" src="https://github.com/user-attachments/assets/97cc62c2-ecba-4d99-85ba-f0673da9b1c6" />
<img width="1895" height="977" alt="image" src="https://github.com/user-attachments/assets/788d588d-fa73-41ef-96b4-b35c1bc79c3d" />
<img width="1900" height="1025" alt="image" src="https://github.com/user-attachments/assets/f32522fd-a1c9-46d1-a8f4-e69d56d9898f" />


## Features

**From the brief**
- Dual converter (source/target dropdowns + amount) on live ExchangeRate API rates
- 30-day trend charts with high/low/change stats
- Favorites list with one-click reload, persisted in SQLite
- Conversion history persisted in SQLite, with CSV export
- Travel Budgeting mode — one amount compared across 5 major currencies,
  fully computed server-side

**Beyond the brief**
- Compare mode — up to 4 currencies on one chart, actual rates or rebased to 100
- 8-day forecast projection with terminal marker (toggleable)
- Currency strength meter ranking 8 majors by 30-day momentum
- Visual gallery where every chart is live and togglable (pairs, ranges, bases, amounts)
- Deal scores per destination, coffee-index math, street-smart FX tips
- URL-synced views (refresh-safe), Sonner toasts, CSV downloads everywhere
- Dark premium shadcn/ReUI/Bklit UI with custom favicon and 404 page

## Pages

| Route | What it does |
| ----- | ------------ |
| `/` | Hero, live rate ticker, market stats, live USD→INR chart, currency strength meter |
| `/convert` | Dual-selector converter, favorites, recent history, history CSV download |
| `/trends` | Single pair (with toggleable 8-day forecast projection) **or** compare mode — up to 4 currencies, actual rates or rebased to 100, CSV download |
| `/budget` | Travel mode: 5-currency table, deal scores, budget donut, coffee index, FX tips, table CSV download |
| `/favorites` | Save, reload and manage favorite pairs |
| `/showcase` | Visual gallery — every chart is live and togglable (pairs, ranges, bases, amounts) |
| `*` | 404 “Lost in the market” page |

> Views sync to the URL (pair, amount, days, mode), so refresh and back-button
> preserve state. Compare charts default to actual rates with an opt-in rebase toggle.

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
# terminal 1 — backend  → http://localhost:5000
cd server && npm install && npm run dev

# terminal 2 — frontend → http://localhost:5173
cd client && npm install && npm run dev
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

