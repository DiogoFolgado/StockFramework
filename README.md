# StockFramework

Research-grade stock analysis and portfolio management platform built with Next.js 16, React 19, PostgreSQL, and Claude AI.

---

## Features

### Stock Analysis
- **Four-pillar composite scoring**: Fundamental (30%), Technical (35%), Entropy (10%), Semantic (25%)
- Live quote data via Yahoo Finance and Finnhub
- Analyst sentiment, price targets, earnings, and sector context
- Signal output: STRONG BUY / BUY / NEUTRAL / SELL / STRONG SELL
- **Pillar breakdown chart** with delta indicators and per-pillar insights
- **Shareable analysis links** — generate a public URL for any result

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
- **Stock Compare** — side-by-side pillar score comparison for multiple tickers
- **Sector Scanner** — 13 market sectors with live daily relative performance; Rising Stars scanner surfaces stocks ≥ 7.0
- **Top Scores** — leaderboard of highest-scoring stocks from your analysis history

### Watchlists
- **Sections** — custom watchlists with icons, colours, and position tracking
- Track positions with purchase price, quantity, and currency
- **Section snapshots** — daily P&L and avg % change history per section

### Podcast
- Finance podcast browser powered by the iTunes API
- AI-generated episode summaries via Claude
- New-episode notifications per user

### Stock AI Advisor
- Floating chat widget powered by Claude
- Context-aware: reads your portfolio sections and positions
- Answers questions about stocks, market trends, and investment strategy

### Auth & History
- Email / password authentication (NextAuth v5 + bcrypt)
- Per-user analysis history with full pillar scores stored and paginated
- Market news, IPO calendar, and earnings calendar via Finnhub

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, standalone output) |
| UI | React 19, TypeScript 5, Tailwind CSS 4, Recharts |
| Database | PostgreSQL + Prisma 7 |
| Auth | NextAuth v5 (credentials, `@auth/prisma-adapter`) |
| AI | Anthropic Claude (`@anthropic-ai/sdk`) |
| Data | Yahoo Finance (Cloudflare Worker proxy), Finnhub API |
| Testing | Vitest + `@vitest/coverage-v8` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+

### 1. Clone and install

```bash
git clone https://github.com/DiogoFolgado/StockFramework.git
cd StockFramework/app
npm install
```

### 2. Configure environment variables

Create `.env.local` in `StockFramework/app/`:

```env
# Database
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/stockframework"

# Auth
AUTH_SECRET="run: openssl rand -base64 32"

# Data APIs
FINNHUB_API_KEY="your-finnhub-key"

# AI (portfolio suggestions, podcast summaries, chat advisor)
ANTHROPIC_API_KEY="sk-ant-..."

# Optional — defaults to the project's Cloudflare Worker
# YAHOO_WORKER_URL="https://your-worker.workers.dev"
```

| Key | Where to get it |
|---|---|
| `FINNHUB_API_KEY` | [finnhub.io/register](https://finnhub.io/register) — free tier, no credit card |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `AUTH_SECRET` | `openssl rand -base64 32` |

### 3. Set up the database

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
StockFramework/
├── app/                         # Next.js application
│   ├── app/
│   │   ├── (auth)/              # Login / register
│   │   ├── (dashboard)/podcast/ # Podcast browser
│   │   ├── compare/             # Stock compare
│   │   ├── history/             # Analysis history
│   │   ├── how-it-works/        # Scoring methodology explainer
│   │   ├── markets/             # Markets overview
│   │   ├── news/                # News, IPO, earnings
│   │   ├── portfolio/           # Portfolio suite
│   │   ├── scores/              # Top scores leaderboard
│   │   ├── sections/            # Watchlist sections
│   │   ├── sectors/             # Sector scanner
│   │   ├── share/[id]/          # Public shared analysis
│   │   └── api/                 # API routes
│   ├── components/
│   │   ├── analysis/            # PillarCard, PillarBreakdownChart, SearchBar
│   │   ├── navigation/          # NavBar
│   │   ├── podcast/             # EpisodeCard, NotificationBanner, PodcastHeader
│   │   ├── portfolio/           # All portfolio panel components
│   │   └── sections/            # AddPositionForm
│   ├── lib/
│   │   ├── db/                  # Prisma client singleton
│   │   ├── finnhub/             # Finnhub API client
│   │   ├── podcast/             # iTunes fetch + Claude summarise
│   │   ├── scoring/             # Four-pillar scoring engine + tests
│   │   ├── sectors/             # Sector definitions
│   │   └── yahoo/               # Yahoo Finance proxy client
│   └── prisma/schema.prisma
├── docs/README.md               # Extended documentation
├── env/                         # Environment variable files (gitignored)
└── specs/                       # Scoring engine and API specs
```

---

## Scoring Methodology

| Pillar | Weight | What it measures |
|---|---|---|
| Fundamental | 30% | Revenue growth, margins, P/E, EPS, free cash flow |
| Technical | 35% | Price momentum, 52-week range, beta, moving averages |
| Entropy | 10% | Volatility and risk-adjusted positioning |
| Semantic | 25% | Analyst ratings, price targets, consensus sentiment |

Composite score 0–10:

| Score | Signal |
|---|---|
| ≥ 8.5 | STRONG BUY |
| ≥ 7.2 | BUY |
| ≥ 5.5 | NEUTRAL |
| ≥ 4.0 | SELL |
| < 4.0 | STRONG SELL |

---

## Scripts

```bash
npm run dev           # Development server
npm run build         # Production build
npm run start         # Start production server
npm run test          # Run tests (Vitest)
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

---

## Disclaimer

Research and educational purposes only. Not financial advice. Markets are unpredictable — always do your own due diligence.
