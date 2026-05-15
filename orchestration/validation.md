# validation.md — StockFramework

## Pre-Ship Validation

### Functional
- [ ] All four nav tabs load without console errors
- [ ] Home search autocomplete works (type 3+ chars)
- [ ] Analysis runs and renders all sections (hero, pillars, chart, synthesis)
- [ ] Price chart loads for 1D/1W/1M/6M/1Y
- [ ] Section creation, stock add, stock remove, section delete all work
- [ ] Section detail page loads and renders leaderboard + chart
- [ ] Sectors page: at least one sector loads live data
- [ ] Rising Stars: scan starts and shows progress

### Data Integrity
- [ ] Scores sum correctly: each pillar [0–10], composite is weighted sum
- [ ] Signal matches composite: ≥8.5 = STRONG BUY, ≥7.2 = BUY, etc.
- [ ] Risk label matches beta + entropy score
- [ ] `escH()` used on all API-returned strings in innerHTML

### Edge Cases
- [ ] Ticker that returns no data → error message, not blank/crash
- [ ] Section with 0 stocks → "no stocks" message, no fetch attempt
- [ ] Rising Stars with 0 results ≥ 7.0 → "none" message shown
- [ ] API key invalid → error shown on first analysis attempt
- [ ] Very long company name → truncated with ellipsis (CSS overflow:hidden)

### Performance
- [ ] Page load < 2s on broadband (no heavy assets)
- [ ] Single analysis < 5s on broadband
- [ ] Canvas chart renders crisp on HiDPI display (Retina/4K)

### Security
- [ ] No API key visible in HTML source
- [ ] No raw API strings rendered without `escH()`
- [ ] No `eval()` calls introduced
