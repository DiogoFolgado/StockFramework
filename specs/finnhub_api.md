# Finnhub API Reference — StockFramework

## Base URL
`https://finnhub.io/api/v1`

## Authentication
All requests append `&token=YOUR_KEY` to the query string.
The `fh(path)` helper function handles this automatically.

## Endpoints Used

### Quote
`GET /quote?symbol=AAPL`
```json
{
  "c": 189.45,    // current price
  "o": 188.10,    // open
  "h": 190.20,    // high
  "l": 187.50,    // low
  "pc": 187.90,   // previous close
  "t": 1699900000 // timestamp
}
```

### Company Profile
`GET /stock/profile2?symbol=AAPL`
```json
{
  "name": "Apple Inc",
  "finnhubIndustry": "Technology",
  "marketCapitalization": 2950.5,  // in billions USD
  "ipo": "1980-12-12",
  "currency": "USD"
}
```

### Metrics
`GET /stock/metric?symbol=AAPL&metric=all`
Key fields in `metric` object:
- `peBasicExclExtraTTM` — trailing P/E
- `peForwardAnnual` — forward P/E
- `epsTTM` — earnings per share
- `revenueGrowthTTMYoy` — revenue growth %
- `grossMarginTTM` — gross margin %
- `roeTTM` — return on equity %
- `beta` — market beta
- `52WeekHigh` / `52WeekLow`
- `3MonthADTV` — 3-month avg daily trading volume (millions)
- `dividendYieldIndicatedAnnual`
- `targetPriceMean` / `targetPriceLow` / `targetPriceHigh`

### Analyst Recommendations
`GET /stock/recommendation?symbol=AAPL`
Returns array, most recent first:
```json
[{ "buy": 25, "hold": 8, "sell": 2, "strongBuy": 10, "strongSell": 0, "period": "2024-01-01" }]
```

### Candles (Price Chart)
`GET /stock/candle?symbol=AAPL&resolution=D&from=1699000000&to=1699900000`
```json
{
  "s": "ok",       // or "no_data"
  "c": [...],      // close prices
  "t": [...],      // timestamps
  "o": [...], "h": [...], "l": [...], "v": [...]
}
```
Resolutions: `1`, `5`, `15`, `30`, `60` (minutes), `D` (daily), `W` (weekly), `M` (monthly)

### Search / Autocomplete
`GET /search?q=apple`
```json
{
  "result": [
    { "symbol": "AAPL", "description": "Apple Inc", "type": "Common Stock", "displaySymbol": "AAPL" }
  ]
}
```

## Error Codes
| HTTP | Meaning | Handler |
|---|---|---|
| 401 | Invalid API key | Show key modal |
| 403 | Forbidden / key inactive | Show key modal |
| 429 | Rate limit exceeded | Show "wait a moment" message |
| 4xx/5xx | API error | Show generic error message |
