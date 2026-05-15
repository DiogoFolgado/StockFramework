# create_api.md — StockFramework

## Purpose
Document and extend the Finnhub API integration layer.

## Current API Endpoints Used

| Endpoint | Purpose | Calls per analysis |
|---|---|---|
| `/quote?symbol=X` | Current price, prev close, open, high, low | 1 |
| `/stock/profile2?symbol=X` | Company name, sector, market cap, IPO | 1 |
| `/stock/metric?symbol=X&metric=all` | P/E, EPS, gross margin, ROE, beta, 52W hi/lo | 1 |
| `/stock/recommendation?symbol=X` | Analyst buy/hold/sell counts | 1 |
| `/stock/candle?symbol=X&resolution=D&from=&to=` | OHLCV for price chart | 1 |
| `/search?q=X` | Ticker autocomplete search | 1 per keystroke |

## Rate Limit Budget (free tier: 60 req/min)
- Full analysis: 4 calls
- Chart load: 1 call
- Autocomplete: 1 call per query (debounced 320ms)
- Sector load: 10–14 calls (one per stock)
- Rising Stars scan: 4 calls per candidate × 100 = 400 calls (spaced 800ms apart)

## Adding New Endpoints
1. Add call inside `fetchAll()` if needed for every analysis
2. Or add a standalone `fh()` call for on-demand features
3. Always use `Promise.allSettled()` for batch calls — never let one failure block others
4. Guard with `if (data && data.field)` before using any field

## Available Finnhub Endpoints (free tier)
- `/news?category=company&symbol=X` — company news headlines
- `/calendar/earnings?symbol=X` — upcoming earnings dates
- `/stock/insider-sentiment?symbol=X&from=&to=` — insider buying/selling
- `/stock/peers?symbol=X` — peer companies in same sector
- `/stock/earnings?symbol=X` — historical EPS surprises
- `/company-news?symbol=X&from=YYYY-MM-DD&to=YYYY-MM-DD` — date-ranged news
