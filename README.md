# Currency Converter

Vibe Coding Round — real-time currency conversion with historical trends, favorites, and a Travel Budgeting mode. All business logic lives server-side; the React frontend is presentation-only.

## Stack

- **Frontend:** React (Vite) + Recharts — `client/`
- **Backend:** Node + Express — `server/`
- **Persistence:** SQLite (`node:sqlite`, zero native deps) — caches conversion history, favorites, live rates (1h TTL)
- **Live rates:** ExchangeRate API (`open.er-api.com`, no key)
- **30-day trends:** Frankfurter v2 (`api.frankfurter.dev`, no key)

## Run

```bash
npm run install:all

# terminal 1 — backend http://localhost:5000
npm run dev:server

# terminal 2 — frontend http://localhost:5173
npm run dev:client

# or both at once (needs root devDeps: npm install)
npm run dev
```

Copy `server/.env.example` → `server/.env` and `client/.env.example` → `client/.env` to override defaults.

## API (all under `/api`)

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/health` | Health check |
| GET | `/currencies` | Supported codes (live, fallback static) |
| GET | `/rates?base=USD` | Live rates for base |
| POST | `/convert` `{from,to,amount}` | Convert + save to history |
| GET | `/history?limit=20` | Recent conversions |
| GET/POST | `/favorites` | List / add `{base,target}` pair |
| DELETE | `/favorites/:id` | Remove pair |
| GET | `/trends?base=&target=&days=30` | Daily series for chart |
| POST | `/budget` `{baseCurrency,amount}` | 5-currency comparison table |

## Structure

```
server/src/{config,controllers,routes,services,utils,middleware}
server/data/.gitkeep        # SQLite file lives here (git-ignored)
client/src/{api,components} # Converter, TrendChart, Favorites, BudgetMode, History
docs/problem-statement.md   # assessment brief
```
