# performance.md — StockFramework

## Performance Constraints

### Finnhub Rate Limit
- Free tier: 60 requests/minute
- Full analysis: 4 calls — leaves 56/min headroom
- Rising Stars scan: 4 calls/ticker × 100 tickers = 400 calls total
  - Spaced at 800ms intervals = ~5 calls/sec = 300 calls/min — exceeds limit
  - **Fix applied**: 800ms delay between tickers (not between individual calls)
  - Each ticker's 4 calls fire in parallel via `Promise.allSettled()`

### Caching Strategy
| Data | Cache location | TTL |
|---|---|---|
| Sector stock data | `sectorsLoaded{}` in-memory | Until page reload |
| Sector avg badges | `sectorsLoaded[id+'_avg']` in-memory | Until page reload |
| Rising Stars results | `risingLoaded{}` in-memory | Until page reload |
| Sections & tickers | `localStorage` | Permanent |
| API key | `localStorage` | Permanent |

### Canvas Chart
- Set `canvas.width = W * devicePixelRatio` for crisp rendering on HiDPI screens
- Redrawn on every period switch — no caching needed (fast, pure JS)

### DOM Performance
- `renderHomePage()` rebuilds the entire sections grid — fine for ≤ 20 sections
- Section dropdown toggle avoids full re-render — only shows/hides existing DOM
- `requestAnimationFrame()` used before chart init to ensure layout is complete

## Rules
- No chart library — native Canvas API keeps file size minimal
- No lodash, no jQuery — native JS only
- Debounce autocomplete at 320ms to avoid hammering the search endpoint
- `Promise.allSettled()` for all batch fetches — never `Promise.all()` (one failure kills all)
