# StockFramework

A browser-based stock analysis tool using a four-pillar scoring framework.

## Quick Start
1. Open `stock_framework_v5_25.html` in any modern browser
2. Click the **🔑 API Key** button and enter your [Finnhub API key](https://finnhub.io/register) (free, no credit card)
3. Search for any stock on the Home tab and run an analysis

## Features
- **Four-pillar analysis**: Fundamental (30%), Technical (35%), Entropy (10%), Semantic (25%)
- **13 market sectors** with live daily relative performance
- **Rising Stars scanner**: scans 100 lesser-known candidates per sector, surfaces stocks ≥ 7.0
- **Custom watchlists**: create sections with custom icons and colours, track daily performance
- **Interactive price chart**: 1D / 1W / 1M / 6M / 1Y with Canvas rendering
- **Autocomplete search**: search by ticker or company name

## Architecture
- Single HTML file — no build system, no server, no dependencies (except Google Fonts CDN)
- All data from [Finnhub](https://finnhub.io) free tier
- API key and watchlists stored in browser `localStorage`

## Project Structure
See [CLAUDE.md](../CLAUDE.md) for the full engineering framework.
