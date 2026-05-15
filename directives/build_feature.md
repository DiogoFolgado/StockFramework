# build_feature.md — StockFramework

## Purpose
Add new features to the single-file HTML/JS/CSS application without breaking existing functionality.

## Workflow
1. Identify which tab/page is affected (Home, Sectors, My Sections, How It Works)
2. Define where new HTML goes in the DOM
3. Identify CSS additions needed (use existing CSS variables)
4. Plan JS additions — prefer new functions, avoid modifying scoring engine
5. Check localStorage impact (sections_v1, fh_key)
6. Implement incrementally
7. Validate all four tabs still work
8. Test with and without API key

## Output Format
- Goal
- Affected DOM sections
- New CSS (variables to reuse: --bg, --bg2, --bg3, --bg4, --border, --gold, --blue, --green, --red, --purple)
- New JS functions
- localStorage changes (if any)
- Validation steps
- Edge cases

## StockFramework-Specific Rules
- All code stays in `stock_framework_v5_25.html` (single file, no build system)
- API calls go through the `fh(path)` helper — never call Finnhub directly
- Use `escH()` for all user-supplied or API-returned strings rendered into HTML
- Respect the 60 req/min Finnhub free-tier rate limit
- New UI must use Space Grotesk / Space Mono fonts and existing CSS variables
- Never hardcode the API key — always read from `FINNHUB_KEY`
