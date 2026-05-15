# Scoring Engine Specification — StockFramework

## Overview
Each stock is scored across four pillars. Each pillar returns a score from 0.0 to 10.0.
The composite score is the weighted sum of the four pillar scores.

## Composite Formula
```
composite = (fundamental × 0.30) + (technical × 0.35) + (entropy × 0.10) + (semantic × 0.25)
```

## Signal Thresholds
| Range | Signal |
|---|---|
| 8.5 – 10.0 | STRONG BUY |
| 7.2 – 8.4 | BUY |
| 5.5 – 7.1 | NEUTRAL |
| 4.0 – 5.4 | SELL |
| 0.0 – 3.9 | STRONG SELL |

## Pillar: Fundamental (30%)
Base score: 5.0

| Metric | Condition | Adjustment |
|---|---|---|
| P/E | < 0 (negative) | −0.5 |
| P/E | < 15 | +1.0 |
| P/E | 15–25 | +0.5 |
| P/E | 25–50 | 0 |
| P/E | > 50 | −0.5 |
| Revenue Growth YoY | > 50% | +1.5 |
| Revenue Growth YoY | 20–50% | +1.0 |
| Revenue Growth YoY | 5–20% | +0.4 |
| Revenue Growth YoY | 0–5% | 0 |
| Revenue Growth YoY | < 0% | −0.8 |
| Gross Margin | > 65% | +1.2 |
| Gross Margin | 40–65% | +0.7 |
| Gross Margin | 20–40% | +0.2 |
| Gross Margin | < 20% | −0.4 |
| ROE | > 30% | +0.6 |
| ROE | 15–30% | +0.3 |
| ROE | < 0% | −0.5 |

## Pillar: Technical (35%)
Base score: 5.0

| Metric | Condition | Adjustment |
|---|---|---|
| 52W Range position | > 85% | +1.0 |
| 52W Range position | 60–85% | +0.5 |
| 52W Range position | 35–60% | 0 |
| 52W Range position | < 35% | −0.8 |
| Intraday vs open | > +2% | +0.4 |
| Intraday vs open | < −2% | −0.3 |
| Daily vs prev close | > +3% | +0.5 |
| Daily vs prev close | 0–3% | +0.1 |
| Daily vs prev close | −3% to 0% | 0 |
| Daily vs prev close | < −3% | −0.4 |
| Distance from 52W high | < 3% | +0.6 |
| Distance from 52W high | 3–10% | +0.3 |
| Distance from 52W high | > 40% | −0.5 |

## Pillar: Entropy (10%)
Base score: 7.0

| Metric | Condition | Adjustment |
|---|---|---|
| Beta | > 2.5 | −2.2 |
| Beta | 1.8–2.5 | −1.5 |
| Beta | 1.2–1.8 | −0.6 |
| Beta | 0.5–1.2 | +0.4 |
| 52W Range width | > 150% | −1.5 |
| 52W Range width | 80–150% | −0.8 |
| 52W Range width | 40–80% | −0.2 |
| 52W Range width | < 40% | +0.4 |
| Sector | Biotech/Crypto/Cannabis | −0.8 |
| Sector | Utilities/Staples/Insurance | +0.4 |
| Intraday range | > 5% | −0.4 |

## Pillar: Semantic (25%)
Base score: 5.0

| Metric | Condition | Adjustment |
|---|---|---|
| Analyst consensus | > 70% bull | +2.0 |
| Analyst consensus | 50–70% bull | +1.2 |
| Analyst consensus | > 40% bear | −1.0 |
| Price targets available | yes | +0.5 |
| Sector | Semis/Software/AI/Cloud/Aerospace | +0.8 |
| Sector | Real Estate/Energy Oil/Coal | −0.3 |
| IPO age | < 1 year | −0.5 |
