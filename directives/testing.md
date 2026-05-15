# testing.md — StockFramework

## Testing Approach
No automated test framework — all testing is manual + browser-based.

## Core Test Checklist

### API Key Flow
- [ ] Open with no key → key modal appears
- [ ] Enter invalid key → error shown, key not saved
- [ ] Enter valid key → saved to localStorage, modal closes, key button turns green
- [ ] Reload page → key is remembered

### Home Search & Analysis
- [ ] Search by company name → autocomplete appears
- [ ] Search by ticker → autocomplete appears
- [ ] Select autocomplete result → analysis runs
- [ ] Press Enter → analysis runs
- [ ] Invalid ticker → error box shown (not blank screen)
- [ ] Analysis panel closes with X → input cleared
- [ ] Refresh button → re-runs analysis for same ticker

### Section Management
- [ ] Create section → appears on Home and My Sections
- [ ] Add stock to section via autocomplete → chip appears
- [ ] Remove stock → disappears from card
- [ ] Delete section → confirm dialog, then removed
- [ ] Daily avg % loads per section card
- [ ] Risk badge updates after beta data loads
- [ ] Section dropdown opens/closes correctly (only one open at a time)

### Section Detail
- [ ] View button → detail page loads
- [ ] Leaderboard renders sorted by % change
- [ ] Chart renders
- [ ] Back button → returns to Home
- [ ] Refresh button → re-fetches data

### Sectors
- [ ] Daily tab → sector cards render
- [ ] Click sector → expands, loads live data
- [ ] Only one sector open at a time
- [ ] Avg badge updates after data loads
- [ ] Rising Stars tab → grid renders
- [ ] Click rising sector → scan starts, progress updates
- [ ] Scan completes → results shown (or "none ≥ 7.0")
- [ ] Switch tabs mid-scan → scan continues in background

### Price Chart
- [ ] 1D / 1W / 1M / 6M / 1Y tabs switch correctly
- [ ] Chart renders with correct color (green = up, red = down)
- [ ] Falls back to synthetic data if candle endpoint returns no_data

### Edge Cases
- [ ] Market closed → quotes return stale data, no crash
- [ ] Ticker with no metrics → scoring degrades gracefully (score stays near 5.0)
- [ ] Network offline → error messages shown, no infinite spinner
- [ ] 429 rate limit → error shown with retry message
