# deployment.md — StockFramework

## Deployment Model
Static single-file HTML — no server, no build step required.

## Options

### Local
Open `stock_framework_v5_25.html` directly in browser.
API key stored in `localStorage` — persists between sessions on same machine.

### GitHub Pages
1. Push `stock_framework_v5_25.html` to a repo (rename to `index.html`)
2. Enable Pages on the `main` branch root
3. Access at `https://<user>.github.io/<repo>/`

### Netlify / Vercel Drop
1. Drag the HTML file onto the Netlify Drop interface
2. Get a public URL instantly
3. No config required

### Self-hosted
Place the file on any web server (Apache, Nginx, Caddy).
No backend required — all API calls go directly from the browser to Finnhub.

## CORS
Finnhub allows browser-side calls with the API key in the query string.
No proxy needed for the free tier endpoints used.

## Environment Variables
The only secret is the Finnhub API key.
It is entered by the user at runtime and stored in `localStorage` — never in the file.
Never commit a version of the file with a hardcoded API key.

## Pre-deploy Checklist
- [ ] No hardcoded API key in HTML source
- [ ] File opens correctly with no API key (modal appears)
- [ ] File opens correctly with saved API key (analysis works)
- [ ] Console has no JS errors on load
- [ ] All four tabs render on fresh load
