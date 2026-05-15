# Stock Analysis Framework — Quick Start

## Prerequisites
- Docker Desktop running
- Finnhub API key (free at finnhub.io)

---

## First-time setup

### 1. Configure secrets

Edit `app/.env` — fill in your real values:

```env
DATABASE_URL=postgresql://postgres:stockframework@localhost:5432/stockframework?schema=public
FINNHUB_API_KEY=your_finnhub_key_here
YAHOO_WORKER_URL=https://noisy-bread-1e4c.diogo-lafp.workers.dev
NEXTAUTH_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
NEXTAUTH_URL=http://localhost:3000
```

### 2. Start the app

```bash
cd StockFramework
docker compose up --build
```

First boot takes ~2 min (builds Next.js + pulls PostgreSQL image).

### 3. Create your account

Open http://localhost:3000/register — create an account, then sign in.

### 4. Run a stock analysis

Go to http://localhost:3000 → type a ticker (e.g. `AAPL`) → click Analyse.

---

## Migrate your existing data (optional)

See `app/docs/data-migration.md` for how to import your watchlist sections from the old HTML app.

---

## Daily use

```bash
# Start (after first setup)
docker compose up

# Stop
docker compose down

# View logs
docker compose logs -f app
```

---

## Project structure

```
StockFramework/
├── backup/
│   └── stock_framework_v5_25_backup.html   ← original app (read-only backup)
├── app/                                     ← Next.js 15 application
│   ├── app/                                 ← Next.js App Router pages & API
│   ├── lib/
│   │   ├── scoring/engine.ts               ← four-pillar scoring engine
│   │   ├── yahoo/client.ts                 ← Yahoo Finance proxy client
│   │   └── finnhub/client.ts               ← Finnhub API client
│   ├── prisma/schema.prisma                ← database schema
│   └── docs/data-migration.md              ← data import guide
├── docker-compose.yml                       ← PostgreSQL + app
└── QUICKSTART.md                           ← this file
```
