# execution_order.md — StockFramework

## Startup Sequence (DOMContentLoaded)
1. Read `FINNHUB_KEY` from localStorage
2. If no key → show key modal
3. If key exists → update key button to green
4. `buildIconPicker()` — render section icon options in modal
5. `buildColorPicker()` — render color swatches in modal
6. `renderHomePage()` — draw section cards (no API calls yet)
7. `initHomeSearch()` — attach autocomplete event listeners

## Page Navigation Order
```
showPage('home')     → renderHomePage()
showPage('sectors')  → renderSectorsPage() [no API calls until card clicked]
showPage('sections') → renderSectionsManager()
showPage('framework')→ static content, no calls
showPage('section-detail') → openSectionDetail(id) → loadSectionDetail(sec)
```

## Analysis Execution Order
```
homeAnalyse()
  → runAnalysis(ticker)
    → show loading state
    → fetchAll() [parallel: 4 API calls]
    → score all four pillars [synchronous, CPU only]
    → renderIntoHome() [DOM build]
    → storeChartSynthData() [fallback data prep]
    → loadChart('1M') [1 more API call]
```

## Rising Stars Scan Order
```
toggleRisingCard(sectorId)
  → scanRisingSector(sector)
    → loop: fetchAll(ticker) × 100
      → score → push if comp ≥ 7.0
      → await 800ms
    → finalise → risingLoaded[id] = results
    → updateRisingBody(sector)
```

## Feature Implementation Order (for new features)
1. Define in `directives/build_feature.md`
2. Plan in `orchestration/planning.md`
3. Add architecture note to `orchestration/architecture_decisions.md` if significant
4. Update `dependency_mapping.md` if new functions added
5. Implement in HTML file
6. Test via `directives/testing.md`
