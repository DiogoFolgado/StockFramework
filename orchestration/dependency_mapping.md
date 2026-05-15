# dependency_mapping.md — StockFramework

## External Dependencies
```
Google Fonts CDN
  └── Space Grotesk (body)
  └── Space Mono (monospace / data)

Finnhub REST API (finnhub.io)
  └── /quote
  └── /stock/profile2
  └── /stock/metric
  └── /stock/recommendation
  └── /stock/candle
  └── /search
```

## Internal Function Dependency Map

```
runAnalysis(ticker)
  └── fetchAll(ticker)
        ├── fh('/quote')
        ├── fh('/stock/profile2')
        ├── fh('/stock/metric')
        └── fh('/stock/recommendation')
  └── scoreFundamental({q,p,m})
  └── scoreTechnical({q,m})
  └── scoreEntropy({q,m,p})
  └── scoreSemantic({p,m,rc})
  └── composite(scores)
  └── signal(comp)
  └── renderIntoHome(ticker, data, scores, comp)
        └── loadChart(ticker, '1M')
              └── fh('/stock/candle')
              └── drawChart(canvas, pts, ticker, period)

renderHomePage()
  └── loadSections()
  └── computeSectionRisk(stocks)
  └── fetchSectionAvg(sec)
        └── fh('/quote') × n stocks
        └── fh('/stock/metric') × n stocks

fetchSectorData(sector)
  └── fh('/quote') × 10–14 stocks

scanRisingSector(sector)
  └── fetchAll(ticker) × 100 candidates
        └── [same as runAnalysis chain above]
```

## localStorage Keys
```
fh_key       → string   (Finnhub API key)
sections_v1  → JSON []  (array of section objects)
```

## In-Memory State
```
FINNHUB_KEY        → string (mirrors localStorage)
currentTicker      → string (last analysed)
currentSectionId   → string (open section detail)
sectorsLoaded      → {}  (cache: sectorId → HTML string)
risingLoaded       → {}  (cache: sectorId → results object)
window._risingScans → {} (live scan state, survives tab switch)
```
