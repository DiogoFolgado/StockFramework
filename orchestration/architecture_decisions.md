# architecture_decisions.md — StockFramework

## Decision Log

### ADR-001: Single HTML file
**Decision**: Keep all CSS and JS inline in one `.html` file.
**Reason**: Zero deployment friction. Works offline after first load. No build step. No npm. No server.
**Tradeoff**: File grows large. No module system. No tree-shaking.
**Status**: Active constraint — do not change.

### ADR-002: Finnhub free tier only
**Decision**: All data comes from Finnhub's free API. No paid tiers, no other providers.
**Reason**: Zero cost. 30-second signup. No credit card.
**Tradeoff**: 60 req/min limit. No WebSocket. Limited historical data. Some endpoints return no data for small-caps.
**Status**: Active constraint.

### ADR-003: No JS framework
**Decision**: Vanilla JS only. No React, Vue, Angular, jQuery.
**Reason**: Keeps file size minimal. No dependency management. No build step.
**Tradeoff**: Manual DOM updates. No reactive state. innerHTML-based rendering.
**Status**: Active constraint.

### ADR-004: localStorage for persistence
**Decision**: Sections/watchlists stored in `localStorage` as JSON.
**Reason**: No backend required. Data persists across sessions on same device.
**Tradeoff**: Not synced across devices. 5MB storage limit. Visible to same-origin JS.
**Status**: Active.

### ADR-005: Canvas for charts
**Decision**: Native Canvas API for price charts, no chart library.
**Reason**: No external dependency. Full control over appearance. Matches dark design system.
**Tradeoff**: More code to maintain. No built-in tooltips or zoom.
**Status**: Active.

### ADR-006: Four-pillar scoring weights
**Decision**: Technical 35%, Fundamental 30%, Semantic 25%, Entropy 10%.
**Reason**: Grounded in Cohen et al. (2025) and Ricchiuti & Sperlí (2025) research.
**Tradeoff**: Weights are static — no personalisation.
**Status**: Active. Revisit if research updates emerge.
