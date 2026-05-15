# architecture_review.md — StockFramework

## Current Architecture

### Delivery
- Single HTML file: `stock_framework_v5_25.html`
- No build system, no npm, no bundler
- All CSS and JS inline — loaded directly in the browser
- Hosted anywhere that can serve a static file

### Data Layer
- **Finnhub free tier** — REST API, 60 req/min, no WebSocket on free plan
- `fh(path)` — central fetch helper with 12s timeout, rate/auth error handling
- `fetchAll(ticker)` — fetches quote + profile + metrics + recommendations in parallel (4 calls)
- No server-side cache — all calls made fresh from the browser

### State Management
- `localStorage` — sections (watchlists) and API key
- In-memory — `sectorsLoaded{}`, `risingLoaded{}`, `window._risingScans{}` for scan progress
- No global state manager — functions read/write localStorage directly

### Scoring Engine
| Pillar | Weight | Key signals |
|---|---|---|
| Fundamental | 30% | P/E, revenue growth, gross margin, ROE |
| Technical | 35% | 52W range position, momentum, golden cross proxy |
| Entropy | 10% | Beta, 52W range width, sector complexity |
| Semantic | 25% | Analyst consensus, price targets, sector tailwinds |

### UI
- 4-tab navigation: Home, Sectors, My Sections, How It Works
- All pages exist in DOM simultaneously — shown/hidden via `showPage()`
- Section detail is a 5th pseudo-page (`page-section-detail`)
- Canvas-based price chart (no chart library)
- No external JS dependencies (no React, no jQuery, no Chart.js)

## Constraints
- Must remain a single file
- Must work on Finnhub free tier
- No Node.js / server required
- Fonts loaded from Google Fonts CDN only
