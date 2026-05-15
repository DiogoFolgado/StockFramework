# security_review.md — StockFramework

## Security Surface

### API Key
- Stored in `localStorage` — visible to any JS on the same origin
- Sent in URL query string to Finnhub — visible in browser history and network logs
- **Mitigation**: This is Finnhub's design for free-tier keys. Keys are low-value (rate-limited, read-only). Acceptable risk for a personal research tool.
- **Never** embed the key in the HTML source or commit it to a repository.

### XSS Prevention
- All API-returned strings rendered into innerHTML **must** pass through `escH()`
- Current usage: `escH()` is used throughout — audit any new `innerHTML` assignments
- User inputs (ticker, section name) are escaped before rendering
- `maxlength` attributes limit input size

### localStorage Integrity
- `loadSections()` wraps JSON.parse in try/catch — corrupt data returns `[]`
- No sensitive data stored beyond the API key and watchlist tickers

### External Resources
- Google Fonts CDN — loaded over HTTPS
- Finnhub API — HTTPS only
- No other third-party scripts loaded

### Content Security
- No `eval()` usage
- No `document.write()` usage
- No external script tags beyond Google Fonts

## Checklist
- [ ] All `innerHTML` assignments use `escH()` for dynamic data
- [ ] No API key in source code
- [ ] No API key in URL fragments (hash)
- [ ] `fetchWithTimeout` prevents hanging requests
- [ ] Rate limit errors surface user-facing message, not raw stack trace
