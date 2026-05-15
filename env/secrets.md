# secrets.md — StockFramework

## Secret Inventory

| Secret | Where stored | How obtained | Who has access |
|---|---|---|---|
| Finnhub API key | User's browser localStorage | finnhub.io/register (free) | End user only |

## Rules
- The Finnhub API key is NEVER hardcoded in source files
- The Finnhub API key is NEVER committed to version control
- The key is entered by the user at runtime via the in-app modal
- The key is stored in `localStorage` under the key `fh_key`
- The key is sent only to `https://finnhub.io` — no other endpoints

## Getting a Finnhub Key
1. Go to https://finnhub.io/register
2. Sign up (no credit card required)
3. Copy the API key from the dashboard
4. Paste into the app's API Key modal (🔑 button in top-right nav)

## If the Key is Compromised
1. Log in to finnhub.io and regenerate the key
2. Update the key in the app via the 🔑 modal
3. The old key is automatically invalidated by Finnhub
