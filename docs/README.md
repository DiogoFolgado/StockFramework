# StockFramework

A full-stack stock analysis platform built with Next.js 16, PostgreSQL, and Claude AI.

## Features

### Stock Analysis
- **Four-pillar scoring**: Fundamental (30%), Technical (35%), Entropy (10%), Semantic (25%)
- **Pillar breakdown chart** with delta indicators and actionable insights per pillar
- **Shareable analysis links** — generate a public URL for any analysis result

### Portfolio Suite
- **DCA Optimizer** — optimal buy-in schedule based on historical volatility
- **Correlation Matrix** — cross-asset correlation heatmap for your positions
- **Entropy / Regime Detection** — market regime alerts (Normal / Elevated / High) with hotspot tickers
- **FX Hedging Panel** — currency exposure and hedging suggestions
- **Rebalance Panel** — target-weight drift analysis and rebalance orders
- **Scenario Tester** — stress-test portfolio under custom macro shocks
- **Sentiment Panel** — AI-powered news sentiment per holding
- **AI Suggestions** — Claude-generated portfolio improvement recommendations
- **Risk Dashboard** — consolidated risk metrics across all positions

### Markets & Discovery
- **Markets overview** — broad market snapshot across indices and asset classes
- **Stock Compare** — side-by-side pillar score comparison for up to N tickers
- **Sector Scanner** — 13 market sectors with live daily relative performance; Rising Stars scanner surfaces stocks ≥ 7.0
- **Top Scores** — leaderboard of highest-scoring stocks from your analysis history

### Watchlists
- **Sections** — custom watchlists with icons, colours, and position tracking
- **Section snapshots** — daily P&L and avg % change history per section

### Podcast
- Finance podcast browser powered by the iTunes API
- AI-generated episode summaries via Claude
- New-episode notifications per user

### Auth & History
- Email / password authentication (NextAuth v5 + bcrypt)
- Per-user analysis history with full pillar scores stored

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, standalone output) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, Recharts |
| Database | PostgreSQL via Prisma 7 |
| Auth | NextAuth v5 (`@auth/prisma-adapter`) |
| AI | Anthropic Claude (`@anthropic-ai/sdk`) |
| Market Data | Finnhub API, Yahoo Finance (via Cloudflare Worker proxy) |
| Testing | Vitest + `@vitest/coverage-v8` |

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/DiogoFolgado/StockFramework.git
cd StockFramework/app
npm install
```

### 2. Configure environment variables

Copy the example and fill in your values:

```bash
cp ../env/.env.local .env.local
```

Required variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/stockframework
FINNHUB_API_KEY=your_finnhub_key
ANTHROPIC_API_KEY=your_anthropic_key
AUTH_SECRET=a_random_secret_string
```

Optional:

```env
YAHOO_WORKER_URL=https://your-worker.workers.dev   # defaults to the project's Cloudflare Worker
```

### 3. Set up the database

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Getting API Keys

| Key | Where to get it |
|---|---|
| `FINNHUB_API_KEY` | [finnhub.io/register](https://finnhub.io/register) — free tier, no credit card |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `AUTH_SECRET` | Run `openssl rand -base64 32` |

---

## Project Structure

```
StockFramework/
├── app/                    # Next.js application
│   ├── app/
│   │   ├── (auth)/         # Login / register pages
│   │   ├── (dashboard)/    # Podcast (dashboard layout)
│   │   ├── api/            # API routes (analyse, portfolio/*, podcast/*, share, …)
│   │   ├── compare/        # Stock compare page
│   │   ├── history/        # Analysis history
│   │   ├── how-it-works/   # Explainer page
│   │   ├── markets/        # Markets overview
│   │   ├── news/           # News feed
│   │   ├── portfolio/      # Portfolio suite
│   │   ├── scores/         # Top scores leaderboard
│   │   ├── sections/       # Watchlist sections
│   │   ├── sectors/        # Sector scanner
│   │   └── share/[id]/     # Public shared analysis
│   ├── components/
│   │   ├── analysis/       # PillarCard, PillarBreakdownChart, SearchBar, …
│   │   ├── navigation/     # NavBar
│   │   ├── podcast/        # EpisodeCard, NotificationBanner, PodcastHeader
│   │   ├── portfolio/      # All portfolio panel components
│   │   └── sections/       # AddPositionForm
│   ├── lib/
│   │   ├── db/             # Prisma client singleton
│   │   ├── finnhub/        # Finnhub API client
│   │   ├── podcast/        # iTunes fetch + Claude summarise
│   │   ├── scoring/        # Four-pillar scoring engine + tests
│   │   ├── sectors/        # Sector definitions and data
│   │   └── yahoo/          # Yahoo Finance proxy client
│   └── prisma/
│       └── schema.prisma
├── directives/             # Engineering directive templates
├── docs/                   # Documentation (this file)
├── env/                    # Environment variable files (gitignored)
├── orchestration/          # Architecture and planning docs
└── specs/                  # Scoring engine and API specs
```

---

## Scripts

```bash
npm run dev           # Start development server
npm run build         # Production build
npm run start         # Start production server
npm run test          # Run tests (Vitest)
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```
