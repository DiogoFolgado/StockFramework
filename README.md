# StockFramework

Research-grade stock analysis application built with Next.js 16, React 19, and TypeScript. Uses a four-pillar scoring engine to evaluate stocks across Fundamental, Technical, Entropy, and Semantic dimensions.

---

## Features

### Stock Analysis
- Four-pillar composite scoring system: **Fundamental (30%)**, **Technical (35%)**, **Entropy (10%)**, **Semantic (25%)**
- Live quote data via Yahoo Finance
- Analyst sentiment, price targets, earnings, and sector context
- Signal output: STRONG BUY / BUY / NEUTRAL / SELL / STRONG SELL

### Portfolio Management
- Create sections (watchlists) with custom icons and colours
- Track positions with purchase price, quantity, and currency
- Live daily P&L and total portfolio worth
- Cash balance tracker (EUR + USD) with hide/show toggle

### Stock AI Advisor
- Floating chat widget powered by **Claude Haiku**
- Context-aware: reads your portfolio sections and positions
- Answers questions about stocks, market trends, and investment strategy
- Concise, no-fluff responses — 1–4 sentences by default

### Market Clock
- Live NYSE countdown in the navbar
- Shows time remaining until market opens or closes
- DST-aware, handles weekends and NYSE holidays through 2026
- Green dot when open, red dot when closed

### Scores Page
- All analysed stocks ranked by composite score
- Filter by sector and minimum score threshold
- Deduplicates by ticker — shows best score per stock

### Sectors
- Daily sector performance overview
- Rising star scan via Server-Sent Events (SSE)

### News
- Market news, IPO calendar, and earnings calendar via Finnhub

### History
- Full analysis history per user, paginated
- Section-level daily snapshots with cumulative P&L tracking

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (Turbopack) |
| UI | React 19, TypeScript 5, Tailwind CSS 4 |
| Database | PostgreSQL + Prisma 7 |
| Auth | NextAuth 5 (credentials) |
| AI | Anthropic Claude Haiku (`@anthropic-ai/sdk`) |
| Data | Yahoo Finance (proxy), Finnhub API |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+ running locally

### 1. Clone and install

```bash
git clone https://github.com/DiogoFolgado/StockFramework.git
cd StockFramework/app
npm install
```

### 2. Configure environment variables

Create a `.env` file in `StockFramework/app/`:

```env
# Database
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/stockframework?schema=public"

# Auth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Data APIs
FINNHUB_API_KEY="your-finnhub-key"

# AI Advisor
ANTHROPIC_API_KEY="sk-ant-..."
```

> **ANTHROPIC_API_KEY** is required for the Stock AI Advisor chat. Get a key at [console.anthropic.com](https://console.anthropic.com).  
> **FINNHUB_API_KEY** is required for news, IPO, and earnings data. Free tier available at [finnhub.io](https://finnhub.io).

### 3. Set up the database

```bash
npx prisma migrate dev
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
├── app/
│   ├── page.tsx              # Home — analysis + portfolio dashboard
│   ├── scores/               # Stock score rankings
│   ├── sectors/              # Sector overview + rising star scan
│   ├── sections/             # Watchlist sections + position detail
│   ├── history/              # Analysis history + section snapshots
│   ├── news/                 # Market news, IPO, earnings
│   ├── how-it-works/         # Scoring methodology
│   └── api/                  # API routes (analyse, chat, history, sections, …)
├── components/
│   ├── analysis/             # SearchBar, StockHeader, ScoreCard, PillarCard
│   ├── chat/                 # AiAdvisor (floating chat widget)
│   ├── navigation/           # NavBar, MarketClock
│   ├── news/                 # NewsCard, IPOTable, EarningsTable
│   ├── sections/             # SectionCard, PositionTable, CreateSectionForm
│   ├── sectors/              # StockRow, ScanResultItem
│   ├── history/              # HistoryTable, PaginationControls
│   └── ui/                   # Card, Badge, Button, LoadingSpinner, ErrorBanner, TabNav
├── lib/
│   ├── scoring/engine.ts     # Four-pillar scoring logic
│   ├── yahoo/client.ts       # Yahoo Finance data client
│   ├── sectors/data.ts       # Sector definitions
│   ├── utils/                # Color helpers, formatters
│   └── auth.ts               # NextAuth configuration
└── prisma/
    └── schema.prisma         # Database schema
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

## Disclaimer

Research and educational purposes only. Not financial advice. Markets are unpredictable — always do your own due diligence.
