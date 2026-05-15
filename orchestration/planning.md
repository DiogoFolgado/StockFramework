# planning.md — StockFramework

## Project Overview
StockFramework is a self-contained browser-based stock analysis tool.
Single HTML file. No build system. No backend. Finnhub free-tier API.

## Active Feature Queue
<!-- Add features here as they are planned. Move to execution/ when started. -->

| Priority | Feature | Directive | Status |
|---|---|---|---|
| — | — | — | Backlog |

## Implementation Phases (for any new feature)
1. **Understand** — read relevant directives, understand API budget impact
2. **Design** — plan DOM changes, new CSS classes, new JS functions
3. **Implement** — write code into the single HTML file
4. **Test** — run through testing.md checklist for affected areas
5. **Ship** — update this planning doc, mark complete

## File to Edit
All code lives in: `stock_framework_v5_25.html`
Rename with version bump on major releases: `stock_framework_v6.html`

## API Budget per New Feature
Before adding any feature, estimate Finnhub calls and check against the 60 req/min limit.
