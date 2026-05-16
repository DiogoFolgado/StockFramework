import { NextRequest, NextResponse } from "next/server";

const WORKER_URL = process.env.YAHOO_WORKER_URL ?? "https://noisy-bread-1e4c.diogo-lafp.workers.dev";

export interface QuoteEntry {
  price:     number;
  prevClose: number;
  change:    number;
  changePct: number;
  currency:  string;
}

async function fetchChartQuote(symbol: string): Promise<[string, QuoteEntry] | null> {
  try {
    const res  = await fetch(
      `${WORKER_URL}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`,
      { headers: { "User-Agent": "StockFramework/2.0" }, next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json() as { chart?: { result?: Array<{ meta?: Record<string, number | string> }> } };
    const meta = data?.chart?.result?.[0]?.meta as Record<string, number | string> | undefined;
    if (!meta) return null;
    const price     = (meta.regularMarketPrice    as number) ?? 0;
    const prevClose = (meta.chartPreviousClose    as number) ?? price;
    const change    = price - prevClose;
    const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0;
    return [symbol, { price, prevClose, change, changePct, currency: (meta.currency as string) ?? "USD" }];
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const tickers = req.nextUrl.searchParams.get("tickers");
  if (!tickers) return NextResponse.json({ error: "Missing tickers" }, { status: 400 });

  const symbols = tickers.split(",").map(t => t.trim()).filter(Boolean);
  if (symbols.length === 0) return NextResponse.json({ quotes: {} });

  try {
    const results = await Promise.all(symbols.map(fetchChartQuote));
    const quotes: Record<string, QuoteEntry> = {};
    for (const entry of results) {
      if (entry) quotes[entry[0]] = entry[1];
    }
    return NextResponse.json({ quotes });
  } catch {
    return NextResponse.json({ error: "Quote fetch failed" }, { status: 502 });
  }
}
