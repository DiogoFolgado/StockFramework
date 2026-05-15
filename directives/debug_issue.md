# debug_issue.md — StockFramework

## Purpose
Diagnose and fix bugs safely without introducing regressions.

## Workflow
1. Reproduce the issue (which browser, which tab, which action)
2. Check browser console for errors
3. Identify root cause — scoring engine, API call, DOM rendering, or localStorage
4. Explain the problem clearly
5. Implement the minimal safe fix
6. Verify all four tabs still render correctly
7. Verify localStorage sections survive a page reload

## Common Bug Categories

### API / Data
- Finnhub returns empty object `{}` for invalid ticker → guard with `if (!q.c)`
- Rate limit 429 → surfaces via `fh()` error handler
- AbortError on slow connections → `fetchWithTimeout` handles it

### Scoring Engine
- `scoreFundamental`, `scoreTechnical`, `scoreEntropy`, `scoreSemantic` — all return `{score, insights, verdict}`
- `composite()` multiplies each score by its weight — weights must sum to 1.0
- Scores clamped to [0, 10] with `Math.min(10, Math.max(0, score))`

### DOM / Rendering
- `escH()` must wrap all dynamic strings in innerHTML
- Section cards re-rendered by `renderHomePage()` — DOM IDs are dynamically generated
- Canvas chart uses `devicePixelRatio` for sharpness — always set `canvas.width = W * dpr`

### localStorage
- Key: `sections_v1` (JSON array of section objects)
- Key: `fh_key` (API key string)
- Corrupted JSON → `loadSections()` returns `[]` via try/catch

## Fix Rule
Fix root causes. Never patch over symptoms.
